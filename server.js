// server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express'); // تصحیح شده بود
const path = require('path');
const cors = require('cors'); // اضافه شد: پکیج CORS
const connectDB = require('./config/db');
const rankingRoutes = require('./routes/rankings');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// --- IMPORTANT: Project Seeding (Run Once) ---
// This function populates the 'projects' collection in MongoDB with initial data.
// It checks if projects already exist to prevent duplicates.
//
// UNCOMMENT the line below and run `npm start` (or `npm run dev`) for the FIRST TIME
// you set up the database.
//
// AFTER you see "Projects seeded successfully!" in your console,
// REMEMBER TO COMMENT THIS LINE OUT AGAIN (or remove it) to avoid
// unnecessary database checks on subsequent server starts.
// ---------------------------------------------
// seedProjects(); // <-- UNCOMMENT THIS LINE FOR THE FIRST RUN, THEN COMMENT IT OUT!

// !!! مهم: تنظیمات دقیق CORS برای حل قطعی مشکل !!!
// فقط به دامنه GitHub Pages شما اجازه دسترسی می‌دهد.
// اگر دامنه دیگری برای فرانت‌اند داشتید، آن را هم اضافه کنید (با کاما جدا کنید)
app.use(cors({
    origin: 'https://yggdrasil999.github.io', // دامنه دقیق فرانت‌اند شما در GitHub Pages
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // متدهای مجاز
    allowedHeaders: ['Content-Type', 'Authorization'], // هدرهای مجاز
    credentials: true // اگر در آینده نیاز به کوکی یا احراز هویت داشتید
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', rankingRoutes); // All ranking-related routes will be prefixed with /api

// Fallback for SPA (Single Page Application) routing or direct access to HTML files
// This ensures that if a user directly navigates to /leaderboard.html or /tierlist.html,
// or refreshes the page on those routes, the correct HTML file is served.
app.get('*', (req, res) => {
    // If the request path does NOT start with /api (meaning it's not an API call)
    if (!req.path.startsWith('/api')) {
        // Serve the leaderboard.html if the path matches exactly
        if (req.path === '/leaderboard.html') {
            res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
        }
        // Otherwise, serve the tierlist.html as the default application entry point
        else {
            res.sendFile(path.join(__dirname, 'public', 'tierlist.html'));
        }
    } else {
        // For invalid API requests, return a 404
        res.status(404).send('API endpoint not found');
    }
});

// server.js
// ...
app.listen(PORT, '0.0.0.0', () => { // !!! مهم: '0.0.0.0' اضافه شد !!!
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}/tierlist.html in your browser`);
});