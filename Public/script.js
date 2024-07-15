document.addEventListener('DOMContentLoaded', function () {
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalRatesButton = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const resetFavoritesButton = document.getElementById('reset-favorites'); // Added reset button
    const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');
    const apiKey = 'fca_live_8oD3tIT3PDuCRRzUAxixL3XSsL5K1vd8IbfyKGlm';
    const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`;

    async function fetchCurrencies() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch currency data');
            }
            const data = await response.json();
            const currencies = Object.keys(data.data);
            populateCurrencySelect(baseCurrencySelect, currencies);
            populateCurrencySelect(targetCurrencySelect, currencies);
        } catch (error) {
            console.error('Error fetching currencies:', error);
            alert('Error fetching currencies. Please try again later.');
        }
    }

    function populateCurrencySelect(selectElement, currencies) {
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            selectElement.appendChild(option);
        });
    }

    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            alert('Please enter valid currencies and amount.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}&base_currency=${baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rate data');
            }
            const data = await response.json();
            const rate = data.data[targetCurrency];
            const convertedAmount = amount * rate;
            convertedAmountSpan.textContent = convertedAmount.toFixed(2);
        } catch (error) {
            console.error('Error converting currency:', error);
            alert('Error converting currency. Please try again later.');
        }
    }

    async function fetchHistoricalRates() {
        // Example of fetching historical rates for a specific date
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = '2023-01-01'; // Hardcoded date for demonstration

        try {
            const response = await fetch(`https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`);
            if (!response.ok) {
                throw new Error('Failed to fetch historical rates');
            }
            const data = await response.json();
            const rate = data.data[date][targetCurrency];
            if (rate !== undefined) {
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
            } else {
                historicalRatesContainer.textContent = `No historical exchange rate data available for ${date}`;
            }
        } catch (error) {
            console.error('Error fetching historical rates:', error);
            alert('Error fetching historical rates. Please try again later.');
        }
    }

    async function saveFavoriteCurrencyPair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        try {
            const response = await fetch('/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ baseCurrency, targetCurrency })
            });
            if (!response.ok) {
                throw new Error('Failed to save favorite currency pair');
            }
            const favoritePair = await response.json();
            displayFavoriteCurrencyPair(favoritePair);
        } catch (error) {
            console.error('Error saving favorite currency pair:', error);
            alert('Error saving favorite currency pair. Please try again later.');
        }
    }

    async function resetFavoriteCurrencyPairs() {
        try {
            const response = await fetch('/favorites/reset', {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to reset favorite currency pairs');
            }
            favoriteCurrencyPairsContainer.innerHTML = ''; // Clear displayed favorite pairs
            alert('Favorite currency pairs reset successfully.');
        } catch (error) {
            console.error('Error resetting favorite currency pairs:', error);
            alert('Error resetting favorite currency pairs. Please try again later.');
        }
    }

    function displayFavoriteCurrencyPair(favoritePair) {
        const button = document.createElement('button');
        button.textContent = `${favoritePair.baseCurrency}/${favoritePair.targetCurrency}`;
        button.addEventListener('click', () => {
            baseCurrencySelect.value = favoritePair.baseCurrency;
            targetCurrencySelect.value = favoritePair.targetCurrency;
            convertCurrency();
        });
        favoriteCurrencyPairsContainer.appendChild(button);
    }

    function loadFavoriteCurrencyPairs() {
        fetch('/favorites')
            .then(response => response.json())
            .then(favoritePairs => {
                favoritePairs.forEach(displayFavoriteCurrencyPair);
            })
            .catch(error => {
                console.error('Error loading favorite currency pairs:', error);
            });
    }

    fetchCurrencies();
    loadFavoriteCurrencyPairs();
    amountInput.addEventListener('input', convertCurrency);
    baseCurrencySelect.addEventListener('change', convertCurrency);
    targetCurrencySelect.addEventListener('change', convertCurrency);
    historicalRatesButton.addEventListener('click', fetchHistoricalRates);
    saveFavoriteButton.addEventListener('click', saveFavoriteCurrencyPair);
    resetFavoritesButton.addEventListener('click', resetFavoriteCurrencyPairs); // Added event listener for reset button
});
