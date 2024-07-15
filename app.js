const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Currency.db'
});

// Define the FavoritePair model
const FavoritePair = sequelize.define('favoritePair', {
    baseCurrency: {
        type: Sequelize.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Sync the database
sequelize.sync().then(() => {
    console.log('Database synced');
});

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch all favorite currency pairs
app.get('/favorites', async (req, res) => {
    try {
        const favoritePairs = await FavoritePair.findAll();
        res.json(favoritePairs);
    } catch (error) {
        console.error('Error fetching favorite currency pairs:', error);
        res.status(500).json({ error: 'Failed to fetch favorite currency pairs' });
    }
});

// Save a new favorite currency pair
app.post('/favorites', async (req, res) => {
    const { baseCurrency, targetCurrency } = req.body;
    try {
        const favoritePair = await FavoritePair.create({ baseCurrency, targetCurrency });
        res.json(favoritePair);
    } catch (error) {
        console.error('Error saving favorite currency pair:', error);
        res.status(500).json({ error: 'Failed to save favorite currency pair' });
    }
});

// Reset all favorite currency pairs
app.delete('/favorites/reset', async (req, res) => {
    try {
        await FavoritePair.destroy({ where: {} });
        res.status(204).end(); // No content response
    } catch (error) {
        console.error('Error resetting favorite currency pairs:', error);
        res.status(500).json({ error: 'Failed to reset favorite currency pairs' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
