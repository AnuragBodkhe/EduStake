// Community search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get search elements
    const searchInput = document.getElementById('community-search-input');
    const collegeItems = document.querySelectorAll('.college-item');
    const noResultsMessage = document.getElementById('no-results-message');
    
    if (searchInput && collegeItems.length > 0) {
        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'community-suggestions';
        suggestionsContainer.id = 'community-suggestions';
        searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);
        
        // Handle search input
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let resultsFound = false;
            
            // Clear previous suggestions
            suggestionsContainer.innerHTML = '';
            
            // Generate suggestions if search term exists
            if (searchTerm.length > 0) {
                generateSuggestions(searchTerm, suggestionsContainer);
            }
            
            // Filter college items based on search term
            collegeItems.forEach(item => {
                const collegeName = item.querySelector('.college-name').textContent.toLowerCase();
                const collegeAbbr = item.querySelector('.college-icon').textContent.toLowerCase();
                
                // Show/hide based on match
                if (collegeName.includes(searchTerm) || collegeAbbr.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    resultsFound = true;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            if (noResultsMessage) {
                if (resultsFound || searchTerm === '') {
                    noResultsMessage.style.display = 'none';
                } else {
                    noResultsMessage.style.display = 'block';
                }
            }
        });
        
        // Handle focus on search input
        searchInput.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                // Show popular college suggestions on focus
                showPopularColleges(suggestionsContainer);
            } else {
                // Or show suggestions based on current input
                generateSuggestions(this.value.toLowerCase().trim(), suggestionsContainer);
            }
        });
        
        // Clear search on Escape key
        searchInput.addEventListener('keydown', function(e) {
            const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
            let selectedIndex = -1;
            
            // Find currently selected suggestion
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].classList.contains('selected')) {
                    selectedIndex = i;
                    break;
                }
            }
            
            switch(e.key) {
                case 'Escape':
                    this.value = '';
                    // Clear suggestions
                    suggestionsContainer.innerHTML = '';
                    // Reset all filters
                    this.dispatchEvent(new Event('input'));
                    this.blur(); // Remove focus
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (suggestions.length === 0) return;
                    
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
                    if (suggestions.length === 0) return;
                    
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
                    const selectedSuggestion = suggestionsContainer.querySelector('.suggestion-item.selected');
                    if (selectedSuggestion) {
                        e.preventDefault();
                        this.value = selectedSuggestion.getAttribute('data-value');
                        suggestionsContainer.innerHTML = '';
                        this.dispatchEvent(new Event('input')); // Trigger filtering
                    }
                    break;
            }
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.innerHTML = '';
            }
        });
    }
    
    // Function to generate search suggestions
    function generateSuggestions(searchTerm, container) {
        if (!searchTerm) return;
        
        // Create an array to store suggestions
        const suggestions = [];
        
        // Collect matching college names and abbreviations
        collegeItems.forEach(item => {
            const collegeName = item.querySelector('.college-name').textContent;
            const collegeAbbr = item.querySelector('.college-icon').textContent;
            
            if (collegeName.toLowerCase().includes(searchTerm) || 
                collegeAbbr.toLowerCase().includes(searchTerm)) {
                suggestions.push({
                    name: collegeName,
                    abbr: collegeAbbr
                });
            }
        });
        
        // Display suggestions (limit to 5)
        if (suggestions.length > 0) {
            // Clear previous suggestions
            container.innerHTML = '';
            
            // Add header
            const header = document.createElement('div');
            header.className = 'suggestions-header';
            header.textContent = 'Colleges';
            container.appendChild(header);
            
            // Add suggestion items (limit to 5)
            suggestions.slice(0, 5).forEach(college => {
                addSuggestionItem(container, college.name, college.abbr, searchTerm);
            });
        }
    }
    
    // Function to add a suggestion item
    function addSuggestionItem(container, collegeName, collegeAbbr, searchTerm) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.setAttribute('data-value', collegeName);
        
        // Highlight the matching part
        let displayName = collegeName;
        if (searchTerm && collegeName.toLowerCase().includes(searchTerm.toLowerCase())) {
            const index = collegeName.toLowerCase().indexOf(searchTerm.toLowerCase());
            displayName = 
                collegeName.substring(0, index) + 
                '<span class="suggestion-highlight">' + 
                collegeName.substring(index, index + searchTerm.length) + 
                '</span>' + 
                collegeName.substring(index + searchTerm.length);
        }
        
        item.innerHTML = `
            <div class="suggestion-icon">${collegeAbbr}</div>
            <div class="suggestion-text">${displayName}</div>
        `;
        
        // Add click handler
        item.addEventListener('click', function() {
            searchInput.value = collegeName;
            container.innerHTML = '';
            searchInput.dispatchEvent(new Event('input')); // Trigger filtering
            
            // Find and activate the corresponding college item
            collegeItems.forEach(collegeItem => {
                const name = collegeItem.querySelector('.college-name').textContent;
                if (name === collegeName) {
                    // Trigger a click on this college item
                    collegeItem.click();
                }
            });
        });
        
        container.appendChild(item);
    }
    
    // Function to show popular/default college suggestions
    function showPopularColleges(container) {
        // Clear previous suggestions
        container.innerHTML = '';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'suggestions-header';
        header.textContent = 'Popular Colleges';
        container.appendChild(header);
        
        // Get first 5 colleges from the list
        const popularColleges = [];
        collegeItems.forEach(item => {
            if (popularColleges.length < 5) {
                popularColleges.push({
                    name: item.querySelector('.college-name').textContent,
                    abbr: item.querySelector('.college-icon').textContent
                });
            }
        });
        
        // Add suggestion items
        popularColleges.forEach(college => {
            addSuggestionItem(container, college.name, college.abbr);
        });
    }
}); 