const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const { updateEventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");

// CREATE a new org
router.post('/', async (req, res) => {
    try {
        const bodyResult = orgValidation.safeParse(req.body);
        if (!bodyResult.success) return res.status(400).json({ error: bodyResult.error.issues });
        
        const newOrg = await Organization.create(bodyResult.data);

        res.json({
            "message": "success",
            "data": newOrg
        });

    } catch (err) {
        console.log(" BE error: " + err);
        return res.status(400).json({ "error": err.message });
    }
});

// GET organizations
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
// REPLACE an event
router.put('/:oid', async (req, res) => {
    try {
        // validate id route param
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });

        const oid = validatedId.data.oid;

        // validate the request body
        const validatedBody = orgValidation.safeParse(req.body);
        if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

        const org = await Organization.findByPk(oid);
        if (!org) return res.status(404).json({ error: `Org with id ${oid} not found` });

       await Organization.update(
            validatedBody.data, { where: { id: oid } }
        );

        const updatedOrganization = await Organization.findByPk(oid);
        return res.status(200).json({ message: "success", "data": updatedOrganization });

    } catch (err) {
        res.status(500).json({ updateError: err.message });
    }
});

// UPDATE an org's fields
router.patch('/:oid', async (req, res) => {
        try {
        // validate id route param
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });

        const oid = validatedId.data.oid;

        // validate the request body
        const validatedBody = orgUpdateValidation.safeParse(req.body);
        if (!validatedBody.success) return res.status(400).json({ bodyValidationError: validatedBody.error.issues });

        const org = await Organization.findByPk(oid);
        if (!org) return res.status(404).json({ error: `Org with id ${oid} not found` });

       await Organization.update(
            validatedBody.data, { where: { id: oid } }
        );

        const updatedOrganization = await Organization.findByPk(oid);
        return res.status(200).json({ message: "success", "data": updatedOrganization });

    } catch (err) {
        res.status(500).json({ updateError: err.message });
    }
});

// DELETE an org
router.delete('/:oid', async (req, res) => {
    try {
        // validate oid
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });
        const oid = validatedId.data.oid;
        
        const deletedCount = await Organization.destroy({
            where: { id: oid }
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


// GET events by organizations
router.get('/:oid/events', async (req, res) => {
    try {
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ paramValidationError: validatedId.error.issues });
        const oid = validatedId.data.oid;

        const events = await Event.findAll({
            // include: [{
            //     model: Organization,
            //     where: { organizationId : oid }
            // }]
            where: { organizationId: oid }
        });
        if (events.length < 1) {
            return res.status(404).json({ error: "Events not found" });
        }
        res.json({
            message: "success",
            data: events,
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});


// CREATE a new event
router.post('/:oid/events', async (req, res) => {
    try {
        const validatedId = orgParamsValidation.safeParse(req.params);
        if (!validatedId.success) return res.status(400).json({ validateOrgParamError: validatedId.error.issues });

        const oid = validatedId.data.oid;

        const bodyResult = updateEventValidation.safeParse(req.body);
        if (!bodyResult.success) return res.status(400).json({ validateBodyError: bodyResult.error.issues });
        
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

module.exports = router;