/**
 * Firebase Utilities for EduStake
 * Provides integration between Firebase and existing EduStake functionality
 */

import { auth, database, storage } from './firebase-config.js';
import { 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    push, 
    query, 
    orderByChild, 
    equalTo, 
    onValue, 
    off 
} from 'firebase/database';
import { 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile 
} from 'firebase/auth';

/**
 * User Profile Management
 * Integrates with UserProfileManager.js
 */
export const UserProfileFirebase = {
    /**
     * Get user profile from Firebase
     * @param {string} uid - User ID
     * @returns {Promise<Object>} User profile
     */
    async getProfile(uid) {
        try {
            const userProfileRef = ref(database, `userProfiles/${uid}`);
            const snapshot = await get(userProfileRef);
            
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log('No profile found for user:', uid);
                return null;
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },

    /**
     * Update user profile in Firebase
     * @param {string} uid - User ID
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated profile
     */
    async updateProfile(uid, profileData) {
        try {
            const userProfileRef = ref(database, `userProfiles/${uid}`);
            
            // Get existing profile or create new one
            const snapshot = await get(userProfileRef);
            const existingProfile = snapshot.exists() ? snapshot.val() : {};
            
            // Merge with new data
            const updatedProfile = {
                ...existingProfile,
                ...profileData,
                uid,
                lastUpdated: Date.now()
            };
            
            // Update in Firebase
            await update(userProfileRef, updatedProfile);
            
            // If there's a photoURL update, also update auth profile
            if (profileData.photoURL && auth.currentUser && auth.currentUser.uid === uid) {
                await updateProfile(auth.currentUser, {
                    displayName: updatedProfile.username,
                    photoURL: updatedProfile.photoURL
                });
            }
            
            console.log('Profile updated successfully');
            return updatedProfile;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },
    
    /**
     * Sync local user profiles with Firebase
     * This helps migrate from localStorage to Firebase
     */
    async syncLocalProfilesToFirebase() {
        try {
            // Get profiles from localStorage
            const profilesJson = localStorage.getItem('edustake_user_profiles');
            if (!profilesJson) return;
            
            const localProfiles = JSON.parse(profilesJson);
            
            // For each profile, update in Firebase
            for (const [uid, profile] of Object.entries(localProfiles)) {
                await this.updateProfile(uid, profile);
            }
            
            console.log('Local profiles synced to Firebase');
        } catch (error) {
            console.error('Error syncing profiles to Firebase:', error);
        }
    }
};

/**
 * Saved Chats Management
 * Integrates with saved-chats.js
 */
export const SavedChatsFirebase = {
    /**
     * Get saved chats from Firebase
     * @param {string} uid - User ID (optional, uses current user if not provided)
     * @returns {Promise<Array>} Array of saved chats
     */
    async getSavedChats(uid) {
        try {
            const currentUid = uid || (auth.currentUser ? auth.currentUser.uid : null);
            if (!currentUid) {
                console.log('No user ID provided and no user logged in');
                return [];
            }
            
            const savedChatsRef = ref(database, `savedChats/${currentUid}`);
            const snapshot = await get(savedChatsRef);
            
            if (snapshot.exists()) {
                // Convert from object to array
                const chatsObj = snapshot.val();
                return Object.values(chatsObj);
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error getting saved chats:', error);
            return [];
        }
    },
    
    /**
     * Save a chat message to Firebase
     * @param {Object} chat - Chat object to save
     * @returns {Promise<string>} ID of saved chat
     */
    async saveChat(chat) {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            // Add saved timestamp
            const chatToSave = {
                ...chat,
                savedAt: Date.now()
            };
            
            // Generate a new ID if not provided
            const savedChatsRef = ref(database, `savedChats/${currentUid}`);
            const newChatRef = chat.id ? 
                ref(database, `savedChats/${currentUid}/${chat.id}`) : 
                push(savedChatsRef);
            
            await set(newChatRef, chatToSave);
            
            const chatId = chat.id || newChatRef.key;
            console.log('Chat saved successfully with ID:', chatId);
            return chatId;
        } catch (error) {
            console.error('Error saving chat:', error);
            throw error;
        }
    },
    
    /**
     * Remove a saved chat from Firebase
     * @param {string} chatId - ID of chat to remove
     * @returns {Promise<void>}
     */
    async removeChat(chatId) {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            const chatRef = ref(database, `savedChats/${currentUid}/${chatId}`);
            await remove(chatRef);
            
            console.log('Chat removed successfully');
        } catch (error) {
            console.error('Error removing chat:', error);
            throw error;
        }
    },
    
    /**
     * Sync local saved chats with Firebase
     * This helps migrate from localStorage to Firebase
     */
    async syncLocalChatsToFirebase() {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                console.log('User not logged in, cannot sync chats');
                return;
            }
            
            // Get chats from localStorage
            const savedChatsJson = localStorage.getItem('edustake_saved_chats');
            if (!savedChatsJson) return;
            
            const localChats = JSON.parse(savedChatsJson);
            
            // For each chat, save to Firebase
            for (const chat of localChats) {
                await this.saveChat(chat);
            }
            
            console.log('Local chats synced to Firebase');
        } catch (error) {
            console.error('Error syncing chats to Firebase:', error);
        }
    }
};

