const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { updateEventValidation, } = require("../schemas/event.schema");
const { userParamsValidation, userValidation, userUpdateValidation, } = require("../schemas/user.schema");
const validate = require("../middleware/validate");
const load = require("../middleware/load")

// GET users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json({
            message: "success",
            data: users,
        });
    } catch (err) {
        return res.status(500).json({ findError: err.message });
    }
});

// CREATE a new user
router.post('/',
    validate({
        body: userValidation,
    }),
    async (req, res) => {
        try {
            const newUser = await User.create(req.validatedBody);

            return res.status(200).json({
                "message": "success",
                "data": newUser
            });

        } catch (err) {
            return res.status(400).json({ createError: err.errors });
        }
    }
);

// GET users by id
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
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    validate({ body: userValidation }),
    async (req, res) => {
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
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE a user's fields
router.patch('/:uid',
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    validate({ body: userUpdateValidation }),
    async (req, res) => {
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
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE a user
router.delete('/:uid',
    validate({ params: userParamsValidation }),
    load(User, {
        identifier: "uid",
        modelField: "id",
        reqKey: "user",
    }),
    async (req, res) => {
        const user = req.user;

        try {
            await user.destroy();
            return res.status(204).end()
        } catch (err) {
            return res.status(400).json({ destroyError: err.message });
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
    async (req, res) => {
        try {
            const user = req.user;
            const events = user.Events;

            return res.status(200).json({
                message: "success",
                data: events,
            });
        } catch (err) {
            return res.status(500).json({ findError: err.message });
        }
    }
);

module.exports = router;