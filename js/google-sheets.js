class GoogleSheetsManager {
    constructor() {
        // Configuración para Vercel
        this.apiUrl = '/api/sheets'; // Endpoint de Vercel
        this.sheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Reemplazar con tu Sheet ID
        this.apiKey = process.env.GOOGLE_SHEETS_API_KEY; // Variable de entorno en Vercel
    }

    // Método para enviar órdenes a Google Sheets
    async submitOrder(orderData) {
        try {
            const response = await fetch(this.apiUrl + '/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addOrder',
                    data: {
                        orderId: orderData.id,
                        customerName: orderData.customerInfo.name,
                        customerEmail: orderData.customerInfo.email,
                        customerPhone: orderData.customerInfo.phone,
                        game: orderData.game,
                        items: JSON.stringify(orderData.items),
                        total: orderData.total,
                        currency: orderData.currency,
                        vendor: orderData.vendor,
                        status: orderData.status,
                        country: orderData.country,
                        paymentMethod: orderData.paymentMethod,
                        timestamp: new Date().toISOString(),
                        profit: this.calculateOrderProfit(orderData)
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Error al enviar orden a Google Sheets');
            }

            const result = await response.json();
            console.log('Orden enviada a Google Sheets:', result);
            return result;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Método para actualizar estado de orden
    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(this.apiUrl + '/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateStatus',
                    orderId: orderId,
                    status: newStatus,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar estado en Google Sheets');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Método para sincronizar ganancias
    async syncProfits(profitsData) {
        try {
            const response = await fetch(this.apiUrl + '/profits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateProfits',
                    data: profitsData,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Error al sincronizar ganancias');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Método para obtener tipos de cambio
    async getExchangeRates() {
        try {
            const response = await fetch(this.apiUrl + '/exchange-rates');
            
            if (!response.ok) {
                throw new Error('Error al obtener tipos de cambio');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            // Fallback a tipos de cambio locales
            return this.getFallbackExchangeRates();
        }
    }

    // Método para actualizar tipos de cambio
    async updateExchangeRates(rates) {
        try {
            const response = await fetch(this.apiUrl + '/exchange-rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateRates',
                    data: rates,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar tipos de cambio');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Método para obtener estadísticas
    async getStatistics(dateRange = null) {
        try {
            const url = dateRange ? 
                `${this.apiUrl}/statistics?from=${dateRange.from}&to=${dateRange.to}` : 
                `${this.apiUrl}/statistics`;
                
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Calcular ganancia de una orden
    calculateOrderProfit(orderData) {
        if (!window.adminManager) return 0;
        
        return window.adminManager.calculateOrderProfit(orderData, orderData.vendor);
    }

    // Tipos de cambio de respaldo
    getFallbackExchangeRates() {
        return {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            CAD: