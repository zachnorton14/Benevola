const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

//app.use(express.urlencoded({ extended: true }));

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json({
            "message": "success",
            "data": events
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// // GET event by id
// router.get('/:id', async (req, res) => {
//     try {
//         const events = await Event.findOne();
//         res.json({
//             "message": "success",
//             "data": events
//         });
//     } catch (err) {
//         res.status(500).json({ "error": err.message });
//     }
// });

// CREATE a new event
router.post('/', async (req, res) => {
    try {
        const { title, description, capacity, time, duration, tags, latitude, longitude, image } = req.body;

        console.log(req.body);
        const formattedTags = "placeholder tag";

        //const { name, location, longitude, latitude, description } = req.body;
        const newEvent = await Event.create({
            title,
            description,
            capacity,
            time,
            duration,
            formattedTags,
            latitude,
            longitude,
            image
        });
        
        // send the user to the page for a successful new event created
        res.redirect("http://localhost:3001/success");
        //res.json({
        //    "message": "success",
        //    "data": newEvent
        //});
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// DELETE an event
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCount = await Event.destroy({
            where: { id: id }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ "error": "Event not found" });
        }

        res.json({
            "message": "deleted",
            "changes": deletedCount
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

module.exports = router;