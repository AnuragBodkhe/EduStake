/**
 * Profile Editor
 * Handles direct editing and updating of user profile in local storage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile editor
    initializeProfileEditor();
    
    // Set up profile photo upload
    setupProfilePhotoUpload();
    
    // Set up username editor
    setupUsernameEditor();
    
    // Add save button event listener
    setupSaveButton();
});

/**
 * Initialize profile editor
 */
function initializeProfileEditor() {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) {
        console.warn('No current user data found');
        return;
    }
    
    // Update profile display
    updateProfileDisplay(currentUserData);
    
    console.log('Profile editor initialized');
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
 * Update profile display with current user data
 * @param {Object} userData - Current user data
 */
function updateProfileDisplay(userData) {
    // Update username fields
    const usernameInputs = document.querySelectorAll('.profile-username-input, #username-input');
    usernameInputs.forEach(input => {
        if (input) input.value = userData.username || userData.displayName || '';
    });
    
    // Update username displays
    const usernameDisplays = document.querySelectorAll('.profile-username, .username-display');
    usernameDisplays.forEach(display => {
        if (display) display.textContent = userData.username || userData.displayName || 'User';
    });
    
    // Update profile photo displays
    const photoDisplays = document.querySelectorAll('.profile-photo, .user-avatar');
    photoDisplays.forEach(display => {
        if (display && display.tagName === 'IMG') {
            display.src = userData.photoURL || getDefaultAvatarUrl(userData.username || userData.displayName || 'User');
        }
    });
    
    // Update profile photo preview
    const photoPreview = document.getElementById('profile-photo-preview');
    if (photoPreview) {
        photoPreview.src = userData.photoURL || getDefaultAvatarUrl(userData.username || userData.displayName || 'User');
    }
}

/**
 * Set up profile photo upload
 */
function setupProfilePhotoUpload() {
    // Find photo upload elements
    const photoUploadButtons = document.querySelectorAll('.photo-upload-button, #photo-upload-button');
    const photoFileInputs = document.querySelectorAll('.photo-file-input, #photo-file-input');
    
    // Set up click handlers for upload buttons
    photoUploadButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // Find the corresponding file input
            const fileInput = photoFileInputs[index] || document.createElement('input');
            if (!fileInput.type) {
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
            }
            
            // Trigger file selection
            fileInput.click();
        });
    });
    
    // Set up change handlers for file inputs
    photoFileInputs.forEach(input => {
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file
            if (!file.type.startsWith('image/')) {
                showMessage('Please select an image file', 'error');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('Image size should be less than 5MB', 'error');
                return;
            }
            
            // Read file as data URL
            const reader = new FileReader();
            reader.onload = function(e) {
                const photoUrl = e.target.result;
                
                // Update preview
                const photoPreview = document.getElementById('profile-photo-preview');
                if (photoPreview) {
                    photoPreview.src = photoUrl;
                }
                
                // Store in temporary storage for saving later
                window.tempPhotoUrl = photoUrl;
                
                showMessage('Photo ready to save. Click Save to update your profile.', 'info');
            };
            
            reader.onerror = function() {
                showMessage('Error reading file', 'error');
            };
            
            reader.readAsDataURL(file);
        });
    });
}

/**
 * Set up username editor
 */
function setupUsernameEditor() {
    // Find username input elements
    const usernameInputs = document.querySelectorAll('.profile-username-input, #username-input');
    
    // Set up input handlers
    usernameInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Store in temporary storage for saving later
            window.tempUsername = input.value.trim();
        });
    });
}

/**
 * Set up save button
 */
function setupSaveButton() {
    // Find save buttons
    const saveButtons = document.querySelectorAll('.profile-save-button, #save-profile-button');
    
    // Set up click handlers
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            saveProfile();
        });
    });
}

/**
 * Save profile changes to local storage
 */
function saveProfile() {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) {
        showMessage('No user data found', 'error');
        return;
    }
    
    // Check if we have changes to save
    const hasUsernameChange = window.tempUsername !== undefined;
    const hasPhotoChange = window.tempPhotoUrl !== undefined;
    
    if (!hasUsernameChange && !hasPhotoChange) {
        showMessage('No changes to save', 'info');
        return;
    }
    
    // Create updated user data
    const updatedUserData = {...currentUserData};
    
    // Update username if changed
    if (hasUsernameChange) {
        updatedUserData.username = window.tempUsername;
        updatedUserData.displayName = window.tempUsername;
    }
    
    // Update photo URL if changed
    if (hasPhotoChange) {
        updatedUserData.photoURL = window.tempPhotoUrl;
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
        
        // Update profile display
        updateProfileDisplay(updatedUserData);
        
        // Clear temporary storage
        window.tempUsername = undefined;
        window.tempPhotoUrl = undefined;
        
        showMessage('Profile updated successfully', 'success');
        
        // Trigger a profile update event
        const event = new CustomEvent('profileUpdated', { detail: updatedUserData });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('Error saving profile', 'error');
    }
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
 * Show a message to the user
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Try to find an existing message container
    let messageContainer = document.querySelector('.profile-message, #profile-message');
    
    // Create a new one if not found
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'profile-message';
        messageContainer.id = 'profile-message';
        
        // Find a good place to add it
        const profileContainer = document.querySelector('.profile-container, .profile-section');
        if (profileContainer) {
            profileContainer.appendChild(messageContainer);
        } else {
            // Add to body if no container found
            document.body.appendChild(messageContainer);
            
            // Style it to appear at the bottom of the screen
            messageContainer.style.position = 'fixed';
            messageContainer.style.bottom = '20px';
            messageContainer.style.right = '20px';
            messageContainer.style.zIndex = '9999';
        }
    }
    
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

// Export functions for use in other scripts
window.updateProfileDisplay = updateProfileDisplay;
window.saveProfile = saveProfile;
window.getCurrentUserData = getCurrentUserData;
