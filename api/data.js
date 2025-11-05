const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Load database
function loadDatabase() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }
    return [];
}

// Save database
function saveDatabase(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
}

// GET - Get all users
app.get('/api/users', (req, res) => {
    const users = loadDatabase();
    res.json(users);
});

// POST - Add new user
app.post('/api/users', (req, res) => {
    const { number, status } = req.body;
    const users = loadDatabase();
    
    // Check if user already exists
    if (users.find(user => user.number === number)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    users.push({ number, status });
    if (saveDatabase(users)) {
        res.json({ message: 'User added successfully', users });
    } else {
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// PUT - Update user
app.put('/api/users/:number', (req, res) => {
    const { number } = req.params;
    const { status } = req.body;
    const users = loadDatabase();
    
    const userIndex = users.findIndex(user => user.number === number);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].status = status;
    if (saveDatabase(users)) {
        res.json({ message: 'User updated successfully', users });
    } else {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE - Delete user
app.delete('/api/users/:number', (req, res) => {
    const { number } = req.params;
    const users = loadDatabase();
    
    const filteredUsers = users.filter(user => user.number !== number);
    if (filteredUsers.length === users.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (saveDatabase(filteredUsers)) {
        res.json({ message: 'User deleted successfully', users: filteredUsers });
    } else {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Serve the frontend
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
