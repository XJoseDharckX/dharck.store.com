class AdminManager {
    constructor() {
        this.productStates = this.loadProductStates();
        this.vendorProfits = this.loadVendorProfits();
        this.isAdminMode = false;
        this.setupAdminControls();
    }

    loadProductStates() {
        const saved = localStorage.getItem('product-states');
        return saved ? JSON.parse(saved) : {};
    }

    saveProductStates() {
        localStorage.setItem('product-states', JSON.stringify(this.productStates));
    }

    loadVendorProfits() {
        const saved = localStorage.getItem('vendor-profits');
        return saved ? JSON.parse(saved) : this.getDefaultProfits();
    }

    saveVendorProfits() {
        localStorage.setItem('vendor-profits', JSON.stringify(this.vendorProfits));
        // También sincronizar con Google Sheets
        this.syncProfitsToGoogleSheets();
    }

    getDefaultProfits() {
        return {
            'lords-mobile': {
                '60-diamonds': {
                    'XJoseDharckX': 0.50,
                    'David': 0.45,
                    'Ernesto': 0.40,
                    'Satoru': 0.35
                },
                '300-diamonds': {
                    'XJoseDharckX': 2.50,
                    'David': 2.25,
                    'Ernesto': 2.00,
                    'Satoru': 1.75
                },
                '980-diamonds': {
                    'XJoseDharckX': 8.00,
                    'David': 7.50,
                    'Ernesto': 7.00,
                    'Satoru': 6.50
                },
                '1980-diamonds': {
                    'XJoseDharckX': 15.00,
                    'David': 14.00,
                    'Ernesto': 13.00,
                    'Satoru': 12.00
                },
                '3280-diamonds': {
                    'XJoseDharckX': 25.00,
                    'David': 23.00,
                    'Ernesto': 21.00,
                    'Satoru': 19.00
                },
                '6480-diamonds': {
                    'XJoseDharckX': 48.00,
                    'David': 45.00,
                    'Ernesto': 42.00,
                    'Satoru': 39.00
                },
                '13000-diamonds': {
                    'XJoseDharckX': 95.00,
                    'David': 90.00,
                    'Ernesto': 85.00,
                    'Satoru': 80.00
                }
            },
            'free-fire': {
                '100-diamonds': {
                    'XJoseDharckX': 1.00,
                    'David': 0.90,
                    'Ernesto': 0.80,
                    'Satoru': 0.70
                },
                '310-diamonds': {
                    'XJoseDharckX': 3.00,
                    'David': 2.75,
                    'Ernesto': 2.50,
                    'Satoru': 2.25
                },
                '520-diamonds': {
                    'XJoseDharckX': 5.00,
                    'David': 4.50,
                    'Ernesto': 4.00,
                    'Satoru': 3.50
                }
            },
            'blood-strike': {
                '60-gold': {
                    'XJoseDharckX': 0.60,
                    'David': 0.55,
                    'Ernesto': 0.50,
                    'Satoru': 0.45
                },
                '300-gold': {
                    'XJoseDharckX': 3.00,
                    'David': 2.75,
                    'Ernesto': 2.50,
                    'Satoru': 2.25
                }
            },
            'genshin-impact': {
                '60-primogems': {
                    'XJoseDharckX': 1.00,
                    'David': 0.90,
                    'Ernesto': 0.80,
                    'Satoru': 0.70
                },
                '300-primogems': {
                    'XJoseDharckX': 5.00,
                    'David': 4.50,
                    'Ernesto': 4.00,
                    'Satoru': 3.50
                }
            }
        };
    }

    setupAdminControls() {
        // Crear botón flotante de admin
        this.createAdminButton();
        
        // Configurar atajo de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAdminMode();
            }
        });
    }

    createAdminButton() {
        const adminBtn = document.createElement('button');
        adminBtn.id = 'admin-toggle';
        adminBtn.innerHTML = '<i class="fas fa-cog"></i>';
        adminBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
            display: none;
        `;
        
        adminBtn.addEventListener('click', () => this.toggleAdminMode());
        document.body.appendChild(adminBtn);
        
        // Mostrar después de 3 segundos
        setTimeout(() => {
            adminBtn.style.display = 'block';
        }, 3000);
    }

    toggleAdminMode() {
        this.isAdminMode = !this.isAdminMode;
        
        if (this.isAdminMode) {
            this.enableAdminMode();
        } else {
            this.disableAdminMode();
        }
    }

    enableAdminMode() {
        // Agregar controles de admin a productos
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            this.addAdminControls(product);
        });
        
        // Mostrar notificación
        this.showNotification('Modo administrador activado', 'success');
        
        // Cambiar color del botón
        const adminBtn = document.getElementById('admin-toggle');
        if (adminBtn) {
            adminBtn.style.background = '#4CAF50';
        }
    }

    disableAdminMode() {
        // Remover controles de admin
        const adminControls = document.querySelectorAll('.admin-controls');
        adminControls.forEach(control => control.remove());
        
        // Mostrar notificación
        this.showNotification('Modo administrador desactivado', 'info');
        
        // Restaurar color del botón
        const adminBtn = document.getElementById('admin-toggle');
        if (adminBtn) {
            adminBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
    }

    addAdminControls(productElement) {
        const productId = productElement.dataset.productId;
        if (!productId) return;
        
        const isEnabled = this.productStates[productId] !== false;
        
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            z-index: 10;
        `;
        
        // Toggle de habilitado/deshabilitado
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = isEnabled ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        toggleBtn.className = `admin-btn ${isEnabled ? 'enabled' : 'disabled'}`;
        toggleBtn.style.cssText = `
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            color: white;
            background: ${isEnabled ? '#4CAF50' : '#f44336'};
            transition: all 0.3s ease;
        `;
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProduct(productId, productElement);
        });
        
        // Botón de editar ganancias
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-dollar-sign"></i>';
        editBtn.className = 'admin-btn edit-profits';
        editBtn.style.cssText = `
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            color: white;
            background: #FF9800;
            transition: all 0.3s ease;
        `;
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editProductProfits(productId);
        });
        
        adminControls.appendChild(toggleBtn);
        adminControls.appendChild(editBtn);
        
        // Hacer el producto relativo para posicionar los controles
        productElement.style.position = 'relative';
        productElement.appendChild(adminControls);
        
        // Aplicar estado visual
        this.updateProductVisualState(productElement, isEnabled);
    }

    toggleProduct(productId, productElement) {
        const currentState = this.productStates[productId] !== false;
        const newState = !currentState;
        
        this.productStates[productId] = newState;
        this.saveProductStates();
        
        // Actualizar visual
        this.updateProductVisualState(productElement, newState);
        
        // Actualizar botón
        const toggleBtn = productElement.querySelector('.admin-btn');
        if (toggleBtn) {
            toggleBtn.innerHTML = newState ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            toggleBtn.style.background = newState ? '#4CAF50' : '#f44336';
            toggleBtn.className = `admin-btn ${newState ? 'enabled' : 'disabled'}`;
        }
        
        // Mostrar notificación
        const action = newState ? 'habilitado' : 'deshabilitado';
        this.showNotification(`Producto ${action}`, newState ? 'success' : 'warning');
        
        // Sincronizar con Google Sheets
        this.syncProductStateToGoogleSheets(productId, newState);
    }

    updateProductVisualState(productElement, isEnabled) {
        if (isEnabled) {
            productElement.classList.remove('disabled');
            productElement.style.opacity = '1';
        } else {
            productElement.classList.add('disabled');
            productElement.style.opacity = '0.6';
        }
    }

    editProductProfits(productId) {
        // Abrir modal de edición de ganancias
        const modal = this.createProfitsModal(productId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createProfitsModal(productId) {
        const modal = document.createElement('div');
        modal.className = 'modal profits-modal';
        
        const currentProfits = this.getProductProfits(productId);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Ganancias - ${productId}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profits-form">
                        <div class="form-group">
                            <label>XJoseDharckX (USD):</label>
                            <input type="number" step="0.01" value="${currentProfits.XJoseDharckX || 0}" data-vendor="XJoseDharckX">
                        </div>
                        <div class="form-group">
                            <label>David (USD):</label>
                            <input type="number" step="0.01" value="${currentProfits.David || 0}" data-vendor="David">
                        </div>
                        <div class="form-group">
                            <label>Ernesto (USD):</label>
                            <input type="number" step="0.01" value="${currentProfits.Ernesto || 0}" data-vendor="Ernesto">
                        </div>
                        <div class="form-group">
                            <label>Satoru (USD):</label>
                            <input type="number" step="0.01" value="${currentProfits.Satoru || 0}" data-vendor="Satoru">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary close-modal">Cancelar</button>
                    <button class="btn-primary save-profits">Guardar</button>
                </div>
            </div>
        `;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.save-profits').addEventListener('click', () => {
            this.saveProfitsFromModal(productId, modal);
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    getProductProfits(productId) {
        const [game, product] = this.parseProductId(productId);
        return this.vendorProfits[game]?.[product] || {};
    }

    parseProductId(productId) {
        // Asumiendo formato: "game-product" ej: "lords-mobile-60-diamonds"
        const parts = productId.split('-');
        if (parts.length >= 3) {
            const game = parts[0] + '-' + parts[1]; // "lords-mobile"
            const product = parts.slice(2).join('-'); // "60-diamonds"
            return [game, product];
        }
        return ['unknown', productId];
    }

    saveProfitsFromModal(productId, modal) {
        const [game, product] = this.parseProductId(productId);
        
        if (!this.vendorProfits[game]) {
            this.vendorProfits[game] = {};
        }
        
        if (!this.vendorProfits[game][product]) {
            this.vendorProfits[game][product] = {};
        }
        
        const inputs = modal.querySelectorAll('input[data-vendor]');
        inputs.forEach(input => {
            const vendor = input.dataset.vendor;
            const value = parseFloat(input.value) || 0;
            this.vendorProfits[game][product][vendor] = value;
        });
        
        this.saveVendorProfits();
        this.showNotification('Ganancias actualizadas correctamente', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Métodos para sincronización con Google Sheets
    async syncProductStateToGoogleSheets(productId, isEnabled) {
        try {
            // Implementar sincronización con Google Sheets
            console.log(`Syncing product ${productId} state: ${isEnabled}`);
        } catch (error) {
            console.error('Error syncing to Google Sheets:', error);
        }
    }

    async syncProfitsToGoogleSheets() {
        try {
            // Implementar sincronización de ganancias con Google Sheets
            console.log('Syncing profits to Google Sheets:', this.vendorProfits);
        } catch (error) {
            console.error('Error syncing profits to Google Sheets:', error);
        }
    }

    // Método para calcular ganancias de una orden
    calculateOrderProfit(order, vendor) {
        let totalProfit = 0;
        
        order.items.forEach(item => {
            const [game, product] = this.parseProductId(item.id);
            const productProfits = this.vendorProfits[game]?.[product];
            
            if (productProfits && productProfits[vendor]) {
                totalProfit += productProfits[vendor] * item.quantity;
            }
        });
        
        return totalProfit;
    }

    // Método para obtener estadísticas de ganancias
    getProfitStats(vendor = null) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const completedOrders = orders.filter(order => order.status === 'completed');
        
        let totalProfit = 0;
        let orderCount = 0;
        
        completedOrders.forEach(order => {
            const orderVendor = order.vendor || 'XJoseDharckX';
            
            if (!vendor || vendor === orderVendor) {
                totalProfit += this.calculateOrderProfit(order, orderVendor);
                orderCount++;
            }
        });
        
        return {
            totalProfit,
            orderCount,
            averageProfit: orderCount > 0 ? totalProfit / orderCount : 0
        };
    }

    // Method to get enabled products (for cart functionality)
    isProductEnabled(productId) {
        return this.productStates[productId] !== false;
    }
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .product-card.disabled {
        filter: grayscale(50%);
        opacity: 0.6;
    }
    
    .admin-btn:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// Inicializar el administrador
const adminManager = new AdminManager();

// Override addToCart to check if product is enabled
const originalAddToCart = window.addToCart;
window.addToCart = function(productId) {
    if (!adminManager.isProductEnabled(productId)) {
        adminManager.showNotification('Este producto no está disponible actualmente', 'warning');
        return;
    }
    
    if (originalAddToCart) {
        originalAddToCart(productId);
    }
};

// Exportar para uso global
window.adminManager = adminManager;