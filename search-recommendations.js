/**
 * Search Recommendations
 * Provides search functionality with recommendations from chats and resources
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initializeSearch();
});

/**
 * Initialize search functionality
 */
function initializeSearch() {
    // Find search button in header
    const searchButton = document.querySelector('.header-actions .icon-button[title="Search"]');
    if (!searchButton) return;
    
    // Create search modal
    createSearchModal();
    
    // Add click event to search button
    searchButton.addEventListener('click', function() {
        showSearchModal();
    });
    
    // Add keyboard shortcut (Ctrl+F or Cmd+F)
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            showSearchModal();
        }
    });
    
    console.log('Search functionality initialized');
}

/**
 * Create search modal
 */
function createSearchModal() {
    // Check if modal already exists
    if (document.getElementById('search-modal')) return;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'search-modal';
    modalContainer.className = 'search-modal';
    modalContainer.style.display = 'none';
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="search-modal-content">
            <div class="search-header">
                <div class="search-input-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="search-input" placeholder="Search in conversation...">
                    <button class="clear-search" id="clear-search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <button class="close-search" id="close-search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="search-recent">
                <div class="search-section-title">Recent searches:</div>
                <div class="recent-searches" id="recent-searches"></div>
                <button class="clear-history" id="clear-history">Clear search history</button>
            </div>
            
            <div class="search-results" id="search-results">
                <div class="no-results" id="no-results">No messages found</div>
                
                <div class="results-container" id="chat-results-container">
                    <div class="results-section-title">Chat Messages</div>
                    <div class="results-list" id="chat-results"></div>
                </div>
                
                <div class="results-container" id="resource-results-container">
                    <div class="results-section-title">Resources</div>
                    <div class="results-list" id="resource-results"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    setupSearchEvents();
    
    // Add search styles
    addSearchStyles();
}

/**
 * Setup search event listeners
 */
function setupSearchEvents() {
    // Get elements
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const closeSearch = document.getElementById('close-search');
    const clearSearch = document.getElementById('clear-search');
    const clearHistory = document.getElementById('clear-history');
    
    if (!searchModal || !searchInput || !closeSearch || !clearSearch || !clearHistory) return;
    
    // Close search modal
    closeSearch.addEventListener('click', function() {
        hideSearchModal();
    });
    
    // Clear search input
    clearSearch.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        hideSearchResults();
    });
    
    // Clear search history
    clearHistory.addEventListener('click', function() {
        clearSearchHistory();
        updateRecentSearches();
    });
    
    // Handle search input
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        
        if (query.length > 0) {
            performSearch(query);
        } else {
            hideSearchResults();
        }
    });
    
    // Handle keyboard events
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideSearchModal();
        } else if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                addToSearchHistory(query);
                updateRecentSearches();
                performSearch(query);
            }
        }
    });
    
    // Close modal when clicking outside
    searchModal.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            hideSearchModal();
        }
    });
    
    // Load recent searches
    updateRecentSearches();
}

/**
 * Show search modal
 */
function showSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    if (!searchModal || !searchInput) return;
    
    // Show modal
    searchModal.style.display = 'flex';
    
    // Focus input
    setTimeout(() => {
        searchInput.focus();
    }, 100);
}

/**
 * Hide search modal
 */
function hideSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (!searchModal) return;
    
    searchModal.style.display = 'none';
}

/**
 * Hide search results
 */
function hideSearchResults() {
    const noResults = document.getElementById('no-results');
    const chatResultsContainer = document.getElementById('chat-results-container');
    const resourceResultsContainer = document.getElementById('resource-results-container');
    
    if (!noResults || !chatResultsContainer || !resourceResultsContainer) return;
    
    noResults.style.display = 'none';
    chatResultsContainer.style.display = 'none';
    resourceResultsContainer.style.display = 'none';
}

/**
 * Perform search
 * @param {string} query - Search query
 */
function performSearch(query) {
    // Normalize query
    query = query.toLowerCase();
    
    // Search in chat messages
    const chatResults = searchInChatMessages(query);
    
    // Search in resources
    const resourceResults = searchInResources(query);
    
    // Update UI with results
    updateSearchResults(query, chatResults, resourceResults);
}

/**
 * Search in chat messages
 * @param {string} query - Search query
 * @returns {Array} Array of matching messages
 */
