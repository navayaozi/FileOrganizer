document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.querySelector('.upload-box');
    const organizeBtn = document.getElementById('organizeBtn');
    
    let selectedFiles = [];

    // Handle file input change
    fileInput.addEventListener('change', function(e) {
        selectedFiles = Array.from(e.target.files);
        updateUploadStatus();
    });

    // Handle drag and drop
    uploadBox.addEventListener('click', () => fileInput.click());
    
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.backgroundColor = '#f8f9ff';
    });

    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#ddd';
        uploadBox.style.backgroundColor = 'transparent';
    });

    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#ddd';
        uploadBox.style.backgroundColor = 'transparent';
        
        selectedFiles = Array.from(e.dataTransfer.files);
        updateUploadStatus();
    });

    function updateUploadStatus() {
        if (selectedFiles.length > 0) {
            uploadBox.innerHTML = `<p>${selectedFiles.length} files selected</p>`;
            organizeBtn.disabled = false;
        } else {
            uploadBox.innerHTML = `<p>Drop files here or click to select</p><input type="file" id="fileInput" multiple>`;
        }
    }

    // Organize files functionality
    organizeBtn.addEventListener('click', function() {
        const sortType = document.querySelector('input[name="sortType"]:checked').value;
        organizeFiles(sortType);
    });

    function organizeFiles(sortType) {
        if (selectedFiles.length === 0) {
            alert('Please select files first');
            return;
        }

        const organized = {};
        
        selectedFiles.forEach(file => {
            let category;
            
            if (sortType === 'type') {
                category = getFileCategory(file.name);
            } else {
                category = getDateCategory(file.lastModified);
            }
            
            if (!organized[category]) {
                organized[category] = [];
            }
            organized[category].push(file);
        });

        displayResults(organized);
    }

    function getFileCategory(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
            return 'Images';
        } else if (['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(ext)) {
            return 'Documents';
        } else if (['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(ext)) {
            return 'Videos';
        } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
            return 'Audio';
        } else {
            return 'Other';
        }
    }

    function getDateCategory(timestamp) {
        const date = new Date(timestamp);
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    }

    function displayResults(organized) {
        let resultHTML = '<div class="results"><h3>Organization Results:</h3>';
        
        Object.keys(organized).forEach(category => {
            resultHTML += `<div class="category">
                <h4>${category} (${organized[category].length} files)</h4>
                <ul>`;
            
            organized[category].forEach(file => {
                const fileSize = formatFileSize(file.size);
                resultHTML += `<li>${file.name} <span class="file-size">(${fileSize})</span></li>`;
            });
            
            resultHTML += '</ul></div>';
        });
        
        resultHTML += '</div>';
        
        document.querySelector('.container').innerHTML += resultHTML;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
});