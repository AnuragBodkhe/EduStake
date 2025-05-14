/**
 * Saved Messages Display
 * Displays saved chat messages in a format similar to saved resources
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize saved messages display
    initializeSavedMessagesDisplay();
});

/**
 * Initialize saved messages display
 */
function initializeSavedMessagesDisplay() {
    // Create saved messages section if it doesn't exist
    createSavedMessagesSection();
    
    // Load saved messages
    loadSavedMessages();
    
    console.log('Saved messages display initialized');
}

/**
 * Create saved messages section
 */
function createSavedMessagesSection() {
    // Check if section already exists in chat area
    const existingSection = document.querySelector('.saved-messages-section');
    if (existingSection) return;
    
    // Find chat area
    const chatArea = document.querySelector('.chat-area');
    if (!chatArea) return;
    
    // Create saved messages section
    const savedMessagesSection = document.createElement('div');
    savedMessagesSection.className = 'saved-messages-section';
    savedMessagesSection.innerHTML = `
        <div class="saved-messages-header">
            <div class="saved-messages-title">
                <i class="fas fa-bookmark"></i>
                <span>Saved Messages</span>
            </div>
            <div class="saved-messages-count">
                <span id="saved-message-count">0</span> messages
            </div>
        </div>
        <div class="saved-messages-grid" id="saved-messages-grid"></div>
    `;
    
    // Add saved messages section to chat area
    chatArea.appendChild(savedMessagesSection);
    
    // Add styles
    addSavedMessagesStyles();
}

/**
 * Load saved messages
 */
function loadSavedMessages() {
    // Get saved messages grid
    const savedMessagesGrid = document.getElementById('saved-messages-grid');
    if (!savedMessagesGrid) return;
    
    // Clear existing content
    savedMessagesGrid.innerHTML = '';
    
    // Get saved messages from localStorage
    const savedMessagesJson = localStorage.getItem('edustake_saved_chats');
    const savedMessages = savedMessagesJson ? JSON.parse(savedMessagesJson) : [];
    
    // Update count
    const savedMessageCount = document.getElementById('saved-message-count');
    if (savedMessageCount) {
        savedMessageCount.textContent = savedMessages.length;
    }
    
    // Check if there are any saved messages
    if (savedMessages.length === 0) {
        // Show empty state
        savedMessagesGrid.innerHTML = `
            <div class="no-saved-messages">
                <i class="fas fa-bookmark"></i>
                <h3>No saved messages yet</h3>
                <p>Bookmark important messages to save them here</p>
            </div>
        `;
        return;
    }
    
    // Sort messages by timestamp (newest first)
    savedMessages.sort((a, b) => b.timestamp - a.timestamp);
    
    // Add each message to the grid
    savedMessages.forEach(message => {
        const messageCard = createMessageCard(message);
        savedMessagesGrid.appendChild(messageCard);
    });
}

/**
 * Create message card
 * @param {Object} message - Message object
 * @returns {HTMLElement} Message card element
 */
function createMessageCard(message) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.messageId = message.id;
    
    // Get message data
    const username = message.username || 'User';
    const text = message.text || '';
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
    const photoURL = message.photoURL || getDefaultAvatarUrl(username);
    
    // Format date
    const formattedDate = formatDate(timestamp);
    const formattedTime = formatTime(timestamp);
    
    // Create card content
    card.innerHTML = `
        <div class="message-preview">
            <div class="message-avatar">
                <img src="${photoURL}" alt="${username}'s avatar">
            </div>
        </div>
        <div class="message-info">
            <div class="message-name">${username}</div>
            <div class="message-meta">
                <span class="message-date">${formattedDate}</span>
                <span class="message-time">${formattedTime}</span>
            </div>
            <div class="message-text">${text}</div>
            <div class="message-actions">
                <button class="message-action view-message" title="View Message">
                    <i class="fas fa-eye"></i>
                    <span>View</span>
                </button>
                <button class="message-action remove-message" title="Remove from Saved">
                    <i class="fas fa-trash"></i>
                    <span>Remove</span>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const viewButton = card.querySelector('.view-message');
    const removeButton = card.querySelector('.remove-message');
    
    if (viewButton) {
        viewButton.addEventListener('click', function() {
            viewSavedMessage(message);
        });
    }
    
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            removeSavedMessage(message.id);
        });
    }
    
    return card;
}

/**
 * View saved message
 * @param {Object} message - Message object
 */
function viewSavedMessage(message) {
    // Create modal if it doesn't exist
    let messageModal = document.getElementById('message-modal');
    
    if (!messageModal) {
        messageModal = document.createElement('div');
        messageModal.id = 'message-modal';
        messageModal.className = 'message-modal';
        
        document.body.appendChild(messageModal);
    }
    
    // Get message data
    const username = message.username || 'User';
    const text = message.text || '';
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
    const photoURL = message.photoURL || getDefaultAvatarUrl(username);
    
    // Format date and time
    const formattedDate = formatDate(timestamp);
    const formattedTime = formatTime(timestamp);
    
    // Update modal content
    messageModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Saved Message</div>
                <button class="modal-close" onclick="closeMessageModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="message-view">
                    <div class="message-view-header">
                        <div class="message-view-avatar">
                            <img src="${photoURL}" alt="${username}'s avatar">
                        </div>
                        <div class="message-view-info">
                            <div class="message-view-username">${username}</div>
                            <div class="message-view-time">${formattedDate} at ${formattedTime}</div>
                        </div>
                    </div>
                    <div class="message-view-content">
                        ${text}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeMessageModal()">Close</button>
                <button class="btn btn-primary" onclick="removeSavedMessageAndClose('${message.id}')">Remove from Saved</button>
            </div>
        </div>
    `;
    
    // Show modal
    messageModal.style.display = 'flex';
    
    // Add close on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeMessageModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    // Add close on outside click
    messageModal.addEventListener('click', function closeOnOutsideClick(e) {
        if (e.target === messageModal) {
            closeMessageModal();
            messageModal.removeEventListener('click', closeOnOutsideClick);
        }
    });
}