function searchInChatMessages(query) {
    const results = [];
    
    // Get all messages from localStorage
    try {
        // Try to get from saved chats
        const savedChatsJson = localStorage.getItem('edustake_saved_chats');
        const savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
        
        // Try to get from current messages
        const currentMessagesJson = localStorage.getItem('edustake_current_messages');
        const currentMessages = currentMessagesJson ? JSON.parse(currentMessagesJson) : [];
        
        // Combine and filter messages
        const allMessages = [...savedChats, ...currentMessages];
        
        // Filter messages that match the query
        const matchingMessages = allMessages.filter(message => {
            if (!message) return false;
            
            const text = message.text || '';
            const username = message.username || '';
            
            return text.toLowerCase().includes(query) || 
                   username.toLowerCase().includes(query);
        });
        
        // Sort by timestamp (newest first)
        matchingMessages.sort((a, b) => b.timestamp - a.timestamp);
        
        // Deduplicate messages based on ID
        const uniqueMessages = [];
        const messageIds = new Set();
        
        matchingMessages.forEach(message => {
            if (!messageIds.has(message.id)) {
                messageIds.add(message.id);
                uniqueMessages.push(message);
            }
        });
        
        // Return up to 5 results
        return uniqueMessages.slice(0, 5);
    } catch (error) {
        console.error('Error searching in chat messages:', error);
        return [];
    }
}

/**
 * Search in resources
 * @param {string} query - Search query
 * @returns {Array} Array of matching resources
 */
function searchInResources(query) {
    const results = [];
    
    // Get all resources from localStorage
    try {
        // Try to get from saved resources
        const resourcesJson = localStorage.getItem('edustake_resources');
        const resources = resourcesJson ? JSON.parse(resourcesJson) : [];
        
        // Filter resources that match the query
        const matchingResources = resources.filter(resource => {
            if (!resource) return false;
            
            const name = resource.name || '';
            const description = resource.description || '';
            const type = resource.type || '';
            
            return name.toLowerCase().includes(query) || 
                   description.toLowerCase().includes(query) ||
                   type.toLowerCase().includes(query);
        });
        
        // Sort by timestamp (newest first)
        matchingResources.sort((a, b) => b.timestamp - a.timestamp);
        
        // Return up to 5 results
        return matchingResources.slice(0, 5);
    } catch (error) {
        console.error('Error searching in resources:', error);
        return [];
    }
}

/**
 * Update search results in UI
 * @param {string} query - Search query
 * @param {Array} chatResults - Array of matching chat messages
 * @param {Array} resourceResults - Array of matching resources
 */
function updateSearchResults(query, chatResults, resourceResults) {
    const noResults = document.getElementById('no-results');
    const chatResultsContainer = document.getElementById('chat-results-container');
    const resourceResultsContainer = document.getElementById('resource-results-container');
    const chatResultsList = document.getElementById('chat-results');
    const resourceResultsList = document.getElementById('resource-results');
    
    if (!noResults || !chatResultsContainer || !resourceResultsContainer || 
        !chatResultsList || !resourceResultsList) return;
    
    // Clear previous results
    chatResultsList.innerHTML = '';
    resourceResultsList.innerHTML = '';
    
    // Check if we have any results
    const hasResults = chatResults.length > 0 || resourceResults.length > 0;
    
    // Show/hide no results message
    noResults.style.display = hasResults ? 'none' : 'block';
    
    // Update chat results
    if (chatResults.length > 0) {
        chatResultsContainer.style.display = 'block';
        
        chatResults.forEach(message => {
            const resultItem = createChatResultItem(message, query);
            chatResultsList.appendChild(resultItem);
        });
    } else {
        chatResultsContainer.style.display = 'none';
    }
    
    // Update resource results
    if (resourceResults.length > 0) {
        resourceResultsContainer.style.display = 'block';
        
        resourceResults.forEach(resource => {
            const resultItem = createResourceResultItem(resource, query);
            resourceResultsList.appendChild(resultItem);
        });
    } else {
        resourceResultsContainer.style.display = 'none';
    }
}

/**
 * Create chat result item
 * @param {Object} message - Message object
 * @param {string} query - Search query for highlighting
 * @returns {HTMLElement} Result item element
 */
