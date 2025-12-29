const { z } = require("zod");

const eventParamValidation = z.object({
    id: z.coerce.number().int().positive(),
})

const eventValidation = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    time: z.coerce.date().optional(),
    duration: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    image: z.url().optional()
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
    organizationId: z.coerce.number().int().positive().optional(),
  }).strict();

module.exports = { eventValidation, updateEventValidation, };