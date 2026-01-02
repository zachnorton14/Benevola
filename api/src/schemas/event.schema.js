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
    tags: z.array(z.string()).nullable(),
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
    tags: z.array(z.string()).nullable().optional(),
    address: z.string(150).nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    image: z.url().nullable().optional(),
  })
    .strict() // can also try .strip()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
    });

const eventQueryValidation = z.object({
    
})

module.exports = { eventValidation, updateEventValidation, eventParamValidation, eventQueryValidation };