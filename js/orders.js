class OrderManager {
    constructor() {
        this.apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Reemplazar con tu Google Apps Script URL
        this.seller = 'XJoseDharckX';
        this.sellerPhone = '+584126027407';
    }

    async submitOrder(orderData) {
        try {
            const order = {
                id: this.generateOrderId(),
                timestamp: new Date().toISOString(),
                seller: this.seller,
                sellerPhone: this.sellerPhone,
                customer: {
                    gameId: orderData.gameId,
                    email: orderData.email,
                    country: localStorage.getItem('selected-country') || 'US',
                    currency: localStorage.getItem('selected-currency') || 'USD'
                },
                items: orderData.items,
                total: orderData.total,
                paymentMethod: orderData.paymentMethod,
                notes: orderData.notes,
                status: 'pending',
                game: this.getGameFromUrl()
            };

            // Save order locally
            this.saveOrderLocally(order);

            // Send to Google Sheets (if configured)
            await this.sendToGoogleSheets(order);

            return order;
        } catch (error) {
            console.error('Error submitting order:', error);
            throw error;
        }
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }

    getGameFromUrl() {
        const path = window.location.pathname;
        if (path.includes('lords-mobile')) return 'Lords Mobile';
        if (path.includes('blood-strike')) return 'Blood Strike';
        if (path.includes('free-fire')) return 'Free Fire';
        if (path.includes('genshin-impact')) return 'Genshin Impact';
        return 'Unknown';
    }

    saveOrderLocally(order) {
        let orders = JSON.parse(localStorage.getItem('user-orders') || '[]');
        orders.push(order);
        localStorage.setItem('user-orders', JSON.stringify(orders));
    }

    async sendToGoogleSheets(order) {
        // This would send data to Google Sheets via Google Apps Script
        // You need to create a Google Apps Script and deploy it as a web app
        
        const payload = {
            action: 'addOrder',
            data: order
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to send order to Google Sheets');
            }

            return await response.json();
        } catch (error) {
            console.warn('Could not send to Google Sheets:', error);
            // Continue without Google Sheets integration
        }
    }

    getUserOrders() {
        return JSON.parse(localStorage.getItem('user-orders') || '[]');
    }

    updateOrderStatus(orderId, status) {
        let orders = this.getUserOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('user-orders', JSON.stringify(orders));
        }
    }
}

// Initialize order manager
const orderManager = new OrderManager();

// Global function for order submission
async function submitOrder() {
    try {
        // Get form data
        const gameId = document.getElementById('game-id').value;
        const email = document.getElementById('contact-email').value;
        const paymentMethod = document.getElementById('payment-method').value;
        const notes = document.getElementById('order-notes').value;

        // Validate required fields
        if (!gameId || !email || !paymentMethod) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingresa un email válido.');
            return;
        }

        // Prepare order data
        const orderData = {
            gameId: gameId,
            email: email,
            paymentMethod: paymentMethod,
            notes: notes,
            items: cart.items,
            total: cart.getTotal()
        };

        // Show loading
        const submitBtn = document.querySelector('.submit-order-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;

        // Submit order
        const order = await orderManager.submitOrder(orderData);

        // Show success message
        alert(`¡Pedido creado exitosamente!\n\nID del Pedido: ${order.id}\n\nTe contactaremos pronto al email: ${email}\n\nVendedor: ${orderManager.seller}\nWhatsApp: ${orderManager.sellerPhone}`);

        // Clear cart and close modal
        cart.clear();
        closeCheckoutModal();

        // Reset form
        document.getElementById('game-id').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('payment-method').value = '';
        document.getElementById('order-notes').value = '';

    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
        // Reset button
        const submitBtn = document.querySelector('.submit-order-btn');
        submitBtn.textContent = 'Confirmar Pedido';
        submitBtn.disabled = false;
    }
}

// Function to show order history (can be called from a user panel)
function showOrderHistory() {
    const orders = orderManager.getUserOrders();
    
    if (orders.length === 0) {
        alert('No tienes pedidos registrados.');
        return;
    }

    let historyHtml = '<h3>Historial de Pedidos</h3>';
    
    orders.forEach(order => {
        const date = new Date(order.timestamp).toLocaleDateString();
        const statusText = {
            'pending': 'Pendiente',
            'processing': 'Procesando',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        }[order.status] || order.status;

        historyHtml += `
            <div style="border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                <strong>Pedido: ${order.id}</strong><br>
                <strong>Fecha:</strong> ${date}<br>
                <strong>Juego:</strong> ${order.game}<br>
                <strong>Estado:</strong> ${statusText}<br>
                <strong>Total:</strong> ${cart.formatCurrency(order.total * (cart.exchangeRates[order.customer.currency] || 1))}<br>
                <strong>Método de Pago:</strong> ${order.paymentMethod}<br>
                <details>
                    <summary>Ver detalles</summary>
                    <strong>Items:</strong><br>
                    ${order.items.map(item => `- ${item.name} (${item.quantity}x)`).join('<br>')}<br>
                    <strong>ID del Juego:</strong> ${order.customer.gameId}<br>
                    <strong>Email:</strong> ${order.customer.email}<br>
                    ${order.notes ? `<strong>Notas:</strong> ${order.notes}<br>` : ''}
                </details>
            </div>
        `;
    });

    // Create modal to show history
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <button onclick="this.closest('.modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            ">&times;</button>
            ${historyHtml}
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
}