/**
 * Quick Profile Component
 * Embeddable profile editor for chat interface
 */

/**
 * Create and show a quick profile editor
 * @param {HTMLElement} container - Container element to add the editor to
 * @param {Function} onSave - Callback function to call when profile is saved
 */
function createQuickProfileEditor(container, onSave) {
    // Create the editor element
    const editor = document.createElement('div');
    editor.className = 'quick-profile-container';
    editor.id = 'quick-profile-editor';
    
    // Add the editor content
    editor.innerHTML = `
        <div class="profile-header">
            <div class="profile-title">Update Your Profile</div>
            <div class="profile-subtitle">Your profile will be visible in chats</div>
        </div>
        
        <div class="profile-photo-container">
            <img id="quick-profile-photo" class="profile-photo" src="https://via.placeholder.com/100" alt="Profile Photo">
            <div class="photo-upload-overlay" id="quick-photo-upload">
                <i class="fas fa-camera"></i> Change
            </div>
            <input type="file" id="quick-photo-input" class="photo-file-input" accept="image/*" style="display: none;">
        </div>
        
        <div class="profile-form">
            <div class="form-group">
                <label for="quick-username-input">Display Name</label>
                <input type="text" id="quick-username-input" class="profile-username-input" placeholder="Enter your display name">
            </div>
            
            <div class="form-actions">
                <button class="btn btn-secondary" id="quick-cancel-button">Cancel</button>
                <button class="btn btn-primary" id="quick-save-button">Save Profile</button>
            </div>
        </div>
        
        <div class="preview-section">
            <div class="preview-title">Chat Preview</div>
            <div class="chat-preview">
                <div class="preview-avatar">
                    <img id="quick-preview-avatar" src="https://via.placeholder.com/40" alt="Avatar">
                </div>
                <div class="preview-content">
                    <div class="preview-header">
                        <div id="quick-preview-username" class="preview-username">Username</div>
                        <div class="preview-time">Just now</div>
                    </div>
                    <div class="preview-message">This is how your messages will appear in chat</div>
                </div>
            </div>
        </div>
        
        <div id="quick-profile-message" class="profile-message"></div>
    `;
    
    // Add the editor to the container
    container.appendChild(editor);
    
    // Add styles if not already added
    addQuickProfileStyles();
    
    // Initialize the editor
    initializeQuickProfileEditor(onSave);
    
    return editor;
}

/**
 * Initialize the quick profile editor
 * @param {Function} onSave - Callback function to call when profile is saved
 */
function initializeQuickProfileEditor(onSave) {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) {
        showQuickProfileMessage('No user data found', 'error');
        return;
    }
    
    // Update profile display
    updateQuickProfileDisplay(currentUserData);
    
    // Set up photo upload
    setupQuickPhotoUpload();
    
    // Set up username input
    setupQuickUsernameInput();
    
    // Set up save button
    setupQuickSaveButton(onSave);
    
    // Set up cancel button
    setupQuickCancelButton();
}

/**
 * Get current user data from local storage
 * @returns {Object|null} Current user data or null if not found
 */
function getCurrentUserData() {
    try {
        const currentUserJson = localStorage.getItem('currentUser');
        if (!currentUserJson) return null;
        
        return JSON.parse(currentUserJson);
    } catch (error) {
        console.error('Error getting current user data:', error);
        return null;
    }
}

/**
 * Update quick profile display with current user data
 * @param {Object} userData - Current user data
 */
function updateQuickProfileDisplay(userData) {
    // Update username input
    const usernameInput = document.getElementById('quick-username-input');
    if (usernameInput) {
        usernameInput.value = userData.username || userData.displayName || '';
    }
    
    // Update preview username
    const previewUsername = document.getElementById('quick-preview-username');
    if (previewUsername) {
        previewUsername.textContent = userData.username || userData.displayName || 'User';
    }
    
    // Get avatar URL
    const avatarUrl = userData.photoURL || getDefaultAvatarUrl(userData.username || userData.displayName || 'User');
    
    // Update profile photo
    const profilePhoto = document.getElementById('quick-profile-photo');
    if (profilePhoto) {
        profilePhoto.src = avatarUrl;
    }
    
    // Update preview avatar
    const previewAvatar = document.getElementById('quick-preview-avatar');
    if (previewAvatar) {
        previewAvatar.src = avatarUrl;
    }
}

