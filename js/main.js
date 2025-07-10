// Main JavaScript functionality
class GameRecharge {
    constructor() {
        this.currentCountry = 'US';
        this.currentCurrency = 'USD';
        this.exchangeRates = {};
        this.init();
    }

    init() {
        this.showCountryModal();
        this.setupEventListeners();
        this.loadExchangeRates();
    }

    showCountryModal() {
        // Show modal after 3 seconds
        setTimeout(() => {
            const modal = document.getElementById('country-modal');
            if (modal && !localStorage.getItem('country-selected')) {
                modal.style.display = 'block';
            }
        }, 3000);
    }

    setupEventListeners() {
        // Country selection
        document.querySelectorAll('.country-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCountry(e.currentTarget);
            });
        });

        // Skip country selection
        const skipBtn = document.getElementById('skip-country');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.closeCountryModal();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('country-modal');
            if (e.target === modal) {
                this.closeCountryModal();
            }
        });
    }

    selectCountry(countryElement) {
        // Remove previous selection
        document.querySelectorAll('.country-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked country
        countryElement.classList.add('selected');

        const country = countryElement.dataset.country;
        const currency = countryElement.dataset.currency;

        this.currentCountry = country;
        this.currentCurrency = currency;

        // Update UI
        this.updateCurrencyDisplay();
        this.updatePrices();

        // Save to localStorage
        localStorage.setItem('selected-country', country);
        localStorage.setItem('selected-currency', currency);
        localStorage.setItem('country-selected', 'true');

        // Close modal after selection
        setTimeout(() => {
            this.closeCountryModal();
        }, 1000);
    }

    closeCountryModal() {
        const modal = document.getElementById('country-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateCurrencyDisplay() {
        const currencyDisplay = document.getElementById('current-currency');
        const countryDisplay = document.getElementById('current-country');
        
        if (currencyDisplay) {
            currencyDisplay.textContent = this.currentCurrency;
        }
        
        if (countryDisplay) {
            const flags = {
                'VE': '🇻🇪',
                'CO': '🇨🇴',
                'MX': '🇲🇽',
                'AR': '🇦🇷',
                'US': '🇺🇸',
                'OTHER': '🌍'
            };
            countryDisplay.textContent = flags[this.currentCountry] || '🌍';
        }
    }

    async loadExchangeRates() {
        try {
            // In a real application, you would fetch from an API
            // For now, we'll use static rates
            this.exchangeRates = {
                'USD': 1,
                'VES': 36.5,
                'COP': 4200,
                'MXN': 17.5,
                'ARS': 350
            };
            
            this.updatePrices();
        } catch (error) {
            console.error('Error loading exchange rates:', error);
        }
    }

    updatePrices() {
        const priceElements = document.querySelectorAll('.price');
        const rate = this.exchangeRates[this.currentCurrency] || 1;
        
        priceElements.forEach(element => {
            const usdPrice = parseFloat(element.dataset.usd);
            const convertedPrice = usdPrice * rate;
            
            const formattedPrice = this.formatCurrency(convertedPrice, this.currentCurrency);
            element.textContent = formattedPrice;
        });
    }

    formatCurrency(amount, currency) {
        const symbols = {
            'USD': '$',
            'VES': 'Bs.',
            'COP': '$',
            'MXN': '$',
            'ARS': '$'
        };
        
        const symbol = symbols[currency] || '$';
        
        if (currency === 'VES' || currency === 'COP' || currency === 'ARS') {
            return `${symbol}${Math.round(amount).toLocaleString()}`;
        } else {
            return `${symbol}${amount.toFixed(2)}`;
        }
    }

    // Method to detect country by IP (would require external service)
    async detectCountryByIP() {
        try {
            // This would use a service like ipapi.co or similar
            // const response = await fetch('https://ipapi.co/json/');
            // const data = await response.json();
            // return data.country_code;
            return 'US'; // Default fallback
        } catch (error) {
            console.error('Error detecting country:', error);
            return 'US';
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GameRecharge();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});