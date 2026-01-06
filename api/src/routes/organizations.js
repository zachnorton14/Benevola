const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const Tag = require("../models/Tag");
const { eventValidation, } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");
const validate = require("../middleware/validate");
const parseTags = require("../middleware/parseTags");
const load = require("../middleware/load");

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
    validate({ body: orgValidation }),
    async (req, res) => {
        try {
            const newOrg = await Organization.create(req.validatedBody);

            return res.status(200).json({
                message: "success",
                data: newOrg
            });

        } catch (err) {
            return res.status(400).json({ createError: err.errors });
        }
    }
);

// GET organization by id
router.get('/:oid', 
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res) => {
        return res.status(200).json({
            message: "success",
            data: req.org
        })
    }
);

// REPLACE an org
router.put('/:oid', 
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: orgValidation }),
    async (req, res) => {
        const org = req.org;
        const body = req.validatedBody;

        try {
            org.set(body);

            if (!org.changed()) {
                return res.status(200).json({
                    message: "no changes were made",
                    data: org
                });
            }

            await org.save();

            return res.status(200).json({
                message: "success",
                data: org
            });
        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE an org's fields
router.patch('/:oid',
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: orgUpdateValidation }),
    async (req, res) => {
        const org = req.org;
        const body = req.validatedBody;

        try {
            org.set(body);

            if (!org.changed()) {
                return res.status(200).json({
                    message: "no changes were made",
                    data: org
                });
            }

            await org.save();

            return res.status(200).json({
                message: "success",
                data: org
            });
        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an org
router.delete('/:oid',
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res) => {
        const org = req.org;

        try {
            await org.destroy();
            return res.status(204).end();
        } catch (err) {
            return res.status(500).json({ destroyError: err.message });
        }
    }
);

// GET events by organizations
router.get('/:oid/events',
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res) => {
        const org = req.org;

        try {
            const events = await org.getEvents();

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
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: eventValidation }),
    parseTags(Tag, false),
    async (req, res) => {
        const org = req.org;
        const body = req.validatedBody;
        const tags = req.parsedTags;

        const t = await sequelize.transaction();
        try {
            const newEvent = await org.createEvent( body, { transaction: t });

            await newEvent.setTags(tags, { transaction: t });
            const newTags = await newEvent.getTags({ transaction: t });
            await t.commit();

            return res.status(201).json({
                message: "success",
                data: {
                    event: newEvent,
                    tags: newTags
                }
            });

        } catch (err) {
            await t.rollback();
            return res.status(500).json({ createError: err.message });
        }
    }
);

module.exports = router;