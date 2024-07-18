// Require necessary modules: Express, Sequelize for database ORM, bodyParser for parsing JSON, and path for handling file paths
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express application
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Sequelize with SQLite database configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Currency.db' // Database file location
});

// Define a Sequelize model 'FavoritePair' for favorite currency pairs
const FavoritePair = sequelize.define('favoritePair', {
    baseCurrency: {
        type: Sequelize.STRING,
        allowNull: false // Base currency cannot be null
    },
    targetCurrency: {
        type: Sequelize.STRING,
        allowNull: false // Target currency cannot be null
    }
});

// Sync Sequelize with the database to ensure the model is created
sequelize.sync().then(() => {
    console.log('Database synced'); // Log confirmation that database synchronization is complete
});

// Route to serve index.html file at root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to fetch all favorite currency pairs from the database
app.get('/favorites', async (req, res) => {
    try {
        const favoritePairs = await FavoritePair.findAll(); // Fetch all rows from 'FavoritePair' table
        res.json(favoritePairs); // Respond with JSON array of favorite currency pairs
    } catch (error) {
        console.error('Error fetching favorite currency pairs:', error); // Log error if fetching fails
        res.status(500).json({ error: 'Failed to fetch favorite currency pairs' }); // Respond with 500 Internal Server Error
    }
});

// Route to save a new favorite currency pair to the database
app.post('/favorites', async (req, res) => {
    const { baseCurrency, targetCurrency } = req.body; // Extract baseCurrency and targetCurrency from request body
    try {
        const favoritePair = await FavoritePair.create({ baseCurrency, targetCurrency }); // Create a new row in 'FavoritePair' table
        res.json(favoritePair); // Respond with JSON object of the created favorite currency pair
    } catch (error) {
        console.error('Error saving favorite currency pair:', error); // Log error if saving fails
        res.status(500).json({ error: 'Failed to save favorite currency pair' }); // Respond with 500 Internal Server Error
    }
});

// Route to reset all favorite currency pairs in the database
app.delete('/favorites/reset', async (req, res) => {
    try {
        await FavoritePair.destroy({ where: {} }); // Delete all rows from 'FavoritePair' table
        res.status(204).end(); // Respond with 204 No Content if deletion is successful
    } catch (error) {
        console.error('Error resetting favorite currency pairs:', error); // Log error if resetting fails
        res.status(500).json({ error: 'Failed to reset favorite currency pairs' }); // Respond with 500 Internal Server Error
    }
});

// Start the Express server and listen on specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Log confirmation that server is running
});
