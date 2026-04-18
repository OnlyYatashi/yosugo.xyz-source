const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

function loadData(filename) {
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    return [];
}

function saveData(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

const ADMIN_CODE = 'yosugoadmin2026';

const defaultUsers = [
    {
        username: 'admin',
        password: 'YoungFinal070811$$',
        displayName: 'Young',
        pfp: 'https://i.pinimg.com/736x/71/d1/8e/71d18ec075e722c02d06c52ad769a333.jpg',
        bio: 'the man himself',
        isAdmin: true,
        joinDate: '2026-01-01T00:00:00.000Z',
        idiotsPosted: []
    }
];

function initializeData() {
    const users = loadData('users.json');
    if (users.length === 0) {
        saveData('users.json', defaultUsers);
        console.log('Initialized default users');
    }
    if (!fs.existsSync(path.join(DATA_DIR, 'idiots.json'))) {
        saveData('idiots.json', []);
    }
    if (!fs.existsSync(path.join(DATA_DIR, 'comments.json'))) {
        saveData('comments.json', []);
    }
}

initializeData();

app.post('/api/signup', (req, res) => {
    const { username, password, displayName, pfp } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const users = loadData('users.json');
    
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already taken' });
    }
    
    const newUser = {
        username,
        password,
        displayName: displayName || username,
        pfp: pfp || '',
        bio: '',
        isAdmin: false,
        joinDate: new Date().toISOString(),
        idiotsPosted: []
    };
    
    users.push(newUser);
    saveData('users.json', users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const users = loadData('users.json');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.get('/api/users', (req, res) => {
    const users = loadData('users.json');
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

app.get('/api/users/:username', (req, res) => {
    const users = loadData('users.json');
    const user = users.find(u => u.username === req.params.username);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.put('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const { displayName, pfp, bio, currentPassword } = req.body;
    
    const users = loadData('users.json');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (currentPassword && users[userIndex].password !== currentPassword) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    
    if (displayName) users[userIndex].displayName = displayName;
    if (pfp !== undefined) users[userIndex].pfp = pfp;
    if (bio !== undefined) users[userIndex].bio = bio;
    
    saveData('users.json', users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
});

app.post('/api/idiots', (req, res) => {
    const { name, reason, images, postedBy } = req.body;
    
    if (!name || !reason) {
        return res.status(400).json({ error: 'Name and reason required' });
    }
    
    const idiots = loadData('idiots.json');
    
    const newIdiot = {
        id: Date.now().toString(),
        name,
        reason,
        images: images || [],
        postedBy: postedBy || 'Anonymous',
        date: new Date().toISOString()
    };
    
    idiots.unshift(newIdiot);
    saveData('idiots.json', idiots);
    
    res.json(newIdiot);
});

app.get('/api/idiots', (req, res) => {
    const idiots = loadData('idiots.json');
    res.json(idiots);
});

app.delete('/api/idiots/:id', (req, res) => {
    const { id } = req.params;
    const { adminCode } = req.body;
    
    if (adminCode !== ADMIN_CODE) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let idiots = loadData('idiots.json');
    idiots = idiots.filter(i => i.id !== id);
    saveData('idiots.json', idiots);
    
    res.json({ success: true });
});

app.post('/api/comments', (req, res) => {
    const { profileUsername, commenter, displayName, pfp, text } = req.body;
    
    if (!profileUsername || !commenter || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const comments = loadData('comments.json');
    
    const newComment = {
        id: Date.now().toString(),
        profileUsername,
        commenter,
        displayName: displayName || commenter,
        pfp: pfp || '',
        text,
        date: new Date().toISOString()
    };
    
    comments.push(newComment);
    saveData('comments.json', comments);
    
    res.json(newComment);
});

app.get('/api/comments/:profileUsername', (req, res) => {
    const comments = loadData('comments.json');
    const profileComments = comments.filter(c => c.profileUsername === req.params.profileUsername);
    res.json(profileComments);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});