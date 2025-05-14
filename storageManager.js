/**
 * Storage Manager - A utility for managing data storage
 * Uses both localStorage (client-side) and PHP backend (server-side)
 */
const StorageManager = {
    /**
     * Save data with the given key
     * @param {string} key - The key to store the data under
     * @param {any} value - The data to store
     * @returns {Promise} - A promise that resolves when the data is saved
     */
    saveData: function(key, value) {
        return new Promise((resolve, reject) => {
            // First, try to save to localStorage for immediate availability
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }
            
            // Then, try to save to the server
            fetch('saveData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data);
                } else {
                    reject(new Error(data.message || 'Failed to save data to server'));
                }
            })
            .catch(error => {
                console.warn('Server storage failed, using localStorage only:', error);
                // If server save fails but localStorage worked, consider it a success
                if (localStorage.getItem(key) !== null) {
                    resolve({ success: true, message: 'Data saved to localStorage only', localStorage: true });
                } else {
                    reject(error);
                }
            });
        });
    },
    
    /**
     * Get data with the given key
     * @param {string} key - The key to retrieve the data for
     * @returns {Promise} - A promise that resolves with the retrieved data
     */
    getData: function(key) {
        return new Promise((resolve, reject) => {
            // First, try to get from localStorage for immediate access
            try {
                const localData = localStorage.getItem(key);
                if (localData !== null) {
                    try {
                        const parsedData = JSON.parse(localData);
                        // If we have local data, return it immediately
                        resolve({ success: true, data: parsedData, source: 'localStorage' });
                        // Still try to get from server, but don't block the response
                        this._fetchFromServer(key);
                        return;
                    } catch (e) {
                        console.warn('Failed to parse localStorage data:', e);
                    }
                }
            } catch (e) {
                console.warn('Failed to read from localStorage:', e);
            }
            
            // If localStorage fails or has no data, try the server
            this._fetchFromServer(key)
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    },
    
    /**
     * Helper method to fetch data from the server
     * @private
     */
    _fetchFromServer: function(key) {
        return new Promise((resolve, reject) => {
            fetch(`getData.php?key=${encodeURIComponent(key)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update localStorage with the latest data from server
                        try {
                            localStorage.setItem(key, JSON.stringify(data.data));
                        } catch (e) {
                            console.warn('Failed to update localStorage with server data:', e);
                        }
                        resolve({ success: true, data: data.data, source: 'server' });
                    } else {
                        reject(new Error(data.message || 'Failed to retrieve data from server'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    },
    
    /**
     * Delete data with the given key
     * @param {string} key - The key of the data to delete
     * @returns {Promise} - A promise that resolves when the data is deleted
     */
    deleteData: function(key) {
        return new Promise((resolve, reject) => {
            // First, remove from localStorage
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('Failed to delete from localStorage:', e);
            }
            
            // Then, try to delete from the server
            fetch(`deleteData.php?key=${encodeURIComponent(key)}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data);
                } else {
                    // If server delete failed but localStorage succeeded, consider it a partial success
                    if (localStorage.getItem(key) === null) {
                        resolve({ success: true, message: 'Data deleted from localStorage only', localStorage: true });
                    } else {
                        reject(new Error(data.message || 'Failed to delete data from server'));
                    }
                }
            })
            .catch(error => {
                console.warn('Server delete failed:', error);
                // If server delete fails but localStorage worked, consider it a success
                if (localStorage.getItem(key) === null) {
                    resolve({ success: true, message: 'Data deleted from localStorage only', localStorage: true });
                } else {
                    reject(error);
                }
            });
        });
    },
    
    /**
     * Get all available storage keys
     * @returns {Promise} - A promise that resolves with an array of keys
     */
    getAllKeys: function() {
        return new Promise((resolve, reject) => {
            // Get keys from localStorage
            const localKeys = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    localKeys.push(localStorage.key(i));
                }
            } catch (e) {
                console.warn('Failed to get keys from localStorage:', e);
            }
            
            // Get keys from server
            fetch('getData.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Combine keys from localStorage and server, removing duplicates
                        const allKeys = [...new Set([...localKeys, ...data.keys])];
                        resolve({ success: true, keys: allKeys });
                    } else {
                        // If server fails, just return localStorage keys
                        resolve({ success: true, keys: localKeys, source: 'localStorage' });
                    }
                })
                .catch(error => {
                    console.warn('Failed to get keys from server:', error);
                    // If server fails, just return localStorage keys
                    resolve({ success: true, keys: localKeys, source: 'localStorage' });
                });
        });
    },
    
    /**
     * Check if the browser supports localStorage
     * @returns {boolean} - True if localStorage is supported
     */
    isLocalStorageSupported: function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Check if the server storage is available
     * @returns {Promise} - A promise that resolves with true if server storage is available
     */
    isServerStorageAvailable: function() {
        return new Promise((resolve) => {
            fetch('getData.php')
                .then(response => {
                    resolve(response.ok);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
} 