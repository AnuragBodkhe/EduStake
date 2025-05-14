/**
 * Chat Enhancements
 * Adds profile photos and usernames to chat messages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UserProfileManager if available
    if (window.UserProfileManager) {
        window.UserProfileManager.initialize();
        console.log('UserProfileManager initialized for chat enhancements');
    }
    
    // Apply profile photos to existing messages
    applyProfilePhotosToExistingMessages();
    
    // Set up observers to apply profile photos to new messages
    setupMessageObservers();
});

/**
 * Apply profile photos to existing messages
 */
function applyProfilePhotosToExistingMessages() {
    // Find all messages
    const messages = document.querySelectorAll('.message, .chat-message');
    
    // Get current user profile
    const currentUserProfile = getCurrentUserProfile();
    
    messages.forEach(message => {
        // Check if this is a Debug User or Guest User message
        const usernameElement = message.querySelector('.sender-name, .username');
        if (usernameElement && (usernameElement.textContent.trim() === 'Debug User' || usernameElement.textContent.trim() === 'Guest User')) {
            // Replace with current user's info
            replaceWithCurrentUser(message, currentUserProfile);
        } else {
            // Apply normal profile enhancements
            enhanceMessageWithProfileInfo(message);
        }
    });
    
    console.log(`Applied profile enhancements to ${messages.length} existing messages`);
}

/**
 * Set up observers to apply profile photos to new messages
 */
