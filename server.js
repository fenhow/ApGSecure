const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load users
function loadUsers() {
  const data = fs.readFileSync(path.join(__dirname, 'users.json'));
  return JSON.parse(data);
}

// In-memory tokens
const tokens = {};

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

// Redirect endpoint
app.get('/redirect/:token', (req, res) => {
  const { token } = req.params;
  const record = tokens[token];

  if (record && !record.used) {
    record.used = true;
    return res.send(\`
      <html>
        <head><meta http-equiv="refresh" content="0;url=\${record.url}"></head>
        <body><p>Redirecting...</p></body>
      </html>
    \`);
  }

  res.send("<h3>Invalid or expired link.</h3>");
});

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));