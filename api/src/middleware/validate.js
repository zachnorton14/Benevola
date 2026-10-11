const validate = ({ params, body, query }) => {
    return (req, res, next) => {
        // validate params
        if (params) {
            const validatedParams = params.safeParse(req.params);
            if (!validatedParams.success) return res.status(400).json({ paramValidationError: validatedParams.error.issues });

            req.validatedParams = validatedParams.data;
        }
        //validate body
        if (body) {
            const validatedBody = body.safeParse(req.body);
            if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

            const { tags: tags, ...restOfBody } = validatedBody.data;
            req.tags = tags;
            req.validatedBody = restOfBody;
        }
        // validate query 
        if (query) {
            const validatedQuery = query.safeParse(req.query);
            if (!validatedQuery.success) return res.status(400).json({ queryValidationError: validatedQuery.error.issues });

            req.validatedQuery = validatedQuery.data
        }

        next();
    }
}

module.exports = validate;