// Upload Animation and Chat Message Enhancement Script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize resource storage
    if (window.ResourceStorage) {
        window.ResourceStorage.initialize();
    }
    
    // Initialize upload animation functionality
    initializeUploadAnimation();
    
    // Add delete and download buttons to existing messages
    addButtonsToExistingMessages();
    
    // Initialize chat message animation
    initializeChatMessageAnimation();
    
    // Initialize resource upload animation
    initializeResourceUploadAnimation();
    
    // Load saved resources for the current community and subject
    loadSavedResources();
});

// Function to initialize upload animation
function initializeUploadAnimation() {
    // Get file attachment button
    const attachButton = document.querySelector('.attachment-buttons .icon-button');
    if (!attachButton) return;
    
    // Override the existing click event
    const newAttachButton = attachButton.cloneNode(true);
    attachButton.parentNode.replaceChild(newAttachButton, attachButton);
    
    newAttachButton.addEventListener('click', function() {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Trigger click on the file input
        fileInput.click();
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                handleFileUploadWithAnimation(file);
            }
            // Remove the input from the DOM
            document.body.removeChild(fileInput);
        });
    });
}

// Function to handle file upload with animation
function handleFileUploadWithAnimation(file) {
    // Create upload status element
    const uploadStatus = document.createElement('div');
    uploadStatus.className = 'upload-status';
    
    const fileName = document.createElement('div');
    fileName.textContent = file.name;
    fileName.style.marginBottom = '5px';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar';
    
    const progress = document.createElement('div');
    progress.className = 'progress';
    
    const statusText = document.createElement('div');
    statusText.className = 'status-text';
    statusText.textContent = 'Uploading... 0%';
    
    progressContainer.appendChild(progress);
    uploadStatus.appendChild(fileName);
    uploadStatus.appendChild(progressContainer);
    uploadStatus.appendChild(statusText);
    
    // Add to chat messages area temporarily
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(uploadStatus);
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate upload progress
    let percent = 0;
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 10) + 5;
        if (percent > 100) percent = 100;
        
        progress.style.width = percent + '%';
        statusText.textContent = `Uploading... ${percent}%`;
        
        if (percent === 100) {
            clearInterval(interval);
            statusText.textContent = 'Processing...';
            
            // After a short delay, remove the upload status and add the actual message
            setTimeout(() => {
                chatMessages.removeChild(uploadStatus);
                sendMessageWithAttachment(file);
            }, 500);
        }
    }, 300);
}

