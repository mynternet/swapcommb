// app.js
const express = require('express');
const app = express();

app.use(express.json());

// Mock user data (replace this with a real database in a production app)
const users = [];

// User registration route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Validate input (basic validation for demonstration purposes)
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  // Check if the email is already registered
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  // Create a new user object and add it to the users array
  const newUser = { username, email, password };
  users.push(newUser);

  // Return a success message
  res.status(201).json({ message: 'User registered successfully.' });
});

module.exports = app;

