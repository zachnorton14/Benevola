const { z } = require("zod");

const orgParamValidation = z.object({
    orgId: z.coerce.number().int().positive(),
})

module.exports = { orgParamValidation };
