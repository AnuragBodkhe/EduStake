// File upload functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add toast notification styles
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }
        .toast-success {
            background-color: #4CAF50;
        }
        .toast-error {
            background-color: #F44336;
        }
        .toast-info {
            background-color: #2196F3;
        }
        .toast-warning {
            background-color: #FF9800;
        }
    `;
    document.head.appendChild(toastStyles);
    const fileInput = document.getElementById('file-input');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const selectedFilesContainer = document.querySelector('.selected-files');
    const messageInput = document.querySelector('.message-input');
    const uploadStatus = document.querySelector('.upload-status');
    const progressBar = document.querySelector('.progress');
    const statusText = document.querySelector('.status-text');
    const resourceList = document.querySelector('.resource-list');
    const chatMessages = document.querySelector('.chat-messages');
    const sendButton = document.getElementById('send-button');
    const collegeItems = document.querySelectorAll('.college-item');
    const communityHeader = document.querySelector('.community-header h2');
    const communityHeaderLogo = document.createElement('img');
    
    // Setup community header with logo
    if (communityHeader) {
        communityHeaderLogo.className = 'community-header-logo';
        communityHeaderLogo.style.width = '30px';
        communityHeaderLogo.style.height = '30px';
        communityHeaderLogo.style.marginRight = '10px';
        communityHeaderLogo.style.borderRadius = '50%';
        communityHeader.parentNode.insertBefore(communityHeaderLogo, communityHeader);
    }
    
    // Add click event to college items to update header
    collegeItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            collegeItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get college name and logo
            const collegeName = this.querySelector('.college-name').textContent;
            const collegeLogo = this.querySelector('.college-logo').src;
            const logoImg = this.querySelector('.college-logo');
            
            // Update community header
            if (communityHeader) {
                communityHeader.textContent = collegeName + ' Community';
                communityHeaderLogo.src = collegeLogo;
                communityHeaderLogo.alt = collegeName;
                communityHeaderLogo.style.display = 'inline-block';
                
                // Apply college theme if theme system is available
                if (typeof applyCollegeTheme === 'function') {
                    applyCollegeTheme(logoImg, collegeName);
                }
            }
        });
    });
    
    // Initialize with the first active college
    const activeCollege = document.querySelector('.college-item.active');
    if (activeCollege) {
        const collegeName = activeCollege.querySelector('.college-name').textContent;
        const collegeLogo = activeCollege.querySelector('.college-logo').src;
        const logoImg = activeCollege.querySelector('.college-logo');
        
        if (communityHeader) {
            communityHeader.textContent = collegeName + ' Community';
            communityHeaderLogo.src = collegeLogo;
            communityHeaderLogo.alt = collegeName;
            communityHeaderLogo.style.display = 'inline-block';
            
            // Apply college theme if theme system is available
            if (typeof applyCollegeTheme === 'function') {
                applyCollegeTheme(logoImg, collegeName);
            }
        }
    }
    
    // Get current user information
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest User',
        email: 'guest@example.com',
        id: 'guest-' + Date.now(),
        joinDate: 'May 2023' // Default join date if not set
    };
    
    // Store the current user ID for ownership checks
    const currentUserId = currentUser.id;

    // Maximum file size (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    // Allowed file types
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    attachFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        // Validate and process each file
        files.forEach(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                showError(`File type not allowed: ${file.name}`);
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                showError(`File too large (max 5MB): ${file.name}`);
                return;
            }

            // Show file preview and start upload
            showFilePreview(file);
            uploadFile(file, files.indexOf(file), files.length);
        });

        // Reset file input
        fileInput.value = '';
    }

    function showFilePreview(file) {
        filePreviewContainer.style.display = 'block';
        
        const fileElement = document.createElement('div');
        fileElement.className = 'selected-file';
        
        // Get appropriate icon based on file type
        const icon = getFileIcon(file.type);
        
        fileElement.innerHTML = `
            ${icon}
            <span>${file.name}</span>
            <span class="remove-file" title="Remove file">×</span>
        `;

        // Add remove functionality
        const removeBtn = fileElement.querySelector('.remove-file');
        removeBtn.addEventListener('click', () => {
            fileElement.remove();
            if (!selectedFilesContainer.children.length) {
                filePreviewContainer.style.display = 'none';
            }
        });

        selectedFilesContainer.appendChild(fileElement);
    }

    // Import Firebase modules
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Import Firebase Storage functions
import { uploadFile as firebaseUploadFile, saveMessageWithAttachment, getFilesByMessageId } from './firebase-storage.js';

// Add Firebase Storage CSS
const firebaseStorageStyles = document.createElement('link');
firebaseStorageStyles.rel = 'stylesheet';
firebaseStorageStyles.href = './firebase-storage.css';
document.head.appendChild(firebaseStorageStyles);

// Initialize Firebase with configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Function to add file to chat
function addFileToChat(file, downloadURL = null) {
    const chatMessages = document.querySelector('.chat-messages');
    const currentChannelId = document.querySelector('.channel.active')?.getAttribute('data-channel-id') || 'general-chat';
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // Get current user profile information
    let username = 'Current User';
    let avatarUrl = 'https://ui-avatars.com/api/?name=Current+User&background=random';
    let userId = 'current-user';
    
    // Try to get from UserProfileManager
    if (window.UserProfileManager) {
        const currentProfile = window.UserProfileManager.getCurrentProfile();
        if (currentProfile) {
            username = currentProfile.username || 'Current User';
            avatarUrl = currentProfile.photoURL || window.UserProfileManager.getDefaultAvatarURL(username);
            userId = currentProfile.uid || 'current-user';
        }
    } else {
        // Fallback to localStorage
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                username = currentUser.username || currentUser.displayName || 'Current User';
                avatarUrl = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
                userId = currentUser.uid || 'current-user';
            }
        } catch (e) {
            console.warn('Could not get current user from localStorage:', e);
        }
    }
    
    // Create message avatar
    const avatarElement = document.createElement('div');
    avatarElement.className = 'message-avatar';
    avatarElement.innerHTML = `<img src="${avatarUrl}" alt="${username}'s Avatar">`;
    
    // Create message content container
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    
    // Create message header
    const headerElement = document.createElement('div');
    headerElement.className = 'message-header';
    headerElement.innerHTML = `
        <span class="message-author">${username}</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    // Add user ID as data attribute
    messageElement.setAttribute('data-user-id', userId);
    
    // Create message body
    const bodyElement = document.createElement('div');
    bodyElement.className = 'message-body';
    
    // Create attachment element based on file type
    const attachmentElement = document.createElement('div');
    attachmentElement.className = 'message-attachment';
    
    if (file.type.startsWith('image/')) {
        // For images, create an image element
        const imgElement = document.createElement('div');
        imgElement.className = 'image-attachment';
        
        // Use the download URL from Firebase if available, otherwise create a temporary object URL
        const imageUrl = downloadURL || URL.createObjectURL(file);
        
        imgElement.innerHTML = `
            <div class="image-container"></div>
            <div class="attachment-info">
                <span class="attachment-name">${file.name}</span>
                <span class="attachment-size">${formatFileSize(file.size)}</span>
            </div>
        `;
        
        attachmentElement.appendChild(imgElement);
        
        // Display the image using our helper function
        setTimeout(() => {
            const imageContainer = imgElement.querySelector('.image-container');
            if (imageContainer) {
                displayStorageImage(imageUrl, imageContainer);
            }
        }, 0);
    } else {
        // For other files, create a file attachment element
        const fileElement = document.createElement('div');
        fileElement.className = 'file-attachment';
        
        // Determine file icon based on type
        let fileIcon = 'fa-file';
        if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
        else if (file.type.includes('word') || file.type.includes('document')) fileIcon = 'fa-file-word';
        else if (file.type.includes('excel') || file.type.includes('sheet')) fileIcon = 'fa-file-excel';
        else if (file.type.includes('video')) fileIcon = 'fa-file-video';
        else if (file.type.includes('audio')) fileIcon = 'fa-file-audio';
        else if (file.type.includes('zip') || file.type.includes('archive')) fileIcon = 'fa-file-archive';
        
        fileElement.innerHTML = `
            <div class="file-icon"><i class="fas ${fileIcon}"></i></div>
            <div class="attachment-info">
                <span class="attachment-name">${file.name}</span>
                <span class="attachment-size">${formatFileSize(file.size)}</span>
            </div>
            <a href="${downloadURL || '#'}" class="download-button" ${downloadURL ? 'download' : ''} target="_blank">
                <i class="fas fa-download"></i>
            </a>
        `;
        
        attachmentElement.appendChild(fileElement);
    }
    
    // Append attachment to message body
    bodyElement.appendChild(attachmentElement);
    
    // Assemble message
    contentElement.appendChild(headerElement);
    contentElement.appendChild(bodyElement);
    messageElement.appendChild(avatarElement);
    messageElement.appendChild(contentElement);
    
    // Add message to chat
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to display images from Firebase Storage
function displayStorageImage(imageUrl, container) {
    if (!imageUrl || !container) return;
    
    const imgElement = document.createElement('img');
    imgElement.className = 'storage-image';
    imgElement.alt = 'Uploaded image';
    
    // Add loading state
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'image-loading-spinner';
    loadingSpinner.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loadingSpinner);
    
    // Load image
    imgElement.onload = () => {
        // Remove loading spinner
        loadingSpinner.remove();
        container.appendChild(imgElement);
        
        // Add lightbox functionality
        imgElement.addEventListener('click', () => {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <img src="${imageUrl}" alt="Fullsize image">
                    <button class="close-lightbox"><i class="fas fa-times"></i></button>
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // Close lightbox on click
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.closest('.close-lightbox')) {
                    lightbox.remove();
                }
            });
            
            // Close lightbox with Escape key
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    document.removeEventListener('keydown', handleEscKey);
                }
            };
            document.addEventListener('keydown', handleEscKey);
        });
    };
    
    imgElement.onerror = () => {
        loadingSpinner.remove();
        container.innerHTML = '<div class="image-error"><i class="fas fa-exclamation-triangle"></i> Failed to load image</div>';
    };
    
    imgElement.src = imageUrl;
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function uploadFile(file, index, totalFiles) {
        // Get the upload animation and chat messages container
        const uploadAnimation = document.getElementById('upload-animation');
        const chatMessages = document.querySelector('.chat-messages');
        const progressBar = document.getElementById('upload-progress-bar');
        const uploadText = document.querySelector('.upload-text');
        
        // Update upload text with file name
        if (uploadText) {
            uploadText.textContent = `Uploading ${file.name}...`;
        }
        
        // Move the upload animation to the chat messages
        if (chatMessages && uploadAnimation) {
            chatMessages.appendChild(uploadAnimation);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Show the animation
        uploadAnimation.classList.add('active');
        progressBar.style.width = '0%';
        
        // Get current channel ID (in a real app, this would be from your state management)
        const currentChannelId = document.querySelector('.channel.active')?.getAttribute('data-channel-id') || 'general-chat';
        const currentCommunityId = document.querySelector('.college-item.active')?.getAttribute('data-community-id') || 'general';
        
        // Get current user information
        let userId = 'current-user-id';
        let username = 'Current User';
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                userId = currentUser.uid || userId;
                username = currentUser.username || currentUser.displayName || username;
            }
        } catch (e) {
            console.warn('Could not get current user from localStorage:', e);
        }
        
        // Create message data
        const messageData = {
            channelId: currentChannelId,
            userId: userId,
            username: username,
            content: '', // Empty content for file-only messages
        };
        
        // Prepare metadata for resource storage
        const metadata = {
            communityId: currentCommunityId,
            subjectId: currentChannelId,
            uploaderId: userId,
            uploaderName: username,
            description: `Uploaded in ${currentChannelId} channel`
        };
        
        // Save to ResourceStorage for permanent storage
        let resourcePromise = Promise.resolve(null);
        if (window.ResourceStorage) {
            resourcePromise = window.ResourceStorage.saveFileAsResource(file, metadata)
                .then(resource => {
                    console.log('Resource saved permanently:', resource);
                    return resource;
                })
                .catch(error => {
                    console.error('Error saving resource permanently:', error);
                    return null;
                });
        }
        
        // Upload to Firebase Storage
        firebaseUploadFile(
            file, 
            `messages/${currentChannelId}`,
            { contentType: file.type },
            (progress) => {
                // Update progress bar
                progressBar.style.width = `${progress}%`;
            }
        ).then(fileData => {
            // Hide upload animation
            uploadAnimation.classList.remove('active');
            
            // Save message with attachment to Firebase Realtime Database
            return saveMessageWithAttachment(messageData, file).then(message => {
                // Add file to chat messages
                addFileToChat(file, fileData.url);
                
                // Show success popup with info about permanent storage
                resourcePromise.then(resource => {
                    if (resource) {
                        showSuccessPopup(`${file.name} uploaded successfully and saved for everyone!`);
                    } else {
                        showSuccessPopup(`${file.name} uploaded successfully`);
                    }
                });
                
                // Clean up file preview if this is the last file
                if (index === totalFiles - 1) {
                    const filePreviewContainer = document.getElementById('file-preview-container');
                    const selectedFilesContainer = document.querySelector('.selected-files');
                    
                    // Clear selected files
                    if (selectedFilesContainer) {
                        selectedFilesContainer.innerHTML = '';
                    }
                    
                    // Hide the container
                    if (filePreviewContainer) {
                        filePreviewContainer.style.display = 'none';
                    }
                }
                
                return fileData;
            });
        }).catch(error => {
            console.error("Upload failed:", error);
            uploadAnimation.classList.remove('active');
            showToast("Upload failed: " + error.message, "error");
        });
    }
    
    // Function to show success popup
    function showSuccessPopup(message) {
        const successPopup = document.getElementById('success-popup');
        const successMessage = document.getElementById('success-message');
        const dismissButton = document.getElementById('dismiss-success');
        
        // Set the message
        if (successMessage) {
            successMessage.textContent = message;
        }
        
        // Show the popup
        if (successPopup) {
            successPopup.classList.add('show');
            
            // Add dismiss handler
            if (dismissButton) {
                dismissButton.addEventListener('click', function() {
                    successPopup.classList.remove('show');
                }, { once: true });
            }
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successPopup.classList.remove('show');
            }, 5000);
        }
    }

    // Format date and time 
    function formatDateTime() {
        const now = new Date();
        
        // Format date: May 10, 2023
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        
        // Format time: 10:30 AM
        const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);
        
        return {
            date: dateStr,
            time: timeStr,
            full: `${dateStr} at ${timeStr}`,
            timestamp: now.getTime()
        };
    }
    
    // This function is already defined above and handles both Firebase URLs and local files
