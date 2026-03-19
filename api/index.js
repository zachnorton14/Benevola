require("dotenv").config({ quiet: true });

const express = require('express');
const app = express();
const sequelize = require('./src/db/database');
require("./src/models/associations");

const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serverless-http can pre-set req.body as a Buffer or string, bypassing express.json()
app.use((req, res, next) => {
    if (Buffer.isBuffer(req.body)) {
        try { req.body = JSON.parse(req.body.toString('utf8')); } catch { req.body = {}; }
    } else if (typeof req.body === 'string') {
        try { req.body = JSON.parse(req.body); } catch { /* leave as-is */ }
    }
    next();
});

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    credentials: true
}));

// Routes
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
app.use('/api/auth', authRouter);
app.use(errorHandler);

// Local development
if (require.main === module) {
    const PORT = process.env.BE_PORT || 5173;
    sequelize.authenticate().then(() => {
        console.log('Database connected.');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => console.error('Unable to connect to the database:', err));
}

module.exports = app;
