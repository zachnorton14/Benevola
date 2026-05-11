
const requireOrg = (req, res, next) => {
    if (req.principal.kind !== "org") return res.status(403).json({ message: "Forbidden" });
    next();
};

const requireUser = (req, res, next) => {
    if (req.principal.kind !== "user") return res.status(403).json({ message: "Forbidden" });
    next();
};

// Usage: verifyOwnership(req => req.user.id) or verifyOwnership(req => req.event.organizationId)
const verifyOwnership = (getOwnerId) => (req, res, next) => {
    const principalId = req.principal.id;

    if (principalId !== getOwnerId(req)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};

module.exports = { requireOrg, requireUser, verifyOwnership }
