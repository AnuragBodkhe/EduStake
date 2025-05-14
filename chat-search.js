// Chat search recommendations functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get search button and add click event
    const searchButton = document.querySelector('.header-actions .icon-button[title="Search"]');
    if (searchButton) {
        searchButton.addEventListener('click', setupSearchOverlay);
    }

    // Setup search overlay with recommendations
    function setupSearchOverlay() {
        // Create the search overlay if it doesn't exist
        let searchOverlay = document.getElementById('search-overlay');
        if (!searchOverlay) {
            searchOverlay = document.createElement('div');
            searchOverlay.id = 'search-overlay';
            searchOverlay.className = 'search-overlay';
            
            // Create search container
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            
            // Create search header
            const searchHeader = document.createElement('div');
            searchHeader.className = 'search-header';
            
            const searchTitle = document.createElement('h3');
            searchTitle.textContent = 'Search Messages';
            
            const closeSearchButton = document.createElement('button');
            closeSearchButton.className = 'close-button';
            closeSearchButton.innerHTML = '&times;';
            closeSearchButton.addEventListener('click', closeSearch);
            
            searchHeader.appendChild(searchTitle);
            searchHeader.appendChild(closeSearchButton);
            
            // Create search input
            const searchInputContainer = document.createElement('div');
            searchInputContainer.className = 'search-input-container';
            
            const searchIcon = document.createElement('div');
            searchIcon.className = 'search-icon';
            searchIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search in conversation...';
            searchInput.id = 'search-input';
            
            searchInputContainer.appendChild(searchIcon);
            searchInputContainer.appendChild(searchInput);
            
            // Create search suggestions container
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            suggestionsContainer.id = 'search-suggestions';
            
            // Create search results container
            const searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.id = 'search-results';
            
            // Assemble the search overlay
            searchContainer.appendChild(searchHeader);
            searchContainer.appendChild(searchInputContainer);
            searchContainer.appendChild(suggestionsContainer);
            searchContainer.appendChild(searchResults);
            searchOverlay.appendChild(searchContainer);
            
            document.body.appendChild(searchOverlay);
            
            // Add event listeners
            searchInput.addEventListener('input', handleSearchInput);
            searchInput.addEventListener('keydown', handleSearchKeydown);
        }
        
        // Show the search overlay
        searchOverlay.classList.add('visible');
        document.getElementById('search-input').focus();
    }
    
    // Handle search input and generate suggestions
    function handleSearchInput() {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim().toLowerCase();
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        if (searchTerm.length < 2) {
            // Show history or popular searches if no input
            showSearchHistory(suggestionsContainer);
            return;
        }
        
        // Generate suggestions based on message content
        const messages = document.querySelectorAll('.message-content');
        const suggestions = new Set(); // Use Set to avoid duplicates
        
        messages.forEach(message => {
            const messageText = message.textContent.toLowerCase();
            
            // If message contains the search term, extract phrases for suggestions
            if (messageText.includes(searchTerm)) {
                const words = messageText.split(/\s+/);
                
                // Find phrases containing the search term
                for (let i = 0; i < words.length; i++) {
                    if (words[i].includes(searchTerm)) {
                        // Create suggestions using 2-3 word phrases
                        let phrase = words[i];
                        
                        // Add next word if available
                        if (i + 1 < words.length) {
                            phrase += ' ' + words[i + 1];
                            
                            // Add one more word if available
                            if (i + 2 < words.length) {
                                phrase += ' ' + words[i + 2];
                            }
                        }
                        
                        // Add previous word if available
                        if (i > 0) {
                            phrase = words[i - 1] + ' ' + phrase;
                        }
                        
                        // Limit phrase length
                        if (phrase.length > 50) {
                            phrase = phrase.substring(0, 47) + '...';
                        }
                        
                        suggestions.add(phrase);
                        
                        // Limit to 5 suggestions
                        if (suggestions.size >= 5) break;
                    }
                }
                
                // Limit to 5 suggestions
                if (suggestions.size >= 5) return;
            }
        });
        
        // Display suggestions
        if (suggestions.size > 0) {
            suggestions.forEach(suggestion => {
                addSearchSuggestion(suggestionsContainer, suggestion, searchTerm);
            });
        } else {
            // If no suggestions from content, suggest the search term itself
            addSearchSuggestion(suggestionsContainer, searchTerm, searchTerm);
        }
        
        // Also perform the actual search
        performSearch(searchTerm);
    }
    
    // Add a single suggestion to the suggestions container
    function addSearchSuggestion(container, suggestion, searchTerm) {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'search-suggestion-item';
        
        // Highlight the search term within the suggestion
        const highlightedSuggestion = suggestion.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="suggestion-highlight">${match}</span>`
        );
        
        suggestionItem.innerHTML = `
            <span class="suggestion-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
            </span>
            <span class="suggestion-text">${highlightedSuggestion}</span>
        `;
        
        // Add click event to use this suggestion
        suggestionItem.addEventListener('click', () => {
            const searchInput = document.getElementById('search-input');
            searchInput.value = suggestion;
            performSearch(suggestion);
            
            // Save to search history
            saveToSearchHistory(suggestion);
            
            // Hide suggestions
            container.innerHTML = '';
        });
        
        container.appendChild(suggestionItem);
    }
    
    // Handle keyboard navigation in search
    function handleSearchKeydown(e) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion-item');
        
        if (suggestions.length === 0) return;
        
        // Find currently selected suggestion, if any
        let selectedIndex = -1;
        for (let i = 0; i < suggestions.length; i++) {
            if (suggestions[i].classList.contains('selected')) {
                selectedIndex = i;
                break;
            }
        }
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                // Select next suggestion
                if (selectedIndex < suggestions.length - 1) {
                    if (selectedIndex >= 0) {
                        suggestions[selectedIndex].classList.remove('selected');
                    }
                    suggestions[selectedIndex + 1].classList.add('selected');
                } else {
                    // Wrap around to first suggestion
                    if (selectedIndex >= 0) {
                        suggestions[selectedIndex].classList.remove('selected');
                    }
                    suggestions[0].classList.add('selected');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                // Select previous suggestion
                if (selectedIndex > 0) {
                    suggestions[selectedIndex].classList.remove('selected');
                    suggestions[selectedIndex - 1].classList.add('selected');
                } else if (selectedIndex === 0) {
                    // Wrap around to last suggestion
                    suggestions[0].classList.remove('selected');
                    suggestions[suggestions.length - 1].classList.add('selected');
                } else {
                    // Select last suggestion if none selected
                    suggestions[suggestions.length - 1].classList.add('selected');
                }
                break;
                
            case 'Enter':
                // Use the selected suggestion
                const selectedSuggestion = suggestionsContainer.querySelector('.search-suggestion-item.selected');
                if (selectedSuggestion) {
                    e.preventDefault();
                    const suggestionText = selectedSuggestion.textContent.trim();
                    document.getElementById('search-input').value = suggestionText;
                    performSearch(suggestionText);
                    
                    // Save to search history
                    saveToSearchHistory(suggestionText);
                    
                    // Hide suggestions
                    suggestionsContainer.innerHTML = '';
                } else {
                    // If no suggestion is selected, perform search with current input
                    const searchTerm = document.getElementById('search-input').value.trim();
                    if (searchTerm.length >= 2) {
                        performSearch(searchTerm);
                        saveToSearchHistory(searchTerm);
                    }
                }
                break;
                
            case 'Escape':
                // Clear suggestions
                suggestionsContainer.innerHTML = '';
                break;
        }
    }
    
    // Show search history
    function showSearchHistory(container) {
        // Get recent searches from localStorage
        let searchHistory = getSearchHistory();
        
        if (searchHistory.length === 0) {
            // Show popular suggestions if no history
            const popularSuggestions = [
                'lecture', 'assignment', 'exam', 'project', 'meeting'
            ];
            
            container.innerHTML = '<div class="suggestions-header">Try searching for:</div>';
            popularSuggestions.forEach(suggestion => {
                addSearchSuggestion(container, suggestion, '');
            });
            
            return;
        }
        
        container.innerHTML = '<div class="suggestions-header">Recent searches:</div>';
        
        // Show most recent searches first (up to 5)
        searchHistory.slice(0, 5).forEach(term => {
            addSearchSuggestion(container, term, '');
        });
        
        // Add a clear history option
        if (searchHistory.length > 0) {
            const clearHistoryItem = document.createElement('div');
            clearHistoryItem.className = 'clear-history-item';
            clearHistoryItem.innerHTML = 'Clear search history';
            
            clearHistoryItem.addEventListener('click', () => {
                localStorage.removeItem('chatSearchHistory');
                container.innerHTML = '';
                showSearchHistory(container);
            });
            
            container.appendChild(clearHistoryItem);
        }
    }
    
    // Save a search term to history
    function saveToSearchHistory(term) {
        const trimmedTerm = term.trim();
        if (trimmedTerm.length < 2) return;
        
        let searchHistory = getSearchHistory();
        
        // Remove if already exists (to avoid duplicates)
        searchHistory = searchHistory.filter(item => item.toLowerCase() !== trimmedTerm.toLowerCase());
        
        // Add to beginning of array
        searchHistory.unshift(trimmedTerm);
        
        // Keep only most recent 10 searches
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
        
        // Save back to localStorage
        localStorage.setItem('chatSearchHistory', JSON.stringify(searchHistory));
    }
    
    // Get search history from localStorage
    function getSearchHistory() {
        const historyJSON = localStorage.getItem('chatSearchHistory');
        if (historyJSON) {
            try {
                return JSON.parse(historyJSON);
            } catch (e) {
                console.error('Error parsing search history:', e);
                return [];
            }
        }
        return [];
    }
    
    // Close search overlay
    function closeSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('visible');
        }
    }
    
    // Search functionality
    function performSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '<div class="search-empty">Type at least 2 characters to search</div>';
            return;
        }
        
        const searchResults = document.getElementById('search-results');
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        // Get all message content
        const messages = document.querySelectorAll('.message-content');
        let results = [];
        
        messages.forEach(message => {
            const messageText = message.textContent.toLowerCase();
            if (messageText.includes(searchTerm.toLowerCase())) {
                // Get the parent message div
                const messageDiv = message.closest('.message');
                if (messageDiv) {
                    const username = messageDiv.querySelector('.username')?.textContent || 'Unknown';
                    const timestamp = messageDiv.querySelector('.timestamp')?.textContent || '';
                    const avatarSrc = messageDiv.querySelector('.avatar')?.src || '';
                    
                    results.push({
                        username,
                        timestamp,
                        avatarSrc,
                        messageText: message.textContent,
                        element: messageDiv
                    });
                }
            }
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-empty">No messages found</div>';
            return;
        }
        
        // Display results
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            const resultAvatar = document.createElement('img');
            resultAvatar.src = result.avatarSrc;
            resultAvatar.alt = 'User avatar';
            resultAvatar.className = 'avatar';
            
            const resultInfo = document.createElement('div');
            resultInfo.className = 'result-info';
            
            const resultHeader = document.createElement('div');
            resultHeader.className = 'result-header';
            
            const resultUsername = document.createElement('span');
            resultUsername.className = 'username';
            resultUsername.textContent = result.username;
            
            const resultTimestamp = document.createElement('span');
            resultTimestamp.className = 'timestamp';
            resultTimestamp.textContent = result.timestamp;
            
            const resultText = document.createElement('div');
            resultText.className = 'result-text';
            
            // Highlight the search term in the message text
            const highlightedText = result.messageText.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="highlight">${match}</span>`
            );
            resultText.innerHTML = highlightedText;
            
            resultHeader.appendChild(resultUsername);
            resultHeader.appendChild(resultTimestamp);
            
            resultInfo.appendChild(resultHeader);
            resultInfo.appendChild(resultText);
            
            resultItem.appendChild(resultAvatar);
            resultItem.appendChild(resultInfo);
            
            // Add click handler to scroll to the original message
            resultItem.addEventListener('click', () => {
                closeSearch();
                result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                result.element.classList.add('highlight-message');
                setTimeout(() => {
                    result.element.classList.remove('highlight-message');
                }, 2000);
            });
            
            searchResults.appendChild(resultItem);
        });
    }
}); 