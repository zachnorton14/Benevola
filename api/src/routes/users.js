const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { updateEventValidation, } = require("../schemas/event.schema");
const { userParamsValidation, userValidation, userUpdateValidation, } = require("../schemas/user.schema");
const validate = require("../middleware/validate");

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
    async (req, res) => {
        try {
            const uid = req.validatedId.uid;
            const user = await User.findByPk(uid);

            if (!user) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "success",
                data: user
            });
        } catch (err) {
            return res.status(500).json({ findError: err.message });
        }
    }
);
// REPLACE an event
router.put('/:uid', 
    validate({
        params: userParamsValidation,
        body: userValidation,
    }),
    async (req, res) => {
        try {
            const uid = req.validatedId.uid;
            const body = req.validatedBody;

            const user = await User.findByPk(uid);
            if (!user) return res.status(404).json({ error: `User with id ${uid} not found` });

            await User.update(
                body, { where: { id: uid } }
            );

            const updatedUser = await User.findByPk(uid);
            return res.status(200).json({
                message: "success",
                data: updatedUser
            });
        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE an user's fields
router.patch('/:uid',
    validate({
        params: userParamsValidation,
        body: userUpdateValidation,
    }),
    async (req, res) => {
        try {
            const uid = req.validatedId.uid;
            const body = req.validatedBody;

            const user = await User.findByPk(uid);
            if (!user) return res.status(404).json({ error: `User with id ${uid} not found` });

            await User.update(
                body, { where: { id: uid } }
            );

            const updatedUser = await User.findByPk(uid);
            return res.status(200).json({
                message: "success",
                data: updatedUser
            });

        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE a user
router.delete('/:uid',
    validate({
        params: userParamsValidation
    }),
    async (req, res) => {
        try {
            const uid = req.validatedId.uid;
            
            const deletedCount = await User.destroy({
                where: { id: uid }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "deleted",
                changes: deletedCount
            });
        } catch (err) {
            return res.status(400).json({ destroyError: err.message });
        }
    }
);

// GET events by user
router.get('/:uid/events',
    validate({
        params: userParamsValidation
    }),
    async (req, res) => {
        try {
            const uid = req.validatedId.uid;

            const user = await User.findByPk(uid, {
                include: {
                    model: Event,
                    through: { attributes: [] }
                }
            });

            if (!user) return res.status(404).json({ error: "User not found" });

            const events = user.Events;

            if (!events || events.length < 1) return res.status(404).json({ error: "Events not found" });

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