// Function to send message with attachment (enhanced version)
function sendMessageWithAttachment(file) {
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let fileType = '';
    let iconSvg = '';
    
    // Determine file type and icon
    if (['pdf'].includes(fileExtension)) {
        fileType = 'pdf-file';
        iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>';
    } else if (['doc', 'docx'].includes(fileExtension)) {
        fileType = 'word-file';
        iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285f4" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path><path fill="#8ab4f8" d="M14 3v5h5z"></path><path fill="white" d="M10.29 14.47L8.5 19h-2l2.67-7h1.8l2.67 7h-2l-1.8-4.53z"></path></svg>';
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
        fileType = 'ppt-file';
        iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#db4437" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path><path fill="#f5b8b4" d="M14 3v5h5z"></path><path fill="white" d="M10 14v-3h2v3h1l-2 3-2-3h1z"></path></svg>';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        fileType = 'image-file';
        // For images, we'll create a preview instead of using an icon
    } else {
        fileType = 'generic-file';
        iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path></svg>';
    }
    
    // Format file size
    const fileSize = formatFileSize(file.size);
    
    // Create message elements
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest User',
        email: 'guest@example.com',
        profilePic: 'https://via.placeholder.com/40'
    };
    
    // Create avatar
    const avatarElement = document.createElement('div');
    avatarElement.className = 'message-avatar';
    
    const avatarImage = document.createElement('img');
    avatarImage.src = currentUser.profilePic || 'https://via.placeholder.com/40';
    avatarImage.alt = 'Avatar';
    avatarImage.className = 'user-avatar';
    
    // Add click event to avatar to show profile
    avatarImage.addEventListener('click', function() {
        if (typeof showUserProfile === 'function') {
            showUserProfile(currentUser);
        }
    });
    
    avatarElement.appendChild(avatarImage);
    
    // Create message info container
    const messageInfo = document.createElement('div');
    messageInfo.className = 'message-info';
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Add username
    const senderName = document.createElement('span');
    senderName.className = 'sender-name user-display-name';
    senderName.textContent = currentUser.username;
    
    // Add click event to username to show profile
    senderName.addEventListener('click', function() {
        if (typeof showUserProfile === 'function') {
            showUserProfile(currentUser);
        }
    });
    
    // Add timestamp
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    const now = new Date();
    messageTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageHeader.appendChild(senderName);
    messageHeader.appendChild(messageTime);
    
    // Add message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = 'Shared a file: ' + file.name;
    
    // Create attachment element
    const attachment = document.createElement('div');
    attachment.className = `attachment ${fileType}`;
    
    if (fileType === 'image-file') {
        // For images, create a preview
        const img = document.createElement('img');
        img.className = 'attachment-image';
        img.alt = file.name;
        
        // Create a temporary URL for the image
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        attachment.appendChild(img);
        
        // Add image actions
        const imageActions = document.createElement('div');
        imageActions.className = 'image-actions';
        
        // View button
        const viewButton = document.createElement('button');
        viewButton.className = 'icon-button';
        viewButton.title = 'View image';
        viewButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>';
        viewButton.addEventListener('click', () => viewFile(file));
        
        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'icon-button';
        downloadButton.title = 'Download image';
        downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>';
        downloadButton.addEventListener('click', () => downloadFile(file));
        
        // Fullscreen button
        const fullscreenButton = document.createElement('button');
        fullscreenButton.className = 'icon-button';
        fullscreenButton.title = 'View fullscreen';
        fullscreenButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42 2.89 2.87L15 21h6v-6z"></path></svg>';
        fullscreenButton.addEventListener('click', () => {
            if (typeof openImageFullscreen === 'function') {
                openImageFullscreen(img);
            }
        });
        
        imageActions.appendChild(viewButton);
        imageActions.appendChild(downloadButton);
        imageActions.appendChild(fullscreenButton);
        attachment.appendChild(imageActions);
    } else {
        // For non-image files
        // Create file icon
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        fileIcon.innerHTML = iconSvg;
        
        // Create file info
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSizeElement = document.createElement('div');
        fileSizeElement.className = 'file-size';
        fileSizeElement.textContent = fileSize;
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSizeElement);
        
        // File actions container
        const fileActions = document.createElement('div');
        fileActions.className = 'file-actions';
        
        // View button for supported file types
        if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            const viewButton = document.createElement('button');
            viewButton.className = 'file-action-btn view-btn';
            viewButton.title = 'View file';
            viewButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg> View';
            viewButton.addEventListener('click', () => viewFile(file));
            
            fileActions.appendChild(viewButton);
        }
        
        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'file-action-btn download-btn';
        downloadButton.title = 'Download file';
        downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg> Download';
        downloadButton.addEventListener('click', () => downloadFile(file));
        
        fileActions.appendChild(downloadButton);
        
        attachment.appendChild(fileIcon);
        attachment.appendChild(fileInfo);
        attachment.appendChild(fileActions);
    }
    
    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-message';
    deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
    deleteButton.addEventListener('click', function() {
        deleteMessage(messageDiv);
    });
    
    // Assemble the message
    messageInfo.appendChild(messageHeader);
    messageInfo.appendChild(messageContent);
    messageInfo.appendChild(attachment);
    
    messageDiv.appendChild(avatarElement);
    messageDiv.appendChild(messageInfo);
    messageDiv.appendChild(deleteButton);
    
    // Add to chat
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(messageDiv);
    
    // Update the stored messages for the current channel
    if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
        channelMessages[currentChannel] = chatMessages.innerHTML;
    }
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store the file in a temporary Map (in a real app, files would be uploaded to a server)
    if (!window.uploadedFiles) window.uploadedFiles = new Map();
    window.uploadedFiles.set(file.name, file);
    
    // Show success toast
    if (typeof showToast === 'function') {
        showToast('File uploaded successfully!', 'success');
    }
}

// Function to download a file
function downloadFile(file) {
    // If file is an object with a name property but not a File object
    if (file && file.name && !(file instanceof File)) {
        // Try to get the file from the uploadedFiles Map
        if (window.uploadedFiles && window.uploadedFiles.has(file.name)) {
            file = window.uploadedFiles.get(file.name);
        } else {
            // If we can't find the actual file, simulate download
            simulateFileDownload(file.name);
            return;
        }
    }
    
    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);
    
    // Create a temporary link to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    
    // Trigger click on the link
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success toast
    if (typeof showToast === 'function') {
        showToast('File downloaded successfully!', 'success');
    }
}

// Function to simulate file download for demo purposes
function simulateFileDownload(fileName) {
    if (typeof showToast === 'function') {
        showToast(`Downloading ${fileName}...`, 'info');
    }
    
    // Create a progress toast to show download progress
    const toastContainer = document.querySelector('.toast-container') || 
        (() => {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        })();
    
    const progressToast = document.createElement('div');
    progressToast.className = 'toast info';
    
    const progressText = document.createElement('div');
    progressText.textContent = `Downloading ${fileName}...`;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'file-upload-progress';
    progressBar.style.width = '0%';
    
    progressToast.appendChild(progressText);
    progressToast.appendChild(progressBar);
    toastContainer.appendChild(progressToast);
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            toastContainer.removeChild(progressToast);
            if (typeof showToast === 'function') {
                showToast(`${fileName} downloaded successfully!`, 'success');
            }
        }
    }, 100);
}

// Function to delete a message
function deleteMessage(messageElement) {
    // Show confirmation dialog
    if (typeof showConfirmDialog === 'function') {
        showConfirmDialog(
            'Delete Message',
            'Are you sure you want to delete this message?',
            function() {
                // Animation for smooth removal
                messageElement.style.height = messageElement.offsetHeight + 'px';
                messageElement.style.overflow = 'hidden';
                messageElement.style.opacity = '1';
                
                setTimeout(() => {
                    messageElement.style.height = '0';
                    messageElement.style.padding = '0';
                    messageElement.style.margin = '0';
                    messageElement.style.opacity = '0';
                    
                    setTimeout(() => {
                        // Remove the message
                        if (messageElement.parentNode) {
                            messageElement.parentNode.removeChild(messageElement);
                        }
                        
                        // Update the stored messages for the current channel
                        if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
                            const chatMessages = document.querySelector('.chat-messages');
                            if (chatMessages) {
                                channelMessages[currentChannel] = chatMessages.innerHTML;
                            }
                        }
                        
                        if (typeof showToast === 'function') {
                            showToast('Message deleted', 'info');
                        }
                    }, 300);
                }, 10);
            }
        );
    } else {
        // If showConfirmDialog is not available, just delete the message
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
            
            // Update the stored messages for the current channel
            if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
                const chatMessages = document.querySelector('.chat-messages');
                if (chatMessages) {
                    channelMessages[currentChannel] = chatMessages.innerHTML;
                }
            }
            
            if (typeof showToast === 'function') {
                showToast('Message deleted', 'info');
            }
        }
    }
}

