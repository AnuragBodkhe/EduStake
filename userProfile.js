/**
 * User Profile Manager
 * Handles storage and retrieval of user profile data including photos
 */

const UserProfileManager = {
    // Storage keys
    STORAGE_KEYS: {
        CURRENT_USER: 'currentUser',
        USER_PROFILES: 'edustake_user_profiles'
    },
    
    /**
     * Initialize the user profile manager
     * Should be called when the application starts
     */
    initialize: function() {
        // Create empty storage if it doesn't exist
        if (!localStorage.getItem(this.STORAGE_KEYS.USER_PROFILES)) {
            localStorage.setItem(this.STORAGE_KEYS.USER_PROFILES, JSON.stringify({}));
        }
        
        console.log('User Profile Manager initialized');
        
        // Update current user's profile if logged in
        this.updateCurrentUserProfile();
    },
    
    /**
     * Update the current user's profile with any missing information
     */
    updateCurrentUserProfile: function() {
        try {
            const currentUserJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            if (!currentUserJson) return;
            
            const currentUser = JSON.parse(currentUserJson);
            if (!currentUser || !currentUser.uid) return;
            
            // Get existing profiles
            const profiles = this.getAllProfiles();
            
            // Check if user profile exists
            if (!profiles[currentUser.uid]) {
                // Create new profile
                profiles[currentUser.uid] = {
                    uid: currentUser.uid,
                    username: currentUser.username || currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL || null,
                    email: currentUser.email || null,
                    lastUpdated: Date.now()
                };
                
                // Save profiles
                localStorage.setItem(this.STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
            } else if (!profiles[currentUser.uid].photoURL && currentUser.photoURL) {
                // Update existing profile with photo if missing
                profiles[currentUser.uid].photoURL = currentUser.photoURL;
                profiles[currentUser.uid].lastUpdated = Date.now();
                
                // Save profiles
                localStorage.setItem(this.STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
            }
        } catch (e) {
            console.error('Error updating current user profile:', e);
        }
    },
    
    /**
     * Get all user profiles
     * @returns {Object} Object with user IDs as keys and profile objects as values
     */
    getAllProfiles: function() {
        try {
            const profilesJson = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILES);
            return profilesJson ? JSON.parse(profilesJson) : {};
        } catch (e) {
            console.error('Error getting user profiles:', e);
            return {};
        }
    },
    
    /**
     * Get a user's profile by ID
     * @param {string} userId - The user ID
     * @returns {Object|null} The user profile or null if not found
     */
    getProfile: function(userId) {
        if (!userId) return null;
        
        const profiles = this.getAllProfiles();
        return profiles[userId] || null;
    },
    
    /**
     * Get the current user's profile
     * @returns {Object|null} The current user's profile or null if not logged in
     */
    getCurrentProfile: function() {
        try {
            const currentUserJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            if (!currentUserJson) return null;
            
            const currentUser = JSON.parse(currentUserJson);
            if (!currentUser || !currentUser.uid) return null;
            
            return this.getProfile(currentUser.uid);
        } catch (e) {
            console.error('Error getting current user profile:', e);
            return null;
        }
    },
    
    /**
     * Update a user's profile
     * @param {string} userId - The user ID
     * @param {Object} profileData - The profile data to update
     * @returns {Object} The updated profile
     */
    updateProfile: function(userId, profileData) {
        if (!userId) throw new Error('User ID is required');
        
        // Get existing profiles
        const profiles = this.getAllProfiles();
        
        // Create or update profile
        profiles[userId] = {
            ...(profiles[userId] || {}),
            ...profileData,
            uid: userId,
            lastUpdated: Date.now()
        };
        
        // Save profiles
        localStorage.setItem(this.STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
        
        // If this is the current user, update currentUser in localStorage
        try {
            const currentUserJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            if (currentUserJson) {
                const currentUser = JSON.parse(currentUserJson);
                if (currentUser && currentUser.uid === userId) {
                    // Update current user with new profile data
                    const updatedUser = {
                        ...currentUser,
                        ...profileData
                    };
                    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
                }
            }
        } catch (e) {
            console.error('Error updating current user:', e);
        }
        
        return profiles[userId];
    },
    
    /**
     * Update the current user's profile photo
     * @param {File} photoFile - The photo file
     * @returns {Promise} A promise that resolves with the updated profile
     */
    updateProfilePhoto: function(photoFile) {
        return new Promise((resolve, reject) => {
            try {
                const currentUserJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
                if (!currentUserJson) {
                    reject(new Error('No current user'));
                    return;
                }
                
                const currentUser = JSON.parse(currentUserJson);
                if (!currentUser || !currentUser.uid) {
                    reject(new Error('Invalid current user'));
                    return;
                }
                
                // Read the file as a data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                    const photoURL = e.target.result;
                    
                    // Update the profile
                    const updatedProfile = this.updateProfile(currentUser.uid, { photoURL });
                    
                    resolve(updatedProfile);
                };
                
                reader.onerror = () => {
                    reject(new Error('Failed to read photo file'));
                };
                
                reader.readAsDataURL(photoFile);
            } catch (e) {
                reject(e);
            }
        });
    },
    
    /**
     * Get a user's display name
     * @param {string} userId - The user ID
     * @returns {string} The user's display name or a default name
     */
    getDisplayName: function(userId) {
        const profile = this.getProfile(userId);
        return profile ? (profile.username || profile.displayName || 'User') : 'Unknown User';
    },
    
    /**
     * Get a user's profile photo URL
     * @param {string} userId - The user ID
     * @returns {string|null} The user's profile photo URL or null if not set
     */
    getProfilePhotoURL: function(userId) {
        const profile = this.getProfile(userId);
        return profile ? profile.photoURL : null;
    },
    
    /**
     * Get a default avatar URL based on username
     * @param {string} username - The username
     * @returns {string} A URL to a default avatar
     */
    getDefaultAvatarURL: function(username) {
        // Generate a color based on the username
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Convert to a color
        const color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
        
        // Get first letter of username
        const initial = username.charAt(0).toUpperCase();
        
        // Create a data URL for a simple SVG with the initial
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="50%" dy=".35em" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${initial}</text></svg>`;
    }
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileManager;
} else if (typeof window !== 'undefined') {
    window.UserProfileManager = UserProfileManager;
}
