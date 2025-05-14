/**
 * Avatar Enhancer
 * Enhances the user avatar functionality and profile display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize avatar enhancer
    initializeAvatarEnhancer();
    
    // Set up profile button clicks
    setupProfileButtonClicks();
});

/**
 * Initialize avatar enhancer
 */
function initializeAvatarEnhancer() {
    // Update avatar with current user data
    updateUserAvatar();
    
    // Listen for profile updates
    document.addEventListener('profileUpdated', function(event) {
        // Update avatar when profile is updated
        updateUserAvatar();
    });
    
    console.log('Avatar enhancer initialized');
}

/**
 * Update user avatar with current user data
 */
function updateUserAvatar() {
    // Get current user data
    const currentUserData = getCurrentUserData();
    if (!currentUserData) return;
    
    // Find avatar image
    const avatarImg = document.querySelector('.profile-avatar img.avatar-img');
    if (!avatarImg) return;
    
    // Update avatar image
    avatarImg.src = currentUserData.photoURL || getDefaultAvatarUrl(currentUserData.username || currentUserData.displayName || 'User');
    avatarImg.alt = `${currentUserData.username || currentUserData.displayName || 'User'}'s avatar`;
    
    // Add click event to avatar for quick profile view
    avatarImg.style.cursor = 'pointer';
    avatarImg.addEventListener('click', function() {
        showUserProfileModal(currentUserData);
    });
}

/**
 * Set up profile button clicks
 */
function setupProfileButtonClicks() {
    // Find view profile button
    const viewProfileBtn = document.getElementById('view-profile-btn');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function() {
            const currentUserData = getCurrentUserData();
            if (currentUserData) {
                showUserProfileModal(currentUserData);
            }
        });
    }
    
    // Find edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Close dropdown
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown) dropdown.style.display = 'none';
            
            // Show profile editor
            if (window.createQuickProfileEditor) {
                const container = document.createElement('div');
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
                
                window.createQuickProfileEditor(container, function() {
                    // Update avatar after profile edit
                    updateUserAvatar();
                    
                    // Remove container
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                });
            }
        });
    }
}

/**
 * Show user profile modal
 * @param {Object} userData - User data
 */
function showUserProfileModal(userData) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'profile-modal-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.zIndex = '9999';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'profile-modal-content';
    modalContent.style.backgroundColor = 'var(--bg-secondary, #2f3136)';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '24px';
    modalContent.style.maxWidth = '400px';
    modalContent.style.width = '90%';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '12px';
    closeButton.style.right = '12px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.color = 'var(--text-muted, #a3a6aa)';
    closeButton.style.cursor = 'pointer';
    
    // Add click event to close button
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    
    // Create profile header
    const profileHeader = document.createElement('div');
    profileHeader.className = 'profile-header';
    profileHeader.style.display = 'flex';
    profileHeader.style.flexDirection = 'column';
    profileHeader.style.alignItems = 'center';
    profileHeader.style.marginBottom = '24px';
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'profile-avatar-large';
    avatar.style.width = '120px';
    avatar.style.height = '120px';
    avatar.style.borderRadius = '50%';
    avatar.style.overflow = 'hidden';
    avatar.style.marginBottom = '16px';
    avatar.style.border = '4px solid var(--primary, #5865f2)';
    
    const avatarImg = document.createElement('img');
    avatarImg.src = userData.photoURL || getDefaultAvatarUrl(userData.username || userData.displayName || 'User');
    avatarImg.alt = `${userData.username || userData.displayName || 'User'}'s avatar`;
    avatarImg.style.width = '100%';
    avatarImg.style.height = '100%';
    avatarImg.style.objectFit = 'cover';
    
    avatar.appendChild(avatarImg);
    
    // Create username
    const username = document.createElement('h2');
    username.className = 'profile-username';
    username.textContent = userData.username || userData.displayName || 'User';
    username.style.fontSize = '24px';
    username.style.fontWeight = '600';
    username.style.color = 'var(--text-normal, #dcddde)';
    username.style.margin = '0 0 4px 0';
    
    // Create email
    const email = document.createElement('div');
    email.className = 'profile-email';
    email.textContent = userData.email || `@${(userData.username || 'user').toLowerCase().replace(/\s+/g, '')}`;
    email.style.fontSize = '16px';
    email.style.color = 'var(--text-muted, #a3a6aa)';
    
    // Add elements to profile header
    profileHeader.appendChild(avatar);
    profileHeader.appendChild(username);
    profileHeader.appendChild(email);
    
    // Create profile info
    const profileInfo = document.createElement('div');
    profileInfo.className = 'profile-info';
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-profile-button';
    editButton.textContent = 'Edit Profile';
    editButton.style.backgroundColor = 'var(--primary, #5865f2)';
    editButton.style.color = 'white';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '4px';
    editButton.style.padding = '10px 16px';
    editButton.style.fontSize = '16px';
    editButton.style.fontWeight = '500';
    editButton.style.cursor = 'pointer';
    editButton.style.marginTop = '16px';
    editButton.style.width = '100%';
    
    // Add click event to edit button
    editButton.addEventListener('click', function() {
        // Close modal
        document.body.removeChild(modalContainer);
        
        // Show profile editor
        if (window.createQuickProfileEditor) {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            
            window.createQuickProfileEditor(container, function() {
                // Update avatar after profile edit
                updateUserAvatar();
                
                // Remove container
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            });
        }
    });
    
    // Add elements to profile info
    profileInfo.appendChild(editButton);
    
    // Add elements to modal content
    modalContent.appendChild(closeButton);
    modalContent.appendChild(profileHeader);
    modalContent.appendChild(profileInfo);
    
    // Add modal content to modal container
    modalContainer.appendChild(modalContent);
    
    // Add modal container to body
    document.body.appendChild(modalContainer);
}

/**
 * Get current user data from local storage
 * @returns {Object|null} Current user data or null if not found
 */
function getCurrentUserData() {
    try {
        // Try to get from UserProfileManager first
        if (window.UserProfileManager && window.UserProfileManager.getCurrentProfile) {
            const profile = window.UserProfileManager.getCurrentProfile();
            if (profile) return profile;
        }
        
        // Fall back to localStorage
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

// Make functions available globally
window.updateUserAvatar = updateUserAvatar;
window.showUserProfileModal = showUserProfileModal;
