class ShoppingCart {
    constructor() {
        this.items = [];
        this.currency = localStorage.getItem('selected-currency') || 'USD';
        this.exchangeRates = {
            'USD': 1,
            'VES': 36.5,
            'COP': 4200,
            'MXN': 17.5,
            'ARS': 350
        };
        this.init();
    }

    init() {
        this.loadCart();
        this.updateCartDisplay();
        this.updatePrices();
    }

    loadCart() {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('shopping-cart', JSON.stringify(this.items));
    }

    addItem(productId, productName, price, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: productId,
                name: productName,
                price: price,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddedToCartMessage(productName);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getTotalInCurrency() {
        const usdTotal = this.getTotal();
        const rate = this.exchangeRates[this.currency] || 1;
        return usdTotal * rate;
    }

    formatCurrency(amount) {
        const symbols = {
            'USD': '$',
            'VES': 'Bs.',
            'COP': '$',
            'MXN': '$',
            'ARS': '$'
        };
        
        const symbol = symbols[this.currency] || '$';
        
        if (this.currency === 'VES' || this.currency === 'COP' || this.currency === 'ARS') {
            return `${symbol}${Math.round(amount).toLocaleString()}`;
        } else {
            return `${symbol}${amount.toFixed(2)}`;
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        // Update cart items
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            } else {
                cartItems.innerHTML = this.items.map(item => {
                    const itemTotal = item.price * item.quantity;
                    const convertedPrice = itemTotal * (this.exchangeRates[this.currency] || 1);
                    
                    return `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-details">
                                    ${item.quantity}x ${this.formatCurrency(item.price * (this.exchangeRates[this.currency] || 1))}
                                </div>
                            </div>
                            <button class="cart-item-remove" onclick="cart.removeItem('${item.id}')">
                                ×
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }

        // Update totals
        const totalConverted = this.getTotalInCurrency();
        if (cartSubtotal) {
            cartSubtotal.textContent = this.formatCurrency(totalConverted);
        }
        if (cartTotal) {
            cartTotal.textContent = this.formatCurrency(totalConverted);
        }

        // Update checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    updatePrices() {
        const priceElements = document.querySelectorAll('.product-price');
        const rate = this.exchangeRates[this.currency] || 1;
        
        priceElements.forEach(element => {
            const usdPrice = parseFloat(element.dataset.usd);
            const convertedPrice = usdPrice * rate;
            element.textContent = this.formatCurrency(convertedPrice);
        });
    }

    showAddedToCartMessage(productName) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${productName} agregado al carrito
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Global functions for cart operations
function changeQuantity(productId, change) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    if (quantityElement) {
        let currentQty = parseInt(quantityElement.textContent);
        currentQty = Math.max(1, currentQty + change);
        quantityElement.textContent = currentQty;
    }
}

function addToCart(productId) {
    const productCard = document.querySelector(`[data-product="${productId}"]`);
    if (!productCard) return;
    
    const productName = productCard.querySelector('h4').textContent;
    const productPrice = parseFloat(productCard.dataset.price);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).textContent);
    
    cart.addItem(productId, productName, productPrice, quantity);
    
    // Reset quantity to 1
    document.getElementById(`qty-${productId}`).textContent = '1';
}

function proceedToCheckout() {
    if (cart.items.length === 0) return;
    
    // Populate checkout modal
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.items.map(item => {
            const itemTotal = item.price * item.quantity;
            const convertedPrice = itemTotal * (cart.exchangeRates[cart.currency] || 1);
            
            return `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${item.name} (${item.quantity}x)</span>
                    <span>${cart.formatCurrency(convertedPrice)}</span>
                </div>
            `;
        }).join('');
    }
    
    if (checkoutTotal) {
        checkoutTotal.textContent = cart.formatCurrency(cart.getTotalInCurrency());
    }
    
    // Show modal
    document.getElementById('checkout-modal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


// Función para mostrar/ocultar carrito
function toggleCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    cartSidebar.classList.toggle('active');
}

// Cerrar carrito al hacer clic fuera
document.addEventListener('click', function(event) {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartToggle = document.querySelector('.cart-toggle');
    
    if (!cartSidebar.contains(event.target) && !cartToggle.contains(event.target)) {
        cartSidebar.classList.remove('active');
    }
});