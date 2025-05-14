/**
 * Profile Sync
 * Handles synchronization of profile changes across the application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile sync
    initializeProfileSync();
    
    // Listen for profile updates
    listenForProfileUpdates();
});

/**
 * Initialize profile synchronization
 */
function initializeProfileSync() {
    // Apply profile photos to existing messages
    applyProfilestoExistingMessages();
    
    // Update user info in the header
    updateUserInfoInHeader();
    
    console.log('Profile sync initialized');
}

/**
 * Listen for profile updates
 */
function listenForProfileUpdates() {
    // Listen for profile updated event
    document.addEventListener('profileUpdated', function(event) {
        // Get updated profile data
        const updatedProfile = event.detail;
        
        if (!updatedProfile) return;
        
        console.log('Profile updated event received:', updatedProfile);
        
        // Apply profile changes to all messages
        applyProfilestoExistingMessages();
        
        // Update user info in the header
        updateUserInfoInHeader();
        
        // Show success toast
        if (window.showToast) {
            window.showToast('Profile updated successfully!', 'success');
        }
    });
}

/**
 * Apply profile photos to existing messages
 */
function applyProfilestoExistingMessages() {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) return;
    
    // Find all messages
    const messages = document.querySelectorAll('.message, .chat-message');
    
    messages.forEach(message => {
        // Check if this is a user message (not system message)
        if (message.classList.contains('system-message')) return;
        
        // Get message user info
        const messageUserElement = message.querySelector('.message-user, .message-author');
        if (!messageUserElement) return;
        
        // Get message text
        const messageText = messageUserElement.textContent.trim();
        
        // Check if this is a message from the current user
        const isCurrentUserMessage = 
            messageText.includes('Debug User') || 
            messageText.includes('Guest User') || 
            (currentUserData.username && messageText.includes(currentUserData.username)) ||
            (currentUserData.displayName && messageText.includes(currentUserData.displayName));
        
        if (isCurrentUserMessage) {
            // Update username
            messageUserElement.textContent = currentUserData.username || currentUserData.displayName || 'User';
            
            // Update avatar if present
            const avatarImg = message.querySelector('.message-avatar img, .user-avatar img');
            if (avatarImg) {
                avatarImg.src = currentUserData.photoURL || getDefaultAvatarUrl(currentUserData.username || currentUserData.displayName || 'User');
                avatarImg.alt = currentUserData.username || currentUserData.displayName || 'User Avatar';
            }
        }
    });
}

/**
 * Update user info in the header
 */
function updateUserInfoInHeader() {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) return;
    
    // Update username displays
    const usernameDisplays = document.querySelectorAll('.user-display-name, #username');
    usernameDisplays.forEach(display => {
        if (display) display.textContent = currentUserData.username || currentUserData.displayName || 'User';
    });
    
    // Update email displays
    const emailDisplays = document.querySelectorAll('.user-email, .profile-id');
    emailDisplays.forEach(display => {
        if (display) {
            const email = currentUserData.email || '';
            display.textContent = email ? email : '@' + (currentUserData.username || 'user').toLowerCase().replace(/\s+/g, '');
        }
    });
    
    // Update avatar displays
    const avatarDisplays = document.querySelectorAll('.avatar-img, .profile-avatar img');
    avatarDisplays.forEach(display => {
        if (display && display.tagName === 'IMG') {
            display.src = currentUserData.photoURL || getDefaultAvatarUrl(currentUserData.username || currentUserData.displayName || 'User');
        }
    });
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
 * Get default avatar URL for a username
 * @param {string} username - Username
 * @returns {string} Default avatar URL
 */
function getDefaultAvatarUrl(username) {
    // Use UserProfileManager if available
    if (window.UserProfileManager && window.UserProfileManager.getDefaultAvatarURL) {
        return window.UserProfileManager.getDefaultAvatarURL(username);
    }
    
    // Generate a color based on the username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a color
    const color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
    
    // Get first letter of username
    const initial = username.charAt(0).toUpperCase();
    
    // Create a data URL for a simple SVG with the initial
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="50%" dy=".35em" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${initial}</text></svg>`;
}

/**
 * Show a toast message
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Style toast
    toast.style.backgroundColor = type === 'success' ? '#43b581' : type === 'error' ? '#f04747' : '#5865f2';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        
        // Remove after animation
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// Make functions available globally
window.applyProfilestoExistingMessages = applyProfilestoExistingMessages;
window.updateUserInfoInHeader = updateUserInfoInHeader;
window.showToast = showToast;
