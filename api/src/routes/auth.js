const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Organization = require('../models/Organization');
const { Op } = require('sequelize');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerValidation, loginValidation, googleAuthValidation } = require('../schemas/auth.schema');
const bcrypt = require('bcrypt');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// REGISTER a user
router.post('/register/user',
    validate({ body: registerValidation }),
    async (req, res, next) => {
        try {
            const { username, email, password } = req.validatedBody;

            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email },{ username }],
                },
            });

            if (existingUser){
                return res.status(409).json({
                    message: existingUser.email === email
                        ? "Email already in use"
                        : "Username already in use",
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = await User.create({
                username,
                email,
                passwordHash,
            }); // "user" role is default

            req.session.regenerate((err) => {
                if (err) return next(err);

                req.session.userId = newUser.id;

                return res.status(201).json({
                    message: "successfully registered",
                    data: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role,
                    }
                })
            })
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

            const existingOrg = await User.findOne({ where: { email } });
            if (existingOrg) return res.status(409).json({ message: "Email already in use" });

            const passwordHash = await bcrypt.hash(password, 12);

            const newOrg = await Organization.create({
                name: "New Organization",
                email,
                passwordHash,
            });

            req.session.regenerate((err) => {
                if (err) return next(err);

                req.session.userId = newUser.id;

                return res.status(201).json({
                    message: "successfully registered",
                    data: {
                        id: newOrg.id,
                        username: newOrg.name,
                        email: newOrg.email,
                    }
                })
            })
        } catch (err) {
            next(err);
        }
    }
);

// Log in a user
router.post('/login/user', authenticate,
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, username, password } = req.validatedBody;

            const user = await User.findOne({ where: (email ? { email } : { username }) });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            req.session.regenerate((err) => {
                if (err) return next(err);
        
                req.session.principal = { kind: "user", id: user.id };
        
                return res.status(200).json({
                    message: "Login successful",
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                });
            });
        } catch (err) {
            next(err);
        }
    }
);

// Log in an org
router.post('/login/org', authenticate,
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, password } = req.validatedBody;

            const org = await Organization.findOne({ where: { email } });
            if (!org) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, org.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            req.session.regenerate((err) => {
                if (err) return next(err);
        
                req.session.principal = { kind: "org", id: org.id };
        
                return res.status(200).json({
                    message: "Login successful",
                    data: {
                        id: org.id,
                        username: org.username,
                        email: org.email,
                        role: org.role,
                    },
                });
            });
        } catch (err) {
            next(err);
        }
    }
);

// POST /logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('sid');
        res.status(200).json({ message: 'logged out'});
    })
});

// GET /me
router.get('/me', authenticate, (req, res) => {
    return res.status(200).json({
        message: 'success',
        data: {
            kind: req.session.principal.kind,
            info: req.user ?? req.org
        }
    });
});

// POST /google
router.post('/google',
    validate({ body: googleAuthValidation }),
    async (req, res, next) => {
        try {
            const { token } = req.validatedBody;
            
            let payload;
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: GOOGLE_CLIENT_ID, 
                });
                payload = ticket.getPayload();
            } catch (googleErr) {

                console.error("Google verify error:", googleErr);
                return res.status(401).json({ message: 'Invalid Google token' });
            }

            const { email, name, picture, sub } = payload;

            if (!email) {
                return res.status(400).json({ message: 'Google account has no email' });
            }

            let user = await User.findOne({ where: { email } });

            if (!user) {

                const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                const passwordHash = await bcrypt.hash(randomPassword, 10);
                
                let baseUsername = email.split('@')[0];
                let username = baseUsername;
                let counter = 1;
                while (await User.findOne({ where: { username } })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                user = await User.create({
                    username,
                    email,
                    passwordHash,
                    displayName: name,
                    profilePic: picture,
                    role: 'user'
                });
            }

            const jwtToken = generateToken(user);

            return res.status(200).json({
                message: 'Google login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        displayName: user.displayName,
                        profilePic: user.profilePic
                    },
                    token: jwtToken
                }
            });

        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
