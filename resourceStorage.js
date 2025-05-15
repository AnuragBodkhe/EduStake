/**
 * Resource Storage Manager
 * Handles persistent storage of uploaded resources across communities and subjects
 * Makes resources available to all users after login
 */

const ResourceStorage = {
    // Storage keys
    STORAGE_KEYS: {
        RESOURCES: 'edustake_resources',
        RESOURCES_BY_COMMUNITY: 'edustake_resources_by_community',
        RESOURCES_BY_SUBJECT: 'edustake_resources_by_subject'
    },
    
    /**
     * Save a resource to persistent storage
     * @param {Object} resource - The resource object to save
     * @param {string} resource.id - Unique identifier for the resource
     * @param {string} resource.name - Name of the resource
     * @param {string} resource.type - MIME type of the resource
     * @param {number} resource.size - Size of the resource in bytes
     * @param {string} resource.url - URL or data URL of the resource
     * @param {string} resource.communityId - ID of the community the resource belongs to
     * @param {string} resource.subjectId - ID of the subject the resource belongs to
     * @param {string} resource.uploaderId - ID of the user who uploaded the resource
     * @param {string} resource.uploaderName - Name of the user who uploaded the resource
     * @param {number} resource.uploadedAt - Timestamp of when the resource was uploaded
     * @returns {Promise} - A promise that resolves when the resource is saved
     */
    saveResource: function(resource) {
        // Ensure the resource has all required fields
        if (!resource.id || !resource.name || !resource.type) {
            return Promise.reject(new Error('Resource missing required fields'));
        }
        
        // Add timestamp if not provided
        if (!resource.uploadedAt) {
            resource.uploadedAt = Date.now();
        }
        
        return this._saveResourceToStorage(resource);
    },
    
    /**
     * Save a file as a resource
     * @param {File} file - The file object to save
     * @param {Object} metadata - Additional metadata for the resource
     * @returns {Promise} - A promise that resolves with the saved resource
     */
    saveFileAsResource: function(file, metadata = {}) {
        return new Promise((resolve, reject) => {
            // Generate a unique ID for the resource
            const resourceId = 'resource_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Create a FileReader to read the file as a data URL
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                
                // Create the resource object
                const resource = {
                    id: resourceId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: dataUrl,
                    communityId: metadata.communityId || this._getCurrentCommunityId(),
                    subjectId: metadata.subjectId || this._getCurrentSubjectId(),
                    uploaderId: metadata.uploaderId || this._getCurrentUserId(),
                    uploaderName: metadata.uploaderName || this._getCurrentUserName(),
                    uploadedAt: Date.now(),
                    description: metadata.description || ''
                };
                
                // Save the resource
                this._saveResourceToStorage(resource)
                    .then(() => resolve(resource))
                    .catch(reject);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            // Read the file as a data URL
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Get all resources
     * @returns {Promise} - A promise that resolves with an array of all resources
     */
    getAllResources: function() {
        return new Promise((resolve) => {
            try {
                const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
                const resources = resourcesJson ? JSON.parse(resourcesJson) : [];
                resolve(resources);
            } catch (error) {
                console.error('Error getting resources:', error);
                resolve([]);
            }
        });
    },
    
    /**
     * Get resources for a specific community
     * @param {string} communityId - ID of the community
     * @returns {Promise} - A promise that resolves with an array of resources for the community
     */
    getResourcesByCommunity: function(communityId) {
        return this.getAllResources().then(resources => {
            return resources.filter(resource => resource.communityId === communityId);
        });
    },
    
    /**
     * Get resources for a specific subject
     * @param {string} subjectId - ID of the subject
     * @returns {Promise} - A promise that resolves with an array of resources for the subject
     */
    getResourcesBySubject: function(subjectId) {
        return this.getAllResources().then(resources => {
            return resources.filter(resource => resource.subjectId === subjectId);
        });
    },
    
    /**
     * Get a specific resource by ID
     * @param {string} resourceId - ID of the resource
     * @returns {Promise} - A promise that resolves with the resource or null if not found
     */
    getResourceById: function(resourceId) {
        return this.getAllResources().then(resources => {
            return resources.find(resource => resource.id === resourceId) || null;
        });
    },
    
    /**
     * Delete a resource
     * @param {string} resourceId - ID of the resource to delete
     * @returns {Promise} - A promise that resolves when the resource is deleted
     */
    deleteResource: function(resourceId) {
        return new Promise((resolve, reject) => {
            this.getAllResources().then(resources => {
                const updatedResources = resources.filter(resource => resource.id !== resourceId);
                
                try {
                    localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(updatedResources));
                    this._updateResourceIndexes(updatedResources);
                    resolve({ success: true });
                } catch (error) {
                    console.error('Error deleting resource:', error);
                    reject(error);
                }
            });
        });
    },
    
    /**
     * Search for resources
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.query - Text to search for in resource name or description
     * @param {string} criteria.communityId - Filter by community ID
     * @param {string} criteria.subjectId - Filter by subject ID
     * @param {string} criteria.type - Filter by resource type
     * @returns {Promise} - A promise that resolves with an array of matching resources
     */
    searchResources: function(criteria = {}) {
        return this.getAllResources().then(resources => {
            return resources.filter(resource => {
                // Filter by query text
                if (criteria.query) {
                    const query = criteria.query.toLowerCase();
                    const nameMatch = resource.name.toLowerCase().includes(query);
                    const descMatch = resource.description && resource.description.toLowerCase().includes(query);
                    if (!nameMatch && !descMatch) return false;
                }
                
                // Filter by community
                if (criteria.communityId && resource.communityId !== criteria.communityId) {
                    return false;
                }
                
                // Filter by subject
                if (criteria.subjectId && resource.subjectId !== criteria.subjectId) {
                    return false;
                }
                
                // Filter by type
                if (criteria.type) {
                    if (criteria.type === 'image' && !resource.type.startsWith('image/')) return false;
                    if (criteria.type === 'document' && !resource.type.includes('pdf') && 
                        !resource.type.includes('word') && !resource.type.includes('doc')) return false;
                    if (criteria.type === 'presentation' && !resource.type.includes('presentation') && 
                        !resource.type.includes('powerpoint') && !resource.type.includes('ppt')) return false;
                }
                
                return true;
            });
        });
    },
    
    /**
     * Initialize the resource storage
     * Should be called when the application starts
     */
    initialize: function() {
        try {
            // Check if resources exist in localStorage
            if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES)) {
                // Initialize with empty array
                localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify([]));
            }
            
            // Check if community index exists
            if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES_BY_COMMUNITY)) {
                // Initialize with empty object
                localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_COMMUNITY, JSON.stringify({}));
            }
            
            // Check if subject index exists
            if (!localStorage.getItem(this.STORAGE_KEYS.RESOURCES_BY_SUBJECT)) {
                // Initialize with empty object
                localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_SUBJECT, JSON.stringify({}));
            }
            
            // Load global resources if LocalStorageManager is available
            if (window.LocalStorageManager) {
                // Get resources from localStorage
                const resourcesJson = localStorage.getItem(this.STORAGE_KEYS.RESOURCES);
                const resources = resourcesJson ? JSON.parse(resourcesJson) : [];
                
                // Get global resources from LocalStorageManager
                const globalResourcesJson = localStorage.getItem(window.LocalStorageManager.STORAGE_KEYS.GLOBAL_RESOURCES);
                const globalResources = globalResourcesJson ? JSON.parse(globalResourcesJson) : [];
                
                // Merge global resources into resources (avoid duplicates)
                if (globalResources.length > 0) {
                    const existingIds = new Set(resources.map(r => r.id));
                    const newResources = globalResources.filter(r => !existingIds.has(r.id));
                    
                    if (newResources.length > 0) {
                        const updatedResources = [...resources, ...newResources];
                        localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(updatedResources));
                        console.log(`Added ${newResources.length} global resources to active resources`);
                        
                        // Update indexes
                        this._updateResourceIndexes(updatedResources);
                    }
                }
            }
            
            console.log('ResourceStorage initialized with permanent storage support');
        } catch (error) {
            console.error('Error initializing ResourceStorage:', error);
        }
    },
    
    /**
     * Helper method to save a resource to storage
     * @private
     */
    _saveResourceToStorage: function(resource) {
        return new Promise((resolve, reject) => {
            this.getAllResources().then(resources => {
                // Check if resource already exists
                const existingIndex = resources.findIndex(r => r.id === resource.id);
                
                if (existingIndex >= 0) {
                    // Update existing resource
                    resources[existingIndex] = { ...resources[existingIndex], ...resource };
                } else {
                    // Add new resource
                    resources.push(resource);
                }
                
                try {
                    // Save updated resources
                    localStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
                    
                    // Update indexes
                    this._updateResourceIndexes(resources);
                    
                    resolve({ success: true, resource });
                } catch (error) {
                    console.error('Error saving resource:', error);
                    reject(error);
                }
            });
        });
    },
    
    /**
     * Update the resource indexes for faster lookups
     * @private
     */
    _updateResourceIndexes: function(resources) {
        // Create community index
        const communityIndex = {};
        
        // Create subject index
        const subjectIndex = {};
        
        // Populate indexes
        resources.forEach(resource => {
            // Add to community index
            if (resource.communityId) {
                if (!communityIndex[resource.communityId]) {
                    communityIndex[resource.communityId] = [];
                }
                communityIndex[resource.communityId].push(resource.id);
            }
            
            // Add to subject index
            if (resource.subjectId) {
                if (!subjectIndex[resource.subjectId]) {
                    subjectIndex[resource.subjectId] = [];
                }
                subjectIndex[resource.subjectId].push(resource.id);
            }
        });
        
        // Save indexes
        localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_COMMUNITY, JSON.stringify(communityIndex));
        localStorage.setItem(this.STORAGE_KEYS.RESOURCES_BY_SUBJECT, JSON.stringify(subjectIndex));
    },
    
    /**
     * Get the current community ID
     * @private
     */
    _getCurrentCommunityId: function() {
        // Try to get from active element
        const activeCollege = document.querySelector('.college-item.active');
        if (activeCollege) {
            return activeCollege.getAttribute('data-community-id') || 
                   activeCollege.querySelector('.college-name')?.textContent || 
                   'general';
        }
        
        // Fallback to localStorage
        return localStorage.getItem('currentCommunityId') || 'general';
    },
    
    /**
     * Get the current subject ID
     * @private
     */
    _getCurrentSubjectId: function() {
        // Try to get from active element
        const activeChannel = document.querySelector('.channel.active');
        if (activeChannel) {
            return activeChannel.getAttribute('data-channel-id') || 
                   activeChannel.querySelector('.channel-name')?.textContent || 
                   'general-chat';
        }
        
        // Fallback to localStorage
        return localStorage.getItem('currentSubjectId') || 'general-chat';
    },
    
    /**
     * Get the current user ID
     * @private
     */
    _getCurrentUserId: function() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return currentUser?.uid || 'anonymous';
        } catch (e) {
            return 'anonymous';
        }
    },
    
    /**
     * Get the current user name
     * @private
     */
    _getCurrentUserName: function() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return currentUser?.username || currentUser?.displayName || 'Anonymous User';
        } catch (e) {
            return 'Anonymous User';
        }
    }
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceStorage;
} else if (typeof window !== 'undefined') {
    window.ResourceStorage = ResourceStorage;
}