function createChatResultItem(message, query) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item chat-result';
    
    // Get message data
    const username = message.username || 'User';
    const text = message.text || '';
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
    const photoURL = message.photoURL || getDefaultAvatarUrl(username);
    
    // Create result content
    resultItem.innerHTML = `
        <div class="result-avatar">
            <img src="${photoURL}" alt="${username}'s avatar">
        </div>
        <div class="result-content">
            <div class="result-header">
                <div class="result-username">${username}</div>
                <div class="result-time">${formatTimestamp(timestamp)}</div>
            </div>
            <div class="result-text">${highlightText(text, query)}</div>
        </div>
    `;
    
    // Add click event
    resultItem.addEventListener('click', function() {
        // Hide search modal
        hideSearchModal();
        
        // Check if it's a saved message
        const isSavedMessage = message.saved === true;
        
        if (isSavedMessage) {
            // Navigate to saved messages section and highlight the message
            navigateToSavedMessage(message.id);
        } else {
            // Regular chat message - try to find and highlight it
            highlightChatMessage(message.id);
        }
    });
    
    return resultItem;
}

/**
 * Create resource result item
 * @param {Object} resource - Resource object
 * @param {string} query - Search query for highlighting
 * @returns {HTMLElement} Result item element
 */
function createResourceResultItem(resource, query) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item resource-result';
    
    // Get resource data
    const name = resource.name || 'Unnamed Resource';
    const description = resource.description || '';
    const type = resource.type || '';
    const url = resource.url || '';
    const timestamp = resource.timestamp ? new Date(resource.timestamp) : new Date();
    
    // Get icon based on type
    let icon = 'fa-file';
    if (type.includes('image')) {
        icon = 'fa-image';
    } else if (type.includes('pdf')) {
        icon = 'fa-file-pdf';
    } else if (type.includes('word') || type.includes('doc')) {
        icon = 'fa-file-word';
    } else if (type.includes('excel') || type.includes('sheet')) {
        icon = 'fa-file-excel';
    } else if (type.includes('powerpoint') || type.includes('presentation')) {
        icon = 'fa-file-powerpoint';
    }
    
    // Create result content
    resultItem.innerHTML = `
        <div class="result-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="result-content">
            <div class="result-header">
                <div class="result-name">${highlightText(name, query)}</div>
                <div class="result-time">${formatTimestamp(timestamp)}</div>
            </div>
            <div class="result-description">${description ? highlightText(description, query) : ''}</div>
        </div>
    `;
    
    // Add click event
    resultItem.addEventListener('click', function() {
        // Hide search modal
        hideSearchModal();
        
        // Navigate to resources page if not already there
        if (!window.location.href.includes('resources.html')) {
            // Save the resource ID to localStorage so we can highlight it after navigation
            localStorage.setItem('highlight_resource_id', resource.id);
            window.location.href = 'resources.html';
        } else {
            // Already on resources page, just highlight the resource
            highlightResource(resource.id);
        }
    });
    
    return resultItem;
}

/**
 * Highlight text with search query
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} Highlighted HTML
 */
