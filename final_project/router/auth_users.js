
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        (user) => user.username === username && user.password === password
    );
};

// Login as a registered user: POST /customer/login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const accessToken = jwt.sign(
        { username: username },
        'access',
        { expiresIn: '1h' }
    );

    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };

    return res.status(200).json({
        message: 'User successfully logged in',
        accessToken: accessToken
    });
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.query.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!review) {
        return res.status(400).json({
            message: 'Please provide a review'
        });
    }

    // Update the user's existing review or add a new one
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review added/updated successfully',
        reviews: books[isbn].reviews
    });
});

// Delete the logged-in user's own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
        return res.status(404).json({
            message: 'You have not reviewed this book'
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: 'Your review has been deleted',
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
