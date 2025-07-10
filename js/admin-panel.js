class AdminPanelManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.sheetsManager = new GoogleSheetsManager();
        this.products = this.loadProducts();
        this.profits = this.loadProfits();
        this.orders = this.loadOrders();
        this.vendors = this.loadVendors();
        this.exchangeRates = this.loadExchangeRates();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.setupCharts();
        this.initializeDefaultData();
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Product management
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.openProductModal();
        });

        document.getElementById('gameFilter')?.addEventListener('change', (e) => {
            this.filterProducts(e.target.value);
        });

        // Profits management
        document.getElementById('saveProfitsBtn')?.addEventListener('click', () => {
            this.saveProfits();
        });

        document.getElementById('profitGameFilter')?.addEventListener('change', (e) => {
            this.loadProfitsTable(e.target.value);
        });

        // Orders management
        document.getElementById('orderStatusFilter')?.addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('orderVendorFilter')?.addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('orderDateFilter')?.addEventListener('change', () => {
            this.filterOrders();
        });

        // Exchange rates
        document.getElementById('updateRatesBtn')?.addEventListener('click', () => {
            this.updateExchangeRates();
        });

        // Vendors
        document.getElementById('addVendorBtn')?.addEventListener('click', () => {
            this.openVendorModal();
        });

        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        document.getElementById('saveProductBtn')?.addEventListener('click', () => {
            this.saveProduct();
        });

        document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
            this.closeModals();
        });

        // Sync button
        document.getElementById('syncBtn')?.addEventListener('click', () => {
            this.syncWithGoogleSheets();
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    getSalesByGame() {
        const orders = this.getStoredOrders();
        const salesByGame = {};
        
        orders.forEach(order => {
            const gameName = this.getGameDisplayName(order.game);
            salesByGame[gameName] = (salesByGame[gameName] || 0) + (order.total || 0);
        });
        
        return salesByGame;
    }

    getProfitsByVendor() {
        const orders = this.getStoredOrders();
        const profitsByVendor = {};
        
        orders.forEach(order => {
            const vendor = order.vendor || 'Sin asignar';
            profitsByVendor[vendor] = (profitsByVendor[vendor] || 0) + (order.profit || 0);
        });
        
        return profitsByVendor;
    }

    // Tab Management
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName)?.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        this.currentTab = tabName;
        
        // Load tab content
        switch(tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'profits':
                this.loadProfitsTable();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'exchange':
                this.loadExchangeRates();
                break;
            case 'vendors':
                this.loadVendors();
                break;
        }
    }

    viewOrderDetails(orderId) {
        const orders = this.getStoredOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            alert(`Detalles de la orden:\n\nID: ${order.id}\nCliente: ${order.customerInfo?.name}\nEmail: ${order.customerInfo?.email}\nTeléfono: ${order.customerInfo?.phone}\nJuego: ${this.getGameDisplayName(order.game)}\nTotal: $${order.total}\nVendedor: ${order.vendor}\nEstado: ${order.status}`);
        }
    }

    // Dashboard Management
    loadDashboard() {
        this.updateStatCards();
        this.updateCharts();
    }

    updateStatCards() {
        const stats = this.calculateStatistics();
        
        const totalOrdersEl = document.querySelector('#totalOrders .stat-info h3');
        const totalRevenueEl = document.querySelector('#totalRevenue .stat-info h3');
        const totalProfitsEl = document.querySelector('#totalProfits .stat-info h3');
        const activeProductsEl = document.querySelector('#activeProducts .stat-info h3');
        
        if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders;
        if (totalRevenueEl) totalRevenueEl.textContent = `$${stats.totalRevenue.toFixed(2)}`;
        if (totalProfitsEl) totalProfitsEl.textContent = `$${stats.totalProfits.toFixed(2)}`;
        if (activeProductsEl) activeProductsEl.textContent = stats.activeProducts;
    }

    calculateStatistics() {
        const orders = this.getStoredOrders();
        const products = this.getStoredProducts();
        
        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
            totalProfits: orders.reduce((sum, order) => sum + (order.profit || 0), 0),
            activeProducts: products.filter(p => p.enabled).length
        };
    }

    setupCharts() {
        setTimeout(() => {
            this.setupSalesChart();
            this.setupProfitsChart();
        }, 100);
    }

    updateCharts() {
        this.setupCharts();
    }

    setupSalesChart() {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        const salesData = this.getSalesByGame();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(salesData),
                datasets: [{
                    data: Object.values(salesData),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupProfitsChart() {
        const ctx = document.getElementById('profitsChart')?.getContext('2d');
        if (!ctx) return;

        const profitsData = this.getProfitsByVendor();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(profitsData),
                datasets: [{
                    label: 'Ganancias ($)',
                    data: Object.values(profitsData),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Product Management
    loadProducts() {
        const products = this.getStoredProducts();
        const gameFilter = document.getElementById('gameFilter')?.value || 'all';
        
        const filteredProducts = gameFilter === 'all' ? 
            products : products.filter(p => p.game === gameFilter);
        
        this.renderProductsGrid(filteredProducts);
    }

    filterProducts(gameFilter) {
        this.loadProducts();
    }

    renderProductsGrid(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        grid.innerHTML = products.map(product => `
            <div class="product-card ${!product.enabled ? 'disabled' : ''}">
                <div class="product-header">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price}</div>
                        <div class="product-game">${this.getGameDisplayName(product.game)}</div>
                    </div>
                    <label class="product-toggle">
                        <input type="checkbox" ${product.enabled ? 'checked' : ''} 
                               onchange="adminPanel.toggleProduct('${product.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="adminPanel.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-secondary" onclick="adminPanel.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleProduct(productId) {
        const products = this.getStoredProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.enabled = !product.enabled;
            this.saveProducts(products);
            this.loadProducts();
            this.showNotification(`Producto ${product.enabled ? 'habilitado' : 'deshabilitado'}`, 'success');
        }
    }

    editProduct(productId) {
        const products = this.getStoredProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    deleteProduct(productId) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            const products = this.getStoredProducts();
            const filteredProducts = products.filter(p => p.id !== productId);
            this.saveProducts(filteredProducts);
            this.loadProducts();
            this.showNotification('Producto eliminado', 'success');
        }
    }

    openProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        if (product) {
            title.textContent = 'Editar Producto';
            document.getElementById('productGame').value = product.game;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productCategory').value = product.category || 'normal';
            form.dataset.productId = product.id;
        } else {
            title.textContent = 'Agregar Producto';
            form.reset();
            delete form.dataset.productId;
        }
        
        modal.classList.add('active');
    }

    saveProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        
        const productData = {
            id: form.dataset.productId || this.generateId(),
            game: document.getElementById('productGame').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image: document.getElementById('productImage').value,
            category: document.getElementById('productCategory').value,
            enabled: true
        };
        
        const products = this.getStoredProducts();
        
        if (form.dataset.productId) {
            // Edit existing product
            const index = products.findIndex(p => p.id === form.dataset.productId);
            if (index !== -1) {
                products[index] = { ...products[index], ...productData };
            }
        } else {
            // Add new product
            products.push(productData);
        }
        
        this.saveProducts(products);
        this.closeModals();
        this.loadProducts();
        this.showNotification('Producto guardado exitosamente', 'success');
    }

    // Profits Management
    loadProfitsTable(game = 'lords-mobile') {
        const products = this.getStoredProducts().filter(p => p.game === game);
        const profits = this.getStoredProfits();
        const vendors = ['XJoseDharckX', 'David', 'Ernesto', 'Satoru'];
        
        const tbody = document.getElementById('profitsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = products.map(product => {
            const productProfits = profits[product.id] || {};
            
            return `
                <tr>
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    ${vendors.map(vendor => `
                        <td>
                            <input type="number" 
                                   value="${productProfits[vendor] || 0}" 
                                   step="0.01" 
                                   data-product="${product.id}" 
                                   data-vendor="${vendor}"
                                   class="profit-input"
                                   style="width: 80px; padding: 0.25rem;">
                        </td>
                    `).join('')}
                    <td>
                        <button class="btn-primary" onclick="adminPanel.saveProfitRow('${product.id}')">
                            <i class="fas fa-save"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getVendorOrderCount(vendorName) {
        const orders = this.getStoredOrders();
        return orders.filter(order => order.vendor === vendorName).length;
    }

    getVendorTotalProfits(vendorName) {
        const orders = this.getStoredOrders();
        return orders
            .filter(order => order.vendor === vendorName)
            .reduce((sum, order) => sum + (order.profit || 0), 0);
    }

    openVendorModal(vendor = null) {
        // Implementar modal de vendedor
        this.showNotification('Funcionalidad de vendedores en desarrollo', 'info');
    }

    editVendor(vendorId) {
        this.showNotification('Funcionalidad de edición de vendedores en desarrollo', 'info');
    }

    // Modal Management
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    saveProfitRow(productId) {
        const inputs = document.querySelectorAll(`[data-product="${productId}"]`);
        const profits = this.getStoredProfits();
        
        if (!profits[productId]) {
            profits[productId] = {};
        }
        
        inputs.forEach(input => {
            const vendor = input.dataset.vendor;
            const value = parseFloat(input.value) || 0;
            profits[productId][vendor] = value;
        });
        
        this.saveProfitsData(profits);
        this.showNotification('Ganancias del producto guardadas', 'success');
    }

    saveProfits() {
        const inputs = document.querySelectorAll('.profit-input');
        const profits = this.getStoredProfits();
        
        inputs.forEach(input => {
            const productId = input.dataset.product;
            const vendor = input.dataset.vendor;
            const value = parseFloat(input.value) || 0;
            
            if (!profits[productId]) {
                profits[productId] = {};
            }
            profits[productId][vendor] = value;
        });
        
        this.saveProfitsData(profits);
        this.showNotification('Todas las ganancias guardadas exitosamente', 'success');
    }

    // Orders Management
    loadOrders() {
        const orders = this.getStoredOrders();
        this.renderOrdersTable(orders);
    }

    filterOrders() {
        const orders = this.getStoredOrders();
        const statusFilter = document.getElementById('orderStatusFilter')?.value;
        const vendorFilter = document.getElementById('orderVendorFilter')?.value;
        const dateFilter = document.getElementById('orderDateFilter')?.value;
        
        let filteredOrders = orders;
        
        if (statusFilter && statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        if (vendorFilter && vendorFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.vendor === vendorFilter);
        }
        
        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.timestamp).toDateString();
                return orderDate === filterDate;
            });
        }
        
        this.renderOrdersTable(filteredOrders);
    }

    renderOrdersTable(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerInfo?.name || 'N/A'}</td>
                <td>${this.getGameDisplayName(order.game)}</td>
                <td>${order.items?.map(item => item.name).join(', ') || 'N/A'}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td>${order.vendor || 'Sin asignar'}</td>
                <td>
                    <select class="status-select" onchange="adminPanel.updateOrderStatus('${order.id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Procesando</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completada</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </td>
                <td>${new Date(order.timestamp).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" onclick="adminPanel.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getStoredOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders(orders);
            this.sheetsManager.updateOrderStatus(orderId, newStatus);
            this.showNotification('Estado de orden actualizado', 'success');
        }
    }

    // Exchange Rates Management
    async loadExchangeRates() {
        try {
            const rates = await this.sheetsManager.getExchangeRates();
            this.renderExchangeRates(rates);
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            this.renderExchangeRates(this.getFallbackRates());
        }
    }

    renderExchangeRates(rates) {
        const grid = document.getElementById('exchangeGrid');
        if (!grid) return;
        
        const currencies = [
            { code: 'USD', name: 'Dólar Estadounidense', flag: 'image/paises/us.png' },
            { code: 'EUR', name: 'Euro', flag: 'image/paises/fr.png' },
            { code: 'GBP', name: 'Libra Esterlina', flag: 'image/paises/gb.png' },
            { code: 'CAD', name: 'Dólar Canadiense', flag: 'image/paises/ca.png' }
        ];
        
        grid.innerHTML = currencies.map(currency => `
            <div class="exchange-card">
                <img src="${currency.flag}" alt="${currency.code}">
                <h3>${currency.code}</h3>
                <p>${currency.name}</p>
                <div class="exchange-rate">${rates[currency.code] || 1}</div>
                <input type="number" 
                       value="${rates[currency.code] || 1}" 
                       step="0.0001" 
                       data-currency="${currency.code}"
                       class="rate-input"
                       style="width: 100%; margin-top: 0.5rem; padding: 0.5rem;">
            </div>
        `).join('');
    }

    async updateExchangeRates() {
        const inputs = document.querySelectorAll('.rate-input');
        const rates = {};
        
        inputs.forEach(input => {
            rates[input.dataset.currency] = parseFloat(input.value);
        });
        
        try {
            await this.sheetsManager.updateExchangeRates(rates);
            this.saveExchangeRates(rates);
            this.showNotification('Tipos de cambio actualizados', 'success');
            this.renderExchangeRates(rates);
        } catch (error) {
            this.showNotification('Error al actualizar tipos de cambio', 'error');
        }
    }

    getFallbackRates() {
        return {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            CAD: 1.25
        };
    }

    // Vendors Management
    loadVendors() {
        const vendors = this.getStoredVendors();
        this.renderVendorsGrid(vendors);
    }

    renderVendorsGrid(vendors) {
        const grid = document.getElementById('vendorsGrid');
        if (!grid) return;
        
        grid.innerHTML = vendors.map(vendor => `
            <div class="vendor-card">
                <img src="${vendor.avatar || 'image/default-avatar.png'}" alt="${vendor.name}" class="vendor-avatar">
                <div class="vendor-name">${vendor.name}</div>
                <div class="vendor-contact">${vendor.contact}</div>
                <div class="vendor-stats">
                    <p>Órdenes: ${this.getVendorOrderCount(vendor.name)}</p>
                    <p>Ganancias: $${this.getVendorTotalProfits(vendor.name).toFixed(2)}</p>
                </div>
                <div class="vendor-actions">
                    <button class="btn-secondary" onclick="adminPanel.editVendor('${vendor.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    getGameDisplayName(gameCode) {
        const games = {
            'lords-mobile': 'Lords Mobile',
            'free-fire': 'Free Fire',
            'blood-strike': 'Blood Strike',
            'genshin-impact': 'Genshin Impact'
        };
        return games[gameCode] || gameCode;
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Data Storage Methods
    getStoredProducts() {
        return JSON.parse(localStorage.getItem('adminProducts') || '[]');
    }

    saveProducts(products) {
        localStorage.setItem('adminProducts', JSON.stringify(products));
    }

    getStoredProfits() {
        return JSON.parse(localStorage.getItem('adminProfits') || '{}');
    }

    saveProfitsData(profits) {
        localStorage.setItem('adminProfits', JSON.stringify(profits));
    }

    getStoredOrders() {
        return JSON.parse(localStorage.getItem('adminOrders') || '[]');
    }

    saveOrders(orders) {
        localStorage.setItem('adminOrders', JSON.stringify(orders));
    }

    getStoredVendors() {
        return JSON.parse(localStorage.getItem('adminVendors') || '[]');
    }

    saveVendors(vendors) {
        localStorage.setItem('adminVendors', JSON.stringify(vendors));
    }

    getStoredExchangeRates() {
        return JSON.parse(localStorage.getItem('exchangeRates') || '{}');
    }

    saveExchangeRates(rates) {
        localStorage.setItem('exchangeRates', JSON.stringify(rates));
    }

    // Initialize default data
    initializeDefaultData() {
        // Initialize default products if none exist
        if (this.getStoredProducts().length === 0) {
            this.initializeDefaultProducts();
        }
        
        // Initialize default vendors if none exist
        if (this.getStoredVendors().length === 0) {
            this.initializeDefaultVendors();
        }
        
        // Initialize default exchange rates if none exist
        if (Object.keys(this.getStoredExchangeRates()).length === 0) {
            this.saveExchangeRates(this.getFallbackRates());
        }
    }

    initializeDefaultProducts() {
        const defaultProducts = [
            // Lords Mobile
            { id: 'lm_1', game: 'lords-mobile', name: '100 Diamantes', price: 1.99, enabled: true, category: 'normal', image: 'image/100.png' },
            { id: 'lm_2', game: 'lords-mobile', name: '300 Diamantes', price: 4.99, enabled: true, category: 'normal', image: 'image/300.png' },
            { id: 'lm_3', game: 'lords-mobile', name: '500 Diamantes', price: 7.99, enabled: true, category: 'promotional', image: 'image/500.png' },
            { id: 'lm_4', game: 'lords-mobile', name: '1000 Diamantes', price: 14.99, enabled: true, category: 'normal', image: 'image/1000.png' },
            { id: 'lm_5', game: 'lords-mobile', name: '2000 Diamantes', price: 29.99, enabled: true, category: 'promotional', image: 'image/2000.png' },
            { id: 'lm_6', game: 'lords-mobile', name: '5000 Diamantes', price: 69.99, enabled: true, category: 'normal', image: 'image/5000.png' },
            
            // Free Fire
            { id: 'ff_1', game: 'free-fire', name: '100 Diamantes FF', price: 1.99, enabled: true, category: 'normal', image: 'image/ff1.png' },
            { id: 'ff_2', game: 'free-fire', name: 'Pase Elite', price: 9.99, enabled: true, category: 'promotional', image: 'image/elite.png' },
            { id: 'ff_3', game: 'free-fire', name: 'Membresía Mensual', price: 4.99, enabled: true, category: 'normal', image: 'image/ffm.png' },
            
            // Blood Strike
            { id: 'bs_1', game: 'blood-strike', name: '100 Gold BS', price: 1.99, enabled: true, category: 'normal', image: 'image/bs.png' },
            { id: 'bs_2', game: 'blood-strike', name: 'Battle Pass BS', price: 9.99, enabled: true, category: 'promotional', image: 'image/bs.png' },
            
            // Genshin Impact
            { id: 'gi_1', game: 'genshin-impact', name: '60 Genesis Crystals', price: 0.99, enabled: true, category: 'normal', image: 'image/cg1.png' },
            { id: 'gi_2', game: 'genshin-impact', name: '300 Genesis Crystals', price: 4.99, enabled: true, category: 'normal', image: 'image/cg2.png' },
            { id: 'gi_3', game: 'genshin-impact', name: '980 Genesis Crystals', price: 14.99, enabled: true, category: 'promotional', image: 'image/cg3.png' }
        ];
        
        this.saveProducts(defaultProducts);
    }

    initializeDefaultVendors() {
        const defaultVendors = [
            { id: 'v1', name: 'XJoseDharckX', contact: '@XJoseDharckX', avatar: 'image/xjosedharckx.jpg' },
            { id: 'v2', name: 'David', contact: '@David_Vendor', avatar: 'image/david.jpg' },
            { id: 'v3', name: 'Ernesto', contact: '@Ernesto_Games', avatar: 'image/ernesto.jpg' },
            { id: 'v4', name: 'Satoru', contact: '@Satoru_Gaming', avatar: 'image/satoru.jpg' }
        ];
        
        this.saveVendors(defaultVendors);
    }

    // Calculate order profit based on vendor
    calculateOrderProfit(orderData, vendor) {
        const profits = this.getStoredProfits();
        let totalProfit = 0;
        
        if (orderData.items) {
            orderData.items.forEach(item => {
                const productProfits = profits[item.id];
                if (productProfits && productProfits[vendor]) {
                    totalProfit += productProfits[vendor] * (item.quantity || 1);
                }
            });
        }
        
        return totalProfit;
    }

    // Sync with Google Sheets
    async syncWithGoogleSheets() {
        try {
            this.showNotification('Sincronizando con Google Sheets...', 'info');
            
            // Sync all data
            await this.sheetsManager.syncProfits(this.getStoredProfits());
            
            // Update exchange rates
            const rates = await this.sheetsManager.getExchangeRates();
            this.saveExchangeRates(rates);
            
            this.showNotification('Sincronización completada', 'success');
            
            // Refresh current tab
            this.switchTab(this.currentTab);
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Error en la sincronización', 'error');
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanelManager();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .status-select {
        padding: 0.25rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
    }
`;
document.head.appendChild(style);