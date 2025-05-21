// payment.js - Payment Processing

// Initialize payment system
const payment = {
    // Payment configuration
    config: {
        price: 5.99,
        currency: 'USD',
        productName: 'Neural Rock Paper Scissors'
    },
    
    init: function() {
        console.log("Payment initialization started");
        
        // Set up payment button
        const paymentButton = document.getElementById('payment-button');
        if (paymentButton) {
            console.log("Payment button found, adding event listener");
            
            // Update button text with price
            paymentButton.textContent = `Pay $${this.config.price.toFixed(2)} Now`;
            
            // Add click event
            paymentButton.addEventListener('click', () => {
                console.log("Payment button clicked");
                this.processPayment();
            });
        } else {
            console.log("Payment button not found on this page");
        }
    },
    
    // Process payment (mock implementation - connect to real payment gateway in production)
    processPayment: function() {
        console.log("Processing payment");
        
        // Show payment status
        const paymentStatus = document.getElementById('payment-status');
        if (paymentStatus) {
            paymentStatus.classList.remove('hidden');
            console.log("Payment status shown");
        }
        
        // Mock payment processing - In production, redirect to payment gateway
        setTimeout(() => {
            console.log('Payment processed successfully');
            
            // Generate mock payment token
            const paymentToken = this.generatePaymentToken();
            console.log('Generated payment token:', paymentToken);
            
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
    console.log("DOM loaded, initializing payment");
    payment.init();
});
