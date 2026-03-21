const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { EventImage } = require('../models/associations');
const {
    eventValidation,
    eventParamValidation,
    updateEventValidation,
    EventsQuerySchema,
    searchQueryValidation,
    galleryImageParamValidation,
    imageUploadUrlQueryValidation,
    galleryBodyValidation,
} = require("../schemas/event.schema");
const { createTagValidation, tagSlugValidation } = require('../schemas/tag.schema');
const validate = require("../middleware/validate");
const load = require("../middleware/load");
const parseTags = require("../middleware/parseTags");
const { generateUploadUrl, deleteFromS3 } = require("../services/s3");
const { searchEvents, indexEvent, removeEvent } = require('../services/searchService');
const { getEvents } = require("../services/buildEventQuery");
const authenticate = require("../middleware/authenticate");
const { requireUser, requireOrg, verifyOwnership } = require("../middleware/authorization");

// GET events
router.get('/',
    validate({ query: EventsQuerySchema }),
    async (req, res, next) => {
        const query = req.validatedQuery

        try {
            const events = await getEvents(query);

            return res.status(200).json({
                message: "success",
                results: events.length,
                data: events
            })
        } catch (err) {
            next(err);
        }
    }
);

// SEARCH events
router.get('/search',
    validate({ query: EventsQuerySchema }),
    async (req, res, next) => {
        const query = req.validatedQuery;

        try {
            const events = await getEvents(query);

            return res.status(200).json({
                message: "success",
                results: events.length,
                data: events
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
    authenticate,
    requireOrg,
    validate({
        params: eventParamValidation,
        body: eventValidation
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    parseTags(Tag, false),
    verifyOwnership(req => req.org.organizationId),
    async (req, res, next) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            if (event.coverPhoto && body.coverPhoto !== undefined && body.coverPhoto !== event.coverPhoto) {
                await deleteFromS3(event.coverPhoto);
            }

            const updated = await sequelize.transaction(async (t) => {
                event.set(body);
                await event.save({ transaction: t });
                await event.setTags(req.parsedTags, { transaction: t });
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            });

            await indexEvent(updated.event);
            return res.status(200).json({
                message: "success",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    }
);

// UPDATE an event's fields
router.patch('/:eid',
    authenticate,
    requireOrg,
    validate({
        params: eventParamValidation,
        body: updateEventValidation
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    parseTags(Tag),
    verifyOwnership(req => req.org.organizationId),
    async (req, res, next) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            if (event.coverPhoto && body.coverPhoto !== undefined && body.coverPhoto !== event.coverPhoto) {
                await deleteFromS3(event.coverPhoto);
            }

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
                data: updated
            });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE an event
router.delete('/:eid',
    authenticate,
    requireOrg,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    verifyOwnership(req => req.event.organizationId),
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
    authenticate,
    requireUser,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
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

// GET presigned upload URL(s) for cover photo or gallery
router.get('/:eid/image-upload-url',
    authenticate,
    requireOrg,
    validate({
        params: eventParamValidation,
        query: imageUploadUrlQueryValidation,
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const { type, contentType, count } = req.validatedQuery;
        try {
            if (type === 'cover') {
                const result = await generateUploadUrl(`events/${req.event.id}/cover`, contentType);
                return res.status(200).json({ message: "success", data: result });
            }

            const currentCount = await EventImage.count({ where: { eventId: req.event.id } });
            if (currentCount + count > 10) {
                return res.status(422).json({
                    error: `Gallery would exceed 10 images (currently has ${currentCount})`
                });
            }
            const urls = await Promise.all(
                Array.from({ length: count }, () =>
                    generateUploadUrl(`events/${req.event.id}/gallery`, contentType)
                )
            );
            return res.status(200).json({ message: "success", data: urls });
        } catch (err) {
            next(err);
        }
    }
);

// ADD gallery images (save S3 URLs after client-side upload)
router.post('/:eid/gallery',
    authenticate,
    requireOrg,
    validate({
        params: eventParamValidation,
        body: galleryBodyValidation,
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const { urls } = req.validatedBody;
        try {
            const currentCount = await EventImage.count({ where: { eventId: req.event.id } });
            if (currentCount + urls.length > 10) {
                return res.status(422).json({
                    error: `Gallery would exceed 10 images (currently has ${currentCount})`
                });
            }
            const images = await EventImage.bulkCreate(
                urls.map((url, i) => ({ eventId: req.event.id, url, position: currentCount + i }))
            );
            return res.status(201).json({ message: "success", data: images });
        } catch (err) {
            next(err);
        }
    }
);

// REMOVE a gallery image
router.delete('/:eid/gallery/:imageId',
    authenticate,
    requireOrg,
    validate({ params: galleryImageParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const { imageId } = req.validatedParams;
        try {
            const image = await EventImage.findOne({ where: { id: imageId, eventId: req.event.id } });
            if (!image) return res.status(404).json({ error: "Image not found" });
            await deleteFromS3(image.url);
            await image.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// REMOVE attendee
router.delete('/:eid/attendees/me',
    authenticate,
    requireUser,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
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