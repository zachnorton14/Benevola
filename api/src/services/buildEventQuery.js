const { Op, fn, col, literal } = require("sequelize");
const Tag = require("../models/Tag")
const Event = require("../models/Event")

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

function buildEventBaseOptions(q) {
    const options = {
        where: {},
        include: [],
        limit: q.limit,
        offset: q.offset,
        order: [["date", "ASC"]],
    };

  // date filters
    if (q.date) {
            const { start, end } = dayBounds(q.date);
            options.where.date = { [Op.between]: [start, end] };
    } else {
        if (q.afterDate) {
            const { start } = dayBounds(q.afterDate);
            options.where.date = { ...(options.where.date || {}), [Op.gte]: start };
        }
        if (q.beforeDate) {
            const { end } = dayBounds(q.beforeDate);
            options.where.date = { ...(options.where.date || {}), [Op.lte]: end };
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
    if (q.nearLat != null || q.nearLng != null || q.radiusM != null) {
        if (q.nearLat == null || q.nearLng == null || q.radiusM == null) {
            throw Object.assign(new Error("nearLat, nearLng, and radiusM must be provided together"), {
                status: 400,
            });
        }

        const latDelta = q.radiusM / 69;
        const lngDelta = q.radiusM / (69 * Math.cos((q.nearLat * Math.PI) / 180));

        options.where.latitude = { [Op.between]: [q.nearLat - latDelta, q.nearLat + latDelta] };
        options.where.longitude = { [Op.between]: [q.nearLng - lngDelta, q.nearLng + lngDelta] };
    }

  return options;
}

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
    const ids = await findEventIdsByFilters(q);
    return await fetchEventsWithAllTags(ids);
}
  
module.exports = { getEvents };