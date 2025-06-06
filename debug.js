console.log("Debug script loading");

// Add event listeners for message sending
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Get message elements
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    
    console.log("Elements found:", {
        sendButton: Boolean(sendButton),
        messageInput: Boolean(messageInput),
        chatMessages: Boolean(chatMessages)
    });
    
    // Direct function to send message
    function debugSendMessage() {
        console.log("Send button clicked");
        
        if (!messageInput || !messageInput.value.trim()) {
            console.log("Message input is empty");
            return;
        }
        
        const messageText = messageInput.value.trim();
        console.log("Sending message:", messageText);
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            username: 'Debug User',
            email: 'debug@example.com',
            profilePic: 'https://via.placeholder.com/40'
        };
        
        console.log("Current user:", currentUser);
        
        // Create message elements
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Create message content with simple structure
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="${currentUser.profilePic || 'https://via.placeholder.com/40'}" alt="Avatar" class="user-avatar">
            </div>
            <div class="message-info">
                <div class="message-header">
                    <span class="sender-name">${currentUser.username}</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${messageText}</div>
            </div>
        `;
        
        // Add to chat
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear input
        messageInput.value = '';
        
        console.log("Message sent and added to chat");
    }
    
    // Add event listeners
    if (sendButton) {
        console.log("Adding click listener to send button");
        sendButton.addEventListener('click', debugSendMessage);
    }
    
    if (messageInput) {
        console.log("Adding keydown listener to message input");
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                debugSendMessage();
            }
        });
    }
});

// Export a global function for testing
window.testSendMessage = function(text) {
    console.log("Test sending message:", text);
    const chatMessages = document.querySelector('.chat-messages');
    
    if (!chatMessages) {
        console.error("Chat messages container not found");
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-avatar">
            <img src="https://via.placeholder.com/40" alt="Test Avatar" class="user-avatar">
        </div>
        <div class="message-info">
            <div class="message-header">
                <span class="sender-name">Test User</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content">${text || "Test message"}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    console.log("Test message added to chat");
    
    return true;
};
document.addEventListener("DOMContentLoaded", function() { const systemMessage = document.querySelector(".system-message"); if (systemMessage) { systemMessage.style.backgroundColor = "#1a1a1a"; systemMessage.style.color = "#aaa"; } });
