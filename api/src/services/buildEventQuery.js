const { Op, fn, col, literal, where } = require("sequelize");
const Tag = require("../models/Tag")
const Event = require("../models/Event")
const { searchEvents } = require("./searchService");

function dayBounds(yyyy_mm_dd) {
    const start = new Date(`${yyyy_mm_dd}T00:00:00.000`);
    const end = new Date(`${yyyy_mm_dd}T23:59:59.999`);
    return { start, end };
}

function combineDateAndTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00.000`);
}

function toHHmmss(timeHHmm) {
    return `${timeHHmm}:00`;
}

function buildEventBaseOptions(q, esIds = null) {
    const options = {
        where: {},
        include: [],
        limit: q.limit,
        offset: q.offset,
        order: [["date", "ASC"]],
    };

    if (esIds) {
        options.where.id = { [Op.in]: esIds };
    }

  // date filters
    if (q.date) {
        options.where[Op.and] = [
            where(fn("date", col("date")), q.date)
        ]
    } else {
        options.where[Op.and] = options.where[Op.and] || [];
        if (q.afterDate) {
            options.where[Op.and].push(
                where(fn("date", col("date")), { [Op.gte]: q.afterDate })
            );
        }
        if (q.beforeDate) {
            options.where[Op.and].push(
                where(fn("date", col("date")), { [Op.lte]: q.beforeDate })
            );
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
        const timeClauses = [];
        if (q.afterTime) {
            timeClauses.push(where(fn("time", col("date")), { [Op.gte]: toHHmmss(q.afterTime) }));
        }
        if (q.beforeTime) {
            timeClauses.push(where(fn("time", col("date")), { [Op.lte]: toHHmmss(q.beforeTime) }));
        }
        if (timeClauses.length) {
            options.where[Op.and] = [...(options.where[Op.and] || []), ...timeClauses];
        }
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

async function findEventIdsByFilters(q, esIds = null) {
    const base = buildEventBaseOptions(q, esIds);
  
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
        order: [[literal('"tagMatchCount"'), "DESC"], ["date", "ASC"]],
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
    let esIds = null;
    if (q.q) {
        const searchResults = await searchEvents(q.q);
        esIds = searchResults.map(hit => hit.id);
        
        // If search returned nothing, return early with empty results
        if (esIds.length === 0) return [];
    }

    const ids = await findEventIdsByFilters(q, esIds);
    return await fetchEventsWithAllTags(ids);
}
  
module.exports = { getEvents };