// Function to add delete and download buttons to existing messages
function addButtonsToExistingMessages() {
    // Get all messages
    const messages = document.querySelectorAll('.message');
    
    messages.forEach(message => {
        // Check if message already has a delete button
        if (!message.querySelector('.delete-message')) {
            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-message';
            deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
            deleteButton.addEventListener('click', function() {
                deleteMessage(message);
            });
            
            message.appendChild(deleteButton);
        }
        
        // Check for file attachments that need download buttons
        const attachment = message.querySelector('.attachment');
        if (attachment) {
            // Check if it's an image attachment
            if (attachment.classList.contains('image-file')) {
                const imageActions = attachment.querySelector('.image-actions');
                if (imageActions) {
                    // Add view button if it doesn't exist
                    if (!imageActions.querySelector('[title="View image"]')) {
                        const viewButton = document.createElement('button');
                        viewButton.className = 'icon-button';
                        viewButton.title = 'View image';
                        viewButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>';
                        
                        const img = attachment.querySelector('img');
                        if (img) {
                            const imgSrc = img.src;
                            const fileName = img.alt || 'image.png';
                            
                            viewButton.addEventListener('click', () => {
                                // Create a simulated file object for viewing
                                createImageFileFromUrl(imgSrc, fileName, (file) => {
                                    viewFile(file);
                                });
                            });
                        }
                        
                        imageActions.appendChild(viewButton);
                    }
                    
                    // Add download button if it doesn't exist
                    if (!imageActions.querySelector('[title="Download image"]')) {
                        const downloadButton = document.createElement('button');
                        downloadButton.className = 'icon-button';
                        downloadButton.title = 'Download image';
                        downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>';
                        
                        const img = attachment.querySelector('img');
                        if (img) {
                            const fileName = img.alt || 'image.png';
                            downloadButton.addEventListener('click', () => {
                                // Create a simulated file object
                                simulateFileDownload(fileName);
                            });
                        }
                        
                        imageActions.appendChild(downloadButton);
                    }
                }
            } else {
                // For non-image files
                if (!attachment.querySelector('.file-actions')) {
                    const fileInfo = attachment.querySelector('.file-info');
                    if (fileInfo) {
                        // File actions container
                        const fileActions = document.createElement('div');
                        fileActions.className = 'file-actions';
                        
                        const fileName = fileInfo.querySelector('.file-name')?.textContent || 'file';
                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        
                        // Add view button for supported file types
                        if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileExtension)) {
                            const viewButton = document.createElement('button');
                            viewButton.className = 'file-action-btn view-btn';
                            viewButton.title = 'View file';
                            viewButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg> View';
                            
                            viewButton.addEventListener('click', () => {
                                // Create a simulated file for viewing
                                createSimulatedFileForViewing(fileName, fileExtension);
                            });
                            
                            fileActions.appendChild(viewButton);
                        }
                        
                        // Download button
                        const downloadButton = document.createElement('button');
                        downloadButton.className = 'file-action-btn download-btn';
                        downloadButton.title = 'Download file';
                        downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg> Download';
                        
                        downloadButton.addEventListener('click', () => {
                            // Create a simulated file object
                            simulateFileDownload(fileName);
                        });
                        
                        fileActions.appendChild(downloadButton);
                        
                        // Insert after file info
                        fileInfo.parentNode.insertBefore(fileActions, fileInfo.nextSibling);
                    }
                }
            }
        }
    });
}

