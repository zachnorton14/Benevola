const { z } = require("zod");

const tagSlugValidation = z.object({
    slug: z.string().regex(new RegExp(/^[a-z0-9-]+$/), {
        message: " Slug must contain only lowercase letters, numbers, and hyphens"
    })
});

const createTagValidation = z.object({
    name: z.string(),
    slug: z.string().regex(new RegExp(/^[a-z0-9-]+$/), {
        message: " Slug must contain only lowercase letters, numbers, and hyphens"
    })
});

module.exports = { createTagValidation, tagSlugValidation };