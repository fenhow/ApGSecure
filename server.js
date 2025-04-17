const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "admin123";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

// Homepage route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Secure Gateway</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>🔒 Secure Login Gateway</h2>
        <p>This endpoint is designed to protect links behind a login page.</p>
        <p>To access, use the embedded form on the main website or <a href="/admin">go to the admin panel</a>.</p>
      </body>
    </html>
  `);
});

// Load users from JSON file
function loadUsers() {
  const data = fs.readFileSync(path.join(__dirname, 'users.json'));
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
}

const tokens = {};
const adminTokens = new Set();

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (users[username] && users[username].password === password) {
    const token = uuidv4();
    tokens[token] = { url: users[username].url, used: false };
    return res.json({ success: true, token });
  }
  res.json({ success: false });
});

// Redirect API
app.get('/redirect/:token', (req, res) => {
  const { token } = req.params;
  const record = tokens[token];

  if (record && !record.used) {
    record.used = true;
    return res.send(`
      <html>
        <head><meta http-equiv="refresh" content="0;url=${record.url}"></head>
        <body><p>Redirecting...</p></body>
      </html>
    `);
  }

  res.send("<h3>Invalid or expired link.</h3>");
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = uuidv4();
    adminTokens.add(token);
    return res.json({ success: true, token });
  }
  res.json({ success: false });
});

// Get user list
app.get('/admin/users', (req, res) => {
  const { token } = req.query;
  if (!adminTokens.has(token)) return res.status(403).json({ error: "Unauthorized" });

  const users = loadUsers();
  res.json(users);
});

// Add user
app.post('/admin/users', (req, res) => {
  const { token } = req.query;
  if (!adminTokens.has(token)) return res.status(403).json({ error: "Unauthorized" });

  const { username, password, url } = req.body;
  const users = loadUsers();
  users[username] = { password, url };
  saveUsers(users);
  res.json({ success: true });
});

// Delete user
app.delete('/admin/users', (req, res) => {
  const { token, username } = req.query;
  if (!adminTokens.has(token)) return res.status(403).json({ error: "Unauthorized" });

  const users = loadUsers();
  delete users[username];
  saveUsers(users);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));