/**
 * Search History Management
 * Integrates with search-recommendations.js
 */
export const SearchHistoryFirebase = {
    /**
     * Get search history from Firebase
     * @param {string} uid - User ID (optional, uses current user if not provided)
     * @param {number} limit - Maximum number of items to return
     * @returns {Promise<Array>} Array of search history items
     */
    async getSearchHistory(uid, limit = 10) {
        try {
            const currentUid = uid || (auth.currentUser ? auth.currentUser.uid : null);
            if (!currentUid) {
                console.log('No user ID provided and no user logged in');
                return [];
            }
            
            const searchHistoryRef = ref(database, `searchHistory/${currentUid}`);
            const snapshot = await get(searchHistoryRef);
            
            if (snapshot.exists()) {
                // Convert from object to array and sort by timestamp descending
                const historyObj = snapshot.val();
                const historyArray = Object.values(historyObj);
                historyArray.sort((a, b) => b.timestamp - a.timestamp);
                
                // Return limited number of items
                return historyArray.slice(0, limit);
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error getting search history:', error);
            return [];
        }
    },
    
    /**
     * Add search query to history in Firebase
     * @param {string} query - Search query
     * @param {number} resultCount - Number of results found
     * @returns {Promise<string>} ID of search history item
     */
    async addToSearchHistory(query, resultCount = 0) {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            const searchItem = {
                query,
                timestamp: Date.now(),
                resultCount
            };
            
            const searchHistoryRef = ref(database, `searchHistory/${currentUid}`);
            const newSearchRef = push(searchHistoryRef);
            
            await set(newSearchRef, searchItem);
            
            console.log('Search added to history');
            return newSearchRef.key;
        } catch (error) {
            console.error('Error adding to search history:', error);
            throw error;
        }
    },
    
    /**
     * Clear search history in Firebase
     * @returns {Promise<void>}
     */
    async clearSearchHistory() {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            const searchHistoryRef = ref(database, `searchHistory/${currentUid}`);
            await remove(searchHistoryRef);
            
            console.log('Search history cleared');
        } catch (error) {
            console.error('Error clearing search history:', error);
            throw error;
        }
    },
    
    /**
     * Sync local search history with Firebase
     * This helps migrate from localStorage to Firebase
     */
    async syncLocalSearchHistoryToFirebase() {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                console.log('User not logged in, cannot sync search history');
                return;
            }
            
            // Get search history from localStorage
            const searchHistoryJson = localStorage.getItem('edustake_search_history');
            if (!searchHistoryJson) return;
            
            const localHistory = JSON.parse(searchHistoryJson);
            
            // For each search item, add to Firebase
            for (const item of localHistory) {
                await this.addToSearchHistory(item.query, item.resultCount);
            }
            
            console.log('Local search history synced to Firebase');
        } catch (error) {
            console.error('Error syncing search history to Firebase:', error);
        }
    }
};

/**
 * Resources Management
 */
