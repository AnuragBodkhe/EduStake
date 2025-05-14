/**
 * Profile Integration
 * Integrates profile editor with chat interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set up profile editor button
    setupProfileEditorButton();
    
    // Listen for profile updates
    listenForProfileUpdates();
    
    // Update all profile displays
    updateAllProfileDisplays();
});

/**
 * Set up profile editor button
 */
function setupProfileEditorButton() {
    // Find edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (!editProfileBtn) return;
    
    // Add click event listener
    editProfileBtn.addEventListener('click', function() {
        // Close dropdown
        const dropdown = document.querySelector('.profile-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        
        // Show quick profile editor
        showQuickProfileEditor();
    });
    
    // Find quick view profile button
    const quickViewProfileBtn = document.getElementById('quick-view-profile');
    if (!quickViewProfileBtn) return;
    
    // Add click event listener
    quickViewProfileBtn.addEventListener('click', function() {
        // Show quick profile editor
        showQuickProfileEditor();
    });
}

/**
 * Show quick profile editor
 */
function showQuickProfileEditor() {
    // Find chat area
    const chatArea = document.querySelector('.chat-area');
    if (!chatArea) return;
    
    // Check if editor already exists
    if (document.getElementById('quick-profile-editor')) return;
    
    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'quick-profile-editor-container';
    editorContainer.style.position = 'absolute';
    editorContainer.style.top = '50%';
    editorContainer.style.left = '50%';
    editorContainer.style.transform = 'translate(-50%, -50%)';
    editorContainer.style.zIndex = '1000';
    editorContainer.style.width = '90%';
    editorContainer.style.maxWidth = '500px';
    
    // Add to chat area
    chatArea.appendChild(editorContainer);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'profile-editor-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Close editor when clicking overlay
    overlay.addEventListener('click', function() {
        // Remove editor and overlay
        if (editorContainer.parentNode) editorContainer.parentNode.removeChild(editorContainer);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    
    // Create quick profile editor
    if (window.createQuickProfileEditor) {
        window.createQuickProfileEditor(editorContainer, function(updatedUserData) {
            // Update all profile displays
            updateAllProfileDisplays();
            
            // Remove overlay
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            
            // Show success toast
            showToast('Profile updated successfully!', 'success');
        });
    }
}

/**
 * Listen for profile updates
 */
function listenForProfileUpdates() {
    // Listen for profile updated event
    document.addEventListener('profileUpdated', function(event) {
        // Update all profile displays
        updateAllProfileDisplays();
    });
}

/**
 * Update all profile displays
 */
function updateAllProfileDisplays() {
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
    const avatarDisplays = document.querySelectorAll('.avatar-img, .user-avatar');
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
    
    // Fallback to ui-avatars.com
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
}

/**
 * Show a toast message
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Check if showToast function exists in global scope
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
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
