// index.js
const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const generalRoutes = require('./router/general').general;
const authUsers = require('./router/auth_users');

const app = express(); // <-- Define 'app' here

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for customer routes
app.use('/customer', session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }));

// Protect routes under /customer/auth/* using the session's JWT access token
app.use('/customer/auth/*', function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, 'access', (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: 'User not authenticated' });
            }
        });
    } else {
        return res.status(403).json({ message: 'User not logged in' });
    }
});

// Mount routers
app.use('/', generalRoutes);
app.use('/customer', authUsers.authenticated);

// Start server
const PORT = process.env.PORT || 3000; // Use port 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});