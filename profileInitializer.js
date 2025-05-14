/**
 * Profile Initializer
 * Ensures user profile is properly initialized and saved in local storage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize user profile
    initializeUserProfile();
    
    // Set up chat message form to include user profile
    setupChatMessageForm();
});

/**
 * Initialize user profile in local storage
 */
function initializeUserProfile() {
    try {
        // Check if we have a current user
        const currentUserJson = localStorage.getItem('currentUser');
        if (!currentUserJson) {
            console.warn('No current user found in localStorage');
            return;
        }
        
        const currentUser = JSON.parse(currentUserJson);
        if (!currentUser || !currentUser.uid) {
            console.warn('Invalid user data in localStorage');
            return;
        }
        
        // Ensure we have a UserProfileManager
        if (!window.UserProfileManager) {
            console.warn('UserProfileManager not available');
            return;
        }
        
        // Initialize UserProfileManager
        window.UserProfileManager.initialize();
        
        // Get current profile
        const profile = window.UserProfileManager.getProfile(currentUser.uid);
        
        // If no profile exists, create one
        if (!profile) {
            const newProfile = {
                uid: currentUser.uid,
                username: currentUser.username || currentUser.displayName || 'User',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || null,
                lastUpdated: Date.now()
            };
            
            window.UserProfileManager.updateProfile(currentUser.uid, newProfile);
            console.log('Created new user profile:', newProfile);
        } else {
            // Update current user with profile data if needed
            let needsUpdate = false;
            const updatedUser = {...currentUser};
            
            if (profile.username && (!currentUser.username || currentUser.username !== profile.username)) {
                updatedUser.username = profile.username;
                updatedUser.displayName = profile.username;
                needsUpdate = true;
            }
            
            if (profile.photoURL && (!currentUser.photoURL || currentUser.photoURL !== profile.photoURL)) {
                updatedUser.photoURL = profile.photoURL;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                console.log('Updated current user with profile data:', updatedUser);
            }
        }
    } catch (error) {
        console.error('Error initializing user profile:', error);
    }
}

/**
 * Set up chat message form to include user profile
 */
function setupChatMessageForm() {
    // Find the chat form
    const chatForm = document.querySelector('.chat-input-container form');
    if (!chatForm) {
        console.warn('Chat form not found');
        return;
    }
    
    // Override the form submission
    chatForm.addEventListener('submit', function(event) {
        // Don't prevent default here, as we want the original handler to run
        // We're just adding additional functionality
        
        // Get the message input
        const messageInput = chatForm.querySelector('input[type="text"], textarea');
        if (!messageInput || !messageInput.value.trim()) {
            return;
        }
        
        // Get current user profile
        const currentProfile = window.UserProfileManager ? 
            window.UserProfileManager.getCurrentProfile() : null;
        
        if (currentProfile) {
            // Store the current message with user profile info
            storeCurrentMessage({
                text: messageInput.value.trim(),
                userId: currentProfile.uid,
                username: currentProfile.username,
                photoURL: currentProfile.photoURL,
                timestamp: Date.now()
            });
        }
    });
}

/**
 * Store the current message in local storage
 * @param {Object} messageData - The message data
 */
function storeCurrentMessage(messageData) {
    try {
        // Get existing messages
        const messagesJson = localStorage.getItem('edustake_current_messages') || '[]';
        const messages = JSON.parse(messagesJson);
        
        // Add new message
        messages.push(messageData);
        
        // Keep only the last 50 messages
        if (messages.length > 50) {
            messages.shift();
        }
        
        // Save back to local storage
        localStorage.setItem('edustake_current_messages', JSON.stringify(messages));
        
        console.log('Stored message with user profile:', messageData);
    } catch (error) {
        console.error('Error storing message:', error);
    }
}

// Make functions available globally
window.initializeUserProfile = initializeUserProfile;
window.storeCurrentMessage = storeCurrentMessage;
