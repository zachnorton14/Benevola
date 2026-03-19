const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(' ')[1];
    let principal;
    try {
        principal = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }

    const { kind, id } = principal;
    if (kind !== "user" && kind !== "org") {
        return res.status(401).json({ message: "Invalid token" });
    }

    const account = kind === "user"
        ? await User.findByPk(id)
        : await Organization.findByPk(id);

    if (!account) {
        return res.status(401).json({ message: "Invalid token" });
    }

    req.principal = principal;
    if (kind === "user") req.user = account;
    else req.org = account;

    next();
};

module.exports = authenticate;
