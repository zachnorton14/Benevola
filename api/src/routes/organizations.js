const express = require('express');
const router = express.Router();
const Organization = require('../models/Event');
const {
    eventValidation,
    createEventSchema,
  } = require("../schemas/event.schema");
const {
    orgParamValidation,
  } = require("../schemas/org.schema");


// CREATE a new event
router.post('/:orgId/events', async (req, res) => {
    try {
        // debugging
        console.log(req.body);

        const paramsResult = orgParamValidation.safeParse(req.params);
        if (!paramsResult.success) {
            return res.status(400).json({ error: paramsResult.error.issues });
        }

        const organizationId = Number(req.params.orgId);
        const bodyResult = eventValidation.safeParse(req.body);

        
        if (!bodyResult.success) {
            return res.status(400).json({ error: bodyResult.error.issues });
        }

        const { title, description, capacity, time, duration, tags, latitude, longitude, image } = req.body;
        
        console.log("Parsed all data successfully");
        const newEvent = await Event.create({
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