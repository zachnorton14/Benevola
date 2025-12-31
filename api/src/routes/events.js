const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { eventValidation, eventParamValidation, updateEventValidation, } = require("../schemas/event.schema");

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json({
            message: "success",
            data: events,
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// GET event by id
router.get('/:eid', async (req, res) => {
    try {
        // validate eid
        const validatedId = eventParamValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });
        const eid = validatedId.data.eid;
        
        // find event
        const event = await Event.findByPk(eid);

        if (!event) return res.status(404).json({ error: "Event not found" });

        res.json({
            message: "success",
            data: event
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// REPLACE an event
router.put('/:eid', async (req, res) => {
    try {
        // validate id route param
        const validatedId = eventParamValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });

        const eid = validatedId.data.eid;

        // validate the request body
        const validatedBody = eventValidation.safeParse(req.body);
        if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

        const event = await Event.findByPk(eid);
        if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

       await Event.update(
            validatedBody.data, { where: { id: eid } }
        );

        const updatedEvent = await Event.findByPk(eid);
        return res.status(200).json({ message: "success", "data": updatedEvent });

    } catch (err) {
        res.status(500).json({ updateError: err.message });
    }
});

// UPDATE an event's fields
router.patch('/:eid', async (req, res) => {
    try {
        // validate id route param
        const validatedId = eventParamValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });

        const eid = validatedId.data.eid;

        // validate the request body
        const validatedBody = updateEventValidation.safeParse(req.body);
        if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

        // check if valid id
        const event = await Event.findByPk(eid);
        if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

        await Event.update(
            validatedBody.data, { where: { id: eid } }
        );
        
        const updatedEvent = await Event.findByPk(eid);
        return res.status(200).json({ message: "success", "data": updatedEvent });

    } catch (err) {
        res.status(500).json({ updateError: err.message });
    }
});

// DELETE an event
router.delete('/:eid', async (req, res) => {
    try {
        // validate eid
        const validatedId = eventParamValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });
        const eid = validatedId.data.eid;
        
        const deletedCount = await Event.destroy({
            where: { id: eid }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({
            message: "deleted",
            changes: deletedCount
        });
        
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;