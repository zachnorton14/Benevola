const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const Tag = require("../models/Tag");
const { updateEventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");
const validate = require("../middleware/validate");
const parseTags = require("../middleware/parseTags");
const preload = require("../middleware/preload");

// GET organizations
router.get('/', async (req, res) => {
    try {
        const orgs = await Organization.findAll();
        return res.status(200).json({
            message: "success",
            data: orgs,
        });
    } catch (err) {
        return res.status(500).json({ findError: err.message });
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
            return res.status(500).json({ findError: err.message });
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
            return res.status(500).json({ updateError: err.message });
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
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an org
router.delete('/:oid',
    validate({
        params: orgParamsValidation
    }),
    preload(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res) => {
        const org = req.org;

        try {
            const deletedCount = await Organization.destroy(
                { where: { id: org.id } },
            );

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({
                message: "deleted",
                changes: deletedCount
            });
        } catch (err) {
            return res.status(400).json({ destroyError: err.message });
        }
    }
);

// GET events by organizations
router.get('/:oid/events',
    validate({
        params: orgParamsValidation
    }),
    preload(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res) => {
        const org = req.org;

        try {
            const events = await Event.findAll({
                where: { organizationId: org.id }
            });

            if (events.length < 1) return res.status(404).json({ error: "No events found under this organization" });

            return res.status(200).json({
                message: "success",
                data: events,
            });
        } catch (err) {
            return res.status(500).json({ findError: err.message });
        }
    }
);

// CREATE a new event
router.post('/:oid/events',
    validate({ params: orgParamsValidation }),
    preload(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: updateEventValidation }),
    parseTags(Tag, false),
    async (req, res) => {
        const org = req.org;
        const body = req.validatedBody;
        const tags = req.parsedTags;

        const t = await sequelize.transaction();
        try {
            const newEvent = await Event.create(
                { organizationId: org.id, ...body, },
                { transaction: t }
            );

            await newEvent.setTags(tags, { transaction: t });
            await t.commit();

            return res.status(201).json({
                "message": "success",
                "data": newEvent,
            });

        } catch (err) {
            await t.rollback();
            return res.status(500).json({ createError: err.message });
        }
    }
);

module.exports = router;