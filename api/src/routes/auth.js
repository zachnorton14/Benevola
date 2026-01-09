const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerValidation, loginValidation, googleAuthValidation } = require('../schemas/auth.schema');

const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret_key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// POST /register
router.post('/register',
    validate({ body: registerValidation }),
    async (req, res) => {
        try {
            const { username, email, password, displayName, profilePic } = req.validatedBody;

            const userCheck = await User.findOne({ where: { email } });
            if (userCheck) {
                return res.status(409).json({ message: 'Email already in use' });
            }
            const usernameCheck = await User.findOne({ where: { username } });
            if (usernameCheck) {
                return res.status(409).json({ message: 'Username already taken' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                username,
                email,
                passwordHash,
                displayName: displayName || username, // Default display name
                profilePic,
                role: 'user'
            });

            const token = generateToken(newUser);

            return res.status(201).json({
                message: 'User registered successfully',
                data: {
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role,
                        displayName: newUser.displayName,
                        profilePic: newUser.profilePic
                    },
                    token
                }
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
);

// POST /login
router.post('/login',
    validate({ body: loginValidation }),
    async (req, res) => {
        try {
            const { email, password } = req.validatedBody;

            const user = await User.findOne({ where: { email } });

            if (!user || !user.passwordHash) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.passwordHash);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = generateToken(user);

            return res.status(200).json({
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        displayName: user.displayName,
                        profilePic: user.profilePic
                    },
                    token
                }
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
);

// POST /logout
router.post('/logout', (req, res) => {
    // Since we are using stateless JWTs, we can't really invalidate the token on the server
    // without a blacklist. For now, we just respond with success.
    res.status(200).json({ message: 'Logout successful' });
});

// GET /me
router.get('/me', authenticate, (req, res) => {
    const user = req.user;
    return res.status(200).json({
        message: 'success',
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
});

// POST /google
router.post('/google',
    validate({ body: googleAuthValidation }),
    async (req, res) => {
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
            console.error(err);
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
);

module.exports = router;
