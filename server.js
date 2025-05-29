const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const path = require('path');
app.use(express.urlencoded({ extended: false }));

const db = new sqlite3.Database('./data.db');

// Create the messages table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL
  )
`);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/submit', (req, res) => {
  const { name, message } = req.body;

  db.run(`INSERT INTO messages (name, message) VALUES (?, ?)`, [name, message], function(err) {
    if (err) {
      return res.send('Error saving your message.');
    }
    res.send('Message saved! <a href="/">Go back</a>');
  });
});
app.get('/messages', (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.send('Error loading messages');
    }

    // Build a simple HTML response
    let html = '<h1>All Messages</h1><ul>';
    for (let row of rows) {
      html += `<li><strong>${row.name}</strong>: ${row.message}</li>`;
    }
    html += '</ul><a href="/">Go back</a>';
    res.send(html);
  });
});



app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
