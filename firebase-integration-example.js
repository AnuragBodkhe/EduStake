/**
 * Firebase Integration Example for EduStake
 * 
 * This file demonstrates how to integrate Firebase Firestore with your existing
 * EduStake features, particularly focusing on:
 * 1. User Profile Management
 * 2. Saved Chats
 * 3. Search Functionality
 */

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import our Firestore queries
import { 
  UserProfileQueries, 
  SavedChatsQueries, 
  SearchQueries 
} from './firestore-queries.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Integration with UserProfileManager.js
 * 
 * This section shows how to integrate Firebase with your existing
 * UserProfileManager to maintain compatibility while adding cloud storage.
 */
const FirebaseUserProfileManager = {
  /**
   * Initialize the Firebase User Profile Manager
   * This should be called after the existing UserProfileManager initializes
   */
  initialize: function() {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
        
        // Get user profile from Firestore
        try {
          const profile = await UserProfileQueries.getUserProfile(user.uid);
          
          if (profile) {
            // Sync Firestore profile with localStorage
            this.syncProfileToLocalStorage(profile);
          } else {
            // If no profile in Firestore, create one from localStorage
            const localProfile = window.UserProfileManager.getProfile(user.uid);
            if (localProfile) {
              await UserProfileQueries.updateUserProfile(user.uid, localProfile);
            }
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    });
    
    console.log('Firebase User Profile Manager initialized');
  },
  
  /**
   * Sync a Firestore profile to localStorage
   * @param {Object} profile - Profile from Firestore
   */
  syncProfileToLocalStorage: function(profile) {
    if (!profile || !profile.uid) return;
    
    // Get existing profiles from localStorage
    const profiles = window.UserProfileManager.loadProfiles();
    
    // Update the profile
    profiles[profile.uid] = {
      uid: profile.uid,
      username: profile.username,
      email: profile.email,
      photoURL: profile.photoURL,
      lastUpdated: profile.lastUpdated || Date.now()
    };
    
    // Save back to localStorage
    localStorage.setItem(window.UserProfileManager.STORAGE_KEY, JSON.stringify(profiles));
    
    // Update current profile if needed
    if (auth.currentUser && auth.currentUser.uid === profile.uid) {
      window.UserProfileManager.currentProfile = profiles[profile.uid];
    }
    
    console.log('Profile synced to localStorage:', profile.uid);
  },
  
  /**
   * Update a user profile in both Firestore and localStorage
   * @param {string} uid - User ID
   * @param {Object} profileData - Profile data to update
   */
  updateProfile: async function(uid, profileData) {
    try {
      // Update in Firestore
      await UserProfileQueries.updateUserProfile(uid, profileData);
      
      // Update in localStorage using existing UserProfileManager
      window.UserProfileManager.updateProfile(uid, profileData);
      
      console.log('Profile updated in both Firestore and localStorage');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Fall back to localStorage only
      window.UserProfileManager.updateProfile(uid, profileData);
    }
  }
};

/**
 * Integration with Saved Chats
 * 
 * This section shows how to integrate Firebase with your existing
 * saved chats functionality to maintain compatibility while adding cloud storage.
 */
const FirebaseSavedChatsManager = {
  /**
   * Initialize the Firebase Saved Chats Manager
   */
  initialize: function() {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in, syncing saved chats');
        
        // Sync saved chats between Firestore and localStorage
        this.syncSavedChats();
      }
    });
    
    console.log('Firebase Saved Chats Manager initialized');
  },
  
  /**
   * Sync saved chats between Firestore and localStorage
   */
  syncSavedChats: async function() {
    try {
      if (!auth.currentUser) return;
      
      // Get saved chats from Firestore
      const firestoreChats = await SavedChatsQueries.getSavedChats();
      
      // Get saved chats from localStorage
      const localChats = window.getSavedChats ? window.getSavedChats() : [];
      
      // Create a map of existing chats by ID for easy lookup
      const chatMap = {};
      firestoreChats.forEach(chat => {
        chatMap[chat.id] = chat;
      });
      
      // Check for local chats that need to be added to Firestore
      for (const localChat of localChats) {
        // Skip if this chat is already in Firestore
        if (chatMap[localChat.id]) continue;
        
        // Add to Firestore
        await SavedChatsQueries.saveChat(localChat.messageId || localChat.id);
      }
      
      // Update localStorage with all chats
      this.updateLocalStorage(firestoreChats);
      
      console.log('Saved chats synced between Firestore and localStorage');
    } catch (error) {
      console.error('Error syncing saved chats:', error);
    }
  },
  
  /**
   * Update localStorage with saved chats
   * @param {Array} chats - Array of saved chats
   */
  updateLocalStorage: function(chats) {
    if (!Array.isArray(chats)) return;
    
    // Save to localStorage
    localStorage.setItem('edustake_saved_chats', JSON.stringify(chats));
    
    console.log('Saved chats updated in localStorage');
  },
  
  /**
   * Save a chat message
   * @param {string} messageId - Message ID to save
   */
  saveChat: async function(messageId) {
    try {
      // Save in Firestore
      const savedChat = await SavedChatsQueries.saveChat(messageId);
      
      // Get current saved chats from localStorage
      const localChats = window.getSavedChats ? window.getSavedChats() : [];
      
      // Add new chat to local chats
      localChats.push(savedChat);
      
      // Update localStorage
      localStorage.setItem('edustake_saved_chats', JSON.stringify(localChats));
      
      console.log('Chat saved in both Firestore and localStorage');
      return savedChat;
    } catch (error) {
      console.error('Error saving chat:', error);
      
      // Fall back to existing functionality if available
      if (window.addSavedChat) {
        return window.addSavedChat({ id: messageId });
      }
    }
  }
};