/**
 * Set up quick photo upload
 */
function setupQuickPhotoUpload() {
    // Find photo upload elements
    const uploadButton = document.getElementById('quick-photo-upload');
    const fileInput = document.getElementById('quick-photo-input');
    
    if (!uploadButton || !fileInput) return;
    
    // Set up click handler for upload button
    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Set up change handler for file input
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            showQuickProfileMessage('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showQuickProfileMessage('Image size should be less than 5MB', 'error');
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoUrl = e.target.result;
            
            // Update preview
            const profilePhoto = document.getElementById('quick-profile-photo');
            const previewAvatar = document.getElementById('quick-preview-avatar');
            
            if (profilePhoto) profilePhoto.src = photoUrl;
            if (previewAvatar) previewAvatar.src = photoUrl;
            
            // Store in temporary storage for saving later
            window.tempQuickPhotoUrl = photoUrl;
            
            showQuickProfileMessage('Photo ready to save. Click Save to update your profile.', 'info');
        };
        
        reader.onerror = function() {
            showQuickProfileMessage('Error reading file', 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Set up quick username input
 */
function setupQuickUsernameInput() {
    // Find username input
    const usernameInput = document.getElementById('quick-username-input');
    const previewUsername = document.getElementById('quick-preview-username');
    
    if (!usernameInput || !previewUsername) return;
    
    // Set up input handler
    usernameInput.addEventListener('input', function() {
        // Update preview
        previewUsername.textContent = usernameInput.value.trim() || 'User';
        
        // Store in temporary storage for saving later
        window.tempQuickUsername = usernameInput.value.trim();
    });
}

/**
 * Set up quick save button
 * @param {Function} onSave - Callback function to call when profile is saved
 */
function setupQuickSaveButton(onSave) {
    // Find save button
    const saveButton = document.getElementById('quick-save-button');
    
    if (!saveButton) return;
    
    // Set up click handler
    saveButton.addEventListener('click', function() {
        saveQuickProfile(onSave);
    });
}

/**
 * Set up quick cancel button
 */
function setupQuickCancelButton() {
    // Find cancel button
    const cancelButton = document.getElementById('quick-cancel-button');
    
    if (!cancelButton) return;
    
    // Set up click handler
    cancelButton.addEventListener('click', function() {
        // Get editor element
        const editor = document.getElementById('quick-profile-editor');
        
        // Remove editor
        if (editor && editor.parentNode) {
            editor.parentNode.removeChild(editor);
        }
    });
}

/**
 * Save quick profile changes to local storage
 * @param {Function} onSave - Callback function to call when profile is saved
 */
function saveQuickProfile(onSave) {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) {
        showQuickProfileMessage('No user data found', 'error');
        return;
    }
    
    // Check if we have changes to save
    const hasUsernameChange = window.tempQuickUsername !== undefined;
    const hasPhotoChange = window.tempQuickPhotoUrl !== undefined;
    
    if (!hasUsernameChange && !hasPhotoChange) {
        showQuickProfileMessage('No changes to save', 'info');
        return;
    }
    
    // Create updated user data
    const updatedUserData = {...currentUserData};
    
    // Update username if changed
    if (hasUsernameChange) {
        updatedUserData.username = window.tempQuickUsername;
        updatedUserData.displayName = window.tempQuickUsername;
    }
    
    // Update photo URL if changed
    if (hasPhotoChange) {
        updatedUserData.photoURL = window.tempQuickPhotoUrl;
    }
    
    // Save to local storage
    try {
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        
        // Update UserProfileManager if available
        if (window.UserProfileManager) {
            window.UserProfileManager.updateProfile(updatedUserData.uid, {
                username: updatedUserData.username,
                displayName: updatedUserData.displayName,
                photoURL: updatedUserData.photoURL
            });
        }
        
        // Clear temporary storage
        window.tempQuickUsername = undefined;
        window.tempQuickPhotoUrl = undefined;
        
        showQuickProfileMessage('Profile updated successfully', 'success');
        
        // Trigger a profile update event
        const event = new CustomEvent('profileUpdated', { detail: updatedUserData });
        document.dispatchEvent(event);
        
        // Call onSave callback if provided
        if (typeof onSave === 'function') {
            onSave(updatedUserData);
        }
        
        // Remove editor after a short delay
        setTimeout(() => {
            const editor = document.getElementById('quick-profile-editor');
            if (editor && editor.parentNode) {
                editor.parentNode.removeChild(editor);
            }
        }, 1500);
    } catch (error) {
        console.error('Error saving profile:', error);
        showQuickProfileMessage('Error saving profile', 'error');
    }
}

/**
 * Show a message in the quick profile editor
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showQuickProfileMessage(message, type = 'info') {
    // Find message container
    const messageContainer = document.getElementById('quick-profile-message');
    
    if (!messageContainer) return;
    
    // Set message content and type
    messageContainer.textContent = message;
    messageContainer.className = `profile-message ${type}`;
    
    // Show the message
    messageContainer.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}

/**
 * Get default avatar URL for a username
 * @param {string} username - Username
 * @returns {string} Default avatar URL
 */
function getDefaultAvatarUrl(username) {
    // Use UserProfileManager if available
    if (window.UserProfileManager && window.UserProfileManager.getDefaultAvatarURL) {
        return window.UserProfileManager.getDefaultAvatarURL(username);
    }
    
    // Fallback to ui-avatars.com
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
}

/**
 * Add styles for the quick profile editor
 */
function addQuickProfileStyles() {
    // Check if styles are already added
    if (document.getElementById('quick-profile-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'quick-profile-styles';
    
    // Add styles
    style.textContent = `
        .quick-profile-container {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            margin: 20px auto;
            position: relative;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .profile-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .profile-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
            color: var(--text-normal, #dcddde);
        }
        
        .profile-subtitle {
            font-size: 14px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .profile-photo-container {
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto 15px;
            border: 3px solid var(--primary, #5865f2);
            background-color: rgba(0, 0, 0, 0.3);
        }
        
        .profile-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .photo-upload-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            text-align: center;
            padding: 5px 0;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .profile-photo-container:hover .photo-upload-overlay {
            opacity: 1;
        }
        
        .profile-form {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--text-normal, #dcddde);
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: var(--text-normal, #dcddde);
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        
        .btn-primary {
            background-color: var(--primary, #5865f2);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #4752c4;
        }
        
        .btn-secondary {
            background-color: rgba(0, 0, 0, 0.3);
            color: var(--text-normal, #dcddde);
        }
        
        .btn-secondary:hover {
            background-color: rgba(0, 0, 0, 0.4);
        }
        
        .profile-message {
            padding: 10px 15px;
            border-radius: 4px;
            margin-top: 15px;
            display: none;
        }
        
        .profile-message.success {
            background-color: rgba(67, 181, 129, 0.2);
            color: #43b581;
            border: 1px solid rgba(67, 181, 129, 0.3);
        }
        
        .profile-message.error {
            background-color: rgba(240, 71, 71, 0.2);
            color: #f04747;
            border: 1px solid rgba(240, 71, 71, 0.3);
        }
        
        .profile-message.info {
            background-color: rgba(88, 101, 242, 0.2);
            color: #5865f2;
            border: 1px solid rgba(88, 101, 242, 0.3);
        }
        
        .preview-section {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 15px;
            margin-top: 20px;
        }
        
        .preview-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 10px;
            color: var(--text-normal, #dcddde);
        }
        
        .chat-preview {
            display: flex;
            align-items: flex-start;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }
        
        .preview-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            overflow: hidden;
        }
        
        .preview-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .preview-content {
            flex: 1;
        }
        
        .preview-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .preview-username {
            font-weight: 500;
            color: var(--text-normal, #dcddde);
            margin-right: 8px;
        }
        
        .preview-time {
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .preview-message {
            color: var(--text-normal, #dcddde);
        }
    `;
    
    // Add style to document
    document.head.appendChild(style);
}

// Export functions for use in other scripts
window.createQuickProfileEditor = createQuickProfileEditor;
window.saveQuickProfile = saveQuickProfile;
