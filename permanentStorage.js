/**
 * Permanent Storage Manager
 * Ensures resources and chats are permanently stored in localStorage
 * and visible to all users regardless of login state
 */

const PermanentStorage = {
    // Storage keys for permanent data
    PERMANENT_KEYS: {
        RESOURCES: 'permanent_resources',
        CHATS: 'permanent_chats',
        MESSAGES: 'permanent_messages'
    },
    
    /**
     * Initialize permanent storage
     * This should be called when the page loads
     */
    initialize: function() {
        console.log('Initializing permanent storage...');
        
        // Initialize permanent storage containers if they don't exist
        if (!localStorage.getItem(this.PERMANENT_KEYS.RESOURCES)) {
            localStorage.setItem(this.PERMANENT_KEYS.RESOURCES, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.PERMANENT_KEYS.CHATS)) {
            localStorage.setItem(this.PERMANENT_KEYS.CHATS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.PERMANENT_KEYS.MESSAGES)) {
            localStorage.setItem(this.PERMANENT_KEYS.MESSAGES, JSON.stringify([]));
        }
        
        // Copy existing resources to permanent storage
        this.copyExistingResourcesToStorage();
        
        // Copy existing chats to permanent storage
        this.copyExistingChatsToStorage();
        
        // Load permanent data into active storage
        this.loadPermanentDataIntoActiveStorage();
        
        // Set up interval to save data periodically
        this.setupAutoSave();
        
        console.log('Permanent storage initialized');
    },
    
    /**
     * Copy existing resources to permanent storage
     */
    copyExistingResourcesToStorage: function() {
        try {
            // Get resources from standard storage
            const resourcesKey = 'edustake_resources';
            const resourcesJson = localStorage.getItem(resourcesKey);
            
            if (resourcesJson) {
                const resources = JSON.parse(resourcesJson);
                
                if (resources && resources.length > 0) {
                    // Get existing permanent resources
                    const permanentResourcesJson = localStorage.getItem(this.PERMANENT_KEYS.RESOURCES);
                    let permanentResources = permanentResourcesJson ? JSON.parse(permanentResourcesJson) : [];
                    
                    // Merge resources (avoid duplicates)
                    const existingIds = new Set(permanentResources.map(r => r.id));
                    const newResources = resources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        permanentResources = [...permanentResources, ...newResources];
                        localStorage.setItem(this.PERMANENT_KEYS.RESOURCES, JSON.stringify(permanentResources));
                        console.log(`Added ${newResources.length} resources to permanent storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error copying existing resources to permanent storage:', error);
        }
    },
    
    /**
     * Copy existing chats to permanent storage
     */
    copyExistingChatsToStorage: function() {
        try {
            // Get saved chats
            const savedChatsKey = 'edustake_saved_chats';
            const savedChatsJson = localStorage.getItem(savedChatsKey);
            
            if (savedChatsJson) {
                const savedChats = JSON.parse(savedChatsJson);
                
                if (savedChats && savedChats.length > 0) {
                    // Get existing permanent chats
                    const permanentChatsJson = localStorage.getItem(this.PERMANENT_KEYS.CHATS);
                    let permanentChats = permanentChatsJson ? JSON.parse(permanentChatsJson) : [];
                    
                    // Merge chats (avoid duplicates)
                    const existingIds = new Set(permanentChats.map(c => c.id));
                    const newChats = savedChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        permanentChats = [...permanentChats, ...newChats];
                        localStorage.setItem(this.PERMANENT_KEYS.CHATS, JSON.stringify(permanentChats));
                        console.log(`Added ${newChats.length} chats to permanent storage`);
                    }
                }
            }
            
            // Get current messages
            const currentMessagesKey = 'edustake_current_messages';
            const currentMessagesJson = localStorage.getItem(currentMessagesKey);
            
            if (currentMessagesJson) {
                const currentMessages = JSON.parse(currentMessagesJson);
                
                if (currentMessages && currentMessages.length > 0) {
                    // Get existing permanent messages
                    const permanentMessagesJson = localStorage.getItem(this.PERMANENT_KEYS.MESSAGES);
                    let permanentMessages = permanentMessagesJson ? JSON.parse(permanentMessagesJson) : [];
                    
                    // Merge messages (avoid duplicates)
                    const existingIds = new Set(permanentMessages.map(m => m.id));
                    const newMessages = currentMessages.filter(m => m.id && !existingIds.has(m.id));
                    
                    if (newMessages.length > 0) {
                        permanentMessages = [...permanentMessages, ...newMessages];
                        localStorage.setItem(this.PERMANENT_KEYS.MESSAGES, JSON.stringify(permanentMessages));
                        console.log(`Added ${newMessages.length} messages to permanent storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error copying existing chats to permanent storage:', error);
        }
    },
    
    /**
     * Load permanent data into active storage
     */
    loadPermanentDataIntoActiveStorage: function() {
        try {
            // Load permanent resources into active storage
            const permanentResourcesJson = localStorage.getItem(this.PERMANENT_KEYS.RESOURCES);
            
            if (permanentResourcesJson) {
                const permanentResources = JSON.parse(permanentResourcesJson);
                
                if (permanentResources && permanentResources.length > 0) {
                    // Get existing resources
                    const resourcesKey = 'edustake_resources';
                    const resourcesJson = localStorage.getItem(resourcesKey);
                    let resources = resourcesJson ? JSON.parse(resourcesJson) : [];
                    
                    // Merge permanent resources into active resources (avoid duplicates)
                    const existingIds = new Set(resources.map(r => r.id));
                    const newResources = permanentResources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        resources = [...resources, ...newResources];
                        localStorage.setItem(resourcesKey, JSON.stringify(resources));
                        console.log(`Added ${newResources.length} permanent resources to active storage`);
                        
                        // Update resource indexes if ResourceStorage is available
                        if (window.ResourceStorage && typeof window.ResourceStorage._updateResourceIndexes === 'function') {
                            window.ResourceStorage._updateResourceIndexes(resources);
                        }
                    }
                }
            }
            
            // Load permanent chats into active storage
            const permanentChatsJson = localStorage.getItem(this.PERMANENT_KEYS.CHATS);
            
            if (permanentChatsJson) {
                const permanentChats = JSON.parse(permanentChatsJson);
                
                if (permanentChats && permanentChats.length > 0) {
                    // Get existing saved chats
                    const savedChatsKey = 'edustake_saved_chats';
                    const savedChatsJson = localStorage.getItem(savedChatsKey);
                    let savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
                    
                    // Merge permanent chats into saved chats (avoid duplicates)
                    const existingIds = new Set(savedChats.map(c => c.id));
                    const newChats = permanentChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        savedChats = [...savedChats, ...newChats];
                        localStorage.setItem(savedChatsKey, JSON.stringify(savedChats));
                        console.log(`Added ${newChats.length} permanent chats to saved chats`);
                    }
                }
            }
            
            // Load permanent messages into active storage
            const permanentMessagesJson = localStorage.getItem(this.PERMANENT_KEYS.MESSAGES);
            
            if (permanentMessagesJson) {
                const permanentMessages = JSON.parse(permanentMessagesJson);
                
                if (permanentMessages && permanentMessages.length > 0) {
                    // Get existing current messages
                    const currentMessagesKey = 'edustake_current_messages';
                    const currentMessagesJson = localStorage.getItem(currentMessagesKey);
                    let currentMessages = currentMessagesJson ? JSON.parse(currentMessagesJson) : [];
                    
                    // Merge permanent messages into current messages (avoid duplicates)
                    const existingIds = new Set(currentMessages.map(m => m.id));
                    const newMessages = permanentMessages.filter(m => m.id && !existingIds.has(m.id));
                    
                    if (newMessages.length > 0) {
                        currentMessages = [...currentMessages, ...newMessages];
                        localStorage.setItem(currentMessagesKey, JSON.stringify(currentMessages));
                        console.log(`Added ${newMessages.length} permanent messages to current messages`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading permanent data into active storage:', error);
        }
    },
    
    /**
     * Save current data to permanent storage
     * This should be called before logout and periodically
     */
    saveCurrentDataToPermanentStorage: function() {
        try {
            // Save resources to permanent storage
            this.copyExistingResourcesToStorage();
            
            // Save chats to permanent storage
            this.copyExistingChatsToStorage();
            
            console.log('Current data saved to permanent storage');
        } catch (error) {
            console.error('Error saving current data to permanent storage:', error);
        }
    },
    
    /**
     * Set up auto-save to periodically save data to permanent storage
     */
    setupAutoSave: function() {
        // Save data every 30 seconds
        setInterval(() => {
            this.saveCurrentDataToPermanentStorage();
        }, 30000);
    },
    
    /**
     * Add a resource to permanent storage
     * @param {Object} resource - The resource to add
     */
    addResourceToPermanentStorage: function(resource) {
        if (!resource || !resource.id) return;
        
        try {
            // Get permanent resources
            const permanentResourcesJson = localStorage.getItem(this.PERMANENT_KEYS.RESOURCES);
            let permanentResources = permanentResourcesJson ? JSON.parse(permanentResourcesJson) : [];
            
            // Check if resource already exists
            const existingIndex = permanentResources.findIndex(r => r.id === resource.id);
            
            if (existingIndex >= 0) {
                // Update existing resource
                permanentResources[existingIndex] = resource;
            } else {
                // Add new resource
                permanentResources.push(resource);
            }
            
            // Save to permanent storage
            localStorage.setItem(this.PERMANENT_KEYS.RESOURCES, JSON.stringify(permanentResources));
            console.log('Resource added to permanent storage:', resource.name);
        } catch (error) {
            console.error('Error adding resource to permanent storage:', error);
        }
    },
    
    /**
     * Add a chat to permanent storage
     * @param {Object} chat - The chat to add
     */
    addChatToPermanentStorage: function(chat) {
        if (!chat || !chat.id) return;
        
        try {
            // Get permanent chats
            const permanentChatsJson = localStorage.getItem(this.PERMANENT_KEYS.CHATS);
            let permanentChats = permanentChatsJson ? JSON.parse(permanentChatsJson) : [];
            
            // Check if chat already exists
            const existingIndex = permanentChats.findIndex(c => c.id === chat.id);
            
            if (existingIndex >= 0) {
                // Update existing chat
                permanentChats[existingIndex] = chat;
            } else {
                // Add new chat
                permanentChats.push(chat);
            }
            
            // Save to permanent storage
            localStorage.setItem(this.PERMANENT_KEYS.CHATS, JSON.stringify(permanentChats));
            console.log('Chat added to permanent storage');
        } catch (error) {
            console.error('Error adding chat to permanent storage:', error);
        }
    },
    
    /**
     * Add a message to permanent storage
     * @param {Object} message - The message to add
     */
    addMessageToPermanentStorage: function(message) {
        if (!message || !message.id) return;
        
        try {
            // Get permanent messages
            const permanentMessagesJson = localStorage.getItem(this.PERMANENT_KEYS.MESSAGES);
            let permanentMessages = permanentMessagesJson ? JSON.parse(permanentMessagesJson) : [];
            
            // Check if message already exists
            const existingIndex = permanentMessages.findIndex(m => m.id === message.id);
            
            if (existingIndex >= 0) {
                // Update existing message
                permanentMessages[existingIndex] = message;
            } else {
                // Add new message
                permanentMessages.push(message);
            }
            
            // Save to permanent storage
            localStorage.setItem(this.PERMANENT_KEYS.MESSAGES, JSON.stringify(permanentMessages));
            console.log('Message added to permanent storage');
        } catch (error) {
            console.error('Error adding message to permanent storage:', error);
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize permanent storage
    PermanentStorage.initialize();
});

// Make available globally
window.PermanentStorage = PermanentStorage;
