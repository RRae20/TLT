require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Expose the current route to EJS templates for active navigation highlighting.
app.use((req, res, next) => { res.locals.currentPath = req.path; next(); });

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Attach Socket.io instance to all incoming HTTP requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('⚡ A user connected to live sockets:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔥 User disconnected:', socket.id);
    });
});

// Static Assets & Templating Setup
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'public/js'))); // Serve JS folder
app.use(express.static(path.join(__dirname, 'public')));          // Serve public root (sw.js, manifest, etc.)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'disaster_system_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Route Definitions
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const evacueeRoutes = require('./routes/evacuee');

// Mount Routers Explicitly
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/evacuee', evacueeRoutes);
app.use('/api', apiRoutes);
app.use('/', indexRoutes);

// Global 404 Fallback - Triggered ONLY if no router handles the request
app.use((req, res) => {
    res.status(404).send('Ay sorry, wala yung page na hinahanap mo. Parang mali yung URL.');
});

// Start Database & HTTP/Socket Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server and WebSockets running successfully at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});