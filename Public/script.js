// Wait for the DOM content to be fully loaded before executing the function
document.addEventListener('DOMContentLoaded', function () {
    // Get references to various DOM elements using their IDs
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalRatesButton = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const resetFavoritesButton = document.getElementById('reset-favorites'); // Added reset button
    const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');
    
    // Define the API key and URL for the currency data API
    const apiKey = 'fca_live_8oD3tIT3PDuCRRzUAxixL3XSsL5K1vd8IbfyKGlm';
    const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`;

    // Function to fetch currency data from the API
    async function fetchCurrencies() {
        try {
            // Fetch currency data from the specified API URL
            const response = await fetch(apiUrl);
            // Check if the response is not okay (HTTP status not in the range 200-299)
            if (!response.ok) {
                throw new Error('Failed to fetch currency data');
            }
            // Parse the response body as JSON
            const data = await response.json();
            // Extract currency symbols from the API response data
            const currencies = Object.keys(data.data);
            // Populate the base and target currency dropdowns with fetched currencies
            populateCurrencySelect(baseCurrencySelect, currencies);
            populateCurrencySelect(targetCurrencySelect, currencies);
        } catch (error) {
            // Log any errors to the console
            console.error('Error fetching currencies:', error);
            // Alert the user about the error
            alert('Error fetching currencies. Please try again later.');
        }
    }

    // Function to populate a select element with currency options
    function populateCurrencySelect(selectElement, currencies) {
        // Iterate over each currency and create an option element for it
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            // Append the option to the select element
            selectElement.appendChild(option);
        });
    }

    // Function to convert currency based on user input
    async function convertCurrency() {
        // Retrieve selected base and target currencies and the amount to convert
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        // Validate input: ensure all fields are filled and amount is valid
        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            alert('Please enter valid currencies and amount.');
            return;
        }

        try {
            // Fetch exchange rate data from API based on selected base currency
            const response = await fetch(`${apiUrl}&base_currency=${baseCurrency}`);
            // Check if the response is not okay (HTTP status not in the range 200-299)
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rate data');
            }
            // Parse the response body as JSON
            const data = await response.json();
            // Retrieve the exchange rate for the selected target currency
            const rate = data.data[targetCurrency];
            // Calculate the converted amount
            const convertedAmount = amount * rate;
            // Display the converted amount with two decimal places
            convertedAmountSpan.textContent = convertedAmount.toFixed(2);
        } catch (error) {
            // Log any errors to the console
            console.error('Error converting currency:', error);
            // Alert the user about the error
            alert('Error converting currency. Please try again later.');
        }
    }

    // Function to fetch historical exchange rates for a specific date
    async function fetchHistoricalRates() {
        // Retrieve selected base and target currencies
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        // Hardcoded date for demonstration purposes
        const date = '2023-01-01';

        try {
            // Fetch historical exchange rate data from API for the specified date and currencies
            const response = await fetch(`https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`);
            // Check if the response is not okay (HTTP status not in the range 200-299)
            if (!response.ok) {
                throw new Error('Failed to fetch historical rates');
            }
            // Parse the response body as JSON
            const data = await response.json();
            // Retrieve the exchange rate for the selected date and target currency
            const rate = data.data[date][targetCurrency];
            // Display the historical exchange rate information
            if (rate !== undefined) {
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
            } else {
                historicalRatesContainer.textContent = `No historical exchange rate data available for ${date}`;
            }
        } catch (error) {
            // Log any errors to the console
            console.error('Error fetching historical rates:', error);
            // Alert the user about the error
            alert('Error fetching historical rates. Please try again later.');
        }
    }

    // Function to save a favorite currency pair
    async function saveFavoriteCurrencyPair() {
        // Retrieve selected base and target currencies
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        try {
            // Send a POST request to save the selected currency pair as a favorite on the server
            const response = await fetch('/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });
            // Check if the response is not okay (HTTP status not in the range 200-299)
            if (!response.ok) {
                throw new Error('Failed to save favorite currency pair');
            }
            // Parse the response body as JSON
            const favoritePair = await response.json();
            // Display the saved favorite currency pair
            displayFavoriteCurrencyPair(favoritePair);
        } catch (error) {
            // Log any errors to the console
            console.error('Error saving favorite currency pair:', error);
            // Alert the user about the error
            alert('Error saving favorite currency pair. Please try again later.');
        }
    }

    // Function to reset favorite currency pairs
    async function resetFavoriteCurrencyPairs() {
        try {
            // Send a DELETE request to reset all favorite currency pairs on the server
            const response = await fetch('/favorites/reset', {
                method: 'DELETE'
            });
            // Check if the response is not okay (HTTP status not in the range 200-299)
            if (!response.ok) {
                throw new Error('Failed to reset favorite currency pairs');
            }
            // Clear the displayed favorite currency pairs container
            favoriteCurrencyPairsContainer.innerHTML = '';
            // Alert the user about successful reset of favorite currency pairs
            alert('Favorite currency pairs reset successfully.');
        } catch (error) {
            // Log any errors to the console
            console.error('Error resetting favorite currency pairs:', error);
            // Alert the user about the error
            alert('Error resetting favorite currency pairs. Please try again later.');
        }
    }

    // Function to display a favorite currency pair as a button
    function displayFavoriteCurrencyPair(favoritePair) {
        // Create a button element to represent the favorite currency pair
        const button = document.createElement('button');
        // Set the button text to display the base and target currencies
        button.textContent = `${favoritePair.baseCurrency}/${favoritePair.targetCurrency}`;
        // Add a click event listener to the button to set currencies and convert
        button.addEventListener('click', () => {
            baseCurrencySelect.value = favoritePair.baseCurrency;
            targetCurrencySelect.value = favoritePair.targetCurrency;
            convertCurrency();
        });
        // Append the button to the container for favorite currency pairs
        favoriteCurrencyPairsContainer.appendChild(button);
    }

    // Function to load favorite currency pairs from the server
    function loadFavoriteCurrencyPairs() {
        // Fetch the list of favorite currency pairs from the server
        fetch('/favorites')
            .then(response => response.json())
            .then(favoritePairs => {
                // For each favorite currency pair, display it as a button
                favoritePairs.forEach(displayFavoriteCurrencyPair);
            })
            .catch(error => {
                // Log any errors to the console
                console.error('Error loading favorite currency pairs:', error);
            });
    }

    // Fetch the list of available currencies when the page loads
    fetchCurrencies();
    // Load the favorite currency pairs when the page loads
    loadFavoriteCurrencyPairs();
    // Add event listeners for input changes and button clicks
    amountInput.addEventListener('input', convertCurrency);
    baseCurrencySelect.addEventListener('change', convertCurrency);
    targetCurrencySelect.addEventListener('change', convertCurrency);
    historicalRatesButton.addEventListener('click', fetchHistoricalRates);
    saveFavoriteButton.addEventListener('click', saveFavoriteCurrencyPair);
    resetFavoritesButton.addEventListener('click', resetFavoriteCurrencyPairs); // Added event listener for reset button
});
