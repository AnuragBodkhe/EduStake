/**
 * Local Storage Manager
 * Ensures resources and chats are permanently stored locally and available to all users
 * even after logout and when new users log in
 */

const LocalStorageManager = {
    // Storage keys
    STORAGE_KEYS: {
        RESOURCES: 'edustake_resources',
        RESOURCES_BY_COMMUNITY: 'edustake_resources_by_community',
        RESOURCES_BY_SUBJECT: 'edustake_resources_by_subject',
        SAVED_CHATS: 'edustake_saved_chats',
        CURRENT_MESSAGES: 'edustake_current_messages',
        SEARCH_HISTORY: 'edustake_search_history',
        USER_PROFILES: 'edustake_user_profiles',
        PERMANENT_STORAGE_FLAG: 'edustake_permanent_storage_enabled',
        GLOBAL_RESOURCES: 'edustake_global_resources',
        GLOBAL_CHATS: 'edustake_global_chats'
    },

    /**
     * Initialize the local storage manager
     * This should be called when the application starts
     */
    initialize: function() {
        // Set permanent storage flag to true
        localStorage.setItem(this.STORAGE_KEYS.PERMANENT_STORAGE_FLAG, 'true');
        
        // Initialize resources if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES)) {
            localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify([]));
        }
        
        // Initialize community resources index if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES_BY_COMMUNITY)) {
            localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_COMMUNITY, JSON.stringify({}));
        }
        
        // Initialize subject resources index if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES_BY_SUBJECT)) {
            localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_SUBJECT, JSON.stringify({}));
        }
        
        // Initialize saved chats if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.SAVED_CHATS)) {
            localStorage.setItem(this.STORAGE_KEYS.SAVED_CHATS, JSON.stringify([]));
        }
        
        // Initialize current messages if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.CURRENT_MESSAGES)) {
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_MESSAGES, JSON.stringify([]));
        }
        
        // Initialize global resources if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.GLOBAL_RESOURCES)) {
            localStorage.setItem(this.STORAGE_KEYS.GLOBAL_RESOURCES, JSON.stringify([]));
        }
        
        // Initialize global chats if not already present
        if (!localStorage.getItem(this.STORAGE_KEYS.GLOBAL_CHATS)) {
            localStorage.setItem(this.STORAGE_KEYS.GLOBAL_CHATS, JSON.stringify([]));
        }
        
        // Load any existing resources and chats into the global storage
        this.loadExistingDataIntoGlobalStorage();
        
        // Load global data into active storage
        this.loadGlobalDataIntoActiveStorage();
        
        console.log('LocalStorageManager initialized with permanent storage');
    },

    /**
     * Preserve data during logout
     * This should be called before auth.signOut()
     */
    preserveDataOnLogout: function() {
        console.log('Preserving data before logout');
        
        // Make sure all data is properly saved
        this.ensureDataIsSaved();
        
        // Save all resources and chats to global storage for permanent access
        this.saveDataToGlobalStorage();
    },
    
    /**
     * Ensure all data is properly saved in localStorage
     */
    ensureDataIsSaved: function() {
        try {
            // Get resources from ResourceStorage if available
            if (window.ResourceStorage) {
                window.ResourceStorage.getAllResources()
                    .then(resources => {
                        if (resources && resources.length > 0) {
                            localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
                        }
                    })
                    .catch(error => console.error('Error saving resources:', error));
            }
            
            // Get saved chats if available
            if (window.loadSavedChats) {
                const savedChats = window.loadSavedChats();
                if (savedChats && savedChats.length > 0) {
                    localStorage.setItem(this.STORAGE_KEYS.SAVED_CHATS, JSON.stringify(savedChats));
                }
            }
            
            // Get current messages if available
            const currentMessagesJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_MESSAGES);
            if (currentMessagesJson) {
                // Make sure they're properly saved
                try {
                    const currentMessages = JSON.parse(currentMessagesJson);
                    localStorage.setItem(this.STORAGE_KEYS.CURRENT_MESSAGES, JSON.stringify(currentMessages));
                } catch (error) {
                    console.error('Error parsing current messages:', error);
                }
            }
            
            console.log('All data successfully preserved');
        } catch (error) {
            console.error('Error ensuring data is saved:', error);
        }
    },
    
    /**
     * Load resources for all users
     * This should be called when the application starts
     */
    loadResourcesForAllUsers: function() {
        try {
            // Check if ResourceStorage is available
            if (window.ResourceStorage) {
                // Initialize ResourceStorage
                window.ResourceStorage.initialize();
            }
            
            console.log('Resources loaded for all users');
        } catch (error) {
            console.error('Error loading resources for all users:', error);
        }
    },
    
    /**
     * Load chats for all users
     * This should be called when the application starts
     */
    loadChatsForAllUsers: function() {
        try {
            // Load saved chats if the function is available
            if (window.loadSavedChats) {
                window.loadSavedChats();
            }
            
            console.log('Chats loaded for all users');
        } catch (error) {
            console.error('Error loading chats for all users:', error);
        }
    },
    
    /**
     * Get all resources
     * @returns {Array} Array of resources
     */
    getAllResources: function() {
        try {
            const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
            return resourcesJson ? JSON.parse(resourcesJson) : [];
        } catch (error) {
            console.error('Error getting resources:', error);
            return [];
        }
    },
    
    /**
     * Get all saved chats
     * @returns {Array} Array of saved chats
     */
    getAllSavedChats: function() {
        try {
            const savedChatsJson = localStorage.getItem(this.STORAGE_KEYS.SAVED_CHATS);
            return savedChatsJson ? JSON.parse(savedChatsJson) : [];
        } catch (error) {
            console.error('Error getting saved chats:', error);
            return [];
        }
    },
    
    /**
     * Get all current messages
     * @returns {Array} Array of current messages
     */
    getAllCurrentMessages: function() {
        try {
            const currentMessagesJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_MESSAGES);
            return currentMessagesJson ? JSON.parse(currentMessagesJson) : [];
        } catch (error) {
            console.error('Error getting current messages:', error);
            return [];
        }
    },
    
    /**
     * Load existing data into global storage
     * This ensures all resources and chats are permanently available
     */
    loadExistingDataIntoGlobalStorage: function() {
        try {
            // Get existing resources
            const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
            const resources = resourcesJson ? JSON.parse(resourcesJson) : [];
            
            // Get existing global resources
            const globalResourcesJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_RESOURCES);
            let globalResources = globalResourcesJson ? JSON.parse(globalResourcesJson) : [];
            
            // Merge resources into global resources (avoid duplicates)
            if (resources.length > 0) {
                const existingIds = new Set(globalResources.map(r => r.id));
                const newResources = resources.filter(r => !existingIds.has(r.id));
                
                if (newResources.length > 0) {
                    globalResources = [...globalResources, ...newResources];
                    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_RESOURCES, JSON.stringify(globalResources));
                    console.log(`Added ${newResources.length} resources to global storage`);
                }
            }
            
            // Get existing saved chats
            const savedChatsJson = localStorage.getItem(this.STORAGE_KEYS.SAVED_CHATS);
            const savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
            
            // Get existing global chats
            const globalChatsJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_CHATS);
            let globalChats = globalChatsJson ? JSON.parse(globalChatsJson) : [];
            
            // Merge saved chats into global chats (avoid duplicates)
            if (savedChats.length > 0) {
                const existingIds = new Set(globalChats.map(c => c.id));
                const newChats = savedChats.filter(c => !existingIds.has(c.id));
                
                if (newChats.length > 0) {
                    globalChats = [...globalChats, ...newChats];
                    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_CHATS, JSON.stringify(globalChats));
                    console.log(`Added ${newChats.length} chats to global storage`);
                }
            }
            
            // Get current messages
            const currentMessagesJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_MESSAGES);
            const currentMessages = currentMessagesJson ? JSON.parse(currentMessagesJson) : [];
            
            // Add current messages to global chats if they're not already saved
            if (currentMessages.length > 0) {
                const existingIds = new Set(globalChats.map(c => c.id));
                const newMessages = currentMessages
                    .filter(m => m.id && !existingIds.has(m.id))
                    .map(m => ({
                        id: m.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        content: m.content || m.text || m.message || '',
                        username: m.username || 'User',
                        photoURL: m.photoURL || '',
                        timestamp: m.timestamp || Date.now(),
                        type: 'message'
                    }));
                
                if (newMessages.length > 0) {
                    globalChats = [...globalChats, ...newMessages];
                    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_CHATS, JSON.stringify(globalChats));
                    console.log(`Added ${newMessages.length} current messages to global storage`);
                }
            }
            
            console.log('Existing data loaded into global storage');
        } catch (error) {
            console.error('Error loading existing data into global storage:', error);
        }
    },
    
    /**
     * Save data to global storage
     * This ensures all resources and chats are permanently available
     */
    saveDataToGlobalStorage: function() {
        try {
            // Get resources from ResourceStorage if available
            if (window.ResourceStorage) {
                window.ResourceStorage.getAllResources()
                    .then(resources => {
                        if (resources && resources.length > 0) {
                            // Get existing global resources
                            const globalResourcesJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_RESOURCES);
                            let globalResources = globalResourcesJson ? JSON.parse(globalResourcesJson) : [];
                            
                            // Merge resources into global resources (avoid duplicates)
                            const existingIds = new Set(globalResources.map(r => r.id));
                            const newResources = resources.filter(r => !existingIds.has(r.id));
                            
                            if (newResources.length > 0) {
                                globalResources = [...globalResources, ...newResources];
                                localStorage.setItem(this.STORAGE_KEYS.GLOBAL_RESOURCES, JSON.stringify(globalResources));
                                console.log(`Added ${newResources.length} resources to global storage`);
                            }
                        }
                    })
                    .catch(error => console.error('Error saving resources to global storage:', error));
            } else {
                // Get resources directly from localStorage
                const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
                const resources = resourcesJson ? JSON.parse(resourcesJson) : [];
                
                if (resources.length > 0) {
                    // Get existing global resources
                    const globalResourcesJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_RESOURCES);
                    let globalResources = globalResourcesJson ? JSON.parse(globalResourcesJson) : [];
                    
                    // Merge resources into global resources (avoid duplicates)
                    const existingIds = new Set(globalResources.map(r => r.id));
                    const newResources = resources.filter(r => !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        globalResources = [...globalResources, ...newResources];
                        localStorage.setItem(this.STORAGE_KEYS.GLOBAL_RESOURCES, JSON.stringify(globalResources));
                        console.log(`Added ${newResources.length} resources to global storage`);
                    }
                }
            }
            
            // Get saved chats
            const savedChatsJson = localStorage.getItem(this.STORAGE_KEYS.SAVED_CHATS);
            const savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
            
            if (savedChats.length > 0) {
                // Get existing global chats
                const globalChatsJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_CHATS);
                let globalChats = globalChatsJson ? JSON.parse(globalChatsJson) : [];
                
                // Merge saved chats into global chats (avoid duplicates)
                const existingIds = new Set(globalChats.map(c => c.id));
                const newChats = savedChats.filter(c => !existingIds.has(c.id));
                
                if (newChats.length > 0) {
                    globalChats = [...globalChats, ...newChats];
                    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_CHATS, JSON.stringify(globalChats));
                    console.log(`Added ${newChats.length} chats to global storage`);
                }
            }
            
            // Get current messages
            const currentMessagesJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_MESSAGES);
            const currentMessages = currentMessagesJson ? JSON.parse(currentMessagesJson) : [];
            
            if (currentMessages.length > 0) {
                // Get existing global chats
                const globalChatsJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_CHATS);
                let globalChats = globalChatsJson ? JSON.parse(globalChatsJson) : [];
                
                // Add current messages to global chats if they're not already saved
                const existingIds = new Set(globalChats.map(c => c.id));
                const newMessages = currentMessages
                    .filter(m => m.id && !existingIds.has(m.id))
                    .map(m => ({
                        id: m.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        content: m.content || m.text || m.message || '',
                        username: m.username || 'User',
                        photoURL: m.photoURL || '',
                        timestamp: m.timestamp || Date.now(),
                        type: 'message'
                    }));
                
                if (newMessages.length > 0) {
                    globalChats = [...globalChats, ...newMessages];
                    localStorage.setItem(this.STORAGE_KEYS.GLOBAL_CHATS, JSON.stringify(globalChats));
                    console.log(`Added ${newMessages.length} current messages to global storage`);
                }
            }
            
            console.log('All data successfully saved to global storage');
        } catch (error) {
            console.error('Error saving data to global storage:', error);
        }
    },
    
    /**
     * Load global data into active storage
     * This ensures all resources and chats are available to the current user
     */
    loadGlobalDataIntoActiveStorage: function() {
        try {
            // Get global resources
            const globalResourcesJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_RESOURCES);
            const globalResources = globalResourcesJson ? JSON.parse(globalResourcesJson) : [];
            
            if (globalResources.length > 0) {
                // Get existing resources
                const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
                let resources = resourcesJson ? JSON.parse(resourcesJson) : [];
                
                // Merge global resources into resources (avoid duplicates)
                const existingIds = new Set(resources.map(r => r.id));
                const newResources = globalResources.filter(r => !existingIds.has(r.id));
                
                if (newResources.length > 0) {
                    resources = [...resources, ...newResources];
                    localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
                    console.log(`Added ${newResources.length} global resources to active storage`);
                    
                    // Update resource indexes if ResourceStorage is available
                    if (window.ResourceStorage && window.ResourceStorage._updateResourceIndexes) {
                        window.ResourceStorage._updateResourceIndexes(resources);
                    }
                }
            }
            
            // Get global chats
            const globalChatsJson = localStorage.getItem(this.STORAGE_KEYS.GLOBAL_CHATS);
            const globalChats = globalChatsJson ? JSON.parse(globalChatsJson) : [];
            
            if (globalChats.length > 0) {
                // Get existing saved chats
                const savedChatsJson = localStorage.getItem(this.STORAGE_KEYS.SAVED_CHATS);
                let savedChats = savedChatsJson ? JSON.parse(savedChatsJson) : [];
                
                // Merge global chats into saved chats (avoid duplicates)
                const existingIds = new Set(savedChats.map(c => c.id));
                const newChats = globalChats.filter(c => !existingIds.has(c.id));
                
                if (newChats.length > 0) {
                    savedChats = [...savedChats, ...newChats];
                    localStorage.setItem(this.STORAGE_KEYS.SAVED_CHATS, JSON.stringify(savedChats));
                    console.log(`Added ${newChats.length} global chats to saved chats`);
                }
            }
            
            console.log('Global data loaded into active storage');
        } catch (error) {
            console.error('Error loading global data into active storage:', error);
        }
    }
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageManager;
} else if (typeof window !== 'undefined') {
    window.LocalStorageManager = LocalStorageManager;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize LocalStorageManager
    LocalStorageManager.initialize();
    
    // Load resources and chats for all users
    LocalStorageManager.loadResourcesForAllUsers();
    LocalStorageManager.loadChatsForAllUsers();
});