// Function to view a file in a modal
function viewFile(file) {
    console.log(`Viewing file: ${file.name}`);
    
    // Create file viewer modal if it doesn't exist
    let fileViewerModal = document.getElementById('file-viewer-modal');
    if (!fileViewerModal) {
        fileViewerModal = document.createElement('div');
        fileViewerModal.id = 'file-viewer-modal';
        fileViewerModal.className = 'modal';
        
        // Add modal content
        fileViewerModal.innerHTML = `
            <div class="modal-content file-viewer-content">
                <div class="modal-header">
                    <h3 class="file-name">File Preview</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="file-preview-area"></div>
                </div>
                <div class="modal-footer">
                    <button class="download-button">Download</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(fileViewerModal);
        
        // Add close button event listener
        const closeButton = fileViewerModal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            fileViewerModal.classList.remove('active');
        });
        
        // Close modal when clicking outside the content
        fileViewerModal.addEventListener('click', (e) => {
            if (e.target === fileViewerModal) {
                fileViewerModal.classList.remove('active');
            }
        });
        
        // Add escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fileViewerModal.classList.contains('active')) {
                fileViewerModal.classList.remove('active');
            }
        });
        
        // Add CSS for the modal
        if (!document.getElementById('file-viewer-styles')) {
            const style = document.createElement('style');
            style.id = 'file-viewer-styles';
            style.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                }
                
                .modal.active {
                    display: flex;
                }
                
                .modal-content {
                    background-color: var(--bg-medium, #2f3136);
                    border-radius: 8px;
                    width: 80%;
                    max-width: 900px;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    animation: modalFadeIn 0.3s ease;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: var(--text-normal, #dcddde);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-muted, #a3a6aa);
                    cursor: pointer;
                }
                
                .close-button:hover {
                    color: var(--text-normal, #dcddde);
                }
                
                .modal-body {
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                }
                
                .file-preview-area {
                    width: 100%;
                    height: 100%;
                    min-height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .file-preview-area img {
                    max-width: 100%;
                    max-height: 60vh;
                    object-fit: contain;
                }
                
                .file-preview-area iframe {
                    width: 100%;
                    height: 60vh;
                    border: none;
                }
                
                .file-preview-area .unsupported-file {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-muted, #a3a6aa);
                }
                
                .file-preview-area .unsupported-file i {
                    font-size: 48px;
                    margin-bottom: 15px;
                    display: block;
                }
                
                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: flex-end;
                }
                
                .modal-footer button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    background-color: var(--primary, #5865f2);
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .modal-footer button:hover {
                    background-color: var(--primary-dark, #4752c4);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Update modal content for this file
    const fileNameElement = fileViewerModal.querySelector('.file-name');
    const previewArea = fileViewerModal.querySelector('.file-preview-area');
    const downloadButton = fileViewerModal.querySelector('.download-button');
    
    // Set file name
    fileNameElement.textContent = file.name;
    
    // Clear previous preview
    previewArea.innerHTML = '';
    
    // Add download button event listener
    downloadButton.addEventListener('click', () => {
        downloadFile(file);
    });
    
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Create preview based on file type
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        // Image preview
        const img = document.createElement('img');
        img.alt = file.name;
        
        // Create a temporary URL for the image
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        // Clean up object URL when image is loaded
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
        };
        
        previewArea.appendChild(img);
    } else if (fileExtension === 'pdf') {
        // PDF preview
        const objectUrl = URL.createObjectURL(file);
        const iframe = document.createElement('iframe');
        iframe.src = objectUrl;
        
        previewArea.appendChild(iframe);
        
        // Clean up object URL when modal is closed
        fileViewerModal.addEventListener('click', function cleanupObjectUrl(e) {
            if (e.target === fileViewerModal || e.target.classList.contains('close-button')) {
                URL.revokeObjectURL(objectUrl);
                fileViewerModal.removeEventListener('click', cleanupObjectUrl);
            }
        });
    } else if (['doc', 'docx', 'ppt', 'pptx'].includes(fileExtension)) {
        // Office documents - use Google Docs Viewer if available
        try {
            const objectUrl = URL.createObjectURL(file);
            const iframe = document.createElement('iframe');
            
            // For a real implementation, you'd upload the file to a server and get a public URL
            // Here we'll just show a message that this would work with a server-side implementation
            const unsupportedDiv = document.createElement('div');
            unsupportedDiv.className = 'unsupported-file';
            unsupportedDiv.innerHTML = `
                <i class="fas fa-file-${fileExtension === 'doc' || fileExtension === 'docx' ? 'word' : 'powerpoint'}"></i>
                <p>This file type requires server-side processing to preview.</p>
                <p>In a production environment, this would use Google Docs Viewer or Microsoft Office Online.</p>
                <p>Please download the file to view its contents.</p>
            `;
            
            previewArea.appendChild(unsupportedDiv);
            
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Error creating preview for Office document:', error);
            showUnsupportedFileMessage();
        }
    } else {
        // Unsupported file type
        showUnsupportedFileMessage();
    }
    
    // Helper function to show unsupported file message
    function showUnsupportedFileMessage() {
        const unsupportedDiv = document.createElement('div');
        unsupportedDiv.className = 'unsupported-file';
        unsupportedDiv.innerHTML = `
            <i class="fas fa-file"></i>
            <p>Preview not available for this file type.</p>
            <p>Please download the file to view its contents.</p>
        `;
        
        previewArea.appendChild(unsupportedDiv);
    }
    
    // Show the modal
    fileViewerModal.classList.add('active');
}

// Helper function to create an image file from a URL
function createImageFileFromUrl(url, fileName, callback) {
    // Fetch the image data
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            // Create a File object from the blob
            const file = new File([blob], fileName, { type: blob.type });
            callback(file);
        })
        .catch(error => {
            console.error('Error creating image file from URL:', error);
            // Show error message
            if (typeof showToast === 'function') {
                showToast('Error loading image. Please try again.', 'error');
            }
        });
}

// Helper function to create a simulated file for viewing
function createSimulatedFileForViewing(fileName, fileExtension) {
    // Create a placeholder file based on the extension
    let fileType = 'application/octet-stream';
    let fileContent = '';
    
    // Set appropriate MIME type based on file extension
    if (fileExtension === 'pdf') {
        fileType = 'application/pdf';
        // For demo purposes, we'll create a simple PDF-like content
        fileContent = '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Resources<<>>>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF';
    } else if (fileExtension === 'doc' || fileExtension === 'docx') {
        fileType = 'application/msword';
        // For demo purposes, we'll create a simple placeholder
        fileContent = 'This is a simulated Word document for preview purposes.';
    } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
        fileType = 'application/vnd.ms-powerpoint';
        // For demo purposes, we'll create a simple placeholder
        fileContent = 'This is a simulated PowerPoint document for preview purposes.';
    }
    
    // Create a blob from the content
    const blob = new Blob([fileContent], { type: fileType });
    
    // Create a File object from the blob
    const file = new File([blob], fileName, { type: fileType });
    
    // View the file
    viewFile(file);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Function to initialize chat message animation
function initializeChatMessageAnimation() {
    // Get the message input and send button
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    
    if (!messageInput || !sendButton) {
        console.error('Message input or send button not found');
        return;
    }
    
    // Clone the send button to remove existing event listeners
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    
    // Add event listener to the new send button
    newSendButton.addEventListener('click', function() {
        handleChatMessageSend();
    });
    
    // Add event listener for Enter key
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatMessageSend();
        }
    });
    
    // Function to handle message sending with animation
    function handleChatMessageSend() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;
        
        // Clear the input
        messageInput.value = '';
        
        // Create a temporary message with sending animation
        createSendingMessageAnimation(messageText);
    }
}

// Function to create a sending message animation
function createSendingMessageAnimation(messageText) {
    // Get the chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }
    
    // Create the message elements
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sending-message';
    
    // Get current user from localStorage or use default
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest User',
        email: 'guest@example.com',
        profilePic: 'https://via.placeholder.com/40'
    };
    
    // Create avatar
    const avatarElement = document.createElement('div');
    avatarElement.className = 'message-avatar';
    
    const avatarImage = document.createElement('img');
    avatarImage.src = currentUser.profilePic || 'https://via.placeholder.com/40';
    avatarImage.alt = 'Avatar';
    avatarImage.className = 'user-avatar';
    
    avatarElement.appendChild(avatarImage);
    
    // Create message info container
    const messageInfo = document.createElement('div');
    messageInfo.className = 'message-info';
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Add username
    const senderName = document.createElement('span');
    senderName.className = 'sender-name user-display-name';
    senderName.textContent = currentUser.username;
    
    // Add timestamp with sending indicator
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    messageTime.innerHTML = '<span class="sending-indicator">Sending<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></span>';
    
    messageHeader.appendChild(senderName);
    messageHeader.appendChild(messageTime);
    
    // Add message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = messageText;
    
    // Assemble the message
    messageInfo.appendChild(messageHeader);
    messageInfo.appendChild(messageContent);
    
    messageDiv.appendChild(avatarElement);
    messageDiv.appendChild(messageInfo);
    
    // Add to chat
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add CSS for the sending animation
    const style = document.createElement('style');
    style.textContent = `
        .sending-message {
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .sending-indicator {
            font-style: italic;
            color: var(--text-muted);
        }
        
        .sending-indicator .dot-1,
        .sending-indicator .dot-2,
        .sending-indicator .dot-3 {
            animation: dot-animation 1.4s infinite;
            opacity: 0;
        }
        
        .sending-indicator .dot-2 {
            animation-delay: 0.2s;
        }
        
        .sending-indicator .dot-3 {
            animation-delay: 0.4s;
        }
        
        @keyframes dot-animation {
            0% { opacity: 0; }
            20% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Simulate sending delay (in a real app, this would be an actual message send)
    setTimeout(() => {
        // Remove the sending message
        chatMessages.removeChild(messageDiv);
        
        // Create the final message
        sendFinalMessage(messageText);
    }, 1500); // 1.5 second delay to simulate network latency
}

// Function to send the final message after animation
function sendFinalMessage(messageText) {
    // Get the chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Create the message elements
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest User',
        email: 'guest@example.com',
        profilePic: 'https://via.placeholder.com/40'
    };
    
    // Create avatar
    const avatarElement = document.createElement('div');
    avatarElement.className = 'message-avatar';
    
    const avatarImage = document.createElement('img');
    avatarImage.src = currentUser.profilePic || 'https://via.placeholder.com/40';
    avatarImage.alt = 'Avatar';
    avatarImage.className = 'user-avatar';
    
    // Add click event to avatar to show profile
    avatarImage.addEventListener('click', function() {
        if (typeof showUserProfile === 'function') {
            showUserProfile(currentUser);
        }
    });
    
    avatarElement.appendChild(avatarImage);
    
    // Create message info container
    const messageInfo = document.createElement('div');
    messageInfo.className = 'message-info';
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Add username
    const senderName = document.createElement('span');
    senderName.className = 'sender-name user-display-name';
    senderName.textContent = currentUser.username;
    
    // Add click event to username to show profile
    senderName.addEventListener('click', function() {
        if (typeof showUserProfile === 'function') {
            showUserProfile(currentUser);
        }
    });
    
    // Add timestamp
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    const now = new Date();
    messageTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageHeader.appendChild(senderName);
    messageHeader.appendChild(messageTime);
    
    // Add message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = messageText;
    
    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-message';
    deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
    deleteButton.addEventListener('click', function() {
        deleteMessage(messageDiv);
    });
    
    // Assemble the message
    messageInfo.appendChild(messageHeader);
    messageInfo.appendChild(messageContent);
    
    messageDiv.appendChild(avatarElement);
    messageDiv.appendChild(messageInfo);
    messageDiv.appendChild(deleteButton);
    
    // Add to chat with a fade-in animation
    messageDiv.style.opacity = '0';
    chatMessages.appendChild(messageDiv);
    
    // Trigger fade-in animation
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease';
        messageDiv.style.opacity = '1';
    }, 10);
    
    // Update the stored messages for the current channel
    if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
        channelMessages[currentChannel] = chatMessages.innerHTML;
    }
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to initialize resource upload animation
function initializeResourceUploadAnimation() {
    console.log('Initializing resource upload animation');
    
    // Find all resource upload buttons
    const resourceUploadButtons = document.querySelectorAll('.resource-upload-btn, .attachment-buttons .icon-button, #attach-file-btn');
    
    if (resourceUploadButtons.length === 0) {
        console.log('No resource upload buttons found. Will try again later.');
        // If buttons aren't found immediately, try again after a delay
        setTimeout(initializeResourceUploadAnimation, 1000);
        return;
    }
    
    console.log(`Found ${resourceUploadButtons.length} resource upload buttons`);
    
    // Create or ensure the upload animation element exists
    ensureUploadAnimationElement();
    
    // Add event listeners to all resource upload buttons
    resourceUploadButtons.forEach((button, index) => {
        // Clone the button to remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        console.log(`Added event listener to resource upload button ${index + 1}`);
        
        // Add click event listener
        newButton.addEventListener('click', function(e) {
            // Create a file input if it doesn't exist
            let fileInput = document.getElementById('resource-file-input');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'resource-file-input';
                fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                // Add change event listener to the file input
                fileInput.addEventListener('change', function() {
                    if (fileInput.files.length > 0) {
                        const files = Array.from(fileInput.files);
                        handleResourceUpload(files);
                    }
                });
            }
            
            // Trigger click on the file input
            fileInput.click();
        });
    });
    
    // Also handle drag and drop for resource uploads
    setupDragAndDropForResources();
}

