// server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Database connection utility
const rankingRoutes = require('./routes/rankings'); // API routes for rankings
const { seedProjects } = require('./public/js/projectsData'); // Import the seedProjects function

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
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
seedProjects(); // <-- UNCOMMENT THIS LINE FOR THE FIRST RUN, THEN COMMENT IT OUT!

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}/tierlist.html in your browser`);
});