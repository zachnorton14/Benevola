const { z } = require("zod");

const orgParamsValidation = z.object({
    oid: z.coerce.number().int().positive(),
})

module.exports = { orgParamsValidation };
