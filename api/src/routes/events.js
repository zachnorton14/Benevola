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
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);

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
router.put('/:id', async (req, res) => {
    try {
        const paramValidation = eventParamValidation.safeParse(req.params.id);
        if (!paramValidation.success) return res.status(400).json({ error: paramValidation.error.issues });

        const id = Number(req.params.id);

        const event = await Event.findByPk(id);
        if (!event) return res.status(404).json({ error: `Event with id ${id} not found` });

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
            where: { id: id }
        });

        if (updated) {
            const updatedEvent = await Event.findByPk(id);
            return res.status(200).json({ "message": "success", "data": updatedEvent });
        } else {
            return res.status(200).json({ "message": "No changes applied; resource already up to date" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// // UPDATE an event's fields
// router.patch('/:id', async (req, res) => {
//     try {
//         const id = req.params.id;

//         const event = await Event.findByPk(id);
//         if (event == null) return res.status(404).json({ error: `Event with id ${id} not found` });

//         const { organizationId, title, description, capacity, time, duration, tags, latitude, longitude, image } = req.body;

//         const [updated] = await Event.update({
//             organizationId,
//             title,
//             description,
//             capacity,
//             time,
//             duration,
//             tags,
//             latitude,
//             longitude,
//             image
//         }, {
//             where: { id: id }
//         });

//         if (updated) {
//             const updatedEvent = await Event.findByPk(id);
//             return res.status(200).json({ "message": "success", "data": updatedEvent });
//         } else {
//             return res.status(200).json({ "message": "No changes applied; resource already up to date" });
//         }
//     } catch (err) {
//         res.status(500).json({ "error": err.message });
//     }
// });

// DELETE an event
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
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