const { z } = require("zod");

const userParamsValidation = z.object({
    uid: z.coerce.number().int().positive(),
})
const userValidation = z.object({
    username: z.string(120).min(1),
    email: z.email(),
    passwordHash: z.string(),
    displayName: z.string().nullable(),
    profilePic: z.url().nullable(),
    role: z.enum(["user", "admin"]),
}).strict();

const userUpdateValidation = z.object({
    username: z.string(120).min(1).optional(),
    email: z.email().optional(),
    passwordHash: z.string().optional(),
    displayName: z.string().nullable().optional(),
    profilePic: z.url().nullable().optional(),
    role: z.enum(["user", "admin"]).optional(),
})  .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
    });

module.exports = { userParamsValidation, userValidation, userUpdateValidation};