const express = require('express');
const app = express();
const sequelize = require('./src/db/database');

// required for fetch on frontend instead of using form POSTs
// must come before express.json / express.urlencoded
const cors = require("cors");
app.use(cors({
  origin: `http://localhost:${FE_PORT}`
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
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
