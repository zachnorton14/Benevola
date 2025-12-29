// npm install dotenv if erroring here
// the env variables weren't working for me (owen) until I implemented this,
// possibly a Windows vs iOS issue?
require("dotenv").config({ quiet: true });

const express = require('express');
const app = express();
const sequelize = require('./src/db/database');

const BE_PORT = process.env.BE_PORT || 5173;
const FE_PORT = process.env.FE_PORT || 3000;
const DOMAIN = process.env.DOMAIN;

// required for fetch on frontend instead of using form POSTs
// must come before express.json / express.urlencoded
const cors = require("cors");
app.use(cors({
  origin: `${DOMAIN}:${FE_PORT}`
}));

const eventsRouter = require('./src/routes/events');
const orgsRouter = require('./src/routes/organizations');

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HOME
app.get('/', (req, res) => {
    res.send("Home route")
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/orgs', orgsRouter);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database connected and synced.');
    app.listen(BE_PORT, () => {
        console.log(`Server is running on ${DOMAIN}:${BE_PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
