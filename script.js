document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.querySelector('.upload-box');
    const organizeBtn = document.getElementById('organizeBtn');
    const previewBtn = document.getElementById('previewBtn');
    const renameSection = document.querySelector('.rename-section');
    
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
            renameSection.style.display = 'block';
        } else {
            uploadBox.innerHTML = `<p>Drop files here or click to select</p><input type="file" id="fileInput" multiple>`;
            renameSection.style.display = 'none';
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

        const detectDuplicates = document.getElementById('detectDuplicates').checked;
        let organized = {};
        let duplicates = [];
        
        if (detectDuplicates) {
            duplicates = findDuplicates(selectedFiles);
        }
        
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

        if (detectDuplicates && duplicates.length > 0) {
            organized['Duplicate Files'] = duplicates;
        }

        displayResults(organized, duplicates.length > 0);
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

    function displayResults(organized, hasDuplicates) {
        let resultHTML = '<div class="results"><h3>Organization Results:</h3>';
        
        if (hasDuplicates) {
            resultHTML += '<div class="duplicate-warning">⚠️ Duplicate files detected!</div>';
        }
        
        Object.keys(organized).forEach(category => {
            const isDuplicateCategory = category === 'Duplicate Files';
            const categoryClass = isDuplicateCategory ? 'category duplicate-category' : 'category';
            
            resultHTML += `<div class="${categoryClass}">
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

    function findDuplicates(files) {
        const duplicates = [];
        const seen = new Map();
        
        files.forEach(file => {
            const key = `${file.name}-${file.size}`;
            if (seen.has(key)) {
                duplicates.push(file);
            } else {
                seen.set(key, file);
            }
        });
        
        return duplicates;
    }

    // Rename functionality
    document.querySelectorAll('input[name="renameType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const replaceInput = document.getElementById('replaceInput');
            const renameInput = document.getElementById('renameInput');
            
            if (this.value === 'replace') {
                replaceInput.style.display = 'block';
                renameInput.placeholder = 'Find text...';
            } else {
                replaceInput.style.display = 'none';
                renameInput.placeholder = this.value === 'prefix' ? 'Enter prefix...' : 'Enter suffix...';
            }
        });
    });

    previewBtn.addEventListener('click', function() {
        const renameType = document.querySelector('input[name="renameType"]:checked').value;
        const renameText = document.getElementById('renameInput').value.trim();
        const replaceText = document.getElementById('replaceInput').value.trim();
        
        if (!renameText) {
            alert('Please enter text for renaming');
            return;
        }
        
        const previewResults = generateRenamePreview(selectedFiles, renameType, renameText, replaceText);
        displayRenamePreview(previewResults);
    });

    function generateRenamePreview(files, type, text, replaceText) {
        return files.map(file => {
            const nameParts = file.name.split('.');
            const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
            const baseName = nameParts.join('.');
            
            let newName;
            
            switch (type) {
                case 'prefix':
                    newName = text + baseName + extension;
                    break;
                case 'suffix':
                    newName = baseName + text + extension;
                    break;
                case 'replace':
                    newName = baseName.replace(new RegExp(text, 'g'), replaceText) + extension;
                    break;
                default:
                    newName = file.name;
            }
            
            return {
                original: file.name,
                renamed: newName,
                size: file.size
            };
        });
    }

    function displayRenamePreview(previewResults) {
        let previewHTML = '<div class="rename-preview"><h3>Rename Preview:</h3>';
        
        previewHTML += '<div class="preview-table">';
        previewHTML += '<div class="preview-header"><span>Original</span><span>New Name</span></div>';
        
        previewResults.forEach(result => {
            const sizeText = formatFileSize(result.size);
            previewHTML += `
                <div class="preview-row">
                    <span class="original-name">${result.original}</span>
                    <span class="new-name">${result.renamed}</span>
                    <span class="file-size">${sizeText}</span>
                </div>
            `;
        });
        
        previewHTML += '</div></div>';
        
        // Remove existing preview if any
        const existingPreview = document.querySelector('.rename-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        document.querySelector('.container').innerHTML += previewHTML;
    }
});