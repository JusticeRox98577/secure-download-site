// auth.js - Firebase Authentication with fixed redirection

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

// Debug logging function
function debugLog(message) {
    console.log("AUTH: " + message);
    // If we have a debug console element, log there too
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        const logEntry = document.createElement('div');
        logEntry.textContent = new Date().toISOString().substr(11, 8) + ': ' + message;
        debugConsole.appendChild(logEntry);
        debugConsole.scrollTop = debugConsole.scrollHeight;
    }
}

// Authentication module
const auth = {
    // Current user data
    user: null,
    
    // Initialize Firebase Auth
    init: function() {
        debugLog("Auth initialization started");
        
        // Set up auth state observer
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.user = user;
                debugLog('User is logged in: ' + user.email);
                
                // Update UI for authenticated user
                this.updateAuthUI(true);
                
                // Store any payment token if it exists
                this.checkAndStorePaymentToken(user.uid);
                
                // If on the login page, redirect to download
                if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/login')) {
                    debugLog('On login page and authenticated, redirecting to download page');
                    window.location.href = 'download.html';
                    return;
                }
                
                // If on the download page, check payment verification
                if (window.location.pathname.includes('download.html') || window.location.pathname.endsWith('/download')) {
                    debugLog('On download page, checking payment verification');
                    // Check if payment is verified for this user
                    this.checkPaymentVerification();
                }
                
            } else {
                this.user = null;
                debugLog('User is logged out');
                
                // Update UI for non-authenticated user
                this.updateAuthUI(false);
                
                // If on download page, redirect to login
                if (window.location.pathname.includes('download.html') || window.location.pathname.endsWith('/download')) {
                    debugLog('On download page but not authenticated, redirecting to login');
                    window.location.href = 'login.html';
                }
            }
        });
        
        // Set up login button if on login page
        const loginBtn = document.getElementById('google-login');
        if (loginBtn) {
            debugLog("Login button found, adding event listener");
            loginBtn.addEventListener('click', () => {
                debugLog("Login button clicked via auth.js");
                this.signInWithGoogle();
            });
        } else {
            debugLog("Login button not found on this page");
        }
        
        // Set up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                debugLog("Logout button clicked");
                this.signOut();
            });
        }
    },
    
    // Check and store payment token from URL if present
    checkAndStorePaymentToken: function(userId) {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentToken = urlParams.get('token');
        
        if (paymentToken) {
            debugLog('Payment token found in URL: ' + paymentToken);
            // Store payment token with user
            this.storePaymentVerification(userId, paymentToken);
        }
    },
    
    // Sign in with Google
    signInWithGoogle: function() {
        debugLog("Initiating Google sign in");
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Show login status
        const loginStatus = document.getElementById('login-status');
        if (loginStatus) loginStatus.classList.remove('hidden');
        
        // Try to sign in with popup
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                debugLog("Google sign-in successful via popup");
                // Handle payment token if present
                this.checkAndStorePaymentToken(result.user.uid);
                
                // Redirect to download page with a small delay
                setTimeout(() => {
                    debugLog("Redirecting to download page after successful sign-in");
                    window.location.href = 'download.html';
                }, 500);
            })
            .catch(error => {
                debugLog('Google sign-in error: ' + error.code + ' - ' + error.message);
                
                // If popup fails, try redirect method
                if (error.code === 'auth/popup-blocked') {
                    debugLog("Popup blocked, trying redirect method");
                    firebase.auth().signInWithRedirect(provider);
                    return;
                }
                
                if (loginStatus) loginStatus.classList.add('hidden');
                
                alert('Authentication failed: ' + error.message + '. Please try again.');
            });
    },
    
    // Sign out
    signOut: function() {
        debugLog("Signing out");
        firebase.auth().signOut()
            .then(() => {
                debugLog("Sign out successful, redirecting to home");
                window.location.href = 'index.html';
            })
            .catch(error => {
                debugLog('Sign out error: ' + error.message);
            });
    },
    
    // Store payment verification in Firestore
    storePaymentVerification: function(userId, paymentToken) {
        debugLog("Storing payment verification for user: " + userId);
        const db = firebase.firestore();
        
        db.collection('payments').doc(userId).set({
            paymentToken: paymentToken,
            verified: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            debugLog('Payment verification stored successfully');
        })
        .catch(error => {
            debugLog('Error storing payment verification: ' + error.message);
        });
    },
    
    // Check if user has verified payment
    checkPaymentVerification: function() {
        const userId = this.user.uid;
        debugLog("Checking payment verification for user: " + userId);
        const db = firebase.firestore();
        
        // Show verification pending UI
        const pendingEl = document.getElementById('verification-pending');
        if (pendingEl) pendingEl.classList.remove('hidden');
        
        db.collection('payments').doc(userId).get()
            .then(doc => {
                if (pendingEl) pendingEl.classList.add('hidden');
                
                if (doc.exists && doc.data().verified) {
                    debugLog("Payment verified, showing download UI");
                    // Payment verified, show download UI
                    const downloadContainer = document.getElementById('download-container');
                    if (downloadContainer) downloadContainer.classList.remove('hidden');
                } else {
                    debugLog("Payment not verified, showing access denied");
                    // Payment not verified, show access denied
                    const accessDenied = document.getElementById('access-denied');
                    if (accessDenied) accessDenied.classList.remove('hidden');
                }
            })
            .catch(error => {
                debugLog('Error checking payment verification: ' + error.message);
                
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
                debugLog("Updated UI for authenticated user");
            } else {
                userInfoEl.classList.add('hidden');
                debugLog("Updated UI for non-authenticated user");
            }
        }
    }
};

// Initialize auth when document is ready
document.addEventListener('DOMContentLoaded', () => {
    debugLog("DOM loaded, initializing auth");
    auth.init();
});

// Check for redirect result (for redirect sign-in method)
firebase.auth().getRedirectResult().then(function(result) {
    if (result.user) {
        debugLog('Sign-in redirect result successful: ' + result.user.email);
        
        // Check and store payment token if present
        const urlParams = new URLSearchParams(window.location.search);
        const paymentToken = urlParams.get('token');
        
        if (paymentToken) {
            debugLog('Payment token found in URL after redirect: ' + paymentToken);
            // Use the auth module to store the verification
            auth.storePaymentVerification(result.user.uid, paymentToken);
        }
        
        // Force redirect to download page
        debugLog("Redirecting to download page after redirect sign-in");
        window.location.href = 'download.html';
    }
}).catch(function(error) {
    debugLog('Redirect sign-in error: ' + error.message);
});