export const ResourcesFirebase = {
    /**
     * Get resources from Firebase
     * @param {string} category - Category to filter by (optional)
     * @returns {Promise<Array>} Array of resources
     */
    async getResources(category = null) {
        try {
            let resourcesRef;
            
            if (category) {
                // Query resources by category
                resourcesRef = query(
                    ref(database, 'resources'),
                    orderByChild('category'),
                    equalTo(category)
                );
            } else {
                // Get all resources
                resourcesRef = ref(database, 'resources');
            }
            
            const snapshot = await get(resourcesRef);
            
            if (snapshot.exists()) {
                // Convert from object to array
                const resourcesObj = snapshot.val();
                return Object.values(resourcesObj);
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error getting resources:', error);
            return [];
        }
    },
    
    /**
     * Get a single resource by ID
     * @param {string} resourceId - Resource ID
     * @returns {Promise<Object>} Resource object
     */
    async getResource(resourceId) {
        try {
            const resourceRef = ref(database, `resources/${resourceId}`);
            const snapshot = await get(resourceRef);
            
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log('Resource not found:', resourceId);
                return null;
            }
        } catch (error) {
            console.error('Error getting resource:', error);
            return null;
        }
    },
    
    /**
     * Add or update a resource in Firebase
     * @param {Object} resource - Resource object
     * @returns {Promise<string>} ID of resource
     */
    async saveResource(resource) {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            // Add metadata if not present
            const resourceToSave = {
                ...resource,
                userId: resource.userId || currentUid,
                timestamp: resource.timestamp || Date.now()
            };
            
            // Generate a new ID if not provided
            const resourcesRef = ref(database, 'resources');
            const resourceRef = resource.id ? 
                ref(database, `resources/${resource.id}`) : 
                push(resourcesRef);
            
            await set(resourceRef, resourceToSave);
            
            const resourceId = resource.id || resourceRef.key;
            console.log('Resource saved successfully with ID:', resourceId);
            return resourceId;
        } catch (error) {
            console.error('Error saving resource:', error);
            throw error;
        }
    },
    
    /**
     * Upload a file for a resource
     * @param {File} file - File to upload
     * @param {string} resourceId - Resource ID
     * @returns {Promise<string>} Download URL
     */
    async uploadResourceFile(file, resourceId) {
        try {
            const currentUid = auth.currentUser ? auth.currentUser.uid : null;
            if (!currentUid) {
                throw new Error('User not logged in');
            }
            
            // Create a storage reference
            const fileRef = storageRef(storage, `resources/${resourceId}/${file.name}`);
            
            // Upload file
            const snapshot = await uploadBytes(fileRef, file);
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Add file metadata to database
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: downloadURL,
                resourceId,
                userId: currentUid,
                uploadedAt: Date.now()
            };
            
            const fileMetadataRef = push(ref(database, 'files'));
            await set(fileMetadataRef, fileData);
            
            console.log('File uploaded successfully:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
};

/**
 * Authentication Utilities
 */
export const AuthFirebase = {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} username - User username
     * @returns {Promise<Object>} User object
     */
    async register(email, password, username) {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update profile with username
            await updateProfile(user, {
                displayName: username
            });
            
            // Create user profile
            await UserProfileFirebase.updateProfile(user.uid, {
                username,
                email,
                photoURL: user.photoURL || null
            });
            
            console.log('User registered successfully:', user.uid);
            return user;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },
    
    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User object
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store user in localStorage for compatibility with existing code
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                username: user.displayName
            }));
            
            console.log('User logged in successfully:', user.uid);
            return user;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    
    /**
     * Logout the current user
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Preserve data in localStorage before logout
            if (window.UserProfileManager && window.UserProfileManager.preserveProfilesOnLogout) {
                window.UserProfileManager.preserveProfilesOnLogout();
            }
            
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },
    
    /**
     * Get the current user
     * @returns {Object} Current user or null
     */
    getCurrentUser() {
        return auth.currentUser;
    },
    
    /**
     * Listen for auth state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    }
};

// Initialize Firebase integration
export const initFirebaseIntegration = async () => {
    try {
        // Listen for auth state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('User is signed in:', user.uid);
                
                // Get user profile
                const profile = await UserProfileFirebase.getProfile(user.uid);
                
                // Store in localStorage for compatibility with existing code
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || profile?.username,
                    photoURL: user.photoURL || profile?.photoURL,
                    username: profile?.username || user.displayName
                }));
                
                // Update UserProfileManager if it exists
                if (window.UserProfileManager) {
                    window.UserProfileManager.setCurrentProfileFromUser();
                }
            } else {
                console.log('User is signed out');
                
                // Clear currentUser from localStorage
                localStorage.removeItem('currentUser');
            }
        });
        
        console.log('Firebase integration initialized');
    } catch (error) {
        console.error('Error initializing Firebase integration:', error);
    }
};

// Export all Firebase utilities
export default {
    UserProfile: UserProfileFirebase,
    SavedChats: SavedChatsFirebase,
    SearchHistory: SearchHistoryFirebase,
    Resources: ResourcesFirebase,
    Auth: AuthFirebase,
    init: initFirebaseIntegration
};
