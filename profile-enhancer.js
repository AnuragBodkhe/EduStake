/**
 * Profile Enhancer
 * Enhances the user profile system and ensures proper integration with chat messages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile enhancer
    initializeProfileEnhancer();
    
    // Enhance message creation to include profile data
    enhanceMessageCreation();
    
    // Monitor for new messages and apply profile data
    monitorNewMessages();
});

/**
 * Initialize profile enhancer
 */
function initializeProfileEnhancer() {
    // Make sure UserProfileManager is initialized
    if (window.UserProfileManager && window.UserProfileManager.initialize) {
        window.UserProfileManager.initialize();
    }
    
    // Add profile data to existing messages
    enhanceExistingMessages();
    
    console.log('Profile enhancer initialized');
}

/**
 * Enhance existing messages with profile data
 */
function enhanceExistingMessages() {
    // Get current user data
    const currentUser = getCurrentUserData();
    if (!currentUser) return;
    
    // Find all messages
    const messages = document.querySelectorAll('.message, .chat-message');
    
    messages.forEach(message => {
        // Skip system messages
        if (message.classList.contains('system-message')) return;
        
        // Get message sender info
        const senderElement = message.querySelector('.sender-name, .message-user, .message-author');
        if (!senderElement) return;
        
        // Get sender name
        const senderName = senderElement.textContent.trim();
        
        // Check if this is a message from the current user
        const isCurrentUserMessage = 
            senderName === 'Debug User' || 
            senderName === 'Guest User' || 
            (currentUser.username && senderName === currentUser.username) ||
            (currentUser.displayName && senderName === currentUser.displayName);
        
        if (isCurrentUserMessage) {
            // Update sender name
            senderElement.textContent = currentUser.username || currentUser.displayName || 'User';
            
            // Update avatar if present
            const avatarImg = message.querySelector('.message-avatar img, .user-avatar');
            if (avatarImg) {
                avatarImg.src = currentUser.photoURL || getDefaultAvatarUrl(currentUser.username || currentUser.displayName || 'User');
                avatarImg.alt = `${currentUser.username || currentUser.displayName || 'User'}'s avatar`;
            }
        }
    });
}

/**
 * Enhance message creation to include profile data
 */
function enhanceMessageCreation() {
    // Override sendMessageWithAttachment function if it exists
    if (window.sendMessageWithAttachment) {
        const originalSendMessageWithAttachment = window.sendMessageWithAttachment;
        
        window.sendMessageWithAttachment = function(file) {
            // Apply profile data before sending message
            applyProfileDataBeforeSending();
            
            // Call original function
            return originalSendMessageWithAttachment(file);
        };
    }
    
    // Override sendMessage function if it exists
    if (window.sendMessage) {
        const originalSendMessage = window.sendMessage;
        
        window.sendMessage = function(messageText) {
            // Apply profile data before sending message
            applyProfileDataBeforeSending();
            
            // Call original function
            return originalSendMessage(messageText);
        };
    }
    
    // Override sendFinalMessage function if it exists
    if (window.sendFinalMessage) {
        const originalSendFinalMessage = window.sendFinalMessage;
        
        window.sendFinalMessage = function(messageText) {
            // Apply profile data before sending message
            applyProfileDataBeforeSending();
            
            // Call original function
            return originalSendFinalMessage(messageText);
        };
    }
    
    // Set up message input form
    const messageForm = document.querySelector('.message-input-container');
    if (messageForm) {
        const messageInput = messageForm.querySelector('#message-input');
        const sendButton = messageForm.querySelector('#send-button');
        
        if (messageInput && sendButton) {
            // Add event listener to send button
            sendButton.addEventListener('click', function() {
                // Apply profile data before sending message
                applyProfileDataBeforeSending();
            });
            
            // Add event listener to message input for Enter key
            messageInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    // Apply profile data before sending message
                    applyProfileDataBeforeSending();
                }
            });
        }
    }
}

/**
 * Apply profile data before sending a message
 */
