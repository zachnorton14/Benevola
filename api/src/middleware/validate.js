const validate = ({ params, body, query }) => {
    return (req, res, next) => {
        // validate params
        if (params) {
            const validatedId = params.safeParse(req.params);
            if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });

            req.validatedId = validatedId.data;
        }
        //validate body
        if (body) {
            const validatedBody = body.safeParse(req.body);
            if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

            req.validatedBody = validatedBody.data;
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