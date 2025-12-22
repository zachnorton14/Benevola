const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// HOME
app.get('/', (req, res) => {
    res.send("Hello world")
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//Connects to the database file
const db = new sqlite3.Database('./BenevaolaDB', (err) => {
  if (err) {
    console.error("There was an error opening the database: ", err.message);
  } else {
    console.log("Successfully connected to the SQLite Database.");
  }
  // This creates the table if it's missing a table of events
        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            location TEXT,
            longitude REAL,
            latitude REAL,
            description TEXT,
            date_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Table creation failed:", err.message);
            } else {
                console.log("Events table is ready.");
            }
        });
});

app.use(express.json()); //Lets the API read JSON data sent to it

//Okay trying to implement a GET route
app.get('/api/events', (req, res) => {
    const sql = "SELECT * FROM events";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/events', (req, res) => {
    const { name, location, longitude, latitude, description } = req.body;
    const sql = `INSERT INTO events (name, location, longitude, latitude, description) 
                 VALUES (?, ?, ?, ?, ?)`;
    const params = [name, location, longitude, latitude, description];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

app.delete('/api/events/:id', (req, res) => {
    const sql = "DELETE FROM events WHERE id = ?";
    const params = [req.params.id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "deleted",
            "changes": this.changes // Tells you how many rows were removed
        });
    });
});

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:${port}')
})