// Function to ensure the upload animation element exists
function ensureUploadAnimationElement() {
    let uploadAnimation = document.getElementById('upload-animation');
    
    // If upload animation element doesn't exist, create it
    if (!uploadAnimation) {
        console.log('Creating upload animation element');
        uploadAnimation = document.createElement('div');
        uploadAnimation.id = 'upload-animation';
        uploadAnimation.className = 'upload-animation';
        
        const uploadSpinner = document.createElement('div');
        uploadSpinner.className = 'upload-spinner';
        
        const uploadText = document.createElement('div');
        uploadText.className = 'upload-text';
        uploadText.textContent = 'Uploading file...';
        
        const uploadProgress = document.createElement('div');
        uploadProgress.className = 'upload-progress';
        
        const uploadProgressBar = document.createElement('div');
        uploadProgressBar.className = 'upload-progress-bar';
        uploadProgressBar.id = 'upload-progress-bar';
        
        uploadProgress.appendChild(uploadProgressBar);
        uploadAnimation.appendChild(uploadSpinner);
        uploadAnimation.appendChild(uploadText);
        uploadAnimation.appendChild(uploadProgress);
        
        // Add to the chat messages container if it exists
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.appendChild(uploadAnimation);
        } else {
            // Otherwise add to the body
            document.body.appendChild(uploadAnimation);
        }
    }
    
    // Add CSS for the upload animation if it doesn't exist
    if (!document.getElementById('upload-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'upload-animation-styles';
        style.textContent = `
            .upload-animation {
                display: none;
                position: relative;
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                text-align: center;
            }
            
            .upload-animation.active {
                display: block;
            }
            
            .upload-spinner {
                display: inline-block;
                width: 30px;
                height: 30px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: var(--primary);
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .upload-text {
                margin-bottom: 10px;
                color: var(--text-normal);
            }
            
            .upload-progress {
                height: 6px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .upload-progress-bar {
                height: 100%;
                background-color: var(--primary);
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    return uploadAnimation;
}

// Function to handle resource file uploads
function handleResourceUpload(files) {
    console.log(`Handling upload of ${files.length} resource files`);
    
    // Get or create the upload animation element
    const uploadAnimation = ensureUploadAnimationElement();
    const uploadText = uploadAnimation.querySelector('.upload-text');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    
    // Make sure the animation is visible
    uploadAnimation.classList.add('active');
    
    // Reset progress bar
    uploadProgressBar.style.width = '0%';
    
    // Update text for multiple files
    if (files.length > 1) {
        uploadText.textContent = `Uploading ${files.length} files...`;
    } else {
        uploadText.textContent = `Uploading ${files[0].name}...`;
    }
    
    // Make sure the upload animation is in the chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages && uploadAnimation.parentNode !== chatMessages) {
        chatMessages.appendChild(uploadAnimation);
    }
    
    // Scroll to the upload animation
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Get current community and subject information
    const communityId = getCurrentCommunityId();
    const subjectId = getCurrentSubjectId();
    
    // Prepare metadata for resource storage
    const metadata = {
        communityId: communityId,
        subjectId: subjectId,
        description: `Uploaded in ${subjectId} channel`
    };
    
    // Simulate upload progress for each file
    let overallProgress = 0;
    const totalFiles = files.length;
    let completedFiles = 0;
    const savedResources = [];
    
    // Process each file
    files.forEach((file, index) => {
        console.log(`Starting upload for ${file.name}`);
        
        // Simulate upload progress
        let fileProgress = 0;
        const progressInterval = setInterval(() => {
            // Increment progress by a random amount
            fileProgress += Math.floor(Math.random() * 10) + 1;
            if (fileProgress > 100) fileProgress = 100;
            
            // Calculate overall progress across all files
            const fileContribution = fileProgress / totalFiles;
            overallProgress = (completedFiles * 100 / totalFiles) + fileContribution;
            
            // Update progress bar
            uploadProgressBar.style.width = `${overallProgress}%`;
            
            // If this file is complete
            if (fileProgress === 100) {
                clearInterval(progressInterval);
                completedFiles++;
                
                // If all files are complete
                if (completedFiles === totalFiles) {
                    // Update text
                    uploadText.textContent = 'Processing...';
                    
                    // Save files to permanent storage
                    const savePromises = files.map(file => {
                        // If ResourceStorage is available, save the file permanently
                        if (window.ResourceStorage) {
                            return window.ResourceStorage.saveFileAsResource(file, metadata)
                                .then(resource => {
                                    savedResources.push(resource);
                                    return resource;
                                })
                                .catch(error => {
                                    console.error('Error saving resource:', error);
                                    return null;
                                });
                        } else {
                            return Promise.resolve(null);
                        }
                    });
                    
                    // After all files are saved, add them to the chat
                    Promise.all(savePromises).then(() => {
                        // After a short delay, hide the animation and add the files to chat
                        setTimeout(() => {
                            // Hide upload animation
                            uploadAnimation.classList.remove('active');
                            
                            // Add files to chat
                            files.forEach(file => {
                                // If the original uploadFile function exists, use it
                                if (typeof window.uploadFile === 'function') {
                                    window.uploadFile(file, files.indexOf(file), files.length);
                                } else {
                                    // Otherwise use our sendMessageWithAttachment function
                                    sendMessageWithAttachment(file);
                                }
                            });
                            
                            // Show success message
                            if (typeof showToast === 'function') {
                                if (files.length > 1) {
                                    showToast(`${files.length} files uploaded successfully and saved for everyone!`, 'success');
                                } else {
                                    showToast(`${files[0].name} uploaded successfully and saved for everyone!`, 'success');
                                }
                            }
                        }, 500);
                    });
                }
            }
        }, 200);
    });
}

// Function to load saved resources for the current community and subject
function loadSavedResources() {
    // Check if ResourceStorage is available
    if (!window.ResourceStorage) {
        console.warn('ResourceStorage not available, cannot load saved resources');
        return;
    }
    
    // Get current community and subject
    const communityId = getCurrentCommunityId();
    const subjectId = getCurrentSubjectId();
    
    console.log(`Loading saved resources for community ${communityId} and subject ${subjectId}`);
    
    // Search for resources matching the current community and subject
    window.ResourceStorage.searchResources({
        communityId: communityId,
        subjectId: subjectId
    }).then(resources => {
        if (resources.length === 0) {
            console.log('No saved resources found for this community and subject');
            return;
        }
        
        console.log(`Found ${resources.length} saved resources`);
        
        // Get the chat messages container
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) {
            console.warn('Chat messages container not found');
            return;
        }
        
        // Check if we've already added a resources section
        if (document.querySelector('.saved-resources-section')) {
            return;
        }
        
        // Create a section for saved resources
        const resourcesSection = document.createElement('div');
        resourcesSection.className = 'saved-resources-section';
        
        // Add a header
        const header = document.createElement('div');
        header.className = 'resources-header';
        header.innerHTML = `
            <h3>Saved Resources (${resources.length})</h3>
            <p>These resources have been shared in this channel</p>
        `;
        resourcesSection.appendChild(header);
        
        // Add resources list
        const resourcesList = document.createElement('div');
        resourcesList.className = 'resources-list';
        
        // Add each resource
        resources.forEach(resource => {
            const resourceItem = createResourceItem(resource);
            resourcesList.appendChild(resourceItem);
        });
        
        resourcesSection.appendChild(resourcesList);
        
        // Add to chat messages
        chatMessages.appendChild(resourcesSection);
        
        // Add CSS for the resources section
        addResourcesSectionStyles();
    }).catch(error => {
        console.error('Error loading saved resources:', error);
    });
}

// Function to create a resource item element
function createResourceItem(resource) {
    const resourceItem = document.createElement('div');
    resourceItem.className = 'resource-item';
    resourceItem.setAttribute('data-resource-id', resource.id);
    
    // Determine resource icon based on type
    let iconHtml = '<i class="fas fa-file"></i>';
    if (resource.type.startsWith('image/')) {
        iconHtml = '<i class="fas fa-image"></i>';
    } else if (resource.type.includes('pdf')) {
        iconHtml = '<i class="fas fa-file-pdf"></i>';
    } else if (resource.type.includes('word') || resource.type.includes('doc')) {
        iconHtml = '<i class="fas fa-file-word"></i>';
    } else if (resource.type.includes('powerpoint') || resource.type.includes('presentation') || resource.type.includes('ppt')) {
        iconHtml = '<i class="fas fa-file-powerpoint"></i>';
    }
    
    // Format date
    const uploadDate = new Date(resource.uploadedAt);
    const formattedDate = uploadDate.toLocaleDateString() + ' ' + uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create resource item content
    resourceItem.innerHTML = `
        <div class="resource-icon">${iconHtml}</div>
        <div class="resource-info">
            <div class="resource-name">${resource.name}</div>
            <div class="resource-meta">
                <span class="resource-uploader">Uploaded by ${resource.uploaderName}</span>
                <span class="resource-date">${formattedDate}</span>
            </div>
        </div>
        <div class="resource-actions">
            <button class="view-resource" title="View"><i class="fas fa-eye"></i></button>
            <button class="download-resource" title="Download"><i class="fas fa-download"></i></button>
        </div>
    `;
    
    // Add event listeners
    const viewButton = resourceItem.querySelector('.view-resource');
    const downloadButton = resourceItem.querySelector('.download-resource');
    
    viewButton.addEventListener('click', () => {
        viewSavedResource(resource);
    });
    
    downloadButton.addEventListener('click', () => {
        downloadSavedResource(resource);
    });
    
    return resourceItem;
}

// Function to view a saved resource
function viewSavedResource(resource) {
    console.log(`Viewing saved resource: ${resource.name}`);
    
    // Convert data URL to blob
    if (resource.url.startsWith('data:')) {
        const byteString = atob(resource.url.split(',')[1]);
        const mimeType = resource.url.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const file = new File([blob], resource.name, { type: resource.type });
        
        // View the file
        viewFile(file);
    } else {
        // For non-data URLs, create a simulated file
        const fileExtension = resource.name.split('.').pop().toLowerCase();
        createSimulatedFileForViewing(resource.name, fileExtension);
    }
}

// Function to download a saved resource
function downloadSavedResource(resource) {
    console.log(`Downloading saved resource: ${resource.name}`);
    
    // Convert data URL to blob
    if (resource.url.startsWith('data:')) {
        const byteString = atob(resource.url.split(',')[1]);
        const mimeType = resource.url.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const file = new File([blob], resource.name, { type: resource.type });
        
        // Download the file
        downloadFile(file);
    } else {
        // For non-data URLs, simulate download
        simulateFileDownload(resource.name);
    }
}

// Function to add CSS styles for the resources section
function addResourcesSectionStyles() {
    if (document.getElementById('resources-section-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'resources-section-styles';
    style.textContent = `
        .saved-resources-section {
            margin: 20px 0;
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        
        .resources-header {
            margin-bottom: 15px;
        }
        
        .resources-header h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: var(--text-normal, #dcddde);
        }
        
        .resources-header p {
            margin: 0;
            font-size: 14px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .resources-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 10px;
        }
        
        .resource-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            transition: background-color 0.2s ease;
        }
        
        .resource-item:hover {
            background-color: rgba(0, 0, 0, 0.3);
        }
        
        .resource-icon {
            font-size: 24px;
            margin-right: 10px;
            color: var(--primary, #5865f2);
        }
        
        .resource-info {
            flex: 1;
            min-width: 0;
        }
        
        .resource-name {
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--text-normal, #dcddde);
        }
        
        .resource-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
            margin-top: 3px;
        }
        
        .resource-actions {
            display: flex;
            gap: 5px;
        }
        
        .resource-actions button {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 5px;
            border-radius: 3px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        
        .resource-actions button:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-normal, #dcddde);
        }
    `;
    
    document.head.appendChild(style);
}

// Helper function to get current community ID
function getCurrentCommunityId() {
    // Try to get from active element
    const activeCollege = document.querySelector('.college-item.active');
    if (activeCollege) {
        return activeCollege.getAttribute('data-community-id') || 
               activeCollege.querySelector('.college-name')?.textContent || 
               'general';
    }
    
    // Fallback to localStorage
    return localStorage.getItem('currentCommunityId') || 'general';
}

// Helper function to get current subject ID
function getCurrentSubjectId() {
    // Try to get from active element
    const activeChannel = document.querySelector('.channel.active');
    if (activeChannel) {
        return activeChannel.getAttribute('data-channel-id') || 
               activeChannel.querySelector('.channel-name')?.textContent || 
               'general-chat';
    }
    
    // Fallback to localStorage
    return localStorage.getItem('currentSubjectId') || 'general-chat';
}

// Function to set up drag and drop for resource uploads
function setupDragAndDropForResources() {
    // Find drop zones
    const dropZones = document.querySelectorAll('.chat-messages, .resource-drop-zone');
    
    if (dropZones.length === 0) {
        console.log('No drop zones found for drag and drop');
        return;
    }
    
    console.log(`Found ${dropZones.length} drop zones for drag and drop`);
    
    dropZones.forEach(zone => {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, highlight, false);
        });
        
        // Remove highlight when item is dragged out or dropped
        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        zone.addEventListener('drop', handleDrop, false);
    });
    
    // Prevent default drag behaviors
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop zone
    function highlight(e) {
        e.currentTarget.classList.add('drag-over');
    }
    
    // Remove highlight
    function unhighlight(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    // Handle dropped files
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        
        if (files.length > 0) {
            handleResourceUpload(files);
        }
    }
    
    // Add CSS for drag and drop
    if (!document.getElementById('drag-drop-styles')) {
        const style = document.createElement('style');
        style.id = 'drag-drop-styles';
        style.textContent = `
            .drag-over {
                background-color: rgba(88, 101, 242, 0.1) !important;
                border: 2px dashed var(--primary) !important;
            }
        `;
        document.head.appendChild(style);
    }
}