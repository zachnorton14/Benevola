function preload(Model, {
    identifier,                // field name inside req.validatedParams
    modelField,                // field name in DB/model (often same as identifier)
    reqKey,                    // where to attach instance on req, e.g. "event"
    notFoundStatus = 404,      // string OR (ctx) => string
    findMethod = "findByPk",   // "findByPk" or "findOne" (auto if not provided)
    include,
} = {}) {
    const key = reqKey ?? (Model.name[0].toLowerCase() + Model.name.slice(1));
  
    return async (req, res, next) => {
        try {
            const value = req.validatedParams?.[identifier];
  
            // if validate middleware was forgotten/mis-ordered, fail loudly (dev-time bug)
            if (value === undefined) {
                return res.status(500).json({
                    error: `loadOne misconfigured: missing req.validatedParams.${identifier}`,
                });
            }
    
            const method =
                findMethod ??
                (modelField === "id" ? "findByPk" : "findOne");
    
            const instance =
                method === "findByPk"
                    ? await Model.findByPk(value, include ? { include } : undefined)
                    : await Model.findOne({
                        where: { [modelField]: value },
                        ...(include ? { include } : {}),
                    });
    
            if (!instance) return res.status(notFoundStatus).json({ error: `Could not find ${reqKey} with ${modelField} ${value}` });
    
            req[key] = instance;
            return next();
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = preload;