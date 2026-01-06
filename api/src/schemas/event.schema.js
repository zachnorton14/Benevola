const { z } = require("zod");

const eventParamValidation = z.object({
    eid: z.coerce.number().int().positive(),
})

const eventValidation = z.object({
    title: z.string().min(1),
    description: z.string().nullable(),
    capacity: z.number().int().positive().nullable(),
    date: z.coerce.date().nullable(),
    duration: z.number().int().positive().nullable(),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(5).default([]),
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
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(5).optional(),
    address: z.string(150).nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    image: z.url().nullable().optional(),
})
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
});

const eventQueryValidation = z.object({
    tags: z.array(z.string()).optional(),
})

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

module.exports = { 
    eventValidation, 
    updateEventValidation, 
    eventParamValidation, 
    eventQueryValidation, 
    searchQueryValidation,
    attendeeBodyValidation,
    attendeeParamValidation
};