function highlightText(text, query) {
    if (!text || !query) return text;
    
    // Escape HTML
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    
    // Create regex for highlighting
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Replace with highlighted text
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format timestamp
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatTimestamp(date) {
    // Check if date is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
        // Format as time only
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // Format as date and time
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

/**
 * Add to search history
 * @param {string} query - Search query
 */
function addToSearchHistory(query) {
    // Normalize query
    query = query.trim();
    if (!query) return;
    
    // Get existing history
    const history = getSearchHistory();
    
    // Remove existing entry if present
    const index = history.indexOf(query);
    if (index !== -1) {
        history.splice(index, 1);
    }
    
    // Add to beginning
    history.unshift(query);
    
    // Keep only the last 10 searches
    const limitedHistory = history.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('edustake_search_history', JSON.stringify(limitedHistory));
}

/**
 * Get search history
 * @returns {Array} Search history array
 */
function getSearchHistory() {
    try {
        const historyJson = localStorage.getItem('edustake_search_history');
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error('Error getting search history:', error);
        return [];
    }
}

/**
 * Clear search history
 */
function clearSearchHistory() {
    localStorage.removeItem('edustake_search_history');
}

/**
 * Update recent searches UI
 */
function updateRecentSearches() {
    const recentSearches = document.getElementById('recent-searches');
    if (!recentSearches) return;
    
    // Clear existing items
    recentSearches.innerHTML = '';
    
    // Get search history
    const history = getSearchHistory();
    
    // Add recent searches
    history.forEach(query => {
        const searchItem = document.createElement('div');
        searchItem.className = 'recent-search-item';
        searchItem.innerHTML = `
            <i class="fas fa-history"></i>
            <span>${query}</span>
        `;
        
        // Add click event
        searchItem.addEventListener('click', function() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = query;
                performSearch(query);
                searchInput.focus();
            }
        });
        
        recentSearches.appendChild(searchItem);
    });
    
    // Show/hide clear history button
    const clearHistory = document.getElementById('clear-history');
    if (clearHistory) {
        clearHistory.style.display = history.length > 0 ? 'block' : 'none';
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
 * Add search styles
 */
function addSearchStyles() {
    // Check if styles already exist
    if (document.getElementById('search-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'search-styles';
    
    // Add styles
    style.textContent = `
        .search-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: flex-start;
            z-index: 9999;
            padding-top: 60px;
        }
        
        .search-modal-content {
            width: 600px;
            max-width: 90%;
            background-color: var(--bg-primary, #36393f);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            max-height: 80vh;
        }
        
        .search-header {
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
        }
        
        .search-input-container {
            position: relative;
            flex: 1;
            margin-right: 12px;
        }
        
        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted, #a3a6aa);
        }
        
        #search-input {
            width: 100%;
            padding: 10px 36px;
            background-color: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: var(--text-normal, #dcddde);
            font-size: 16px;
        }
        
        #search-input:focus {
            outline: none;
            border-color: var(--primary, #5865f2);
        }
        
        .clear-search {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .close-search {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .close-search:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-normal, #dcddde);
        }
        
        .search-recent {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            max-height: 150px;
            overflow-y: auto;
        }
        
        .search-section-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted, #a3a6aa);
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .recent-searches {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .recent-search-item {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: var(--text-normal, #dcddde);
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .recent-search-item:hover {
            background-color: rgba(255, 255, 255, 0.15);
        }
        
        .recent-search-item i {
            margin-right: 6px;
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
        }
        
        .clear-history {
            background: none;
            border: none;
            color: var(--text-muted, #a3a6aa);
            cursor: pointer;
            padding: 0;
            font-size: 12px;
            text-decoration: underline;
            margin-top: 4px;
        }
        
        .clear-history:hover {
            color: var(--text-normal, #dcddde);
        }
        
        .search-results {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        .no-results {
            text-align: center;
            padding: 24px;
            color: var(--text-muted, #a3a6aa);
            font-size: 16px;
        }
        
        .results-container {
            margin-bottom: 20px;
        }
        
        .results-section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-normal, #dcddde);
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .results-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .result-item {
            display: flex;
            padding: 10px;
            border-radius: 4px;
            background-color: rgba(255, 255, 255, 0.05);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .result-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .result-avatar, .result-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .result-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .result-icon {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-normal, #dcddde);
            font-size: 18px;
        }
        
        .result-content {
            flex: 1;
            min-width: 0;
        }
        
        .result-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        .result-username, .result-name {
            font-weight: 600;
            color: var(--text-normal, #dcddde);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .result-time {
            font-size: 12px;
            color: var(--text-muted, #a3a6aa);
            white-space: nowrap;
            margin-left: 8px;
        }
        
        .result-text, .result-description {
            color: var(--text-normal, #dcddde);
            font-size: 14px;
            line-height: 1.4;
            word-break: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .highlight {
            background-color: rgba(88, 101, 242, 0.3);
            border-radius: 2px;
            padding: 0 2px;
        }
    `;
    
    // Add style to document
    document.head.appendChild(style);
}

/**
 * Highlight a specific resource
 * @param {string} resourceId - ID of the resource to highlight
 */
function highlightResource(resourceId) {
    // Find the resource card with the matching ID
    const resourceCard = document.querySelector(`.resource-card[data-resource-id="${resourceId}"]`);
    
    if (!resourceCard) {
        console.warn(`Resource with ID ${resourceId} not found`);
        return;
    }
    
    // Scroll to the resource
    resourceCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add highlight effect
    resourceCard.classList.add('highlight-resource');
    
    // Add highlight style if it doesn't exist
    if (!document.getElementById('highlight-resource-style')) {
        const style = document.createElement('style');
        style.id = 'highlight-resource-style';
        style.textContent = `
            @keyframes pulse-highlight {
                0% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(88, 101, 242, 0); }
                100% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0); }
            }
            
            .highlight-resource {
                animation: pulse-highlight 2s infinite;
                border: 2px solid var(--primary, #5865f2);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove highlight after 5 seconds
    setTimeout(() => {
        resourceCard.classList.remove('highlight-resource');
    }, 5000);
}

/**
 * Navigate to a saved message and highlight it
 * @param {string} messageId - ID of the message to navigate to
 */
function navigateToSavedMessage(messageId) {
    // If we're on the main page, we need to scroll to the saved messages section
    if (document.querySelector('.saved-messages-section')) {
        // Find the saved message card
        const messageCard = document.querySelector(`.message-card[data-message-id="${messageId}"]`);
        
        if (messageCard) {
            // Scroll to the message card
            messageCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the message card
            highlightElement(messageCard, 'highlight-message');
        } else {
            console.warn(`Saved message with ID ${messageId} not found`);
            // Show toast notification
            if (window.showToast) {
                window.showToast('Message not found in saved messages', 'warning');
            }
        }
    } else {
        // Save the message ID to localStorage so we can highlight it after navigation
        localStorage.setItem('highlight_message_id', messageId);
        localStorage.setItem('message_type', 'saved');
        
        // Navigate to the main page
        window.location.href = 'index.html';
    }
}

/**
 * Highlight a chat message
 * @param {string} messageId - ID of the message to highlight
 */
function highlightChatMessage(messageId) {
    // Find the chat message with the matching ID
    const chatMessage = document.querySelector(`.chat-message[data-message-id="${messageId}"], .message[data-message-id="${messageId}"]`);
    
    if (chatMessage) {
        // Scroll to the message
        chatMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the message
        highlightElement(chatMessage, 'highlight-message');
    } else {
        console.warn(`Chat message with ID ${messageId} not found`);
        // Show toast notification
        if (window.showToast) {
            window.showToast('Message not found in chat', 'warning');
        }
    }
}

/**
 * Highlight an element with a pulsing effect
 * @param {HTMLElement} element - Element to highlight
 * @param {string} className - Class name for the highlight effect
 */
function highlightElement(element, className) {
    // Add highlight style if it doesn't exist
    if (!document.getElementById('highlight-element-style')) {
        const style = document.createElement('style');
        style.id = 'highlight-element-style';
        style.textContent = `
            @keyframes pulse-highlight {
                0% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(88, 101, 242, 0); }
                100% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0); }
            }
            
            .highlight-message, .highlight-resource {
                animation: pulse-highlight 2s infinite;
                border: 2px solid var(--primary, #5865f2) !important;
                position: relative;
                z-index: 2;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add highlight class
    element.classList.add(className);
    
    // Remove highlight after 5 seconds
    setTimeout(() => {
        element.classList.remove(className);
    }, 5000);
}

/**
 * Check for message to highlight on page load
 */
function checkForMessageToHighlight() {
    // Check if there's a message ID to highlight in localStorage
    const messageId = localStorage.getItem('highlight_message_id');
    const messageType = localStorage.getItem('message_type');
    
    if (messageId) {
        // Clear the localStorage items
        localStorage.removeItem('highlight_message_id');
        localStorage.removeItem('message_type');
        
        // Wait a bit for the messages to load
        setTimeout(() => {
            if (messageType === 'saved') {
                // Find and highlight the saved message
                const messageCard = document.querySelector(`.message-card[data-message-id="${messageId}"]`);
                if (messageCard) {
                    messageCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    highlightElement(messageCard, 'highlight-message');
                }
            } else {
                // Find and highlight the chat message
                highlightChatMessage(messageId);
            }
        }, 1000);
    }
}

/**
 * Check for resource to highlight on page load
 */
function checkForResourceToHighlight() {
    // Check if there's a resource ID to highlight in localStorage
    const resourceId = localStorage.getItem('highlight_resource_id');
    
    if (resourceId) {
        // Clear the localStorage item
        localStorage.removeItem('highlight_resource_id');
        
        // Wait a bit for the resources to load
        setTimeout(() => {
            highlightResource(resourceId);
        }, 500);
    }
}

// Add event listeners to check for items to highlight on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for resource to highlight if on resources page
    if (window.location.href.includes('resources.html')) {
        checkForResourceToHighlight();
    }
    
    // Check for message to highlight if on main page
    if (window.location.href.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        checkForMessageToHighlight();
    }
});

// Make functions available globally
window.showSearchModal = showSearchModal;
window.performSearch = performSearch;
window.highlightResource = highlightResource;
window.highlightChatMessage = highlightChatMessage;
window.navigateToSavedMessage = navigateToSavedMessage;
window.highlightElement = highlightElement;
