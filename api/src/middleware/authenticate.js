const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret_key';

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        // Check if token is blacklisted
        const blacklisted = await TokenBlacklist.findOne({ where: { token } });
        if (blacklisted) {
            return res.status(401).json({ message: 'Token invalid (logged out)' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Optionally verify user exists in DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token: User not found' });
        }

        req.user = user;
        req.token = token; // Pass token to request for logout route usage
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
