const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { Op } = require('sequelize');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../schemas/auth.schema');
const bcrypt = require('bcrypt');

// REGISTER a user
router.post('/register/user',
    validate({ body: registerValidation }),
    async (req, res, next) => {
        try {
            const { username, email, password } = req.validatedBody;

            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });

            if (existingUser) {
                return res.status(409).json({
                    message: existingUser.email === email
                        ? "Email already in use"
                        : "Username already in use",
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const newUser = await User.create({ username, email, passwordHash });

            const token = jwt.sign(
                { kind: "user", id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(201).json({
                message: "successfully registered",
                token,
            });
        } catch (err) {
            next(err);
        }
    }
);

// REGISTER an organization
router.post('/register/org',
    validate({ body: registerValidation }),
    async (req, res, next) => {
        try {
            const { email, password } = req.validatedBody;

            const existingOrg = await Organization.findOne({ where: { email } });
            if (existingOrg) return res.status(409).json({ message: "Email already in use" });

            const passwordHash = await bcrypt.hash(password, 12);
            const newOrg = await Organization.create({
                name: "New Organization",
                email,
                passwordHash,
            });

            const token = jwt.sign(
                { kind: "org", id: newOrg.id, username: newOrg.name, email: newOrg.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(201).json({
                message: "successfully registered",
                token,
            });
        } catch (err) {
            next(err);
        }
    }
);

// Log in a user
router.post('/login/user',
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, username, password } = req.validatedBody;

            const user = await User.findOne({ where: (email ? { email } : { username }) });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { kind: "user", id: user.id, username: user.username, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({ message: "Login successful", token });
        } catch (err) {
            next(err);
        }
    }
);

// Log in an org
router.post('/login/org',
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, password } = req.validatedBody;

            const org = await Organization.findOne({ where: { email } });
            if (!org) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, org.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { kind: "org", id: org.id, username: org.name, email: org.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({ message: "Login successful", token });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
