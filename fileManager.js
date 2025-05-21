// fileManager.js - File Access Control

const fileManager = {
    // Current file data - update with your actual file info
    fileData: {
        name: 'RPS.py',
        size: '61.28 KB',
        storageRef: 'files/RPS.py'
    },
    
    init: function() {
        console.log("FileManager initialization started");
        
        // Set up download button
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            console.log("Download button found, adding event listener");
            downloadBtn.addEventListener('click', () => this.downloadFile());
        } else {
            console.log("Download button not found on this page");
        }
        
        // Update file info in UI
        this.updateFileInfo();
    },
    
    // Update file information in UI
    updateFileInfo: function() {
        const fileNameEl = document.getElementById('file-name');
        const fileSizeEl = document.getElementById('file-size');
        
        if (fileNameEl) fileNameEl.textContent = this.fileData.name;
        if (fileSizeEl) fileSizeEl.textContent = `Size: ${this.fileData.size}`;
    },
    
    // Download file from Firebase Storage
    downloadFile: function() {
        console.log("Download file requested");
        
        // Check if user is authenticated
        if (!auth.user) {
            console.log("User not authenticated, redirecting to login");
            alert('You must be signed in to download this file');
            window.location.href = 'login.html';
            return;
        }
        
        console.log("User authenticated, getting file from storage");
        
        // Reference to the file in Firebase Storage
        const storageRef = firebase.storage().ref(this.fileData.storageRef);
        
        // Get download URL
        storageRef.getDownloadURL()
            .then(url => {
                console.log("Download URL obtained: ", url.substring(0, 20) + "...");
                
                // Log download event to Firestore (optional)
                this.logDownload(auth.user.uid);
                
                // Create a hidden link and trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = this.fileData.name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                console.log("Download triggered");
            })
            .catch(error => {
                console.error('Error getting download URL:', error);
                alert('Error downloading file: ' + error.message + '. Please try again.');
            });
    },
    
    // Log download in Firestore
    logDownload: function(userId) {
        console.log("Logging download for user: ", userId);
        const db = firebase.firestore();
        
        db.collection('downloads').add({
            userId: userId,
            fileName: this.fileData.name,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Download logged successfully');
        })
        .catch(error => {
            console.error('Error logging download:', error);
        });
    }
};

// Initialize file manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing file manager");
    fileManager.init();
});
