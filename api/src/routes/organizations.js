const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const { updateEventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");
const validate = require("../middleware/validate");

// GET organizations
router.get('/', async (req, res) => {
    try {
        const orgs = await Organization.findAll();
        return res.status(200).json({
            message: "success",
            data: orgs,
        });
    } catch (err) {
        res.status(500).json({ findError: err.message });
    }
});

// CREATE a new org
router.post('/',
    validate({
        body: orgValidation,
    }),
    async (req, res) => {
        try {
            const newOrg = await Organization.create(req.validatedBody);

            return res.status(200).json({
                "message": "success",
                "data": newOrg
            });

        } catch (err) {
            return res.status(400).json({ createError: err.errors });
        }
    }
);

// GET organization by id
router.get('/:oid', 
    validate({
        params: orgParamsValidation,
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;
            const org = await Organization.findByPk(oid);

            if (!org) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "success",
                data: org
            });
        } catch (err) {
            res.status(500).json({ findError: err.message });
        }
    }
);

// REPLACE an event
router.put('/:oid', 
    validate({
        params: orgParamsValidation,
        body: orgValidation,
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;
            const body = req.validatedBody;

            const org = await Organization.findByPk(oid);
            if (!org) return res.status(404).json({ error: `Org with id ${oid} not found` });

            await Organization.update(
                body, { where: { id: oid } }
            );

            const updatedOrganization = await Organization.findByPk(oid);
            return res.status(200).json({
                message: "success",
                data: updatedOrganization
            });
        } catch (err) {
            res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE an org's fields
router.patch('/:oid',
    validate({
        params: orgParamsValidation,
        body: orgUpdateValidation,
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;
            const body = req.validatedBody;

            const org = await Organization.findByPk(oid);
            if (!org) return res.status(404).json({ error: `Org with id ${oid} not found` });

            await Organization.update(
                body, { where: { id: oid } }
            );

            const updatedOrganization = await Organization.findByPk(oid);
            return res.status(200).json({
                message: "success",
                data: updatedOrganization
            });

        } catch (err) {
            res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an org
router.delete('/:oid',
    validate({
        params: orgParamsValidation
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;
            
            const deletedCount = await Organization.destroy({
                where: { id: oid }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "deleted",
                changes: deletedCount
            });
        } catch (err) {
            res.status(400).json({ destroyError: err.message });
        }
    }
);

// GET events by organizations
router.get('/:oid/events',
    validate({
        params: orgParamsValidation
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;

            const events = await Event.findAll({
                where: { organizationId: oid }
            });

            if (events.length < 1) return res.status(404).json({ error: "Events not found" });

            return res.status(200).json({
                message: "success",
                data: events,
            });
        } catch (err) {
            res.status(500).json({ findError: err.message });
        }
    }
);

// CREATE a new event
router.post('/:oid/events',
    validate({
        params: orgParamsValidation,
        body: updateEventValidation,
    }),
    async (req, res) => {
        try {
            const oid = req.validatedId.oid;
            const body = req.validatedBody;
            
            const newEvent = await Event.create({
                organizationId: oid,
                ...body,     
            });

            return res.status(200).json({
                "message": "success",
                "data": newEvent
            });

        } catch (err) {
            console.log(" BE error: " + err);
            return res.status(400).json({ createError: err.message });
        }
    }
);

module.exports = router;