// router/auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Import the book data
const regd_users = express.Router();

let users = []; // Array to store registered users (This array is populated via Task 6 in general.js)

// Function to check if the user is valid (exists) (Used by general.js/Task 6 helper 'doesExist')
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    return userswithsamename.length > 0;
}

// Function to check if username and password match (Task 7 requirement)
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        // Find a user where both username AND password match
        return (user.username === username && user.password === password)
    });
    return validusers.length > 0;
}

// --- Authenticated Routes ---

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate a JWT
        let accessToken = jwt.sign({
            data: password // Payload data
        }, 'access', { expiresIn: 60 * 60 }); // 'access' MUST match the secret key in index.js middleware

        // Save the user credentials and token for the session
        req.session.authorization = {
            accessToken: accessToken,
            username: username // Store username in session for use in Tasks 8 & 9
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 8: Add or modify a book review
regd_users.put("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Review is given as a request query
    const username = req.session.authorization.username; // Get username from session

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (books[isbn]) {
        let bookReviews = books[isbn].reviews;

        if (bookReviews.hasOwnProperty(username)) {
            // Modify the existing review (overwrite it)
            bookReviews[username] = review;
            return res.status(200).json({ message: `Review for ISBN ${isbn} updated by user ${username}.` });
        } else {
            // Add a new review
            bookReviews[username] = review;
            return res.status(200).json({ message: `Review for ISBN ${isbn} added by user ${username}.` });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 9: Delete a book review
regd_users.delete("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session

    if (books[isbn]) {
        let bookReviews = books[isbn].reviews;

        // Filter & delete the review associated with the current session username.
        if (bookReviews.hasOwnProperty(username)) {
            delete bookReviews[username];
            return res.status(200).json({ message: `Review by user ${username} for ISBN ${isbn} deleted.` });
        } else {
            return res.status(404).json({ message: `No review found by user ${username} for ISBN ${isbn}.` });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; // Export the users array to be used in general.js