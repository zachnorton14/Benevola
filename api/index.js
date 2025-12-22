const express = require('express');
const app = express();
const sequelize = require('./src/database');
const PORT = process.env.PORT || 3000;

const eventsRouter = require('./src/routes/events');

// Middleware to parse JSON bodies
app.use(express.json());

// HOME
app.get('/', (req, res) => {
    res.send("Hello world")
});

// API Routes
app.use('/api/events', eventsRouter);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database connected and synced.');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