// The duplicate definition below is removed to avoid conflicts
                
                // Create message header with user info, timestamp, and delete button
                const messageHeader = `
                    <div class="message-header">
                        <div class="message-sender">
                            <span class="sender-name">${currentUser.username}</span>
                            <span class="message-timestamp" title="${datetime.full}">${datetime.time}</span>
                        </div>
                        <button class="delete-message" title="Delete message"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                fileMessage.innerHTML = `
                    ${messageHeader}
                    <div class="message-date">${datetime.date}</div>
                    <div class="message-content">
                        <img src="${fileUrl}" alt="${file.name}" style="max-width: 300px; max-height: 200px; cursor: pointer;" class="preview-image">
                        <div class="file-info">
                            <span>${file.name}</span>
                            <span class="file-size">${formatFileSize(file.size)}</span>
                            <div class="file-actions">
                                <button class="file-action-btn preview-btn" title="Preview"><i class="fas fa-eye"></i></button>
                                <a href="${fileUrl}" download="${file.name}" class="file-action-btn download-btn" title="Download"><i class="fas fa-download"></i></a>
                            </div>
                        </div>
                    </div>
                `;
                chatMessages.appendChild(fileMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Add preview functionality for images
                const previewImage = fileMessage.querySelector('.preview-image');
                const previewBtn = fileMessage.querySelector('.preview-btn');
                
                const showImagePreview = () => {
                    const modal = document.createElement('div');
                    modal.className = 'image-preview-modal';
                    modal.innerHTML = `
                        <div class="modal-content">
                            <span class="close-preview">&times;</span>
                            <img src="${fileUrl}" alt="${file.name}">
                            <div class="preview-file-name">${file.name}</div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    
                    // Close modal when clicking the X or outside the image
                    const closeBtn = modal.querySelector('.close-preview');
                    closeBtn.addEventListener('click', () => modal.remove());
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) modal.remove();
                    });
                };
                
                previewImage.addEventListener('click', showImagePreview);
                previewBtn.addEventListener('click', showImagePreview);
                
                // Add delete functionality with error handling
                const deleteBtn = fileMessage.querySelector('.delete-message');
                deleteBtn.addEventListener('click', function() {
                    try {
                        // Create delete animation
                        fileMessage.classList.add('message-deleting');
                        
                        // After animation completes, remove the message
                        setTimeout(() => {
                            if (fileMessage && fileMessage.parentNode) {
                                fileMessage.parentNode.removeChild(fileMessage);
                                showToast("File deleted successfully", "success");
                            }
                        }, 300);
                    } catch (error) {
                        console.log("Error removing file:", error);
                        // Still remove the element if possible despite the error
                        if (fileMessage && fileMessage.parentNode) {
                            fileMessage.parentNode.removeChild(fileMessage);
                        }
                    }
                });
                
                // Always make delete button visible for user's own resources
                // This ensures the delete button is always visible for the current user's resources
                deleteBtn.style.visibility = 'visible';
                deleteBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
            return;
        } else {
            // For other file types, use icon with download option
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileUrl = e.target.result;
                const icon = getFileIcon(file.type);
                
                // Create message header with user info, timestamp, and delete button
                const messageHeader = `
                    <div class="message-header">
                        <div class="message-sender">
                            <span class="sender-name">${currentUser.username}</span>
                            <span class="message-timestamp" title="${datetime.full}">${datetime.time}</span>
                        </div>
                        <button class="delete-message" title="Delete message"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                fileContent = `
                    ${messageHeader}
                    <div class="message-date">${datetime.date}</div>
                    <div class="message-content">
                        <div class="file-attachment">
                            <i class="${icon}"></i>
                            <span>${file.name}</span>
                            <span class="file-size">${formatFileSize(file.size)}</span>
                            <div class="file-actions">
                                <button class="file-action-btn preview-btn" title="Preview"><i class="fas fa-eye"></i></button>
                                <a href="${fileUrl}" download="${file.name}" class="file-action-btn download-btn" title="Download"><i class="fas fa-download"></i></a>
                            </div>
                        </div>
                    </div>
                `;
                
                fileMessage.innerHTML = fileContent;
                chatMessages.appendChild(fileMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Add preview functionality for documents
                const previewBtn = fileMessage.querySelector('.preview-btn');
                previewBtn.addEventListener('click', () => {
                    // For PDFs, we can preview in a new tab
                    if (file.type === 'application/pdf') {
                        window.open(fileUrl, '_blank');
                    } else {
                        // For other files, show a modal with download prompt
                        const modal = document.createElement('div');
                        modal.className = 'file-preview-modal';
                        modal.innerHTML = `
                            <div class="modal-content">
                                <span class="close-preview">&times;</span>
                                <div class="preview-file-icon"><i class="${icon} fa-3x"></i></div>
                                <div class="preview-file-name">${file.name}</div>
                                <p>This file type cannot be previewed directly.</p>
                                <a href="${fileUrl}" download="${file.name}" class="btn btn-primary">Download File</a>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking the X or outside the content
                        const closeBtn = modal.querySelector('.close-preview');
                        closeBtn.addEventListener('click', () => modal.remove());
                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) modal.remove();
                        });
                    }
                });
                
                // Add delete functionality with error handling
                const deleteBtn = fileMessage.querySelector('.delete-message');
                deleteBtn.addEventListener('click', function() {
                    try {
                        // Create delete animation
                        fileMessage.classList.add('message-deleting');
                        
                        // After animation completes, remove the message
                        setTimeout(() => {
                            if (fileMessage && fileMessage.parentNode) {
                                fileMessage.parentNode.removeChild(fileMessage);
                                showToast("File deleted successfully", "success");
                            }
                        }, 300);
                    } catch (error) {
                        console.log("Error removing file:", error);
                        // Still remove the element if possible despite the error
                        if (fileMessage && fileMessage.parentNode) {
                            fileMessage.parentNode.removeChild(fileMessage);
                        }
                    }
                });
                
                // Always make delete button visible for user's own resources
                // This ensures the delete button is always visible for the current user's resources
                deleteBtn.style.visibility = 'visible';
                deleteBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    function getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': 'fas fa-file-pdf',
            'application/msword': 'fas fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint',
            'text/plain': 'fas fa-file-alt',
            'image/jpeg': 'fas fa-file-image',
            'image/png': 'fas fa-file-image',
            'image/gif': 'fas fa-file-image'
        };

        return iconMap[fileType] || 'fas fa-file';
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        messageInput.parentElement.insertBefore(errorDiv, messageInput);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        } else {
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        }
    }
    
    // Add functionality for sending text messages
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Initialize message ownership controls for existing messages
    function initializeMessageControls() {
        const allMessages = document.querySelectorAll('.message');
        
        allMessages.forEach(message => {
            const deleteBtn = message.querySelector('.delete-message');
            if (deleteBtn) {
                // Set owner ID if not already set (for backward compatibility)
                if (!message.dataset.owner) {
                    message.dataset.owner = currentUserId;
                }
                
                // Make delete button visible for all messages
                deleteBtn.style.visibility = 'visible';
                deleteBtn.style.display = 'block';
                
                // Add click event with error handling
                deleteBtn.addEventListener('click', function() {
                    try {
                        // Create delete animation
                        message.classList.add('message-deleting');
                        
                        // After animation completes, remove the message
                        setTimeout(() => {
                            if (message && message.parentNode) {
                                message.parentNode.removeChild(message);
                                showToast("Message deleted successfully", "success");
                            }
                        }, 300);
                    } catch (error) {
                        console.log("Error removing message:", error);
                        // Still remove the element if possible despite the error
                        if (message && message.parentNode) {
                            message.parentNode.removeChild(message);
                        }
                    }
                });
            }
        });
    }
    
    // Initialize file attachment controls
    function initializeFileControls() {
        const fileAttachments = document.querySelectorAll('.file-attachment, .preview-image');
        
        fileAttachments.forEach(attachment => {
            const parentMessage = attachment.closest('.message');
            if (parentMessage) {
                // Add delete functionality for file attachments
                const deleteBtn = parentMessage.querySelector('.delete-message');
                if (deleteBtn && (!parentMessage.dataset.owner || parentMessage.dataset.owner === currentUserId)) {
                    deleteBtn.style.visibility = 'visible';
                    deleteBtn.style.display = 'block';
                }
            }
        });
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Call initialization functions
    initializeMessageControls();
    initializeFileControls();
    
    // Function to send a text message
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        
        // Get current user profile information
        let username = currentUser.username || 'Current User';
        let userId = currentUserId || 'current-user';
        let avatarUrl = currentUser.photoURL || null;
        
        // Try to get from UserProfileManager for better avatar handling
        if (window.UserProfileManager) {
            const currentProfile = window.UserProfileManager.getCurrentProfile();
            if (currentProfile) {
                username = currentProfile.username || username;
                avatarUrl = currentProfile.photoURL || window.UserProfileManager.getDefaultAvatarURL(username);
                userId = currentProfile.uid || userId;
            }
        }
        
        // If still no avatar URL, create a default one
        if (!avatarUrl) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Get formatted date and time
        const datetime = formatDateTime();
        
        // Add ownership data
        messageElement.dataset.owner = userId;
        messageElement.dataset.username = username;
        messageElement.dataset.timestamp = datetime.timestamp;
        
        // Create avatar HTML
        const avatarHtml = `<div class="message-avatar"><img src="${avatarUrl}" alt="${username}'s Avatar" class="user-avatar"></div>`;
        
        // Create message with avatar, header containing user info, timestamp, and delete button
        messageElement.innerHTML = `
            ${avatarHtml}
            <div class="message-content-wrapper">
                <div class="message-header">
                    <div class="message-sender">
                        <span class="sender-name">${username}</span>
                        <span class="message-timestamp" title="${datetime.full}">${datetime.time}</span>
                    </div>
                    <button class="delete-message" title="Delete message"><i class="fas fa-trash"></i></button>
                </div>
                <div class="message-date">${datetime.date}</div>
                <div class="message-content">
                    <p>${messageText}</p>
                </div>
            </div>
        `;
        
        // Store message with user profile info
        if (window.storeCurrentMessage) {
            window.storeCurrentMessage({
                text: messageText,
                userId: userId,
                username: username,
                photoURL: avatarUrl,
                timestamp: Date.now()
            });
        }
        
        // Add to chat and scroll to bottom
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear input
        messageInput.value = '';
        
        // Add delete functionality with error handling
        const deleteBtn = messageElement.querySelector('.delete-message');
        deleteBtn.addEventListener('click', function() {
            try {
                // Create delete animation
                messageElement.classList.add('message-deleting');
                
                // After animation completes, remove the message
                setTimeout(() => {
                    if (messageElement && messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                        showToast("Message deleted successfully", "success");
                    }
                }, 300);
            } catch (error) {
                console.log("Error removing message:", error);
                // Still remove the element if possible despite the error
                if (messageElement && messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }
        });
    }

    // Display user info in the sidebar
    const displayUserInfo = function() {
        const usernameDisplay = document.getElementById('username');
        const userEmailDisplay = document.querySelector('.user-email');
        const joinDateDisplay = document.querySelector('.join-date');
        
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.username;
        }
        
        if (userEmailDisplay) {
            userEmailDisplay.textContent = currentUser.email;
        }
        
        if (joinDateDisplay) {
            joinDateDisplay.textContent = `Joined: ${currentUser.joinDate}`;
        }
    };
    
    // Display user info in the profile modal
    const displayProfileInfo = function() {
        const profileNameDisplay = document.getElementById('profile-display-name');
        const profileEmailDisplay = document.getElementById('profile-email');
        const profileJoinDateDisplay = document.getElementById('profile-join-date');
        
        if (profileNameDisplay) {
            profileNameDisplay.textContent = currentUser.username;
        }
        
        if (profileEmailDisplay) {
            profileEmailDisplay.textContent = currentUser.email;
        }
        
        if (profileJoinDateDisplay) {
            profileJoinDateDisplay.textContent = currentUser.joinDate;
        }
    };
    
    // Initialize user displays
    displayUserInfo();
    
    // Initialize the view profile button
    const viewProfileBtn = document.getElementById('view-profile-btn');
    const quickViewProfileBtn = document.getElementById('quick-view-profile');
    const profileViewModal = document.getElementById('profile-view-modal');
    
    if ((viewProfileBtn || quickViewProfileBtn) && profileViewModal) {
        const showProfileModal = function() {
            profileViewModal.style.display = 'flex';
            displayProfileInfo();
        };
        
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', showProfileModal);
        }
        
        if (quickViewProfileBtn) {
            quickViewProfileBtn.addEventListener('click', showProfileModal);
        }
        
        const closeProfileViewBtn = document.getElementById('close-profile-view');
        if (closeProfileViewBtn) {
            closeProfileViewBtn.addEventListener('click', function() {
                profileViewModal.style.display = 'none';
            });
        }
    }
});