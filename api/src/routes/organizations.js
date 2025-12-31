const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const { eventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");

router.get('/', async (req, res) => {
    try {
        const orgs = await Organization.findAll();
        res.json({
            message: "success",
            data: orgs,
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// GET organization by id
router.get('/:oid', async (req, res) => {
    try {
         const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });
        const oid = validatedId.data.oid;

        const org = await Organization.findByPk(oid);

        if (!org) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({
            message: "success",
            data: org
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// CREATE a new event
router.post('/:oid/events', async (req, res) => {
    try {
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ error: validatedId.error.issues });

        const oid = validatedId.data.oid;

        const bodyResult = eventValidation.safeParse(req.body);
        if (!bodyResult.success) return res.status(400).json({ error: bodyResult.error.issues });
        
        const newEvent = await Event.create({
            organizationId: oid,
            ...bodyResult.data,     
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

// CREATE a new event
router.post('/', async (req, res) => {
    try {
        const bodyResult = eventValidation.safeParse(req.body);
        if (!bodyResult.success) return res.status(400).json({ error: bodyResult.error.issues });
        
        const newEvent = await Event.create(bodyResult);

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