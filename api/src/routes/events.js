const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const { eventValidation, eventParamValidation, updateEventValidation, eventQueryValidation, searchQueryValidation } = require("../schemas/event.schema");
const { createTagValidation, tagSlugValidation } = require('../schemas/tag.schema');
const validate = require("../middleware/validate")
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
    validate({
        query: eventQueryValidation
    }),
    async (req, res) => {

    }
);

// SEARCH events
router.get('/search',
    validate({
        query: searchQueryValidation
    }),
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
    validate({
        body: createTagValidation,
    }),
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
    validate({
        params: tagSlugValidation
    }),
    async (req, res) => {
    try {
        const slug = req.validatedId.slug;

        const tag = await Tag.findOne({ where: { slug: slug } });
        if (!tag) return res.status(404).json({ error: "Tag not found" });

        const deleted = await Tag.destroy({
            where: {
                slug: slug
            }
        });
        if (deleted < 1) return res.status(400).json({ message: "Nothing was deleted" });

        return res.status(200).json({
            message: "success",
            changes: deleted
        })
    } catch (err) {
        return res.status(500).json({ destroyError: err.message });
    }
});

// GET event by id
router.get('/:eid',
    validate({
        params: eventParamValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            
            const event = await Event.findByPk(eid, {
                include: [{ model: Tag, through: { attributes: [] } }],
              });
            if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

            return res.status(200).json({
                message: "success",
                data: event
            });
        } catch (err) {
            return res.status(500).json({ findError: err.message });
        }
    }
);

// REPLACE an event
router.put('/:eid',
    validate({
        params: eventParamValidation,
        body: eventValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            const body = req.validatedBody;
            const { tags: tags } = body;

            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

            await Event.update(
                body, { where: { id: eid } }
            );

            const updatedEvent = await Event.findByPk(eid);
            updatedEvent.setTags(tags);

            // Sync with Elasticsearch
            await indexEvent(updatedEvent);

            return res.status(200).json({
                message: "success",
                "data": updatedEvent
            });

        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// UPDATE an event's fields
router.patch('/:eid',
    validate({
        params: eventParamValidation,
        body: updateEventValidation,
    }), 
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            const body = req.validatedBody;

            const event = await Event.findByPk(eid);
            if (!event) return res.status(404).json({ error: `Event with id ${eid} not found` });

            await Event.update(
                body, { where: { id: eid } }
            );
            
            const updatedEvent = await Event.findByPk(eid);

            // Sync with Elasticsearch
            await indexEvent(updatedEvent);

            return res.status(200).json({ 
                message: "success",
                "data": updatedEvent
            });

        } catch (err) {
            return res.status(500).json({ updateError: err.message });
        }
    }
);

// DELETE an event
router.delete('/:eid',
    validate({
        params: eventParamValidation,
    }),
    async (req, res) => {
        try {
            const eid = req.validatedId.eid;
            
            const deletedCount = await Event.destroy({
                where: { id: eid }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            // Sync with Elasticsearch
            await removeEvent(eid);

            return res.status(200).json({
                message: "deleted",
                changes: deletedCount
            });
            
        } catch (err) {
            return res.status(500).json({ destroyError: err.message });
        }
    }
);

module.exports = router;