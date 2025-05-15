/**
 * Global Storage System
 * Ensures resources and chats are permanently saved in local storage
 * and visible to everyone who logs in, similar to Discord but using local storage
 */

const GlobalStorage = {
    // Storage keys for global data
    KEYS: {
        RESOURCES: 'global_resources_data',
        CHATS: 'global_chats_data',
        MESSAGES: 'global_messages_data',
        LAST_SYNC: 'global_last_sync_timestamp'
    },
    
    /**
     * Initialize the global storage system
     */
    init: function() {
        console.log('Initializing Global Storage System...');
        
        // Create storage containers if they don't exist
        if (!localStorage.getItem(this.KEYS.RESOURCES)) {
            localStorage.setItem(this.KEYS.RESOURCES, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.CHATS)) {
            localStorage.setItem(this.KEYS.CHATS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.MESSAGES)) {
            localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify([]));
        }
        
        // Set last sync timestamp
        if (!localStorage.getItem(this.KEYS.LAST_SYNC)) {
            localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
        }
        
        // Import existing data from standard storage
        this.importExistingData();
        
        // Load global data into active storage
        this.loadGlobalDataIntoActiveStorage();
        
        // Set up auto-save
        this.setupAutoSave();
        
        // Monitor for new resources and chats
        this.monitorForNewData();
        
        console.log('Global Storage System initialized');
    },
    
    /**
     * Import existing data from standard storage
     */
    importExistingData: function() {
        console.log('Importing existing data to global storage...');
        
        // Import resources
        try {
            const resourcesKey = 'edustake_resources';
            const resourcesData = localStorage.getItem(resourcesKey);
            
            if (resourcesData) {
                const resources = JSON.parse(resourcesData);
                
                if (resources && resources.length > 0) {
                    // Get global resources
                    const globalResourcesData = localStorage.getItem(this.KEYS.RESOURCES);
                    let globalResources = globalResourcesData ? JSON.parse(globalResourcesData) : [];
                    
                    // Add new resources to global storage
                    const existingIds = new Set(globalResources.map(r => r.id));
                    const newResources = resources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        globalResources = [...globalResources, ...newResources];
                        localStorage.setItem(this.KEYS.RESOURCES, JSON.stringify(globalResources));
                        console.log(`Imported ${newResources.length} resources to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error importing resources:', error);
        }
        
        // Import saved chats
        try {
            const savedChatsKey = 'edustake_saved_chats';
            const savedChatsData = localStorage.getItem(savedChatsKey);
            
            if (savedChatsData) {
                const savedChats = JSON.parse(savedChatsData);
                
                if (savedChats && savedChats.length > 0) {
                    // Get global chats
                    const globalChatsData = localStorage.getItem(this.KEYS.CHATS);
                    let globalChats = globalChatsData ? JSON.parse(globalChatsData) : [];
                    
                    // Add new chats to global storage
                    const existingIds = new Set(globalChats.map(c => c.id));
                    const newChats = savedChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        globalChats = [...globalChats, ...newChats];
                        localStorage.setItem(this.KEYS.CHATS, JSON.stringify(globalChats));
                        console.log(`Imported ${newChats.length} chats to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error importing saved chats:', error);
        }
        
        // Import current messages
        try {
            const messagesKey = 'edustake_current_messages';
            const messagesData = localStorage.getItem(messagesKey);
            
            if (messagesData) {
                const messages = JSON.parse(messagesData);
                
                if (messages && messages.length > 0) {
                    // Get global messages
                    const globalMessagesData = localStorage.getItem(this.KEYS.MESSAGES);
                    let globalMessages = globalMessagesData ? JSON.parse(globalMessagesData) : [];
                    
                    // Add new messages to global storage
                    const existingIds = new Set(globalMessages.map(m => m.id || m.messageId));
                    const newMessages = messages.filter(m => {
                        const messageId = m.id || m.messageId;
                        return messageId && !existingIds.has(messageId);
                    });
                    
                    if (newMessages.length > 0) {
                        // Ensure all messages have an ID
                        const processedMessages = newMessages.map(m => {
                            if (!m.id && !m.messageId) {
                                m.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            }
                            return m;
                        });
                        
                        globalMessages = [...globalMessages, ...processedMessages];
                        localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(globalMessages));
                        console.log(`Imported ${processedMessages.length} messages to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error importing messages:', error);
        }
    },
    
    /**
     * Load global data into active storage
     */
    loadGlobalDataIntoActiveStorage: function() {
        console.log('Loading global data into active storage...');
        
        // Load resources
        try {
            const globalResourcesData = localStorage.getItem(this.KEYS.RESOURCES);
            
            if (globalResourcesData) {
                const globalResources = JSON.parse(globalResourcesData);
                
                if (globalResources && globalResources.length > 0) {
                    const resourcesKey = 'edustake_resources';
                    const resourcesData = localStorage.getItem(resourcesKey);
                    let resources = resourcesData ? JSON.parse(resourcesData) : [];
                    
                    // Add global resources to active storage
                    const existingIds = new Set(resources.map(r => r.id));
                    const newResources = globalResources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        resources = [...resources, ...newResources];
                        localStorage.setItem(resourcesKey, JSON.stringify(resources));
                        console.log(`Loaded ${newResources.length} global resources into active storage`);
                        
                        // Update resource indexes if ResourceStorage is available
                        if (window.ResourceStorage && typeof window.ResourceStorage._updateResourceIndexes === 'function') {
                            window.ResourceStorage._updateResourceIndexes(resources);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading global resources:', error);
        }
        
        // Load chats
        try {
            const globalChatsData = localStorage.getItem(this.KEYS.CHATS);
            
            if (globalChatsData) {
                const globalChats = JSON.parse(globalChatsData);
                
                if (globalChats && globalChats.length > 0) {
                    const savedChatsKey = 'edustake_saved_chats';
                    const savedChatsData = localStorage.getItem(savedChatsKey);
                    let savedChats = savedChatsData ? JSON.parse(savedChatsData) : [];
                    
                    // Add global chats to active storage
                    const existingIds = new Set(savedChats.map(c => c.id));
                    const newChats = globalChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        savedChats = [...savedChats, ...newChats];
                        localStorage.setItem(savedChatsKey, JSON.stringify(savedChats));
                        console.log(`Loaded ${newChats.length} global chats into active storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading global chats:', error);
        }
        
        // Load messages
        try {
            const globalMessagesData = localStorage.getItem(this.KEYS.MESSAGES);
            
            if (globalMessagesData) {
                const globalMessages = JSON.parse(globalMessagesData);
                
                if (globalMessages && globalMessages.length > 0) {
                    const messagesKey = 'edustake_current_messages';
                    const messagesData = localStorage.getItem(messagesKey);
                    let messages = messagesData ? JSON.parse(messagesData) : [];
                    
                    // Add global messages to active storage
                    const existingIds = new Set(messages.map(m => m.id || m.messageId));
                    const newMessages = globalMessages.filter(m => {
                        const messageId = m.id || m.messageId;
                        return messageId && !existingIds.has(messageId);
                    });
                    
                    if (newMessages.length > 0) {
                        messages = [...messages, ...newMessages];
                        localStorage.setItem(messagesKey, JSON.stringify(messages));
                        console.log(`Loaded ${newMessages.length} global messages into active storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading global messages:', error);
        }
        
        // Update last sync timestamp
        localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
    },
    
    /**
     * Set up auto-save to periodically save data to global storage
     */
    setupAutoSave: function() {
        // Save data every 10 seconds
        setInterval(() => {
            this.saveActiveDataToGlobalStorage();
        }, 10000);
    },
    
    /**
     * Monitor for new resources and chats
     */
    monitorForNewData: function() {
        // Set up mutation observer to detect new resources
        if (typeof MutationObserver !== 'undefined') {
            // Monitor for new resources
            const resourcesContainer = document.querySelector('.resources-container');
            if (resourcesContainer) {
                const resourcesObserver = new MutationObserver((mutations) => {
                    this.saveActiveDataToGlobalStorage();
                });
                
                resourcesObserver.observe(resourcesContainer, { 
                    childList: true, 
                    subtree: true 
                });
            }
            
            // Monitor for new messages
            const messagesContainer = document.querySelector('.chat-messages');
            if (messagesContainer) {
                const messagesObserver = new MutationObserver((mutations) => {
                    this.saveActiveDataToGlobalStorage();
                });
                
                messagesObserver.observe(messagesContainer, { 
                    childList: true, 
                    subtree: true 
                });
            }
        }
        
        // Add event listeners for file uploads
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Wait for the upload to complete
                setTimeout(() => {
                    this.saveActiveDataToGlobalStorage();
                }, 2000);
            });
        });
    },
    
    /**
     * Save active data to global storage
     */
    saveActiveDataToGlobalStorage: function() {
        console.log('Saving active data to global storage...');
        
        // Save resources
        try {
            const resourcesKey = 'edustake_resources';
            const resourcesData = localStorage.getItem(resourcesKey);
            
            if (resourcesData) {
                const resources = JSON.parse(resourcesData);
                
                if (resources && resources.length > 0) {
                    // Get global resources
                    const globalResourcesData = localStorage.getItem(this.KEYS.RESOURCES);
                    let globalResources = globalResourcesData ? JSON.parse(globalResourcesData) : [];
                    
                    // Add new resources to global storage
                    const existingIds = new Set(globalResources.map(r => r.id));
                    const newResources = resources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        globalResources = [...globalResources, ...newResources];
                        localStorage.setItem(this.KEYS.RESOURCES, JSON.stringify(globalResources));
                        console.log(`Saved ${newResources.length} new resources to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving resources to global storage:', error);
        }
        
        // Save chats
        try {
            const savedChatsKey = 'edustake_saved_chats';
            const savedChatsData = localStorage.getItem(savedChatsKey);
            
            if (savedChatsData) {
                const savedChats = JSON.parse(savedChatsData);
                
                if (savedChats && savedChats.length > 0) {
                    // Get global chats
                    const globalChatsData = localStorage.getItem(this.KEYS.CHATS);
                    let globalChats = globalChatsData ? JSON.parse(globalChatsData) : [];
                    
                    // Add new chats to global storage
                    const existingIds = new Set(globalChats.map(c => c.id));
                    const newChats = savedChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        globalChats = [...globalChats, ...newChats];
                        localStorage.setItem(this.KEYS.CHATS, JSON.stringify(globalChats));
                        console.log(`Saved ${newChats.length} new chats to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving chats to global storage:', error);
        }
        
        // Save messages
        try {
            const messagesKey = 'edustake_current_messages';
            const messagesData = localStorage.getItem(messagesKey);
            
            if (messagesData) {
                const messages = JSON.parse(messagesData);
                
                if (messages && messages.length > 0) {
                    // Get global messages
                    const globalMessagesData = localStorage.getItem(this.KEYS.MESSAGES);
                    let globalMessages = globalMessagesData ? JSON.parse(globalMessagesData) : [];
                    
                    // Add new messages to global storage
                    const existingIds = new Set(globalMessages.map(m => m.id || m.messageId));
                    const newMessages = messages.filter(m => {
                        const messageId = m.id || m.messageId;
                        return messageId && !existingIds.has(messageId);
                    });
                    
                    if (newMessages.length > 0) {
                        // Ensure all messages have an ID
                        const processedMessages = newMessages.map(m => {
                            if (!m.id && !m.messageId) {
                                m.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            }
                            return m;
                        });
                        
                        globalMessages = [...globalMessages, ...processedMessages];
                        localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(globalMessages));
                        console.log(`Saved ${processedMessages.length} new messages to global storage`);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving messages to global storage:', error);
        }
        
        // Update last sync timestamp
        localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
    },
    
    /**
     * Add a resource to global storage
     * @param {Object} resource - The resource to add
     */
    addResource: function(resource) {
        if (!resource || !resource.id) return;
        
        try {
            // Get global resources
            const globalResourcesData = localStorage.getItem(this.KEYS.RESOURCES);
            let globalResources = globalResourcesData ? JSON.parse(globalResourcesData) : [];
            
            // Check if resource already exists
            const existingIndex = globalResources.findIndex(r => r.id === resource.id);
            
            if (existingIndex >= 0) {
                // Update existing resource
                globalResources[existingIndex] = resource;
            } else {
                // Add new resource
                globalResources.push(resource);
            }
            
            // Save to global storage
            localStorage.setItem(this.KEYS.RESOURCES, JSON.stringify(globalResources));
            console.log('Resource added to global storage:', resource.name || 'Unnamed resource');
        } catch (error) {
            console.error('Error adding resource to global storage:', error);
        }
    },
    
    /**
     * Add a chat to global storage
     * @param {Object} chat - The chat to add
     */
    addChat: function(chat) {
        if (!chat || !chat.id) return;
        
        try {
            // Get global chats
            const globalChatsData = localStorage.getItem(this.KEYS.CHATS);
            let globalChats = globalChatsData ? JSON.parse(globalChatsData) : [];
            
            // Check if chat already exists
            const existingIndex = globalChats.findIndex(c => c.id === chat.id);
            
            if (existingIndex >= 0) {
                // Update existing chat
                globalChats[existingIndex] = chat;
            } else {
                // Add new chat
                globalChats.push(chat);
            }
            
            // Save to global storage
            localStorage.setItem(this.KEYS.CHATS, JSON.stringify(globalChats));
            console.log('Chat added to global storage');
        } catch (error) {
            console.error('Error adding chat to global storage:', error);
        }
    },
    
    /**
     * Add a message to global storage
     * @param {Object} message - The message to add
     */
    addMessage: function(message) {
        if (!message) return;
        
        try {
            // Ensure message has an ID
            if (!message.id && !message.messageId) {
                message.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Get global messages
            const globalMessagesData = localStorage.getItem(this.KEYS.MESSAGES);
            let globalMessages = globalMessagesData ? JSON.parse(globalMessagesData) : [];
            
            // Check if message already exists
            const messageId = message.id || message.messageId;
            const existingIndex = globalMessages.findIndex(m => {
                const mId = m.id || m.messageId;
                return mId === messageId;
            });
            
            if (existingIndex >= 0) {
                // Update existing message
                globalMessages[existingIndex] = message;
            } else {
                // Add new message
                globalMessages.push(message);
            }
            
            // Save to global storage
            localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(globalMessages));
            console.log('Message added to global storage');
        } catch (error) {
            console.error('Error adding message to global storage:', error);
        }
    },
    
    /**
     * Get all resources from global storage
     * @returns {Array} Array of resources
     */
    getAllResources: function() {
        try {
            const globalResourcesData = localStorage.getItem(this.KEYS.RESOURCES);
            return globalResourcesData ? JSON.parse(globalResourcesData) : [];
        } catch (error) {
            console.error('Error getting resources from global storage:', error);
            return [];
        }
    },
    
    /**
     * Get all chats from global storage
     * @returns {Array} Array of chats
     */
    getAllChats: function() {
        try {
            const globalChatsData = localStorage.getItem(this.KEYS.CHATS);
            return globalChatsData ? JSON.parse(globalChatsData) : [];
        } catch (error) {
            console.error('Error getting chats from global storage:', error);
            return [];
        }
    },
    
    /**
     * Get all messages from global storage
     * @returns {Array} Array of messages
     */
    getAllMessages: function() {
        try {
            const globalMessagesData = localStorage.getItem(this.KEYS.MESSAGES);
            return globalMessagesData ? JSON.parse(globalMessagesData) : [];
        } catch (error) {
            console.error('Error getting messages from global storage:', error);
            return [];
        }
    },
    
    /**
     * Save all data before logout
     * This should be called before the user logs out
     */
    saveBeforeLogout: function() {
        console.log('Saving all data to global storage before logout...');
        
        // Save active data to global storage
        this.saveActiveDataToGlobalStorage();
        
        console.log('All data saved to global storage before logout');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global storage
    GlobalStorage.init();
    
    // Add event listener for page unload to save data
    window.addEventListener('beforeunload', function() {
        GlobalStorage.saveActiveDataToGlobalStorage();
    });
});

// Make available globally
window.GlobalStorage = GlobalStorage;
