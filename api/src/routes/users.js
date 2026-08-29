const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { userParamsValidation, userValidation, userUpdateValidation, } = require("../schemas/user.schema");
const validate = require("../middleware/validate");
const load = require("../middleware/load");
const authenticate = require("../middleware/authenticate");
const { requireUser, requireAdmin, verifyOwnership } = require("../middleware/authorization");

// GET users
// The full listing exposes every volunteer's email address, so it is not
// something to hand out anonymously. Individual profiles stay public.
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const users = await User.findAll();
        return res.status(200).json({
            message: "success",
            data: users,
        });
    } catch (err) {
        next(err);
    }
});

// CREATE a new user
// Sign-up goes through POST /api/auth/register/user, which hashes the password
// properly. This route takes a passwordHash directly, so it is an admin tool
// rather than a public endpoint.
router.post('/',
    authenticate,
    requireAdmin,
    validate({
        body: userValidation,
    }),
    async (req, res, next) => {
        try {
            const newUser = await User.create(req.validatedBody);

            return res.status(200).json({
                "message": "success",
                "data": newUser
            });

        } catch (err) {
            next(err);
        }
    }
);

// GET user by id
router.get('/:uid',
    validate({
        params: userParamsValidation
    }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    async (req, res) => {
        return res.status(200).json({
            message: "success",
            data: req.user
        });
    }
);
// REPLACE a user
router.put('/:uid', 
    authenticate,
    requireUser,
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    validate({ body: userValidation }),
    verifyOwnership(req => req.user.id),
    async (req, res, next) => {
        try {
            const user = req.user;
            const body = req.validatedBody;

            user.set(body);

            if (!user.changed()) {
                return res.status(200).json({
                    message: "No changes were made",
                    data: user
                })
            }

            await user.save();

            return res.status(200).json({
                message: "success",
                data: user
            });
        } catch (err) {
            next(err);
        }
    }
);

// UPDATE a user's fields
router.patch('/:uid',
    authenticate,
    requireUser,
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    validate({ body: userUpdateValidation }),
    verifyOwnership(req => req.user.id),
    async (req, res, next) => {
        try {
            const user = req.user;
            const body = req.validatedBody;

            await user.set(body);

            if (!user.changed()) {
                return res.status(200).json({
                    message: "No changes were made",
                    data: user
                })
            }

            await user.save();

            return res.status(200).json({
                message: "success",
                data: user
            });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE a user
router.delete('/:uid',
    authenticate,
    requireUser,
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    verifyOwnership(req => req.user.id),
    async (req, res, next) => {
        const user = req.user;

        try {
            await user.destroy();
            return res.status(204).end()
        } catch (err) {
            next(err);
        }
    }
);

// GET events user is attending
router.get('/:uid/events',
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
        include: { model: Event }
    }),
    async (req, res, next) => {
        try {
            const user = req.user;
            const events = user.Events;

            return res.status(200).json({
                message: "success",
                data: events,
            });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;