const { Op, fn, col, cast, literal, where } = require("sequelize");
const sequelize = require("../db/database");
const Tag = require("../models/Tag")
const Event = require("../models/Event")

/* Dev runs on SQLite and production on Postgres, and the two disagree on
   exactly the things this file leans on. Both differences below are silent —
   they return wrong rows rather than raising — so they are resolved once here
   from the live dialect instead of being assumed. */
const IS_POSTGRES = sequelize.getDialect() === "postgres";

// SQLite's LIKE is case-insensitive for ASCII; Postgres's is not, and there
// searching "Food" would stop matching "food bank". ILIKE restores it.
const LIKE = IS_POSTGRES ? "ILIKE" : "LIKE";

/* date()/time() are SQLite built-ins with no Postgres equivalent, so the same
   idea is spelled as a cast there. Note a cast is not a portable substitute in
   the other direction: SQLite has no DATE type and would coerce the value to a
   number, quietly turning a timestamp into its leading year. */
const dateOf = (column) =>
    IS_POSTGRES ? cast(col(column), "DATE") : fn("date", col(column));

const timeOf = (column) =>
    IS_POSTGRES ? cast(col(column), "TIME") : fn("time", col(column));

function combineDateAndTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00.000`);
}

function toHHmmss(timeHHmm) {
    return `${timeHHmm}:00`;
}

// `%` and `_` are LIKE wildcards, so escape any the user actually typed —
// searching for "50%" should look for "50%", not match every row.
function likePattern(term) {
    const escaped = term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    return sequelize.escape(`%${escaped}%`);
}

// Keyword search covers the event's own text plus the names of its tags, so
// searching "food" finds events tagged food-bank as well as ones that say it.
// Tags live in a join table and the tag *filter* below already owns that join,
// so they are matched with a subquery rather than a second include.
function keywordClause(term) {
    const pattern = likePattern(term);
    const like = (column) => literal(`${column} ${LIKE} ${pattern} ESCAPE '\\'`);

    return {
        [Op.or]: [
            like(`"Event"."title"`),
            like(`"Event"."description"`),
            like(`"Event"."address"`),
            literal(`"Event"."id" IN (
                SELECT et.event_id FROM event_tags et
                JOIN tags t ON t.id = et.tag_id
                WHERE t.name ${LIKE} ${pattern} ESCAPE '\\'
                   OR t.slug ${LIKE} ${pattern} ESCAPE '\\'
            )`),
        ],
    };
}

function buildEventBaseOptions(q) {
    const options = {
        where: {},
        include: [],
        order: [[q.sort, q.order.toUpperCase()]],
    };

    const and = [];

    // keyword filter
    if (q.q) {
        and.push(keywordClause(q.q));
    }

  // date filters
    if (q.date) {
        and.push(where(dateOf("date"), q.date));
    } else {
        if (q.afterDate) {
            and.push(where(dateOf("date"), { [Op.gte]: q.afterDate }));
        }
        if (q.beforeDate) {
            and.push(where(dateOf("date"), { [Op.lte]: q.beforeDate }));
        }
    }

  // time filters
    if (q.date) {
        if (q.afterTime) {
            const dt = combineDateAndTime(q.date, q.afterTime);
            options.where.date = { ...(options.where.date || {}), [Op.gte]: dt };
        }
        if (q.beforeTime) {
            const dt = combineDateAndTime(q.date, q.beforeTime);
            options.where.date = { ...(options.where.date || {}), [Op.lte]: dt };
        }
    } else {
        if (q.afterTime) {
            and.push(where(timeOf("date"), { [Op.gte]: toHHmmss(q.afterTime) }));
        }
        if (q.beforeTime) {
            and.push(where(timeOf("date"), { [Op.lte]: toHHmmss(q.beforeTime) }));
        }
    }

    if (and.length) {
        options.where[Op.and] = and;
    }

  // location filter (miles)
    if (q.lat != null || q.lng != null || q.radius != null) {
        if (q.lat == null || q.lng == null || q.radius == null) {
            throw Object.assign(new Error("lat, lng, and radius must be provided together"), {
                status: 400,
            });
        }

        const latDelta = q.radius / 69;
        const lngDelta = q.radius / (69 * Math.cos((q.lat * Math.PI) / 180));

        options.where.latitude = { [Op.between]: [q.lat - latDelta, q.lat + latDelta] };
        options.where.longitude = { [Op.between]: [q.lng - lngDelta, q.lng + lngDelta] };
    }

  return options;
}

// Returns every matching id, unpaginated — getEvents slices out the page. The
// full list is what makes an honest `total` possible, and at this dataset's
// size one id column is far cheaper than a second COUNT query that would have
// to repeat the tag-match grouping below.
async function findEventIdsByFilters(q) {
    const base = buildEventBaseOptions(q);

    // If no tag filter, just use the base ordering and return IDs
    if (!q.tags?.length) {
        const rows = await Event.findAll({
            ...base,
            attributes: [[col("Event.id"), "id"]],
            raw: true,
        });
        return rows.map(r => r.id);
    }

    const slugs = [...new Set(q.tags)];

    const rows = await Event.findAll({
        ...base,
        attributes: [
            [col("Event.id"), "id"],
            [fn("COUNT", fn("DISTINCT", col("Tags.id"))), "tagMatchCount"],
        ],
        include: [
            ...base.include,
            {
                model: Tag,
                as: "Tags",
                attributes: [],
                where: { slug: slugs },
                through: { attributes: [] },
                required: true,
            },
        ],
        group: ["Event.id"],
        order: [[literal('"tagMatchCount"'), "DESC"], ...base.order],
        subQuery: false,
        raw: true,
    });

    return rows.map(r => r.id);
}

async function fetchEventsWithAllTags(ids) {
    if (!ids.length) return [];

    const events = await Event.findAll({
        where: { id: { [Op.in]: ids } },
        include: [{
            model: Tag,
            as: "Tags",
            attributes: ["id", "name", "slug"],
            through: { attributes: [] },
            required: false,
        }],
    });

    const map = new Map(events.map(e => [e.id, e]));
    return ids.map(id => map.get(id)).filter(Boolean);
}

async function getEvents(q) {
    const ids = await findEventIdsByFilters(q);
    const pageIds = ids.slice(q.offset, q.offset + q.limit);
    const rows = await fetchEventsWithAllTags(pageIds);
    return { rows, total: ids.length };
}

module.exports = { getEvents };
