const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { eventValidation, eventParamValidation, updateEventValidation, eventQueryValidation } = require("../schemas/event.schema");
const validate = require("../middleware/validate")

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll();
        return res.status(200).json({
            message: "success",
            data: events,
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// GET events by query
router.get('/',
    validate({
        query: eventQueryValidation
    }),
    async (req, res) => {

    }
);

// GET event by id
router.get('/:eid',
    validate({
        params: eventParamValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            
            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: "Event not found" });

            return res.status(200).json({
                message: "success",
                data: event
            });
        } catch (err) {
            res.status(500).json({ findError: err.message });
        }
    }
);

// REPLACE an event
router.put('/:eid',
    validate({
        params: eventParamValidation,
        body: eventValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            const body = req.validatedBody;

            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

            await Event.update(
                body, { where: { id: eid } }
            );

            const updatedEvent = await Event.findByPk(eid);
            return res.status(200).json({
                message: "success",
                "data": updatedEvent
            });

        } catch (err) {
            res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE an event's fields
<<<<<<< HEAD
router.patch('/:eid', async (req, res) => {
    try {
        // print for debugging
        console.log(req.body);

        // validate id route param
        const validatedId = eventParamValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ error: validatedId.error.issues });
=======
router.patch('/:eid',
    validate({
        params: eventParamValidation,
        body: updateEventValidation,
    }), 
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            const body = req.validatedBody;
>>>>>>> 8ff0a78001d559ca1d5c5c8821d263905ee67416

            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

            await Event.update(
                body, { where: { id: eid } }
            );
            
            const updatedEvent = await Event.findByPk(eid);
            return res.status(200).json({ 
                message: "success",
                "data": updatedEvent
            });

        } catch (err) {
            res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an event
router.delete('/:eid',
    validate({
        params: eventParamValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            
            const deletedCount = await Event.destroy({
                where: { id: eid }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "deleted",
                changes: deletedCount
            });
            
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

module.exports = router;