const { z } = require("zod");

const orgParamsValidation = z.object({
    oid: z.coerce.number().int().positive(),
})
const orgValidation = z.object({
    name: z.string().max(120).min(1),
    description: z.string().nullable(),
    email: z.email(),
    passwordHash: z.string(),
    phone: z.string().nullable(),
    address: z.string().max(150).nullable(),
    bannerImg: z.url().nullable(),
    iconImg: z.url().nullable(),
}).strict();

const orgUpdateValidation = z.object({
    name: z.string().max(120).min(1).optional(),
    description: z.string().nullable().optional(),
    email: z.email().optional(),
    passwordHash: z.string().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().max(150).nullable(),
    bannerImg: z.url().nullable().optional(),
    iconImg: z.url().nullable().optional(),
})
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
    });

module.exports = { orgParamsValidation, orgValidation, orgUpdateValidation};