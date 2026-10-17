
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

// The book API must run separately from this Express server.
const API_BASE_URL = 'http://localhost:5001';

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'Username already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User successfully registered. You can now log in.'
    });
});

// Task 10: Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        return res.json(response.data);
    } catch (error) {
        return res.status(502).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Task 11: Get book details by ISBN using Axios and Promises
public_users.get('/isbn/:isbn', (req, res) => {
    axios.get(
        `${API_BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`
    )
        .then(response => res.json(response.data))
        .catch(error => {
            const status = error.response?.status === 404 ? 404 : 502;

            return res.status(status).json({
                message: status === 404
                    ? 'Book not found'
                    : 'Unable to retrieve book'
            });
        });
});

// Task 12: Get books by author using Axios and async/await
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/author/${encodeURIComponent(req.params.author)}`
        );

        return res.json(response.data);
    } catch (error) {
        const status = error.response?.status === 404 ? 404 : 502;

        return res.status(status).json({
            message: status === 404
                ? 'No books found for this author'
                : 'Unable to retrieve books by author'
        });
    }
});

// Task 13: Get books by title using Axios and Promises
public_users.get('/title/:title', (req, res) => {
    axios.get(
        `${API_BASE_URL}/title/${encodeURIComponent(req.params.title)}`
    )
        .then(response => res.json(response.data))
        .catch(error => {
            const status = error.response?.status === 404 ? 404 : 502;

            return res.status(status).json({
                message: status === 404
                    ? 'No books found with this title'
                    : 'Unable to retrieve books by title'
            });
        });
});

// Get reviews by ISBN from the local books database
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.json(books[isbn].reviews);
});

module.exports.general = public_users;
