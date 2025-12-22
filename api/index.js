const express = require('express');
const app = express();
app.use(express.json()); //Lets the API read JSON data sent to it
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 3000;

//Connects to the database file
const db = new sqlite3.Database('./data/BenevolaDB.db', (err) => {
  if (err) {
    console.error("There was an error opening the database: ", err.message);
  } else {
    console.log("Successfully connected to the SQLite Database.");
  }
  // This creates the table if it's missing a table of events
        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            longitude REAL,
            latitude REAL,
            description TEXT,
            date_time TEXT DEFAULT (datetime('now')) NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Table creation failed:", err.message);
            } else {
                console.log("Events table is ready.");
            }
        });
});

// HOME
app.get('/', (req, res) => {
    res.send("Hello world")
});

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
    const event = { name, location, longitude, latitude, description };
    const sql = `INSERT INTO events (name, location, longitude, latitude, description) 
                 VALUES (?, ?, ?, ?, ?)
                 CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
                 CHECK (latitude  IS NULL OR (latitude  >=  -90 AND latitude  <=  90))`;
    const params = [name, location, longitude, latitude, description];

    if ( !name || !location ) {
        return res.status(400).json({ error: "name and location are required" });
    }

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...event  }
        });
    });
});

app.delete('/api/events/:id', (req, res) => {
    const params = [req.params.id];
    const sql = "DELETE FROM events WHERE id = ?";

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
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  