/**
 * Integration with Search Functionality
 * 
 * This section shows how to integrate Firebase with your existing
 * search functionality to maintain compatibility while adding cloud storage.
 */
const FirebaseSearchManager = {
  /**
   * Initialize the Firebase Search Manager
   */
  initialize: function() {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in, syncing search history');
        
        // Sync search history
        this.syncSearchHistory();
      }
    });
    
    console.log('Firebase Search Manager initialized');
  },
  
  /**
   * Sync search history between Firestore and localStorage
   */
  syncSearchHistory: async function() {
    try {
      if (!auth.currentUser) return;
      
      // Get search history from Firestore
      const firestoreHistory = await SearchQueries.getSearchHistory();
      
      // Get search history from localStorage
      const localHistoryJson = localStorage.getItem('edustake_search_history');
      const localHistory = localHistoryJson ? JSON.parse(localHistoryJson) : [];
      
      // Create a map of existing history items by query for easy lookup
      const historyMap = {};
      firestoreHistory.forEach(item => {
        historyMap[item.query] = item;
      });
      
      // Check for local history items that need to be added to Firestore
      for (const localItem of localHistory) {
        // Skip if this query is already in Firestore
        if (historyMap[localItem.query]) continue;
        
        // Add to Firestore
        await SearchQueries.addToSearchHistory(localItem.query, localItem.resultCount || 0);
      }
      
      // Update localStorage with all history items
      this.updateLocalStorage(firestoreHistory);
      
      console.log('Search history synced between Firestore and localStorage');
    } catch (error) {
      console.error('Error syncing search history:', error);
    }
  },
  
  /**
   * Update localStorage with search history
   * @param {Array} history - Array of search history items
   */
  updateLocalStorage: function(history) {
    if (!Array.isArray(history)) return;
    
    // Save to localStorage
    localStorage.setItem('edustake_search_history', JSON.stringify(history));
    
    console.log('Search history updated in localStorage');
  },
  
  /**
   * Perform a search
   * @param {string} query - Search query
   * @returns {Object} Search results
   */
  performSearch: async function(query) {
    try {
      // Search in messages
      const messageResults = await SearchQueries.searchMessages(query);
      
      // Search in resources
      const resourceResults = await SearchQueries.searchResources(query);
      
      // Add to search history in Firestore
      await SearchQueries.addToSearchHistory(query, messageResults.length + resourceResults.length);
      
      // Add to search history in localStorage
      const searchHistoryJson = localStorage.getItem('edustake_search_history');
      const searchHistory = searchHistoryJson ? JSON.parse(searchHistoryJson) : [];
      
      searchHistory.unshift({
        query,
        timestamp: Date.now(),
        resultCount: messageResults.length + resourceResults.length
      });
      
      // Limit history to 20 items
      const limitedHistory = searchHistory.slice(0, 20);
      
      // Save back to localStorage
      localStorage.setItem('edustake_search_history', JSON.stringify(limitedHistory));
      
      console.log('Search performed and history updated');
      
      return {
        query,
        messageResults,
        resourceResults,
        totalResults: messageResults.length + resourceResults.length
      };
    } catch (error) {
      console.error('Error performing search:', error);
      
      // Fall back to existing search functionality if available
      if (window.performSearch) {
        return window.performSearch(query);
      }
      
      return {
        query,
        messageResults: [],
        resourceResults: [],
        totalResults: 0,
        error: error.message
      };
    }
  }
};

/**
 * Initialize all Firebase integrations
 */
export function initializeFirebaseIntegration() {
  // Initialize Firebase integrations
  FirebaseUserProfileManager.initialize();
  FirebaseSavedChatsManager.initialize();
  FirebaseSearchManager.initialize();
  
  console.log('Firebase integration initialized');
  
  // Return the managers for external use
  return {
    UserProfileManager: FirebaseUserProfileManager,
    SavedChatsManager: FirebaseSavedChatsManager,
    SearchManager: FirebaseSearchManager
  };
}

// Export all managers
export {
  FirebaseUserProfileManager,
  FirebaseSavedChatsManager,
  FirebaseSearchManager
};

// Default export
export default {
  initializeFirebaseIntegration,
  UserProfileManager: FirebaseUserProfileManager,
  SavedChatsManager: FirebaseSavedChatsManager,
  SearchManager: FirebaseSearchManager
};
