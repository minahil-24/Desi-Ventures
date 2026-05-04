const express = require('express'); // Import Express 
const router = express. Router(); // Create a router
// Home route
router.get('/', (req, res) => {
res.render('index', {user: req.session.user }); // Render index view with user data
});

module.exports = router; 