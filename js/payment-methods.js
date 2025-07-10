// Configuración de métodos de pago por país
const paymentMethodsByCountry = {
    'US': [
        { value: 'paypal', text: 'PayPal' },
        { value: 'stripe', text: 'Tarjeta de Crédito/Débito' },
        { value: 'zelle', text: 'Zelle' },
        { value: 'crypto', text: 'Criptomonedas' }
    ],
    'VE': [
        { value: 'zelle', text: 'Zelle' },
        { value: 'binance', text: 'Binance Pay' },
        { value: 'crypto', text: 'Criptomonedas' },
        { value: 'bank-ve', text: 'Transferencia Bancaria (VE)' },
        { value: 'paypal', text: 'PayPal' }
    ],
    'CO': [
        { value: 'nequi', text: 'Nequi' },
        { value: 'daviplata', text: 'DaviPlata' },
        { value: 'bancolombia', text: 'Bancolombia' },
        { value: 'crypto', text: 'Criptomonedas' },
        { value: 'paypal', text: 'PayPal' }
    ],
    'MX': [
        { value: 'oxxo', text: 'OXXO' },
        { value: 'spei', text: 'SPEI' },
        { value: 'paypal', text: 'PayPal' },
        { value: 'crypto', text: 'Criptomonedas' }
    ],
    'AR': [
        { value: 'mercadopago', text: 'Mercado Pago' },
        { value: 'crypto', text: 'Criptomonedas' },
        { value: 'bank-ar', text: 'Transferencia Bancaria' }
    ],
    'PE': [
        { value: 'yape', text: 'Yape' },
        { value: 'plin', text: 'Plin' },
        { value: 'bcp', text: 'BCP' },
        { value: 'crypto', text: 'Criptomonedas' }
    ],
    'CL': [
        { value: 'webpay', text: 'WebPay' },
        { value: 'crypto', text: 'Criptomonedas' },
        { value: 'bank-cl', text: 'Transferencia Bancaria' }
    ],
    'EC': [
        { value: 'crypto', text: 'Criptomonedas' },
        { value: 'bank-ec', text: 'Transferencia Bancaria' },
        { value: 'paypal', text: 'PayPal' }
    ]
};

// Función para detectar país automáticamente
async function detectCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_code;
    } catch (error) {
        console.log('No se pudo detectar el país automáticamente');
        return null;
    }
}

// Función para actualizar métodos de pago según el país
function updatePaymentMethods() {
    const countrySelect = document.getElementById('country-select');
    const paymentSelect = document.getElementById('payment-method');
    const selectedCountry = countrySelect.value;
    
    // Limpiar opciones actuales
    paymentSelect.innerHTML = '<option value="">Seleccionar método</option>';
    
    if (selectedCountry && paymentMethodsByCountry[selectedCountry]) {
        const methods = paymentMethodsByCountry[selectedCountry];
        methods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.value;
            option.textContent = method.text;
            paymentSelect.appendChild(option);
        });
    }
}

// Inicializar detección automática al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    const detectedCountry = await detectCountry();
    if (detectedCountry) {
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry;
            updatePaymentMethods();
        }
    }
});