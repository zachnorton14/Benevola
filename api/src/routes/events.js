const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { eventValidation, eventParamValidation, updateEventValidation, } = require("../schemas/event.schema");

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json({
            "message": "success",
            "data": events
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// GET event by id
router.get('/:eid', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.eid);

        if (!event) {
            return res.status(404).json({ "error": "Event not found" });
        }

        res.json({
            "message": "success",
            "data": event
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// REPLACE an event
router.put('/:eid', async (req, res) => {
    try {
        const paramValidation = eventParamValidation.safeParse(req.params.eid);
        if (!paramValidation.success) return res.status(400).json({ error: paramValidation.error.issues });

        const eid = Number(req.params.eid);

        const event = await Event.findByPk(eid);
        if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

        const bodyValidation = eventValidation.safeParse(req.body);
        if (!bodyValidation.success) return res.status(400).json({ error: bodyValidation.error.issues })

        const { title, description, capacity, time, duration, tags, latitude, longitude, image } = req.body;

        const [updated] = await Event.update({
            title,
            description,
            capacity,
            time,
            duration,
            tags,
            latitude,
            longitude,
            image
        }, {
            where: { id: eid }
        });

        if (updated) {
            const updatedEvent = await Event.findByPk(eid);
            return res.status(200).json({ "message": "success", "data": updatedEvent });
        } else {
            return res.status(200).json({ "message": "No changes applied; resource already up to date" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// UPDATE an event's fields
router.patch('/:eid', async (req, res) => {
    try {
        // validate id route param
        const paramValidation = eventParamValidation.safeParse(req.params.eid);
        if (!paramValidation.success) return res.status(400).json({ error: paramValidation.error.issues });

        const eid = Number(req.params.eid);

        // 

        const { ...body } = req.body

        const updates = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No fields provided to update" });

        const event = await Event.findByPk(eid);
        if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

        const bodyValidation = updateEventValidation.safeParse(updates);
        if (!bodyValidation.success) return res.status(400).json({ error: bodyValidation.error.issues })

        const [updated] = await Event.update({
            organizationId,
            title,
            description,
            capacity,
            time,
            duration,
            tags,
            latitude,
            longitude,
            image
        }, {
            where: { id: eid }
        });

        if (updated) {
            const updatedEvent = await Event.findByPk(eid);
            return res.status(200).json({ "message": "success", "data": updatedEvent });
        } else {
            return res.status(200).json({ "message": "No changes applied; resource already up to date" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// DELETE an event
router.delete('/:eid', async (req, res) => {
    try {
        const id = req.params.eid;
        const deletedCount = await Event.destroy({
            where: { id: id }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ "error": "Event not found" });
        }

        res.json({
            "message": "deleted",
            "changes": deletedCount
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

module.exports = router;