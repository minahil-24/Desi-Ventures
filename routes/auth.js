const express = require('express'); // Import Express
const router = express.Router(); // Create a router
const User = require('../models/User'); // Import the User model

// Show login form
router.get('/login', (req, res) => {
    res.render('login'); // Render the login view 
});

// Handle login logic
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Get username and password from request body
    try {
        const user = await User.findOne({ username }); // Find user by username
        if (user && await user.comparePassword(password)) { // Check if user exists and password matches
            req.session.user = user; // Save user in session
            if(user.admin){
                return res.redirect('/admin/cart'); // Redirect to home page
            }
            return res.redirect('/menu'); // Redirect to home page
        }
        res.render('login', { error: 'Invalid username or password' }); // Render login view with error
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'An error occurred. Please try again.' }); // Render login view with error
    }
});

router.get('/register', (req, res) => {
    res.render('register'); // Render the register view 
});

// Handle registration logic
router.post('/register', async (req, res) => {
    const { username, password, admin } = req.body; // Get username, password, and admin from request body
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists' }); // Render register view with error
        }

        // Determine if the admin checkbox was checked
        const isAdmin = admin === 'on';

        // Create a new user with the admin status
        const user = new User({ username, password, admin: isAdmin });

        await user.save(); // Save user to database
        res.redirect('/auth/login'); // Redirect to login page
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'An error occurred. Please try again.' }); // Render register view with error
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => { // Destroy session 
        if (err) {
            return res.redirect('/'); // If error, redirect to home page
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/auth/login'); // Redirect to login page
    });
});

module.exports = router; // Export the router
