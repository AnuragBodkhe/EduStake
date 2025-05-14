/**
 * User Profile Manager
 * Manages user profiles and ensures they persist in local storage
 */

// Create UserProfileManager as a global object
window.UserProfileManager = {
    // Storage key for profiles
    STORAGE_KEY: 'edustake_user_profiles',
    
    // Current profile cache
    currentProfile: null,
    
    /**
     * Initialize the UserProfileManager
     */
    initialize: function() {
        // Load profiles from localStorage
        this.loadProfiles();
        
        // Set current profile from currentUser
        this.setCurrentProfileFromUser();
        
        console.log('UserProfileManager initialized');
    },
    
    /**
     * Load profiles from localStorage
     * @returns {Object} Profiles object with user IDs as keys
     */
    loadProfiles: function() {
        try {
            const profilesJson = localStorage.getItem(this.STORAGE_KEY);
            this.profiles = profilesJson ? JSON.parse(profilesJson) : {};
            return this.profiles;
        } catch (error) {
            console.error('Error loading profiles:', error);
            this.profiles = {};
            return this.profiles;
        }
    },
    
    /**
     * Save profiles to localStorage
     */
    saveProfiles: function() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profiles));
        } catch (error) {
            console.error('Error saving profiles:', error);
        }
    },
    
    /**
     * Set current profile from currentUser in localStorage
     */
    setCurrentProfileFromUser: function() {
        try {
            const currentUserJson = localStorage.getItem('currentUser');
            if (!currentUserJson) return;
            
            const currentUser = JSON.parse(currentUserJson);
            if (!currentUser || !currentUser.uid) return;
            
            // Get or create profile
            let profile = this.getProfile(currentUser.uid);
            
            if (!profile) {
                // Create new profile
                profile = {
                    uid: currentUser.uid,
                    username: currentUser.username || currentUser.displayName || 'User',
                    email: currentUser.email || '',
                    photoURL: currentUser.photoURL || this.getDefaultAvatarURL(currentUser.email || 'User'),
                    lastUpdated: Date.now()
                };
                
                // Save new profile
                this.updateProfile(currentUser.uid, profile);
            }
            
            // Set as current profile
            this.currentProfile = profile;
            
            // Update currentUser with profile data if needed
            this.syncCurrentUserWithProfile(currentUser, profile);
        } catch (error) {
            console.error('Error setting current profile:', error);
        }
    },
    
    /**
     * Sync currentUser with profile data
     * @param {Object} currentUser - Current user object
     * @param {Object} profile - Profile object
     */
    syncCurrentUserWithProfile: function(currentUser, profile) {
        let needsUpdate = false;
        const updatedUser = {...currentUser};
        
        if (profile.username && (!currentUser.username || currentUser.username !== profile.username)) {
            updatedUser.username = profile.username;
            updatedUser.displayName = profile.username;
            needsUpdate = true;
        }
        
        if (profile.photoURL && (!currentUser.photoURL || currentUser.photoURL !== profile.photoURL)) {
            updatedUser.photoURL = profile.photoURL;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('Updated current user with profile data:', updatedUser);
        }
    },
    
    /**
     * Get profile by user ID
     * @param {string} uid - User ID
     * @returns {Object|null} Profile object or null if not found
     */
    getProfile: function(uid) {
        if (!this.profiles) this.loadProfiles();
        return this.profiles[uid] || null;
    },
    
    /**
     * Get current user profile
     * @returns {Object|null} Current profile or null if not set
     */
    getCurrentProfile: function() {
        if (this.currentProfile) return this.currentProfile;
        
        // Try to set from currentUser
        this.setCurrentProfileFromUser();
        return this.currentProfile;
    },
    
    /**
     * Update profile
     * @param {string} uid - User ID
     * @param {Object} profileData - Profile data
     * @returns {Object} Updated profile
     */
    updateProfile: function(uid, profileData) {
        if (!this.profiles) this.loadProfiles();
        
        // Update profile
        this.profiles[uid] = {
            ...this.profiles[uid],
            ...profileData,
            lastUpdated: Date.now()
        };
        
        // Save profiles
        this.saveProfiles();
        
        // Update current profile if it's the same user
        if (this.currentProfile && this.currentProfile.uid === uid) {
            this.currentProfile = this.profiles[uid];
            
            // Update currentUser with profile data
            const currentUserJson = localStorage.getItem('currentUser');
            if (currentUserJson) {
                const currentUser = JSON.parse(currentUserJson);
                this.syncCurrentUserWithProfile(currentUser, this.profiles[uid]);
            }
        }
        
        return this.profiles[uid];
    },
    
    /**
     * Update current user profile
     * @param {Object} profileData - Profile data
     * @returns {Object|null} Updated profile or null if no current user
     */
    updateCurrentProfile: function(profileData) {
        const currentUserJson = localStorage.getItem('currentUser');
        if (!currentUserJson) return null;
        
        const currentUser = JSON.parse(currentUserJson);
        if (!currentUser || !currentUser.uid) return null;
        
        return this.updateProfile(currentUser.uid, profileData);
    },
    
    /**
     * Get default avatar URL for a username or email
     * @param {string} identifier - Username or email
     * @returns {string} Default avatar URL
     */
    getDefaultAvatarURL: function(identifier) {
        if (!identifier) identifier = 'User';
        
        // Generate a color based on the identifier
        let hash = 0;
        for (let i = 0; i < identifier.length; i++) {
            hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Convert to a color
        const color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
        
        // Get first letter of identifier
        const initial = identifier.charAt(0).toUpperCase();
        
        // Create a data URL for a simple SVG with the initial
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="50%" dy=".35em" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${initial}</text></svg>`;
    },
    
    /**
     * Get username for display
     * @param {string} uid - User ID (optional, uses current user if not provided)
     * @returns {string} Username for display
     */
    getDisplayUsername: function(uid) {
        if (!uid) {
            const profile = this.getCurrentProfile();
            return profile ? profile.username : 'User';
        }
        
        const profile = this.getProfile(uid);
        return profile ? profile.username : 'User';
    },
    
    /**
     * Get profile photo URL
     * @param {string} uid - User ID (optional, uses current user if not provided)
     * @returns {string} Profile photo URL
     */
    getProfilePhotoURL: function(uid) {
        if (!uid) {
            const profile = this.getCurrentProfile();
            return profile && profile.photoURL ? 
                profile.photoURL : 
                this.getDefaultAvatarURL(profile ? profile.username : 'User');
        }
        
        const profile = this.getProfile(uid);
        return profile && profile.photoURL ? 
            profile.photoURL : 
            this.getDefaultAvatarURL(profile ? profile.username : 'User');
    },
    
    /**
     * Add user info to message
     * @param {Object} message - Message object
     * @returns {Object} Message with user info
     */
    addUserInfoToMessage: function(message) {
        if (!message) return message;
        
        // If message already has username and photoURL, return as is
        if (message.username && message.photoURL) return message;
        
        // Get user profile
        const profile = message.userId ? 
            this.getProfile(message.userId) : 
            this.getCurrentProfile();
        
        if (!profile) return message;
        
        // Add user info
        return {
            ...message,
            username: message.username || profile.username || 'User',
            photoURL: message.photoURL || profile.photoURL || this.getDefaultAvatarURL(profile.username)
        };
    },
    
    /**
     * Preserve user profiles during logout
     * This should be called before auth.signOut()
     */
    preserveProfilesOnLogout: function() {
        // We don't need to do anything special here as profiles are already stored
        // in localStorage under a separate key from auth data
        console.log('User profiles preserved for logout');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UserProfileManager
    window.UserProfileManager.initialize();
});
