const express = require('express');
const router = express.Router();
const Organization = require('../models/Event');

// CREATE a new event
router.post('/:orgId/events', async (req, res) => {
    try {
        const orgId = Number(req.params.orgId);

        if (!Number.isInteger(orgId)) {
            return res.status(400).json({ error: "Invalid organization id." });
        }

        const { title, description, capacity, time, duration, tags, latitude, longitude, image } = req.body;
        const lat = Number(latitude);
        const lon = Number(longitude);

        if ( !title || Number.isNaN(lat) || Number.isNaN(lon) ) {
            return res.status(400).json({ error: "Title, latitude, and longitude are required." });
        }

        if 

        const newEvent = await Event.create({
            orgId,
            title,
            description,
            capacity,
            time,
            duration,
            tags,
            latitude,
            longitude,
            image
        });
        
        res.json({
            "message": "success",
            "data": newEvent
        });

    } catch (err) {
        return res.status(400).json({ "error": err.message });
    }
});

module.exports = router;