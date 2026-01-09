const { z } = require("zod");

const registerValidation = z.object({
    username: z.string(120).min(1),
    email: z.email(),
    password: z.string().min(8), // Enforce some password strength
    displayName: z.string().optional(),
    profilePic: z.url().nullable().optional(),
}).strict();

const loginValidation = z.object({
    email: z.email(),
    password: z.string().min(1),
}).strict();

const googleAuthValidation = z.object({
    token: z.string().min(1),
}).strict();

module.exports = { registerValidation, loginValidation, googleAuthValidation };
