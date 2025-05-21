const payment = {
    // Payment configuration
    config: {
        price: 19.99,
        currency: 'USD',
        productName: 'Premium File Access'
    },
    
    init: function() {
        // Set up payment button
        const paymentButton = document.getElementById('payment-button');
        if (paymentButton) {
            // Update button text with price
            paymentButton.textContent = `Pay $${this.config.price.toFixed(2)} Now`;
            
            // Add click event
            paymentButton.addEventListener('click', () => this.processPayment());
        }
    },
    
    // Process payment (mock implementation - connect to real payment gateway in production)
    processPayment: function() {
        // Show payment status
        const paymentStatus = document.getElementById('payment-status');
        if (paymentStatus) paymentStatus.classList.remove('hidden');
        
        // Mock payment processing - In production, redirect to payment gateway
        setTimeout(() => {
            console.log('Payment processed successfully');
            
            // Generate mock payment token
            const paymentToken = this.generatePaymentToken();
            
            // Redirect to login page with payment token
            window.location.href = `login.html?token=${paymentToken}`;
        }, 2000);
    },
    
    // Generate a mock payment token
    generatePaymentToken: function() {
        // In production, this would come from the payment gateway
        return 'pay_' + Math.random().toString(36).substr(2, 9);
    }
};

// Initialize payment when document is ready
document.addEventListener('DOMContentLoaded', () => {
    payment.init();
});