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
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    image: z.url().nullable()
});

const updateEventValidation = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    time: z.coerce.date().optional(),
    duration: z.coerce.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    image: z.url().optional(),
  }).strict();

module.exports = { eventValidation, updateEventValidation, };