/**
 * Close message modal
 */
function closeMessageModal() {
    const messageModal = document.getElementById('message-modal');
    if (messageModal) {
        messageModal.style.display = 'none';
    }
}

/**
 * Remove saved message and close modal
 * @param {string} messageId - Message ID
 */
function removeSavedMessageAndClose(messageId) {
    removeSavedMessage(messageId);
    closeMessageModal();
}

/**
 * Remove saved message
 * @param {string} messageId - Message ID
 */
function removeSavedMessage(messageId) {
    // Get saved messages from localStorage
    const savedMessagesJson = localStorage.getItem('edustake_saved_chats');
    let savedMessages = savedMessagesJson ? JSON.parse(savedMessagesJson) : [];
    
    // Filter out the message to remove
    savedMessages = savedMessages.filter(message => message.id !== messageId);
    
    // Save updated messages back to localStorage
    localStorage.setItem('edustake_saved_chats', JSON.stringify(savedMessages));
    
    // Remove message card from UI
    const messageCard = document.querySelector(`.message-card[data-message-id="${messageId}"]`);
    if (messageCard) {
        messageCard.remove();
    }
    
    // Update count
    const savedMessageCount = document.getElementById('saved-message-count');
    if (savedMessageCount) {
        savedMessageCount.textContent = savedMessages.length;
    }
    
    // Show empty state if no messages left
    if (savedMessages.length === 0) {
        const savedMessagesGrid = document.getElementById('saved-messages-grid');
        if (savedMessagesGrid) {
            savedMessagesGrid.innerHTML = `
                <div class="no-saved-messages">
                    <i class="fas fa-bookmark"></i>
                    <h3>No saved messages yet</h3>
                    <p>Bookmark important messages to save them here</p>
                </div>
            `;
        }
    }
    
    console.log(`Removed saved message with ID: ${messageId}`);
}

/**
 * Format date
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Format time
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString(undefined, options);
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
 * Add saved messages styles
 */
function addSavedMessagesStyles() {
    // Check if styles already exist
    if (document.getElementById('saved-messages-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'saved-messages-styles';
    
    // Add styles
    style.textContent = `
        .saved-messages-section {
            margin-top: 20px;
            padding: 20px;
            background-color: var(--bg-primary, #36393f);
            border-radius: 8px;
        }
        
        .saved-messages-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .saved-messages-title {
            display: flex;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-normal, #dcddde);
        }
        
        .saved-messages-title i {
            margin-right: 8px;
            color: var(--primary, #5865f2);
        }
        
        .saved-messages-count {
            font-size: 14px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .saved-messages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .message-card {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .message-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .message-preview {
            height: 80px;
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .message-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
        }
        
        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .message-info {
            padding: 15px;
        }
        
        .message-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .message-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
            margin-bottom: 10px;
        }
        
        .message-text {
            color: var(--text-normal, #dcddde);
            font-size: 14px;
            margin-bottom: 10px;
            max-height: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
        
        .message-actions {
            display: flex;
            gap: 10px;
        }
        
        .message-action {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.2);
            color: var(--text-normal, #dcddde);
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .message-action:hover {
            background-color: var(--primary, #5865f2);
        }
        
        .message-action.remove-message:hover {
            background-color: var(--danger, #ed4245);
        }
        
        .no-saved-messages {
            grid-column: 1 / -1;
            text-align: center;
            padding: 50px;
            color: var(--text-normal, #dcddde);
        }
        
        .no-saved-messages i {
            font-size: 48px;
            color: var(--text-muted, #a3a6aa);
            margin-bottom: 15px;
        }
        
        .no-saved-messages h3 {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .no-saved-messages p {
            color: var(--text-muted, #a3a6aa);
        }
        
        /* Message Modal */
        .message-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .modal-content {
            background-color: var(--bg-primary, #36393f);
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modal-title {
            font-size: 18px;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            font-size: 20px;
            cursor: pointer;
        }
        
        .modal-body {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-primary {
            background-color: var(--primary, #5865f2);
            color: white;
        }
        
        .btn-secondary {
            background-color: rgba(0, 0, 0, 0.3);
            color: var(--text-normal, #dcddde);
        }
        
        .message-view {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 15px;
        }
        
        .message-view-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .message-view-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px;
        }
        
        .message-view-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .message-view-username {
            font-weight: 600;
            color: var(--text-normal, #dcddde);
        }
        
        .message-view-time {
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .message-view-content {
            color: var(--text-normal, #dcddde);
            font-size: 16px;
            line-height: 1.5;
            word-break: break-word;
        }
    `;
    
    // Add style to document
    document.head.appendChild(style);
}

// Make functions available globally
window.closeMessageModal = closeMessageModal;
window.removeSavedMessageAndClose = removeSavedMessageAndClose;
window.loadSavedMessages = loadSavedMessages;
