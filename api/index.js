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
  // This creates the table if it's missing
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            role TEXT
        )`, (err) => {
            if (err) {
                console.error("Table creation failed:", err.message);
            } else {
                console.log("Users table is ready.");
            }
        });
});

app.use(express.json()); //Lets the API read JSON data sent to it

//Okay trying to implement a GET route
app.get('/api/users', (req, res) => {
    const sql = "SELECT * FROM users";
    
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

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:${port}')
})