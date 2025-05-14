/**
 * Saved Chats
 * Manages saved chat messages and conversations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize saved chats
    initializeSavedChats();
    
    // Set up save message functionality
    setupSaveMessageFunctionality();
});

/**
 * Initialize saved chats
 */
function initializeSavedChats() {
    // Handle saved messages silently
    handleSavedMessages();
    
    console.log('Saved chats initialized');
}

/**
 * Create saved chats container
 */
function createSavedChatsContainer() {
    // Check if container already exists
    if (document.querySelector('.saved-chats-container')) return;
    
    // Create saved chats container in the chat area
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Create saved chats container
    const savedChatsContainer = document.createElement('div');
    savedChatsContainer.className = 'saved-chats-container';
    savedChatsContainer.style.display = 'none';
    savedChatsContainer.innerHTML = `
        <div class="saved-chats-list"></div>
    `;
    
    // Add saved chats container to chat messages
    chatMessages.parentNode.appendChild(savedChatsContainer);
    
    // Add styles for saved chats
    addSavedChatsStyles();
}

/**
 * Create saved messages section
 * @returns {HTMLElement} Saved messages section
 */
function createSavedMessagesSection() {
    // Find chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return null;
    
    // Create section
    const savedMessagesSection = document.createElement('div');
    savedMessagesSection.className = 'saved-messages-section';
    
    // Add to chat messages
    chatMessages.appendChild(savedMessagesSection);
    
    return savedMessagesSection;
}

/**
 * Handle saved messages silently
 */
function handleSavedMessages() {
    // Instead of displaying saved messages in the UI,
    // we'll just keep the functionality to save messages
    // but not display them in a dedicated section
    console.log('Saved messages handling initialized');
}

/**
 * Load saved chats (silently, no UI display)
 */
function loadSavedChats() {
    // This function now just loads the saved chats into memory
    // but doesn't display them in the UI
    
    // Get saved chats from localStorage
    const savedChatsJson = localStorage.getItem('edustake_saved_chats');
    const savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
    
    // We're not displaying them, but we're still loading them
    // so they can be accessed by other functions like search
    console.log(`Loaded ${savedChats.length} saved messages silently`);
    
    return savedChats;
}

/**
 * Group chats by date
 * @param {Array} chats - Array of chat objects
 * @returns {Object} Object with dates as keys and arrays of chats as values
 */
function groupChatsByDate(chats) {
    const grouped = {};
    
    chats.forEach(chat => {
        const date = new Date(chat.timestamp);
        const dateString = date.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (!grouped[dateString]) {
            grouped[dateString] = [];
        }
        
        grouped[dateString].push(chat);
    });
    
    return grouped;
}

/**
 * Create saved chat item
 * @param {Object} chat - Chat object
 * @returns {HTMLElement} Chat item element
 */
function createSavedChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.className = 'saved-chat-item';
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'saved-chat-avatar';
    
    const avatarImg = document.createElement('img');
    avatarImg.src = chat.photoURL || getDefaultAvatarUrl(chat.username || 'User');
    avatarImg.alt = `${chat.username || 'User'}'s avatar`;
    
    avatar.appendChild(avatarImg);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'saved-chat-content';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'saved-chat-header';
    
    const username = document.createElement('div');
    username.className = 'saved-chat-username';
    username.textContent = chat.username || 'User';
    
    const time = document.createElement('div');
    time.className = 'saved-chat-time';
    time.textContent = new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    header.appendChild(username);
    header.appendChild(time);
    
    // Create message
    const message = document.createElement('div');
    message.className = 'saved-chat-message';
    message.textContent = chat.text || '';
    
    // Add file attachment if present
    if (chat.file) {
        const fileAttachment = document.createElement('div');
        fileAttachment.className = 'saved-chat-file';
        
        if (chat.file.type.startsWith('image/')) {
            // For images, show a thumbnail
            const img = document.createElement('img');
            img.src = chat.file.url;
            img.alt = chat.file.name;
            fileAttachment.appendChild(img);
        } else {
            // For other files, show an icon and name
            fileAttachment.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${chat.file.name}</span>
            `;
        }
        
        message.appendChild(fileAttachment);
    }
    
    // Add elements to content
    content.appendChild(header);
    content.appendChild(message);
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'saved-chat-actions';
    
    const viewButton = document.createElement('button');
    viewButton.className = 'saved-chat-action';
    viewButton.title = 'View in chat';
    viewButton.innerHTML = '<i class="fas fa-eye"></i>';
    
    viewButton.addEventListener('click', function() {
        // TODO: Implement view in chat functionality
        alert('View in chat functionality coming soon!');
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'saved-chat-action';
    deleteButton.title = 'Remove from saved';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    
    deleteButton.addEventListener('click', function() {
        removeSavedChat(chat.id);
        chatItem.remove();
        
        // Check if there are no more chats
        if (getSavedChats().length === 0) {
            loadSavedChats(); // Reload to show empty state
        }
    });
    
    actions.appendChild(viewButton);
    actions.appendChild(deleteButton);
    
    // Add elements to chat item
    chatItem.appendChild(avatar);
    chatItem.appendChild(content);
    chatItem.appendChild(actions);
    
    return chatItem;
}

/**
 * Set up save message functionality
 */
function setupSaveMessageFunctionality() {
    // Add save button to all existing messages
    addSaveButtonToExistingMessages();
    
    // Monitor for new messages
    monitorForNewMessages();
}

/**
 * Add save button to existing messages
 */
function addSaveButtonToExistingMessages() {
    // Find all messages
    const messages = document.querySelectorAll('.message, .chat-message');
    
    messages.forEach(message => {
        // Skip system messages
        if (message.classList.contains('system-message')) return;
        
        // Skip if already has save button
        if (message.querySelector('.save-message-button')) return;
        
        // Add save button
        addSaveButtonToMessage(message);
    });
}

/**
 * Add save button to a message
 * @param {HTMLElement} messageElement - Message element
 */
function addSaveButtonToMessage(messageElement) {
    // Create save button
    const saveButton = document.createElement('button');
    saveButton.className = 'message-action save-message-button';
    saveButton.title = 'Save message';
    saveButton.innerHTML = '<i class="far fa-bookmark"></i>';
    
    // Add click event
    saveButton.addEventListener('click', function() {
        // Toggle saved state
        const isSaved = saveButton.classList.contains('saved');
        
        if (isSaved) {
            // Unsave message
            saveButton.classList.remove('saved');
            saveButton.innerHTML = '<i class="far fa-bookmark"></i>';
            
            // Remove from saved chats
            const messageId = messageElement.dataset.messageId;
            if (messageId) {
                removeSavedChat(messageId);
            }
        } else {
            // Save message
            saveButton.classList.add('saved');
            saveButton.innerHTML = '<i class="fas fa-bookmark"></i>';
            
            // Add to saved chats
            saveMessage(messageElement);
        }
    });
    
    // Find message actions container or create one
    let actionsContainer = messageElement.querySelector('.message-actions');
    
    if (!actionsContainer) {
        actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions';
        
        // Find where to insert actions
        const messageContent = messageElement.querySelector('.message-content');
        if (messageContent) {
            messageContent.appendChild(actionsContainer);
        } else {
            messageElement.appendChild(actionsContainer);
        }
    }
    
    // Add save button to actions
    actionsContainer.appendChild(saveButton);
    
    // Check if message is already saved
    const messageId = messageElement.dataset.messageId;
    if (messageId) {
        const savedChats = getSavedChats();
        const isSaved = savedChats.some(chat => chat.id === messageId);
        
        if (isSaved) {
            saveButton.classList.add('saved');
            saveButton.innerHTML = '<i class="fas fa-bookmark"></i>';
        }
    } else {
        // Generate a message ID if not present
        messageElement.dataset.messageId = generateMessageId();
    }
}

/**
 * Monitor for new messages
 */
function monitorForNewMessages() {
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
                        
                        // Add save button to the new message
                        addSaveButtonToMessage(node);
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(chatMessages, { childList: true });
}

/**
 * Save a message
 * @param {HTMLElement} messageElement - Message element
 */
function saveMessage(messageElement) {
    // Get message data
    const messageId = messageElement.dataset.messageId || generateMessageId();
    
    // Ensure message has an ID
    if (!messageElement.dataset.messageId) {
        messageElement.dataset.messageId = messageId;
    }
    
    // Get message content
    const messageContent = messageElement.querySelector('.message-content');
    const messageText = messageContent ? messageContent.textContent.trim() : '';
    
    // Get sender info
    const senderElement = messageElement.querySelector('.sender-name, .message-user, .message-author');
    const username = senderElement ? senderElement.textContent.trim() : 'User';
    
    // Get avatar
    const avatarImg = messageElement.querySelector('.message-avatar img, .user-avatar');
    const photoURL = avatarImg ? avatarImg.src : null;
    
    // Get timestamp
    const timeElement = messageElement.querySelector('.message-time');
    const timestamp = timeElement ? 
        new Date(timeElement.dataset.timestamp || Date.now()).getTime() : 
        Date.now();
    
    // Check for file attachment
    let file = null;
    const attachment = messageElement.querySelector('.attachment');
    if (attachment) {
        const fileNameElement = attachment.querySelector('.file-name');
        const fileName = fileNameElement ? fileNameElement.textContent.trim() : 'File';
        
        const fileImage = attachment.querySelector('img');
        const fileUrl = fileImage ? fileImage.src : null;
        
        file = {
            name: fileName,
            url: fileUrl,
            type: fileImage ? 'image/jpeg' : 'application/octet-stream'
        };
    }
    
    // Create chat object
    const chat = {
        id: messageId,
        text: messageText,
        username: username,
        photoURL: photoURL,
        timestamp: timestamp,
        file: file
    };
    
    // Add to saved chats
    addSavedChat(chat);
}

/**
 * Add a chat to saved chats
 * @param {Object} chat - Chat object
 */
function addSavedChat(chat) {
    // Get existing saved chats
    const savedChats = getSavedChats();
    
    // Check if already saved
    const existingIndex = savedChats.findIndex(item => item.id === chat.id);
    
    if (existingIndex !== -1) {
        // Update existing chat
        savedChats[existingIndex] = chat;
    } else {
        // Add new chat
        savedChats.push(chat);
    }
    
    // Save to localStorage
    localStorage.setItem('edustake_saved_chats', JSON.stringify(savedChats));
    
    console.log('Chat saved:', chat);
}

/**
 * Remove a chat from saved chats
 * @param {string} chatId - Chat ID
 */
function removeSavedChat(chatId) {
    // Get existing saved chats
    const savedChats = getSavedChats();
    
    // Filter out the chat to remove
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    
    // Save to localStorage
    localStorage.setItem('edustake_saved_chats', JSON.stringify(updatedChats));
    
    console.log('Chat removed:', chatId);
    
    // Update save button if message is visible
    const messageElement = document.querySelector(`[data-message-id="${chatId}"]`);
    if (messageElement) {
        const saveButton = messageElement.querySelector('.save-message-button');
        if (saveButton) {
            saveButton.classList.remove('saved');
            saveButton.innerHTML = '<i class="far fa-bookmark"></i>';
        }
    }
}

/**
 * Get saved chats from localStorage
 * @returns {Array} Array of saved chat objects
 */
function getSavedChats() {
    try {
        const savedChatsJson = localStorage.getItem('edustake_saved_chats');
        return savedChatsJson ? JSON.parse(savedChatsJson) : [];
    } catch (error) {
        console.error('Error getting saved chats:', error);
        return [];
    }
}

/**
 * Generate a unique message ID
 * @returns {string} Unique ID
 */
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
 * Add styles for saved chats
 */
function addSavedChatsStyles() {
    // Check if styles already exist
    if (document.getElementById('saved-chats-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'saved-chats-styles';
    
    // Add styles
    style.textContent = `
        .saved-chats-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background-color: var(--bg-primary, #36393f);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
        }
        
        .saved-chats-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        
        .saved-chats-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted, #a3a6aa);
            text-align: center;
            padding: 20px;
        }
        
        .saved-chats-empty i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        .saved-chats-empty p {
            margin: 8px 0;
        }
        
        .saved-chats-empty-hint {
            font-size: 12px;
            opacity: 0.7;
        }
        
        .saved-chats-date {
            padding: 8px 4px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted, #a3a6aa);
            text-transform: uppercase;
            margin-top: 8px;
        }
        
        .saved-chat-item {
            display: flex;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 4px;
            transition: background-color 0.2s ease;
        }
        
        .saved-chat-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        .saved-chat-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .saved-chat-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .saved-chat-content {
            flex: 1;
            min-width: 0;
        }
        
        .saved-chat-header {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }
        
        .saved-chat-username {
            font-weight: 600;
            color: var(--text-normal, #dcddde);
            margin-right: 8px;
        }
        
        .saved-chat-time {
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .saved-chat-message {
            color: var(--text-normal, #dcddde);
            word-break: break-word;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .saved-chat-file {
            display: flex;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 6px 8px;
            margin-top: 4px;
            font-size: 12px;
        }
        
        .saved-chat-file img {
            max-width: 100%;
            max-height: 150px;
            border-radius: 4px;
            margin-top: 4px;
        }
        
        .saved-chat-file i {
            margin-right: 6px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .saved-chat-actions {
            display: flex;
            flex-direction: column;
            margin-left: 8px;
        }
        
        .saved-chat-action {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 4px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        
        .saved-chat-action:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-normal, #dcddde);
        }
        
        .message-actions {
            display: flex;
            position: absolute;
            top: 4px;
            right: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .message:hover .message-actions,
        .chat-message:hover .message-actions {
            opacity: 1;
        }
        
        .message-action {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 4px;
            margin-left: 4px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        
        .message-action:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-normal, #dcddde);
        }
        
        .message-action.saved {
            color: var(--primary, #5865f2);
        }
    `;
    
    // Add style to document
    document.head.appendChild(style);
}

// Make functions available globally
window.loadSavedChats = loadSavedChats;
window.addSaveButtonToMessage = addSaveButtonToMessage;
