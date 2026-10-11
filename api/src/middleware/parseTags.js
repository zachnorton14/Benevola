function parseTags(TagModel, optional = true) {
    return async (req, res, next) => {
        try {
            const slugs = [...new Set(req.tags)];

            if (slugs === undefined) {
                if (optional) {
                    req.parsedTags = [];
                    return next();
                }
                return res.status(400).json({ error: "request body is missing tags" });
            }
    
            const tagRows = slugs.length
                ? await TagModel.findAll({ where: { slug: slugs }})
                : [];
            
            const found = new Set(tagRows.map(t => t.slug));
            const missing = slugs.filter(s => !found.has(s));
            if (missing.length) return res.status(400).json({ parseTagError: "Unknown tag(s)", details: { missing } });

            req.parsedTags = tagRows
            return next();
        } catch (err) {
            return next(err)
        }
    }
}

module.exports = parseTags;