function applyProfileDataBeforeSending() {
    // Get current user data
    const currentUser = getCurrentUserData();
    if (!currentUser) return;
    
    // Ensure currentUser in localStorage has the latest profile data
    updateCurrentUserInLocalStorage(currentUser);
}

/**
 * Update currentUser in localStorage with latest profile data
 * @param {Object} currentUser - Current user data
 */
function updateCurrentUserInLocalStorage(currentUser) {
    try {
        // Get current user from localStorage
        const storedUserJson = localStorage.getItem('currentUser');
        if (!storedUserJson) return;
        
        const storedUser = JSON.parse(storedUserJson);
        if (!storedUser || !storedUser.uid) return;
        
        // Check if we need to update
        let needsUpdate = false;
        const updatedUser = {...storedUser};
        
        // Get profile from UserProfileManager if available
        let profileData = null;
        if (window.UserProfileManager && window.UserProfileManager.getProfile) {
            profileData = window.UserProfileManager.getProfile(storedUser.uid);
        }
        
        if (profileData) {
            // Update from profile data
            if (profileData.username && (!updatedUser.username || updatedUser.username !== profileData.username)) {
                updatedUser.username = profileData.username;
                updatedUser.displayName = profileData.username;
                needsUpdate = true;
            }
            
            if (profileData.photoURL && (!updatedUser.photoURL || updatedUser.photoURL !== profileData.photoURL)) {
                updatedUser.photoURL = profileData.photoURL;
                needsUpdate = true;
            }
        } else {
            // Update from currentUser parameter
            if (currentUser.username && (!updatedUser.username || updatedUser.username !== currentUser.username)) {
                updatedUser.username = currentUser.username;
                updatedUser.displayName = currentUser.username;
                needsUpdate = true;
            }
            
            if (currentUser.photoURL && (!updatedUser.photoURL || updatedUser.photoURL !== currentUser.photoURL)) {
                updatedUser.photoURL = currentUser.photoURL;
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('Updated current user in localStorage with latest profile data');
        }
    } catch (error) {
        console.error('Error updating current user in localStorage:', error);
    }
}

/**
 * Monitor for new messages and apply profile data
 */
function monitorNewMessages() {
    // Create a mutation observer to watch for new messages
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.classList.contains('message') || node.classList.contains('chat-message'))) {
                        // Skip system messages
                        if (node.classList.contains('system-message')) return;
                        
                        // Apply profile data to the new message
                        applyProfileDataToMessage(node);
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(chatMessages, { childList: true });
}

/**
 * Apply profile data to a message
 * @param {HTMLElement} messageElement - The message element
 */
function applyProfileDataToMessage(messageElement) {
    // Get current user data
    const currentUser = getCurrentUserData();
    if (!currentUser) return;
    
    // Get message sender info
    const senderElement = messageElement.querySelector('.sender-name, .message-user, .message-author');
    if (!senderElement) return;
    
    // Get sender name
    const senderName = senderElement.textContent.trim();
    
    // Check if this is a message from the current user
    const isCurrentUserMessage = 
        senderName === 'Debug User' || 
        senderName === 'Guest User' || 
        (currentUser.username && senderName === currentUser.username) ||
        (currentUser.displayName && senderName === currentUser.displayName);
    
    if (isCurrentUserMessage) {
        // Update sender name
        senderElement.textContent = currentUser.username || currentUser.displayName || 'User';
        
        // Update avatar if present
        const avatarImg = messageElement.querySelector('.message-avatar img, .user-avatar');
        if (avatarImg) {
            avatarImg.src = currentUser.photoURL || getDefaultAvatarUrl(currentUser.username || currentUser.displayName || 'User');
            avatarImg.alt = `${currentUser.username || currentUser.displayName || 'User'}'s avatar`;
        }
    }
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
window.enhanceExistingMessages = enhanceExistingMessages;
window.applyProfileDataToMessage = applyProfileDataToMessage;
window.getCurrentUserData = getCurrentUserData;
window.getDefaultAvatarUrl = getDefaultAvatarUrl;
