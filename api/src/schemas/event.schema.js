const { z } = require("zod");

const eventValidation = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    startTime: z.coerce.date().optional(),
    durationMinutes: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    image: z.url().optional()
});

module.exports = { eventValidation, };