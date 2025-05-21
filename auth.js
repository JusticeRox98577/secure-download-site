const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Authentication module
const auth = {
    // Current user data
    user: null,
    
    // Initialize Firebase Auth
    init: function() {
        // Set up auth state observer
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.user = user;
                console.log('User is logged in:', user.email);
                
                // Update UI for authenticated user
                this.updateAuthUI(true);
                
                // If on the download page, check payment verification
                if (window.location.pathname.includes('download.html')) {
                    // Check if payment is verified for this user
                    this.checkPaymentVerification();
                }
            } else {
                this.user = null;
                console.log('User is logged out');
                
                // Update UI for non-authenticated user
                this.updateAuthUI(false);
                
                // If on download page, redirect to login
                if (window.location.pathname.includes('download.html')) {
                    window.location.href = 'login.html';
                }
            }
        });
        
        // Set up login button if on login page
        const loginBtn = document.getElementById('google-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.signInWithGoogle());
        }
        
        // Set up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }
    },
    
    // Sign in with Google
    signInWithGoogle: function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Show login status
        const loginStatus = document.getElementById('login-status');
        if (loginStatus) loginStatus.classList.remove('hidden');
        
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                // Get payment verification token from URL params (if coming from payment)
                const urlParams = new URLSearchParams(window.location.search);
                const paymentToken = urlParams.get('token');
                
                if (paymentToken) {
                    // Store payment token with user
                    this.storePaymentVerification(result.user.uid, paymentToken);
                }
                
                // Redirect to download page
                window.location.href = 'download.html';
            })
            .catch(error => {
                console.error('Google sign-in error:', error);
                
                if (loginStatus) loginStatus.classList.add('hidden');
                
                alert('Authentication failed. Please try again.');
            });
    },
    
    // Sign out
    signOut: function() {
        firebase.auth().signOut()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Sign out error:', error);
            });
    },
    
    // Store payment verification in Firestore
    storePaymentVerification: function(userId, paymentToken) {
        const db = firebase.firestore();
        
        db.collection('payments').doc(userId).set({
            paymentToken: paymentToken,
            verified: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Payment verification stored');
        })
        .catch(error => {
            console.error('Error storing payment verification:', error);
        });
    },
    
    // Check if user has verified payment
    checkPaymentVerification: function() {
        const userId = this.user.uid;
        const db = firebase.firestore();
        
        // Show verification pending UI
        const pendingEl = document.getElementById('verification-pending');
        if (pendingEl) pendingEl.classList.remove('hidden');
        
        db.collection('payments').doc(userId).get()
            .then(doc => {
                if (pendingEl) pendingEl.classList.add('hidden');
                
                if (doc.exists && doc.data().verified) {
                    // Payment verified, show download UI
                    const downloadContainer = document.getElementById('download-container');
                    if (downloadContainer) downloadContainer.classList.remove('hidden');
                } else {
                    // Payment not verified, show access denied
                    const accessDenied = document.getElementById('access-denied');
                    if (accessDenied) accessDenied.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error checking payment verification:', error);
                
                if (pendingEl) pendingEl.classList.add('hidden');
                
                // Show error UI
                const accessDenied = document.getElementById('access-denied');
                if (accessDenied) accessDenied.classList.remove('hidden');
            });
    },
    
    // Update UI based on authentication state
    updateAuthUI: function(isAuthenticated) {
        // Update user info display if element exists
        const userInfoEl = document.getElementById('user-info');
        const userEmailEl = document.getElementById('user-email');
        
        if (userInfoEl && userEmailEl) {
            if (isAuthenticated) {
                userInfoEl.classList.remove('hidden');
                userEmailEl.textContent = this.user.email;
            } else {
                userInfoEl.classList.add('hidden');
            }
        }
    }
};

// Initialize auth when document is ready
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});