const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const { eventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation } = require("../schemas/org.schema");

// CREATE a new event
router.post('/:oid/events', async (req, res) => {
    try {
        const paramsResult = orgParamsValidation.safeParse(req.params);
        if (!paramsResult.success) return res.status(400).json({ error: paramsResult.error.issues });

        const organizationId = Number(req.params.oid);

        const bodyResult = eventValidation.safeParse(req.body);
        if (!bodyResult.success) return res.status(400).json({ error: bodyResult.error.issues });
        
        const { title, description, capacity, date, duration, tags, address, latitude, longitude, image } = req.body;

        const newEvent = await Event.create({
            organizationId,
            title,
            description,
            capacity,
            date,
            duration,
            tags,
            address,
            latitude,
            longitude,
            image
        });

        res.json({
            "message": "success",
            "data": newEvent
        });

    } catch (err) {
        console.log(" BE error: " + err);
        return res.status(400).json({ "error": err.message });
    }
});

module.exports = router;