const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { 
    eventValidation, 
    eventParamValidation, 
    updateEventValidation, 
    EventsQuerySchema, 
    searchQueryValidation,
    attendeeBodyValidation,
    attendeeParamValidation,
    addTagValidation
} = require("../schemas/event.schema");
const { createTagValidation, tagSlugValidation } = require('../schemas/tag.schema');
const validate = require("../middleware/validate");
const load = require("../middleware/load");
const parseTags = require("../middleware/parseTags")
const { searchEvents, indexEvent, removeEvent } = require('../services/searchService');
const { getEvents } = require("../services/buildEventQuery");

// GET events
router.get('/',
    validate({ query: EventsQuerySchema }),
    async (req, res, next) => {
        const query = req.validatedQuery

        try {
            const events = await getEvents(query);

            return res.status(200).json({
                message: "success",
                data: events
            })
        } catch (err) {
            next(err);
        }
    }
);

// SEARCH events
router.get('/search',
    validate({ query: searchQueryValidation }),
    async (req, res, next) => {
        try {
            const { q } = req.validatedQuery;
            const results = await searchEvents(q);
            return res.status(200).json({
                message: "success",
                data: results
            });
        } catch (err) {
            next(err);
        }
    }
);

// GET list of tags
router.get('/tags', async (req, res, next) => {
    try {
        const tags = await Tag.findAll();
        if (!tags) return res.status(404).json({ error: "No tags to display "});
        
        return res.status(200).json({
            message: "success",
            tags: tags,
        })
    } catch (err) {
        next(err);
    }
});

// ADD a tag
router.post('/tags',
    validate({ body: createTagValidation }),
    async (req, res, next) => {
        try {
            const newTag = await Tag.create(req.validatedBody);
            
            return res.status(200).json({
                message: "success",
                data: newTag
            });
        } catch (err) {
            next(err);
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
    async (req, res, next) => {
        const tag = req.tag;

        try {
            await tag.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// GET event by id
router.get('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
        include: [{ model: Tag, through: { attributes: [] } }]
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
    async (req, res, next) => {
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
            next(err);
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
    async (req, res, next) => {
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
            next(err);
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
    async (req, res, next) => {
        const event = req.event;

        try {
            await removeEvent(event.id);
            await event.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// GET event attendees
router.get('/:eid/attendees',
    validate({
        params: eventParamValidation,
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
        include: [{
            model: User,
            attributes: ['id', 'username', 'displayName', 'profilePic'],
            through: { attributes: [] }
        }]
    }),
    async (req, res) => {
        const event = req.event;

        console.log(event);
        return res.status(200).json({
            message: "success",
            data: event.Users
        });
    }
);

// ADD an attendee
router.post('/:eid/attendees',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
    }),
    validate({ body: attendeeBodyValidation }), // user validation and load will go away once auth is set up
    load(User, {
        identifier: "userId",
        modelField: "id",
        reqKey: "user",
        origin: "validatedBody"
    }),
    async (req, res, next) => {
        const event = req.event;
        const user = req.user;

        try {
            await event.addUser(user.id);
            return res.status(201).json({ message: "joined" });
        } catch (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
              return res.status(409).json({ error: "already attending" });
            }
            next(err);
        }
    }
);

// REMOVE attendee
router.delete('/:eid/attendees/me',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
    }),
    validate({ body: attendeeBodyValidation }), // user validation will go away once auth is set up
    load(User, {
        identifier: "userId",
        modelField: "id",
        reqKey: "user",
        origin: "validatedBody"
    }),
    async (req, res, next) => {
        const event = req.event;
        const user = req.user;

        try {
            await event.removeUser(user.id);
            return res.status(200).json({ message: "removed" });
        } catch (err) {
            next(err);
        }
    }
);


module.exports = router;