const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// HOME
app.get('/', (req, res) => {
    res.send("Hello world")
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});