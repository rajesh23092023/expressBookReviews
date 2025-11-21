// router/general.js
const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users; // Import the users array
const public_users = express.Router();
const axios = require('axios'); // Required for Tasks 10-13

// --- Helper Functions ---

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    return userswithsamename.length > 0;
}

// --- General Routes ---

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        // Handle missing username or password
        return res.status(404).json({ message: "Unable to register user. Username and password are required." });
    }

    if (!doesExist(username)) {
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
        // Handle existing username
        return res.status(404).json({ message: "User already exists!" });
    }
});

// --- Synchronous Implementations (Tasks 1-5) ---

// Task 1: Get the list of all books
public_users.get('/', function (req, res) {
    // Complete the code for getting the list of books.
    // Use the JSON.stringify method for displaying the output neatly.
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 3: Get book details based on Author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];
    let bookKeys = Object.keys(books); // Obtain all the keys for the 'books' object.

    // Iterate through the 'books' array & check the author matches.
    for (const key of bookKeys) {
        if (books[key].author === author) {
            // Add the book along with its ISBN
            booksByAuthor.push({ "isbn": key, ...books[key] });
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Get book details based on Title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksByTitle = [];
    let bookKeys = Object.keys(books);

    for (const key of bookKeys) {
        if (books[key].title === title) {
            booksByTitle.push({ "isbn": key, ...books[key] });
        }
    }

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        // Get the book reviews based on ISBN provided in the request parameters.
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// --- Asynchronous Implementations (Tasks 10-13) ---

// Helper function to simulate an asynchronous fetch (required for Tasks 10-13 logic)
const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ message: "Books list is unavailable" });
        }
    });
};

// Task 10: Get all books using Async-Await (Correct)
public_users.get('/async/', async function (req, res) {
    try {
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Task 11: Get book details based on ISBN using Promises (Correct)
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBooks().then(
        (bks) => {
            const book = bks[isbn];
            if (book) {
                return res.status(200).json(book);
            } else {
                return res.status(404).json({ message: "Book not found" });
            }
        },
        (err) => res.status(500).json({ message: err.message })
    );
});

// Task 12: Get book details based on Author using Async-Await (Correct)
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const bks = await getBooks();
        let booksByAuthor = [];
        let bookKeys = Object.keys(bks);
    
        for (const key of bookKeys) {
            if (bks[key].author === author) {
                booksByAuthor.push({ "isbn": key, ...bks[key] });
            }
        }

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Task 13: Get book details based on Title using Promises (Correct)
public_users.get('/async/title/:title', function (req, res) {
    const title = req.params.title;
    getBooks().then(
        (bks) => {
            let booksByTitle = [];
            let bookKeys = Object.keys(bks);

            for (const key of bookKeys) {
                if (bks[key].title === title) {
                    booksByTitle.push({ "isbn": key, ...bks[key] });
                }
            }

            if (booksByTitle.length > 0) {
                return res.status(200).json(booksByTitle);
            } else {
                return res.status(404).json({ message: "No books found with this title" });
            }
        },
        (err) => res.status(500).json({ message: err.message })
    );
});


module.exports.general = public_users;