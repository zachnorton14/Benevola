const { z } = require("zod");

const timeHHmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/); // 00:00 - 23:59
const dateYYYYMMDD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const tagSlug = z.string().regex(/^[a-z0-9-]+$/);

const eventParamValidation = z.object({
    eid: z.coerce.number().int().positive(),
})

const eventValidation = z.object({
    title: z.string().min(1),
    description: z.string().nullable(),
    capacity: z.number().int().positive().nullable(),
    date: z.coerce.date().nullable(),
    duration: z.number().int().positive().nullable(),
    tags: z.array(tagSlug).max(5).default([]),
    address: z.string(150).nullable(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    image: z.url().nullable()
}).strict();

const updateEventValidation = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    capacity: z.coerce.number().int().positive().nullable().optional(),
    date: z.coerce.date().nullable().optional(),
    duration: z.coerce.number().int().positive().nullable().optional(),
    tags: z.array(tagSlug).max(5).optional(),
    address: z.string(150).nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    image: z.url().nullable().optional(),
})
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
});

const tagsSchema = z.preprocess((val) => {
    if (val == null) return undefined;
  
    if (typeof val === "string") {
      return [val];
    }
    if (Array.isArray(val)) {
      return val;
    }
    return val;
  }, z.array(tagSlug).max(5).optional());
  

const EventsQuerySchema = z.object({
    tags: tagsSchema,

    date: dateYYYYMMDD.optional(),
    beforeDate: dateYYYYMMDD.optional(),
    afterDate: dateYYYYMMDD.optional(),

    beforeTime: timeHHmm.optional(),
    afterTime: timeHHmm.optional(),

    nearLat: z.coerce.number().min(-90).max(90).optional(),
    nearLng: z.coerce.number().min(-180).max(180).optional(),
    radiusM: z.coerce.number().positive().max(500).optional(),

    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    offset: z.coerce.number().int().min(0).optional().default(0), // for pagination
    sort: z.enum(["date", "createdAt"]).optional().default("date"),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
}).strict().superRefine((q, ctx) => {
    // date cannot be provided with beforeDate/afterDate
    if (q.date && (q.beforeDate || q.afterDate)) {
        ctx.addIssue({
            code: "invalid format",
            message: "`date` cannot be combined with `beforeDate` or `afterDate`",
        });
    }

    // if one near param provided, require all
    const anyGeo = q.nearLat != null || q.nearLng != null || q.radiusM != null;
    const allGeo = q.nearLat != null && q.nearLng != null && q.radiusM != null;
    if (anyGeo && !allGeo) {
        ctx.addIssue({
            code: "invalid format",
            message: "nearLat, nearLng, and radiusKm must be provided together",
        });
    }

    // Disallow wraparound time windows when both present
    if (q.afterTime && q.beforeTime) {
        if (q.afterTime > q.beforeTime) {
            ctx.addIssue({
                code: "invalid format",
                message: "afterTime must be <= beforeTime (wraparound windows not supported)",
            });
        }
    }
});

const searchQueryValidation = z.object({
    q: z.string().min(1),
})

const attendeeBodyValidation = z.object({
    userId: z.coerce.number().int().positive(),
}).strict();

const attendeeParamValidation = z.object({
    eid: z.coerce.number().int().positive(),
    uid: z.coerce.number().int().positive(),
});

const addTagValidation = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/)
}).strict();

module.exports = { 
    eventValidation, 
    updateEventValidation, 
    eventParamValidation, 
    EventsQuerySchema, 
    searchQueryValidation,
    attendeeBodyValidation,
    attendeeParamValidation,
    addTagValidation
};