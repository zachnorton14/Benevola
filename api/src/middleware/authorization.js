/* Authorization checks. All of these assume `authenticate` has already run, so
   req.principal is the signed-in account and req.session.principal describes it.

   Note the deliberate use of req.principal rather than req.user: load() reassigns
   req.user to whatever record the URL names, so reading it here would check the
   target instead of the caller. */

/** Admins are users carrying the admin role. Organizations are never admins. */
const isAdmin = (req) =>
    req.session?.principal?.kind === "user" && req.principal?.role === "admin";

/* Site administrators. Used for anything that is not owned by one account:
   the shared tag vocabulary, and the full user listing. */
const requireAdmin = (req, res, next) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Administrator access required" });
    }
    next();
};

/* Organization-only actions. Admins are allowed through so they can moderate
   content that belongs to an organization they do not own. */
const requireOrg = (req, res, next) => {
    if (req.session.principal.kind !== "org" && !isAdmin(req)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};

const requireUser = (req, res, next) => {
    if (req.session.principal.kind !== "user") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};

/* Usage: verifyOwnership(req => req.user.id) or verifyOwnership(req => req.event.organizationId)
   Admins bypass the ownership test: that is what makes moderation possible,
   and it is the only way an admin can act on somebody else's record. */
const verifyOwnership = (getOwnerId) => (req, res, next) => {
    if (isAdmin(req)) return next();

    const principalId = req.session.principal.id;

    if (principalId !== getOwnerId(req)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};

module.exports = { requireOrg, requireUser, requireAdmin, verifyOwnership, isAdmin };
