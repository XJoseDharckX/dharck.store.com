class ProductManager {
    constructor() {
        this.products = this.loadProductStates();
        this.init();
    }

    init() {
        this.updateProductStates();
        this.setupAdminControls();
    }

    loadProductStates() {
        // Cargar estados desde localStorage o usar valores por defecto
        const saved = localStorage.getItem('product-states');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Estados por defecto - todos habilitados
        return {
            // Promociones
            'promo-499': true,
            'promo-999': true,
            'promo-1999': true,
            'promo-2499': true,
            'promo-2999': true,
            'promo-4999': true,
            'promo-9999': true,
            
            // Diamantes normales
            'weekly-pass': true,
            'monthly-pass': true,
            'gems-209': true,
            'gems-524': true,
            'gems-1048': true,
            'gems-2096': true,
            'gems-3144': true,
            'gems-5240': true,
            'gems-6812': true,
            'gems-9956': true,
            'gems-19912': true,
            'gems-30392': true,
            'gems-50304': true
        };
    }

    saveProductStates() {
        localStorage.setItem('product-states', JSON.stringify(this.products));
    }

    toggleProduct(productId) {
        this.products[productId] = !this.products[productId];
        this.saveProductStates();
        this.updateProductStates();
        return this.products[productId];
    }

    enableProduct(productId) {
        this.products[productId] = true;
        this.saveProductStates();
        this.updateProductStates();
    }

    disableProduct(productId) {
        this.products[productId] = false;
        this.saveProductStates();
        this.updateProductStates();
    }

    isProductEnabled(productId) {
        return this.products[productId] !== false;
    }

    updateProductStates() {
        Object.keys(this.products).forEach(productId => {
            const productCard = document.querySelector(`[data-product="${productId}"]`);
            if (productCard) {
                const isEnabled = this.products[productId];
                
                // Actualizar atributo data-enabled
                productCard.setAttribute('data-enabled', isEnabled);
                
                // Actualizar indicador de estado
                const statusIndicator = productCard.querySelector('.status-indicator');
                if (statusIndicator) {
                    statusIndicator.className = `status-indicator ${isEnabled ? 'enabled' : 'disabled'}`;
                    statusIndicator.textContent = isEnabled ? 'Disponible' : 'No Disponible';
                }
                
                // Deshabilitar/habilitar botones
                const addButton = productCard.querySelector('.add-to-cart');
                const qtyButtons = productCard.querySelectorAll('.qty-btn');
                
                if (addButton) {
                    addButton.disabled = !isEnabled;
                    if (!isEnabled) {
                        addButton.textContent = 'No Disponible';
                    } else {
                        addButton.textContent = 'Agregar';
                    }
                }
                
                qtyButtons.forEach(btn => {
                    btn.disabled = !isEnabled;
                });
            }
        });
    }

    setupAdminControls() {
        // Solo mostrar controles de admin si estamos en modo admin
        if (window.location.search.includes('admin=true')) {
            this.showAdminControls();
        }
    }

    showAdminControls() {
        // Agregar botones de admin a cada producto
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.getAttribute('data-product');
            if (productId && !card.querySelector('.admin-controls')) {
                const adminControls = document.createElement('div');
                adminControls.className = 'admin-controls';
                adminControls.innerHTML = `
                    <button class="admin-btn toggle-btn" onclick="productManager.toggleProduct('${productId}')">
                        ${this.isProductEnabled(productId) ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                `;
                
                card.appendChild(adminControls);
            }
        });
        
        // Agregar estilos para controles de admin
        if (!document.getElementById('admin-styles')) {
            const adminStyles = document.createElement('style');
            adminStyles.id = 'admin-styles';
            adminStyles.textContent = `
                .admin-controls {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 2px dashed #007bff;
                }
                
                .admin-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: bold;
                    transition: background 0.3s;
                    width: 100%;
                }
                
                .admin-btn:hover {
                    background: #0056b3;
                }
                
                .admin-controls::before {
                    content: "🔧 ADMIN";
                    display: block;
                    font-size: 0.7rem;
                    color: #007bff;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    text-align: center;
                }
            `;
            document.head.appendChild(adminStyles);
        }
    }

    // Método para obtener todos los productos habilitados
    getEnabledProducts() {
        return Object.keys(this.products).filter(productId => this.products[productId]);
    }

    // Método para obtener todos los productos deshabilitados
    getDisabledProducts() {
        return Object.keys(this.products).filter(productId => !this.products[productId]);
    }

    // Método para exportar configuración
    exportConfiguration() {
        const config = {
            timestamp: new Date().toISOString(),
            products: this.products
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lords-mobile-products-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Método para importar configuración
    importConfiguration(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (config.products) {
                    this.products = config.products;
                    this.saveProductStates();
                    this.updateProductStates();
                    alert('Configuración importada exitosamente');
                }
            } catch (error) {
                alert('Error al importar configuración: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar el gestor de productos
const productManager = new ProductManager();

// Función global para verificar si un producto está habilitado antes de agregarlo al carrito
function addToCart(productId) {
    if (!productManager.isProductEnabled(productId)) {
        alert('Este producto no está disponible actualmente.');
        return;
    }
    
    const productCard = document.querySelector(`[data-product="${productId}"]`);
    if (!productCard) return;
    
    const productName = productCard.querySelector('h4').textContent;
    const productPrice = parseFloat(productCard.dataset.price);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).textContent);
    
    cart.addItem(productId, productName, productPrice, quantity);
    
    // Reset quantity to 1
    document.getElementById(`qty-${productId}`).textContent = '1';
}

// Función para mostrar panel de administración de productos
function showProductAdminPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const enabledProducts = productManager.getEnabledProducts();
    const disabledProducts = productManager.getDisabledProducts();
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Administrar Productos - Lords Mobile</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <h4