function setupMessageObservers() {
    // Find the chat messages container
    const chatContainer = document.querySelector('.chat-messages');
    if (!chatContainer) return;
    
    // Get current user profile
    const currentUserProfile = getCurrentUserProfile();
    
    // Create a mutation observer to watch for new messages
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (node.classList.contains('message') || node.classList.contains('chat-message'))) {
                        // Check if this is a Debug User or Guest User message
                        const usernameElement = node.querySelector('.sender-name, .username');
                        if (usernameElement && (usernameElement.textContent.trim() === 'Debug User' || usernameElement.textContent.trim() === 'Guest User')) {
                            // Replace with current user's info
                            replaceWithCurrentUser(node, currentUserProfile);
                        } else {
                            // Apply normal profile enhancements
                            enhanceMessageWithProfileInfo(node);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(chatContainer, { childList: true });
    
    console.log('Message observer set up for chat enhancements');
}

/**
 * Replace Debug User or Guest User with current user's info
 * @param {HTMLElement} messageElement - The message element to update
 * @param {Object} currentUserProfile - The current user's profile
 */
function replaceWithCurrentUser(messageElement, currentUserProfile) {
    // Skip if already processed
    if (messageElement.hasAttribute('data-user-replaced')) return;
    
    // Mark as processed
    messageElement.setAttribute('data-user-replaced', 'true');
    
    // Find the username element
    const usernameElement = messageElement.querySelector('.sender-name, .username');
    if (usernameElement) {
        usernameElement.textContent = currentUserProfile.username;
    }
    
    // Find the avatar element
    const avatarElement = messageElement.querySelector('.message-avatar');
    const avatarImage = avatarElement ? avatarElement.querySelector('img') : null;
    
    if (avatarImage) {
        // Update existing avatar image
        avatarImage.src = currentUserProfile.profilePic;
        avatarImage.alt = `${currentUserProfile.username}'s avatar`;
    } else if (avatarElement) {
        // Create new avatar image
        const newAvatarImage = document.createElement('img');
        newAvatarImage.src = currentUserProfile.profilePic;
        newAvatarImage.alt = `${currentUserProfile.username}'s avatar`;
        newAvatarImage.className = 'user-avatar';
        avatarElement.innerHTML = '';
        avatarElement.appendChild(newAvatarImage);
    } else {
        // Create avatar element if it doesn't exist
        createAndAddAvatarElement(messageElement, currentUserProfile);
    }
    
    // Update user ID attribute
    messageElement.setAttribute('data-user-id', currentUserProfile.uid);
    
    console.log(`Replaced Debug/Guest User with ${currentUserProfile.username} in message`);
}

/**
 * Enhance a message with profile information
 * @param {HTMLElement} messageElement - The message element to enhance
 */
function enhanceMessageWithProfileInfo(messageElement) {
    // Skip if already processed
    if (messageElement.hasAttribute('data-profile-enhanced')) return;
    
    // Mark as processed
    messageElement.setAttribute('data-profile-enhanced', 'true');
    
    // Try to get message ID
    const messageId = messageElement.getAttribute('data-message-id');
    
    // Try to get user ID from message
    const userId = messageElement.getAttribute('data-user-id');
    
    // Try to get username from message
    const usernameElement = messageElement.querySelector('.sender-name, .username');
    const username = usernameElement ? usernameElement.textContent.trim() : '';
    
    // Try to get user profile
    let userProfile = null;
    
    // If we have a message ID, try to get the message from local storage
    if (messageId) {
        try {
            // Check saved messages
            const savedMessagesJson = localStorage.getItem('edustake_saved_chats');
            if (savedMessagesJson) {
                const savedMessages = JSON.parse(savedMessagesJson);
                const message = savedMessages.find(msg => msg.id === messageId);
                if (message && message.username && message.photoURL) {
                    userProfile = {
                        username: message.username,
                        photoURL: message.photoURL
                    };
                }
            }
            
            // Check current messages if not found in saved
            if (!userProfile) {
                const currentMessagesJson = localStorage.getItem('edustake_current_messages');
                if (currentMessagesJson) {
                    const currentMessages = JSON.parse(currentMessagesJson);
                    const message = currentMessages.find(msg => msg.id === messageId);
                    if (message && message.username && message.photoURL) {
                        userProfile = {
                            username: message.username,
                            photoURL: message.photoURL
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('Error getting message from storage:', error);
        }
    }
    
    if (userProfile) {
        // Find the avatar element
        const avatarElement = messageElement.querySelector('.message-avatar');
        const avatarImage = avatarElement ? avatarElement.querySelector('img') : null;
        
        if (avatarImage) {
            // Update existing avatar image
            avatarImage.src = userProfile.photoURL;
            avatarImage.alt = `${userProfile.username}'s avatar`;
        } else if (avatarElement && !avatarImage) {
            const newAvatarImage = document.createElement('img');
            newAvatarImage.src = userProfile.photoURL;
            newAvatarImage.alt = `${userProfile.username}'s avatar`;
            newAvatarImage.className = 'user-avatar';
            avatarElement.innerHTML = '';
            avatarElement.appendChild(newAvatarImage);
        } else if (!avatarElement && userProfile.photoURL) {
            // Create avatar element if it doesn't exist
            createAndAddAvatarElement(messageElement, userProfile);
        }
        
        // Add user ID to message
        messageElement.setAttribute('data-user-id', userId);
    } else if (username) {
        // If we don't have a profile but have a username, create a default avatar
        const defaultAvatarUrl = window.UserProfileManager.getDefaultAvatarURL(username);
        
        if (avatarImage) {
            avatarImage.src = defaultAvatarUrl;
        } else if (avatarElement && !avatarImage) {
            const newAvatarImage = document.createElement('img');
            newAvatarImage.src = defaultAvatarUrl;
            newAvatarImage.alt = 'Avatar';
            newAvatarImage.className = 'user-avatar';
            avatarElement.innerHTML = '';
            avatarElement.appendChild(newAvatarImage);
        } else if (!avatarElement) {
            // Create avatar element with default avatar
            createAndAddAvatarElement(messageElement, { photoURL: defaultAvatarUrl, username });
            messageElement.setAttribute('data-user-id', userId);
        } else if (username) {
            // If we don't have a profile but have a username, create a default avatar
            const defaultAvatarUrl = window.UserProfileManager.getDefaultAvatarURL(username);
            
            if (avatarImage) {
                avatarImage.src = defaultAvatarUrl;
            } else if (avatarElement && !avatarImage) {
                const newAvatarImage = document.createElement('img');
                newAvatarImage.src = defaultAvatarUrl;
                newAvatarImage.alt = 'Avatar';
                newAvatarImage.className = 'user-avatar';
                avatarElement.innerHTML = '';
                avatarElement.appendChild(newAvatarImage);
            } else if (!avatarElement) {
                // Create avatar element with default avatar
                createAndAddAvatarElement(messageElement, { photoURL: defaultAvatarUrl, username });
            }
        }
    }
}

/**
 * Create and add an avatar element to a message
 * @param {HTMLElement} messageElement - The message element
 * @param {Object} userProfile - The user profile
 */
function createAndAddAvatarElement(messageElement, userProfile) {
    // Create avatar element
    const avatarElement = document.createElement('div');
    avatarElement.className = 'message-avatar';
    
    // Create avatar image
    const avatarImage = document.createElement('img');
    avatarImage.src = userProfile.photoURL;
    avatarImage.alt = 'Avatar';
    avatarImage.className = 'user-avatar';
    
    // Add avatar image to avatar element
    avatarElement.appendChild(avatarImage);
    
    // Find where to insert the avatar
    const messageHeader = messageElement.querySelector('.message-header');
    const messageInfo = messageElement.querySelector('.message-info');
    
    if (messageHeader && !messageInfo) {
        // If we have a message header but no message info, insert before the first child
        messageHeader.insertBefore(avatarElement, messageHeader.firstChild);
        
        // Create message info to wrap the existing content
        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';
        
        // Move all children except the avatar to message info
        while (messageHeader.childNodes.length > 1) {
            messageInfo.appendChild(messageHeader.childNodes[1]);
        }
        
        // Add message info to message header
        messageHeader.appendChild(messageInfo);
    } else if (!messageHeader) {
        // If we don't have a message header, insert at the beginning of the message
        messageElement.insertBefore(avatarElement, messageElement.firstChild);
    }
    
    // Add styles for avatars if needed
    addAvatarStyles();
}

/**
 * Add styles for avatars if they don't exist
 */
function addAvatarStyles() {
    if (document.getElementById('chat-avatar-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'chat-avatar-styles';
    style.textContent = `
        .message-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px;
            flex-shrink: 0;
        }
        
        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .message-header {
            display: flex;
            align-items: center;
        }
        
        .message-info {
            flex: 1;
            min-width: 0;
        }
        
        .message, .chat-message {
            display: flex;
            align-items: flex-start;
        }
        
        .message-content {
            flex: 1;
            min-width: 0;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Get current user profile
 * @returns {Object} The current user profile
 */
function getCurrentUserProfile() {
    // Try to get from UserProfileManager
    if (window.UserProfileManager) {
        const profile = window.UserProfileManager.getCurrentProfile();
        if (profile) {
            return {
                username: profile.username || 'Guest User',
                email: profile.email || 'guest@example.com',
                profilePic: profile.photoURL || window.UserProfileManager.getDefaultAvatarURL(profile.username || 'Guest User'),
                uid: profile.uid || 'guest'
            };
        }
    }
    
    // Fallback to localStorage
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            return {
                username: currentUser.username || currentUser.displayName || 'Guest User',
                email: currentUser.email || 'guest@example.com',
                profilePic: currentUser.photoURL || 'https://via.placeholder.com/40',
                uid: currentUser.uid || 'guest'
            };
        }
    } catch (e) {
        console.warn('Could not get current user from localStorage:', e);
    }
    
    // Default user
    return {
        username: 'Guest User',
        email: 'guest@example.com',
        profilePic: 'https://via.placeholder.com/40',
        uid: 'guest'
    };
}

// Export getCurrentUserProfile for other scripts to use
window.getCurrentUserProfile = getCurrentUserProfile;
