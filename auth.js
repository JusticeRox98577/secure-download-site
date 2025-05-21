// auth.js - Firebase Authentication

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3WX8RCWYUwpoE4DYlg8JbTaN4MQnwKHg",
  authDomain: "nrps-sell.firebaseapp.com",
  projectId: "nrps-sell",
  storageBucket: "nrps-sell.firebasestorage.app",
  messagingSenderId: "696676277086",
  appId: "1:696676277086:web:f90d7ed9bc0272cddb4dcf",
  measurementId: "G-KJPF6CQTG9"
};

// Initialize Firebase - using compatibility version for older syntax
firebase.initializeApp(firebaseConfig);

// Authentication module
const auth = {
    // Current user data
    user: null,
    
    // Initialize Firebase Auth
    init: function() {
        console.log("Auth initialization started");
        
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
            console.log("Login button found, adding event listener");
            loginBtn.addEventListener('click', () => {
                console.log("Login button clicked");
                this.signInWithGoogle();
            });
        } else {
            console.log("Login button not found on this page");
        }
        
        // Set up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }
    },
    
    // Sign in with Google
    signInWithGoogle: function() {
        console.log("Attempting Google sign in");
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Show login status
        const loginStatus = document.getElementById('login-status');
        if (loginStatus) loginStatus.classList.remove('hidden');
        
        // Try to sign in with popup
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                console.log("Google sign-in successful");
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
                
                // If popup fails, try redirect method
                if (error.code === 'auth/popup-blocked') {
                    console.log("Popup blocked, trying redirect method");
                    firebase.auth().signInWithRedirect(provider);
                }
                
                if (loginStatus) loginStatus.classList.add('hidden');
                
                alert('Authentication failed: ' + error.message + '. Please try again.');
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
    console.log("DOM loaded, initializing auth");
    auth.init();
});

// Check for redirect result (for redirect sign-in method)
firebase.auth().getRedirectResult().then(function(result) {
    if (result.user) {
        console.log('Sign-in redirect result:', result.user.email);
        // User signed in with redirect
        window.location.href = 'download.html';
    }
}).catch(function(error) {
    console.error('Redirect sign-in error:', error);
});
