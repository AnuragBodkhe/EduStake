/**
 * Direct Storage System
 * Ensures resources and chats are immediately available after page refresh
 * and visible to all users regardless of login state
 */

const DirectStorage = {
    // Storage keys
    KEYS: {
        ALL_RESOURCES: 'all_resources_permanent',
        ALL_CHATS: 'all_chats_permanent',
        ALL_MESSAGES: 'all_messages_permanent'
    },
    
    /**
     * Initialize the direct storage system
     */
    init: function() {
        console.log('Initializing Direct Storage System...');
        
        // Create storage containers if they don't exist
        if (!localStorage.getItem(this.KEYS.ALL_RESOURCES)) {
            localStorage.setItem(this.KEYS.ALL_RESOURCES, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.ALL_CHATS)) {
            localStorage.setItem(this.KEYS.ALL_CHATS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.ALL_MESSAGES)) {
            localStorage.setItem(this.KEYS.ALL_MESSAGES, JSON.stringify([]));
        }
        
        // Immediately save any existing data
        this.saveAllDataImmediately();
        
        // Immediately load all data
        this.loadAllDataImmediately();
        
        // Set up auto-save
        this.setupAutoSave();
        
        // Set up event listeners for page load and unload
        this.setupEventListeners();
        
        console.log('Direct Storage System initialized');
    },
    
    /**
     * Save all data immediately
     */
    saveAllDataImmediately: function() {
        console.log('Saving all data immediately...');
        
        // Save resources
        this.saveResources();
        
        // Save chats
        this.saveChats();
        
        // Save messages
        this.saveMessages();
        
        console.log('All data saved immediately');
    },
    
    /**
     * Save resources to permanent storage
     */
    saveResources: function() {
        try {
            // Get resources from standard storage
            const standardKeys = ['edustake_resources', 'resources', 'global_resources_data'];
            let allResources = [];
            
            // Collect resources from all possible storage keys
            standardKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const resources = JSON.parse(data);
                        if (Array.isArray(resources) && resources.length > 0) {
                            allResources = [...allResources, ...resources];
                        }
                    } catch (e) {
                        console.error(`Error parsing ${key}:`, e);
                    }
                }
            });
            
            // Get existing permanent resources
            const permanentData = localStorage.getItem(this.KEYS.ALL_RESOURCES);
            let permanentResources = permanentData ? JSON.parse(permanentData) : [];
            
            // Merge resources (avoid duplicates)
            if (allResources.length > 0) {
                const existingIds = new Set(permanentResources.map(r => r.id));
                const newResources = allResources.filter(r => r.id && !existingIds.has(r.id));
                
                if (newResources.length > 0) {
                    permanentResources = [...permanentResources, ...newResources];
                    localStorage.setItem(this.KEYS.ALL_RESOURCES, JSON.stringify(permanentResources));
                    console.log(`Saved ${newResources.length} resources to permanent storage`);
                }
            }
        } catch (error) {
            console.error('Error saving resources:', error);
        }
    },
    
    /**
     * Save chats to permanent storage
     */
    saveChats: function() {
        try {
            // Get chats from standard storage
            const standardKeys = ['edustake_saved_chats', 'saved_chats', 'global_chats_data'];
            let allChats = [];
            
            // Collect chats from all possible storage keys
            standardKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const chats = JSON.parse(data);
                        if (Array.isArray(chats) && chats.length > 0) {
                            allChats = [...allChats, ...chats];
                        }
                    } catch (e) {
                        console.error(`Error parsing ${key}:`, e);
                    }
                }
            });
            
            // Get existing permanent chats
            const permanentData = localStorage.getItem(this.KEYS.ALL_CHATS);
            let permanentChats = permanentData ? JSON.parse(permanentData) : [];
            
            // Merge chats (avoid duplicates)
            if (allChats.length > 0) {
                const existingIds = new Set(permanentChats.map(c => c.id));
                const newChats = allChats.filter(c => c.id && !existingIds.has(c.id));
                
                if (newChats.length > 0) {
                    permanentChats = [...permanentChats, ...newChats];
                    localStorage.setItem(this.KEYS.ALL_CHATS, JSON.stringify(permanentChats));
                    console.log(`Saved ${newChats.length} chats to permanent storage`);
                }
            }
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    },
    
    /**
     * Save messages to permanent storage
     */
    saveMessages: function() {
        try {
            // Get messages from standard storage
            const standardKeys = ['edustake_current_messages', 'current_messages', 'global_messages_data'];
            let allMessages = [];
            
            // Collect messages from all possible storage keys
            standardKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const messages = JSON.parse(data);
                        if (Array.isArray(messages) && messages.length > 0) {
                            allMessages = [...allMessages, ...messages];
                        }
                    } catch (e) {
                        console.error(`Error parsing ${key}:`, e);
                    }
                }
            });
            
            // Get existing permanent messages
            const permanentData = localStorage.getItem(this.KEYS.ALL_MESSAGES);
            let permanentMessages = permanentData ? JSON.parse(permanentData) : [];
            
            // Merge messages (avoid duplicates)
            if (allMessages.length > 0) {
                const existingIds = new Set(permanentMessages.map(m => m.id || m.messageId));
                const newMessages = allMessages.filter(m => {
                    const id = m.id || m.messageId;
                    return id && !existingIds.has(id);
                });
                
                if (newMessages.length > 0) {
                    permanentMessages = [...permanentMessages, ...newMessages];
                    localStorage.setItem(this.KEYS.ALL_MESSAGES, JSON.stringify(permanentMessages));
                    console.log(`Saved ${newMessages.length} messages to permanent storage`);
                }
            }
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    },
    
    /**
     * Load all data immediately
     */
    loadAllDataImmediately: function() {
        console.log('Loading all data immediately...');
        
        // Load resources
        this.loadResources();
        
        // Load chats
        this.loadChats();
        
        // Load messages
        this.loadMessages();
        
        console.log('All data loaded immediately');
    },
    
    /**
     * Load resources from permanent storage
     */
    loadResources: function() {
        try {
            // Get permanent resources
            const permanentData = localStorage.getItem(this.KEYS.ALL_RESOURCES);
            const permanentResources = permanentData ? JSON.parse(permanentData) : [];
            
            if (permanentResources.length > 0) {
                // Load into all standard storage locations
                const standardKeys = ['edustake_resources', 'resources', 'global_resources_data'];
                
                standardKeys.forEach(key => {
                    const existingData = localStorage.getItem(key);
                    let existingResources = existingData ? JSON.parse(existingData) : [];
                    
                    // Merge permanent resources into existing resources (avoid duplicates)
                    const existingIds = new Set(existingResources.map(r => r.id));
                    const newResources = permanentResources.filter(r => r.id && !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        existingResources = [...existingResources, ...newResources];
                        localStorage.setItem(key, JSON.stringify(existingResources));
                        console.log(`Loaded ${newResources.length} resources into ${key}`);
                    }
                });
                
                // Update resource indexes if ResourceStorage is available
                if (window.ResourceStorage && typeof window.ResourceStorage._updateResourceIndexes === 'function') {
                    const resourcesData = localStorage.getItem('edustake_resources');
                    if (resourcesData) {
                        const resources = JSON.parse(resourcesData);
                        window.ResourceStorage._updateResourceIndexes(resources);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    },
    
    /**
     * Load chats from permanent storage
     */
    loadChats: function() {
        try {
            // Get permanent chats
            const permanentData = localStorage.getItem(this.KEYS.ALL_CHATS);
            const permanentChats = permanentData ? JSON.parse(permanentData) : [];
            
            if (permanentChats.length > 0) {
                // Load into all standard storage locations
                const standardKeys = ['edustake_saved_chats', 'saved_chats', 'global_chats_data'];
                
                standardKeys.forEach(key => {
                    const existingData = localStorage.getItem(key);
                    let existingChats = existingData ? JSON.parse(existingData) : [];
                    
                    // Merge permanent chats into existing chats (avoid duplicates)
                    const existingIds = new Set(existingChats.map(c => c.id));
                    const newChats = permanentChats.filter(c => c.id && !existingIds.has(c.id));
                    
                    if (newChats.length > 0) {
                        existingChats = [...existingChats, ...newChats];
                        localStorage.setItem(key, JSON.stringify(existingChats));
                        console.log(`Loaded ${newChats.length} chats into ${key}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    },
    
    /**
     * Load messages from permanent storage
     */
    loadMessages: function() {
        try {
            // Get permanent messages
            const permanentData = localStorage.getItem(this.KEYS.ALL_MESSAGES);
            const permanentMessages = permanentData ? JSON.parse(permanentData) : [];
            
            if (permanentMessages.length > 0) {
                // Load into all standard storage locations
                const standardKeys = ['edustake_current_messages', 'current_messages', 'global_messages_data'];
                
                standardKeys.forEach(key => {
                    const existingData = localStorage.getItem(key);
                    let existingMessages = existingData ? JSON.parse(existingData) : [];
                    
                    // Merge permanent messages into existing messages (avoid duplicates)
                    const existingIds = new Set(existingMessages.map(m => m.id || m.messageId));
                    const newMessages = permanentMessages.filter(m => {
                        const id = m.id || m.messageId;
                        return id && !existingIds.has(id);
                    });
                    
                    if (newMessages.length > 0) {
                        existingMessages = [...existingMessages, ...newMessages];
                        localStorage.setItem(key, JSON.stringify(existingMessages));
                        console.log(`Loaded ${newMessages.length} messages into ${key}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    },
    
    /**
     * Set up auto-save to periodically save data
     */
    setupAutoSave: function() {
        // Save data every 5 seconds
        setInterval(() => {
            this.saveAllDataImmediately();
        }, 5000);
    },
    
    /**
     * Set up event listeners for page load and unload
     */
    setupEventListeners: function() {
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllDataImmediately();
        });
        
        // Monitor DOM changes to detect new resources and messages
        if (typeof MutationObserver !== 'undefined') {
            // Create a mutation observer to monitor the entire document
            const observer = new MutationObserver((mutations) => {
                // Save data when DOM changes
                this.saveAllDataImmediately();
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });
        }
        
        // Add event listeners for resource uploads
        document.addEventListener('change', (event) => {
            if (event.target && event.target.type === 'file') {
                // Wait for the upload to complete
                setTimeout(() => {
                    this.saveAllDataImmediately();
                }, 1000);
            }
        });
        
        // Add event listeners for form submissions
        document.addEventListener('submit', (event) => {
            // Wait for the form submission to complete
            setTimeout(() => {
                this.saveAllDataImmediately();
            }, 1000);
        });
    },
    
    /**
     * Save data before logout
     */
    saveBeforeLogout: function() {
        console.log('Saving data before logout...');
        this.saveAllDataImmediately();
    },
    
    /**
     * Force refresh data from permanent storage
     * Call this function if data is not showing up after refresh
     */
    forceRefresh: function() {
        console.log('Forcing refresh of all data...');
        this.loadAllDataImmediately();
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
};

// Initialize immediately
DirectStorage.init();

// Make available globally
window.DirectStorage = DirectStorage;

// Force refresh on page load
window.addEventListener('load', function() {
    // Wait a short time for other scripts to initialize
    setTimeout(() => {
        DirectStorage.loadAllDataImmediately();
    }, 500);
});

// Add a special event listener for the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time for other scripts to initialize
    setTimeout(() => {
        DirectStorage.loadAllDataImmediately();
    }, 1000);
});
