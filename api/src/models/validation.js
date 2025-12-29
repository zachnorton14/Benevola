const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  time: z.string().datetime().optional(), // or z.coerce.date()
  durationMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  image: z.string().url().optional()
});