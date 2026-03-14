
const requireOrg = (req, res, next) => {
    if (req.principal.kind !== "org") return res.status(403).json({ message: "Forbidden" });
    next();
};

const requireUser = (req, res, next) => {
    if (req.principal.kind !== "user") return res.status(403).json({ message: "Forbidden" });
    next();
};

module.exports = { requireOrg, requireUser }