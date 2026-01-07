const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Attendance = require('../models/EventAttendance');
const { 
    eventValidation, 
    eventParamValidation, 
    updateEventValidation, 
    eventQueryValidation, 
    searchQueryValidation,
    attendeeBodyValidation,
    attendeeParamValidation
} = require("../schemas/event.schema");
const { createTagValidation, tagSlugValidation } = require('../schemas/tag.schema');
const validate = require("../middleware/validate");
const load = require("../middleware/load");
const parseTags = require("../middleware/parseTags")
const { searchEvents, indexEvent, removeEvent } = require('../services/searchService');

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [{ model: Tag, through: { attributes: [] } }],
        });
        return res.status(200).json({
            message: "success",
            data: events,
        });
    } catch (err) {
        return res.status(500).json({ findError: err.message });
    }
});

// GET events by query
router.get('/',
    validate({ query: eventQueryValidation }),
    async (req, res) => {

    }
);

// SEARCH events
router.get('/search',
    validate({ query: searchQueryValidation }),
    async (req, res) => {
        try {
            const { q } = req.validatedQuery;
            const results = await searchEvents(q);
            return res.status(200).json({
                message: "success",
                data: results
            });
        } catch (err) {
            return res.status(500).json({ searchError: err.message });
        }
    }
);

// GET list of tags
router.get('/tags', async (req, res) => {
    try {
        const tags = await Tag.findAll();
        if (!tags) return res.status(404).json({ error: "No tags to display "});
        
        return res.status(200).json({
            message: "success",
            tags: tags,
        })
    } catch (err) {
        return res.status(500).json({ findError: err.message });
    }
});

// POST a tag
router.post('/tags',
    validate({ body: createTagValidation }),
    async (req, res) => {
        try {
            const newTag = await Tag.create(req.validatedBody);
            
            return res.status(200).json({
                message: "success",
                data: newTag
            });
        } catch (err) {
            return res.status(500).json({ createError: err.errors });
        }
    }
);

// DELETE tag by slug
router.delete('/tags/:slug',
    validate({ params: tagSlugValidation }),
    load(Tag, {
        identifier: "slug",
        modelField: "slug",
        reqKey: "tag",
        findMethod: "findOne"
    }),
    async (req, res) => {
        const tag = req.tag;

        try {
            await tag.destroy();
            return res.status(204).end();
        } catch (err) {
            return res.status(500).json({ destroyError: err.message });
        }
    }
);

// GET event by id
router.get('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    async (req, res) => {
        return res.status(200).json({
            message: "success",
            data: req.event
        });
    }
);

// REPLACE an event
router.put('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    validate({ body: eventValidation }),
    parseTags(Tag, false),
    async (req, res) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            const updated = await sequelize.transaction(async (t) => {
                event.set(body);
                await event.save({ transaction: t });
                await event.setTags(req.parsedTags, { transaction: t });
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            })

            await indexEvent(updated.event);
            return res.status(200).json({
                message: "success",
                "data": updated
            });
        } catch (err) {
            return res.status(500).json({ updateError: err });
        }
    }
);

// UPDATE an event's fields
router.patch('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    validate({ body: updateEventValidation }),
    parseTags(Tag),
    async (req, res) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            const updated = await sequelize.transaction(async (t) => {
                if (body && Object.keys(body).length > 0) {
                    event.set(body);
                    await event.save({ transaction: t });
                }
                if (tags !== undefined){
                    await event.setTags(req.parsedTags, { transaction: t });
                }
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            });

            await indexEvent(updated.event);
            return res.status(200).json({
                message: "success",
                "data": updated
            });
        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an event
router.delete('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    async (req, res) => {
        const event = req.event;

        try {
            await removeEvent(event.id);
            await event.destroy();
            return res.status(204).end();
        } catch (err) {
            return res.status(500).json({ destroyError: err.message });
        }
    }
);

// GET event attendees
router.get('/:eid/attendees',
    validate({
        params: eventParamValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedParams ? req.validatedParams.eid : req.validatedId.eid;
            const event = await Event.findByPk(eid, {
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'displayName', 'profilePic'],
                    through: { attributes: [] }
                }]
            });

            if (!event) return res.status(404).json({ error: "Event not found" });

            return res.status(200).json({
                message: "success",
                data: event.Users
            });
        } catch (err) {
            return res.status(500).json({ findError: err.message });
        }
    }
);

// ADD attendee
router.post('/:eid/attendees',
    validate({
        params: eventParamValidation,
        body: attendeeBodyValidation
    }),
    async (req, res) => {
        try {
            const eid = req.validatedParams ? req.validatedParams.eid : req.validatedId.eid;
            const { userId } = req.validatedBody;

            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: "Event not found" });

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            const [attendance, created] = await Attendance.findOrCreate({
                where: { eventId: eid, userId: userId }
            });

            if (!created) {
                return res.status(409).json({ error: "User is already attending this event" });
            }

            return res.status(201).json({
                message: "success",
                data: attendance
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
);

// REMOVE attendee
router.delete('/:eid/attendees/:uid',
    validate({
        params: attendeeParamValidation
    }),
    async (req, res) => {
        try {
            const { eid, uid } = req.validatedParams || req.validatedId; // Fallback for safety

            const deleted = await Attendance.destroy({
                where: {
                    eventId: eid,
                    userId: uid
                }
            });

            if (deleted === 0) {
                return res.status(404).json({ error: "Attendance record not found" });
            }

            return res.status(200).json({
                message: "success",
                changes: deleted
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
);


module.exports = router;