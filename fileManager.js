const fileManager = {
    // Current file data
    fileData: {
        name: 'RPS.py',
        size: '61.28 KB',
        storageRef: 'files/RPS.py'
    },
    
    init: function() {
        // Set up download button
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadFile());
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
        // Check if user is authenticated
        if (!auth.user) {
            alert('You must be signed in to download this file');
            window.location.href = 'login.html';
            return;
        }
        
        // Reference to the file in Firebase Storage
        const storageRef = firebase.storage().ref(this.fileData.storageRef);
        
        // Get download URL
        storageRef.getDownloadURL()
            .then(url => {
                // Log download event to Firestore (optional)
                this.logDownload(auth.user.uid);
                
                // Create a hidden link and trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = this.fileData.name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            })
            .catch(error => {
                console.error('Error getting download URL:', error);
                alert('Error downloading file. Please try again.');
            });
    },
    
    // Log download in Firestore
    logDownload: function(userId) {
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
    fileManager.init();
});
