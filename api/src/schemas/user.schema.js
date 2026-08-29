const { z } = require("zod");

const userParamsValidation = z.object({
    uid: z.coerce.number().int().positive(),
})
const userValidation = z.object({
    username: z.string().max(50).min(2).regex(/^[a-zA-Z0-9_]+$/),
    email: z.email(),
    passwordHash: z.string(),
    displayName: z.string().nullable(),
    profilePic: z.url().nullable(),
    role: z.enum(["user", "admin"]),
}).strict();

// NOTE: `role` and `passwordHash` are deliberately not updatable here. This is a
// self-service endpoint (verifyOwnership limits it to your own record), so
// accepting them would let any logged-in user promote themselves to admin or
// set their own credential hash directly.
const userUpdateValidation = z.object({
    username: z.string().max(50).min(2).regex(/^[a-zA-Z0-9_]+$/).optional(),
    email: z.email().optional(),
    displayName: z.string().nullable().optional(),
    profilePic: z.url().nullable().optional(),
})  .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Provide at least one field to update",
    });

module.exports = { userParamsValidation, userValidation, userUpdateValidation};