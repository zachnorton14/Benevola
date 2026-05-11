const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const Tag = require("../models/Tag");
const { updateEventValidation } = require("../schemas/event.schema");
const { orgParamsValidation, orgValidation, orgUpdateValidation, } = require("../schemas/org.schema");
const validate = require("../middleware/validate");
const parseTags = require("../middleware/parseTags");
const load = require("../middleware/load");
const authenticate = require('../middleware/authenticate');
const { requireOrg, verifyOwnership, } = require('../middleware/authorization');

// GET organizations
router.get('/', async (req, res, next) => {
    try {
        const orgs = await Organization.findAll();
        return res.status(200).json({
            message: "success",
            data: orgs,
        });
    } catch (err) {
        next(err);
    }
});

// CREATE a new org
router.post('/',
    validate({ body: orgValidation }),
    async (req, res, next) => {
        try {
            const newOrg = await Organization.create(req.validatedBody);

            return res.status(200).json({
                message: "success",
                data: newOrg
            });

        } catch (err) {
            next(err);
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
    authenticate,
    requireOrg,
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: orgValidation }),
    verifyOwnership(req => req.org.id),
    async (req, res, next) => {
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
            next(err);
        }
    }
);

// UPDATE an org's fields
router.patch('/:oid',
    authenticate,
    requireOrg,
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: orgUpdateValidation }),
    verifyOwnership(req => req.org.id),
    async (req, res, next) => {
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
            next(err);
        }
    }
);

// DELETE an org
router.delete('/:oid',
    authenticate,
    requireOrg,
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    verifyOwnership(req => req.org.id),
    async (req, res, next) => {
        const org = req.org;

        try {
            await org.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// GET an organization's events
router.get('/:oid/events',
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    async (req, res, next) => {
        const org = req.org;

        try {
            const events = await org.getEvents();

            return res.status(200).json({
                message: "success",
                data: events,
            });
        } catch (err) {
            next(err);
        }
    }
);

// CREATE a new event
router.post('/:oid/events',
    authenticate,
    requireOrg,
    validate({ params: orgParamsValidation }),
    load(Organization, {
        identifier: "oid",
        modelField: "id",
        reqKey: "org"
    }),
    validate({ body: updateEventValidation }),
    parseTags(Tag, false),
    verifyOwnership(req => req.org.id),
    async (req, res, next) => {
        const org = req.org;
        const body = req.validatedBody;

        try {
            const created = await sequelize.transaction(async (t) => {
                const event = await org.createEvent(body, { transaction: t });
                await event.setTags(req.parsedTags, { transaction: t });
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            });

            return res.status(201).json({
                message: "success",
                data: created
            });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;