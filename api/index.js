// npm install dotenv if erroring here
// the env variables weren't working for me (owen) until I implemented this,
// possibly a Windows vs iOS issue?
require("dotenv").config({ quiet: true });

const express = require('express');
const app = express();
const sequelize = require('./src/db/database');
const redisClient = require('./src/redis/client');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
require("./src/models/associations");

const BE_PORT = process.env.BE_PORT || 5173;
const FE_PORT = process.env.FE_PORT || 3000;
const DOMAIN = process.env.DOMAIN;

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// required for fetch on frontend instead of using form POSTs
// must come before express.json / express.urlencoded
const cors = require("cors");
app.use(cors({
  origin: `${DOMAIN}:${FE_PORT}`,
  credentials: true
}));

// configure the redis client
app.use(session({
    store: new RedisStore({ client: redisClient }),
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}))

// get routes
const eventsRouter = require('./src/routes/events');
const orgsRouter = require('./src/routes/organizations');
const usersRouter = require('./src/routes/users');
const authRouter = require('./src/routes/auth');
const { errorHandler } = require("./src/middleware/errorHandler");

// HOME
app.get('/', (req, res) => {
    res.send("Home route")
});

// API Routes
app.use('/', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/orgs', orgsRouter);
app.use('/api/users', usersRouter);
app.use(errorHandler);


// enable foreign keys for all sqlite sessions
sequelize.addHook("afterConnect", async (connection) => {
    await new Promise((resolve, reject) => {
        connection.run("PRAGMA foreign_keys = ON;", (err) =>
            err ? reject(err) : resolve()
        );
    });
});

// Start server
sequelize.authenticate().then(() => {
    console.log('Database connected.');
    app.listen(BE_PORT, () => {
        console.log(`Server is running on ${DOMAIN}:${BE_PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
