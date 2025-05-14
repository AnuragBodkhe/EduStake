/**
 * Emoji picker functionality for the chat application
 */

// Emoji Picker Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing emoji picker');

    // Select the main content area
    const contentArea = document.querySelector('main.content-area');
    if (!contentArea) return;

    // Find the message input container within the content area
    const messageInputContainer = contentArea.querySelector('.message-input-container');
    if (!messageInputContainer) return;

    // Disable any emoji buttons in sidebars
    document.querySelectorAll('.communities-sidebar .chat-emoji-button, .channels-sidebar .chat-emoji-button, .sidebar .chat-emoji-button').forEach(button => {
        console.log('Disabling emoji button in sidebar');
        button.classList.add('disabled');
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
        
        // Remove any existing event listeners
        const oldButton = button.cloneNode(true);
        button.parentNode.replaceChild(oldButton, button);
    });

    // Remove any existing emoji pickers in sidebars
    document.querySelectorAll('.communities-sidebar .emoji-picker, .channels-sidebar .emoji-picker, .sidebar .emoji-picker').forEach(picker => {
        console.log('Removing emoji picker from sidebar');
        picker.remove();
    });

    // Find the emoji button in the chat area
    const emojiButton = messageInputContainer.querySelector('.chat-emoji-button');
    if (!emojiButton) return;

    // Create emoji picker structure if it doesn't exist
    let emojiPicker = messageInputContainer.querySelector('.emoji-picker');
    if (!emojiPicker) {
        console.log('Creating emoji picker in chat area');
        emojiPicker = document.createElement('div');
        emojiPicker.className = 'emoji-picker';
        emojiPicker.innerHTML = `
            <div class="emoji-search-container">
                <input type="text" class="emoji-search" placeholder="Search emojis...">
            </div>
            <div class="emoji-categories">
                <div class="emoji-category active" data-category="smileys">😊</div>
                <div class="emoji-category" data-category="people">👋</div>
                <div class="emoji-category" data-category="animals">🐶</div>
                <div class="emoji-category" data-category="food">🍎</div>
                <div class="emoji-category" data-category="travel">✈️</div>
                <div class="emoji-category" data-category="activities">⚽</div>
                <div class="emoji-category" data-category="objects">💡</div>
                <div class="emoji-category" data-category="symbols">❤️</div>
                <div class="emoji-category" data-category="flags">🏳️</div>
            </div>
            <div class="emoji-container">
                <div class="emoji-group" data-category="smileys" data-active="true">
                    <span class="emoji">😀</span><span class="emoji">😃</span><span class="emoji">😄</span>
                    <span class="emoji">😁</span><span class="emoji">😆</span><span class="emoji">😅</span>
                    <span class="emoji">🤣</span><span class="emoji">😂</span><span class="emoji">🙂</span>
                    <span class="emoji">🙃</span><span class="emoji">😉</span><span class="emoji">😊</span>
                    <span class="emoji">😇</span><span class="emoji">🥰</span><span class="emoji">😍</span>
                    <span class="emoji">🤩</span><span class="emoji">😘</span><span class="emoji">😗</span>
                </div>
                <div class="emoji-group" data-category="people">
                    <span class="emoji">👋</span><span class="emoji">🤚</span><span class="emoji">🖐️</span>
                    <span class="emoji">✋</span><span class="emoji">🖖</span><span class="emoji">👌</span>
                    <span class="emoji">🤌</span><span class="emoji">🤏</span><span class="emoji">✌️</span>
                    <span class="emoji">🤞</span><span class="emoji">🤟</span><span class="emoji">🤘</span>
                    <span class="emoji">🤙</span><span class="emoji">👈</span><span class="emoji">👉</span>
                    <span class="emoji">👆</span><span class="emoji">🖕</span><span class="emoji">👇</span>
                </div>
                <div class="emoji-group" data-category="animals">
                    <span class="emoji">🐶</span><span class="emoji">🐱</span><span class="emoji">🐭</span>
                    <span class="emoji">🐹</span><span class="emoji">🐰</span><span class="emoji">🦊</span>
                    <span class="emoji">🐻</span><span class="emoji">🐼</span><span class="emoji">🐻‍❄️</span>
                    <span class="emoji">🐨</span><span class="emoji">🐯</span><span class="emoji">🦁</span>
                    <span class="emoji">🐮</span><span class="emoji">🐷</span><span class="emoji">🐸</span>
                    <span class="emoji">🐵</span><span class="emoji">🙈</span><span class="emoji">🙉</span>
                </div>
                <div class="emoji-group" data-category="food">
                    <span class="emoji">🍎</span><span class="emoji">🍐</span><span class="emoji">🍊</span>
                    <span class="emoji">🍋</span><span class="emoji">🍌</span><span class="emoji">🍉</span>
                    <span class="emoji">🍇</span><span class="emoji">🍓</span><span class="emoji">🫐</span>
                    <span class="emoji">🍈</span><span class="emoji">🍒</span><span class="emoji">🍑</span>
                    <span class="emoji">🥭</span><span class="emoji">🍍</span><span class="emoji">🥥</span>
                    <span class="emoji">🥝</span><span class="emoji">🍅</span><span class="emoji">🍆</span>
                </div>
                <div class="emoji-group" data-category="travel">
                    <span class="emoji">🚗</span><span class="emoji">🚕</span><span class="emoji">🚙</span>
                    <span class="emoji">🚌</span><span class="emoji">🚎</span><span class="emoji">🏎️</span>
                    <span class="emoji">🚓</span><span class="emoji">🚑</span><span class="emoji">🚒</span>
                    <span class="emoji">🚐</span><span class="emoji">🛻</span><span class="emoji">🚚</span>
                    <span class="emoji">🚛</span><span class="emoji">🚜</span><span class="emoji">🛵</span>
                    <span class="emoji">🏍️</span><span class="emoji">🛺</span><span class="emoji">🚲</span>
                </div>
                <div class="emoji-group" data-category="activities">
                    <span class="emoji">⚽</span><span class="emoji">🏀</span><span class="emoji">🏈</span>
                    <span class="emoji">⚾</span><span class="emoji">🥎</span><span class="emoji">🎾</span>
                    <span class="emoji">🏐</span><span class="emoji">🏉</span><span class="emoji">🥏</span>
                    <span class="emoji">🎱</span><span class="emoji">🪀</span><span class="emoji">🏓</span>
                    <span class="emoji">🏸</span><span class="emoji">🏒</span><span class="emoji">🏑</span>
                    <span class="emoji">🥍</span><span class="emoji">🏏</span><span class="emoji">🪃</span>
                </div>
                <div class="emoji-group" data-category="objects">
                    <span class="emoji">⌚</span><span class="emoji">📱</span><span class="emoji">📲</span>
                    <span class="emoji">💻</span><span class="emoji">⌨️</span><span class="emoji">🖥️</span>
                    <span class="emoji">🖨️</span><span class="emoji">🖱️</span><span class="emoji">🖲️</span>
                    <span class="emoji">🕹️</span><span class="emoji">🗜️</span><span class="emoji">💽</span>
                    <span class="emoji">💾</span><span class="emoji">💿</span><span class="emoji">📀</span>
                    <span class="emoji">📼</span><span class="emoji">📷</span><span class="emoji">📸</span>
                </div>
                <div class="emoji-group" data-category="symbols">
                    <span class="emoji">❤️</span><span class="emoji">🧡</span><span class="emoji">💛</span>
                    <span class="emoji">💚</span><span class="emoji">💙</span><span class="emoji">💜</span>
                    <span class="emoji">🖤</span><span class="emoji">🤍</span><span class="emoji">🤎</span>
                    <span class="emoji">❣️</span><span class="emoji">💕</span><span class="emoji">💞</span>
                    <span class="emoji">💓</span><span class="emoji">💗</span><span class="emoji">💖</span>
                    <span class="emoji">💘</span><span class="emoji">💝</span><span class="emoji">💟</span>
                </div>
                <div class="emoji-group" data-category="flags">
                    <span class="emoji">🏳️</span><span class="emoji">🏴</span><span class="emoji">🏴‍☠️</span>
                    <span class="emoji">🏁</span><span class="emoji">🚩</span><span class="emoji">🏳️‍🌈</span>
                    <span class="emoji">🏳️‍⚧️</span><span class="emoji">🇺🇳</span><span class="emoji">🇦🇫</span>
                    <span class="emoji">🇦🇱</span><span class="emoji">🇩🇿</span><span class="emoji">🇦🇸</span>
                    <span class="emoji">🇦🇩</span><span class="emoji">🇦🇴</span><span class="emoji">🇦🇮</span>
                    <span class="emoji">🇦🇶</span><span class="emoji">🇦🇬</span><span class="emoji">🇦🇷</span>
                </div>
            </div>
        `;
        messageInputContainer.appendChild(emojiPicker);
    }

    // Function to toggle the emoji picker
    const toggleEmojiPicker = function(event) {
        // Get the parent container to check if we're in a sidebar
        const parentContainer = event.target.closest('.communities-sidebar, .channels-sidebar, .sidebar');
        
        // If we're in a sidebar, do nothing
        if (parentContainer) {
            console.log('Emoji button clicked in sidebar - ignoring');
            return;
        }
        
        // Only toggle when clicked in chat area
        console.log('Emoji button clicked in chat area');
        emojiPicker.classList.toggle('active');
        
        // Position check - make sure the picker is visible and doesn't go off-screen
        const rect = emojiPicker.getBoundingClientRect();
        if (rect.left < 0) {
            emojiPicker.style.left = '0';
        }
        if (rect.right > window.innerWidth) {
            emojiPicker.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        
        event.stopPropagation();
    };

    // Add click event to the emoji button
    emojiButton.addEventListener('click', toggleEmojiPicker);

    // Close emoji picker when clicking outside
    document.addEventListener('click', function(event) {
        if (!emojiPicker.contains(event.target) && event.target !== emojiButton) {
            emojiPicker.classList.remove('active');
        }
    });

    // Emoji category switching
    emojiPicker.querySelectorAll('.emoji-category').forEach(category => {
        category.addEventListener('click', function() {
            const categoryName = this.getAttribute('data-category');
            
            // Update active category
            emojiPicker.querySelectorAll('.emoji-category').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding emoji group
            emojiPicker.querySelectorAll('.emoji-group').forEach(group => {
                group.setAttribute('data-active', group.getAttribute('data-category') === categoryName);
            });
        });
    });

    // Emoji click event - insert emoji into input
    emojiPicker.querySelectorAll('.emoji').forEach(emoji => {
        emoji.addEventListener('click', function() {
            const messageInput = messageInputContainer.querySelector('.message-input');
            if (messageInput) {
                const emojiText = this.textContent;
                
                // Insert at cursor position if possible
                if (typeof messageInput.selectionStart !== 'undefined') {
                    const startPos = messageInput.selectionStart;
                    const endPos = messageInput.selectionEnd;
                    messageInput.value = messageInput.value.substring(0, startPos) + emojiText + messageInput.value.substring(endPos);
                    
                    // Move cursor after inserted emoji
                    messageInput.selectionStart = messageInput.selectionEnd = startPos + emojiText.length;
                } else {
                    // Fallback: append to end
                    messageInput.value += emojiText;
                }
                
                // Focus back on input
                messageInput.focus();
            }
            
            // Close the picker
            emojiPicker.classList.remove('active');
        });
    });

    // Emoji search functionality
    const searchInput = emojiPicker.querySelector('.emoji-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm === '') {
                // Show the active category when search is cleared
                const activeCategory = emojiPicker.querySelector('.emoji-category.active').getAttribute('data-category');
                emojiPicker.querySelectorAll('.emoji-group').forEach(group => {
                    group.setAttribute('data-active', group.getAttribute('data-category') === activeCategory);
                });
                
                // Show all emojis in that category
                emojiPicker.querySelectorAll('.emoji').forEach(emoji => {
                    emoji.style.display = '';
                });
                return;
            }
            
            // Show all groups when searching
            emojiPicker.querySelectorAll('.emoji-group').forEach(group => {
                group.setAttribute('data-active', 'true');
            });
            
            // Filter emojis
            emojiPicker.querySelectorAll('.emoji').forEach(emoji => {
                // We could enhance this with a proper emoji search data structure
                // For now, a simple display/hide will do
                if (searchTerm === '' || emoji.textContent.toLowerCase().includes(searchTerm)) {
                    emoji.style.display = '';
                } else {
                    emoji.style.display = 'none';
                }
            });
        });
    }

    // Prevent emoji picker close when clicking inside it
    emojiPicker.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    console.log('Emoji picker functionality initialized in chat area only');
}); 