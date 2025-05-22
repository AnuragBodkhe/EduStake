/**
 * Firebase Cloud Firestore Queries for EduStake
 * 
 * This file contains Firestore queries for all major functionality in the EduStake project:
 * - User profiles
 * - Chat messages
 * - Saved chats
 * - Resources
 * - Search functionality
 */

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
 * User Profile Queries
 */
export const UserProfileQueries = {
  /**
   * Get a user profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User profile or null if not found
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, "userProfiles", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        console.log("No user profile found for ID:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },
  
  /**
   * Get current user's profile
   * @returns {Promise<Object|null>} Current user profile or null if not logged in
   */
  async getCurrentUserProfile() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("No user is currently logged in");
      return null;
    }
    
    return this.getUserProfile(currentUser.uid);
  },
  
  /**
   * Create or update a user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, "userProfiles", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Update existing profile
        const updatedData = {
          ...profileData,
          lastUpdated: serverTimestamp()
        };
        
        await updateDoc(userRef, updatedData);
        console.log("User profile updated successfully");
      } else {
        // Create new profile
        const newProfile = {
          ...profileData,
          uid: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        };
        
        await setDoc(userRef, newProfile);
        console.log("User profile created successfully");
      }
      
      // Get the updated profile
      const updatedSnap = await getDoc(userRef);
      return { id: updatedSnap.id, ...updatedSnap.data() };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
  
  /**
   * Find users by username (for user search)
   * @param {string} usernameQuery - Username to search for
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} Array of matching user profiles
   */
  async findUsersByUsername(usernameQuery, maxResults = 10) {
    try {
      // Convert to lowercase for case-insensitive search
      const lowerQuery = usernameQuery.toLowerCase();
      
      // Create a query against the collection
      const usersRef = collection(db, "userProfiles");
      const q = query(
        usersRef,
        where("usernameLower", ">=", lowerQuery),
        where("usernameLower", "<=", lowerQuery + '\uf8ff'),
        limit(maxResults)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error("Error finding users:", error);
      throw error;
    }
  }
};

/**
 * Chat Message Queries
 */
export const ChatMessageQueries = {
  /**
   * Get messages for a specific channel
   * @param {string} channelId - Channel ID
   * @param {number} messageLimit - Maximum number of messages to retrieve
   * @param {Object} lastMessage - Last message for pagination (optional)
   * @returns {Promise<Array>} Array of messages
   */
  async getChannelMessages(channelId, messageLimit = 50, lastMessage = null) {
    try {
      const messagesRef = collection(db, "messages");
      let q;
      
      if (lastMessage) {
        // Paginated query
        q = query(
          messagesRef,
          where("channelId", "==", channelId),
          orderBy("timestamp", "desc"),
          startAfter(lastMessage),
          limit(messageLimit)
        );
      } else {
        // Initial query
        q = query(
          messagesRef,
          where("channelId", "==", channelId),
          orderBy("timestamp", "desc"),
          limit(messageLimit)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      // Return in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error("Error getting channel messages:", error);
      throw error;
    }
  },
  
  /**
   * Send a new message to a channel
   * @param {string} channelId - Channel ID
   * @param {string} text - Message text
   * @param {Array} attachments - Array of attachment objects (optional)
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(channelId, text, attachments = []) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const messagesRef = collection(db, "messages");
      
      const messageData = {
        text,
        channelId,
        userId: currentUser.uid,
        username: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
        attachments: attachments || [],
        reactions: {}
      };
      
      const docRef = await addDoc(messagesRef, messageData);
      
      // Update channel's lastActivity
      const channelRef = doc(db, "channels", channelId);
      await updateDoc(channelRef, {
        lastActivity: serverTimestamp(),
        lastMessagePreview: text.substring(0, 50) + (text.length > 50 ? "..." : "")
      });
      
      console.log("Message sent successfully with ID:", docRef.id);
      
      // Get the created message
      const messageSnap = await getDoc(docRef);
      return { id: messageSnap.id, ...messageSnap.data() };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  
  /**
   * Add a reaction to a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji reaction
   * @returns {Promise<void>}
   */
  async addReaction(messageId, emoji) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const messageRef = doc(db, "messages", messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new Error("Message not found");
      }
      
      const userId = currentUser.uid;
      const reactionKey = `reactions.${emoji}`;
      
      // Add user to the reaction array if not already present
      await updateDoc(messageRef, {
        [reactionKey]: arrayUnion(userId)
      });
      
      console.log("Reaction added successfully");
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw error;
    }
  },
  
  /**
   * Remove a reaction from a message
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji reaction
   * @returns {Promise<void>}
   */
  async removeReaction(messageId, emoji) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const messageRef = doc(db, "messages", messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new Error("Message not found");
      }
      
      const userId = currentUser.uid;
      const reactionKey = `reactions.${emoji}`;
      
      // Remove user from the reaction array
      await updateDoc(messageRef, {
        [reactionKey]: arrayRemove(userId)
      });
      
      console.log("Reaction removed successfully");
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  }
};

/**
 * Saved Chats Queries
 */
export const SavedChatsQueries = {
  /**
   * Get saved chats for the current user
   * @param {number} limit - Maximum number of saved chats to retrieve
   * @returns {Promise<Array>} Array of saved chats
   */
  async getSavedChats(limit = 100) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const savedChatsRef = collection(db, "savedChats");
      const q = query(
        savedChatsRef,
        where("userId", "==", currentUser.uid),
        orderBy("savedAt", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const savedChats = [];
      
      querySnapshot.forEach((doc) => {
        savedChats.push({ id: doc.id, ...doc.data() });
      });
      
      return savedChats;
    } catch (error) {
      console.error("Error getting saved chats:", error);
      throw error;
    }
  },
  
  /**
   * Save a chat message
   * @param {string} messageId - Message ID to save
   * @returns {Promise<Object>} Saved chat
   */
  async saveChat(messageId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Get the message to save
      const messageRef = doc(db, "messages", messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new Error("Message not found");
      }
      
      const messageData = messageSnap.data();
      
      // Create saved chat entry
      const savedChatsRef = collection(db, "savedChats");
      const savedChatData = {
        messageId,
        userId: currentUser.uid,
        text: messageData.text,
        originalUserId: messageData.userId,
        username: messageData.username,
        photoURL: messageData.photoURL,
        channelId: messageData.channelId,
        originalTimestamp: messageData.timestamp,
        savedAt: serverTimestamp(),
        attachments: messageData.attachments || []
      };
      
      const docRef = await addDoc(savedChatsRef, savedChatData);
      console.log("Chat saved successfully with ID:", docRef.id);
      
      // Get the created saved chat
      const savedChatSnap = await getDoc(docRef);
      return { id: savedChatSnap.id, ...savedChatSnap.data() };
    } catch (error) {
      console.error("Error saving chat:", error);
      throw error;
    }
  },
  
  /**
   * Remove a saved chat
   * @param {string} savedChatId - Saved chat ID
   * @returns {Promise<void>}
   */
  async removeSavedChat(savedChatId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Verify ownership
      const savedChatRef = doc(db, "savedChats", savedChatId);
      const savedChatSnap = await getDoc(savedChatRef);
      
      if (!savedChatSnap.exists()) {
        throw new Error("Saved chat not found");
      }
      
      const savedChatData = savedChatSnap.data();
      
      if (savedChatData.userId !== currentUser.uid) {
        throw new Error("You don't have permission to remove this saved chat");
      }
      
      // Delete the saved chat
      await deleteDoc(savedChatRef);
      console.log("Saved chat removed successfully");
    } catch (error) {
      console.error("Error removing saved chat:", error);
      throw error;
    }
  }
};

/**
 * Resources Queries
 */
export const ResourceQueries = {
  /**
   * Get resources by category
   * @param {string} category - Category to filter by (optional)
   * @param {number} limit - Maximum number of resources to retrieve
   * @param {Object} lastResource - Last resource for pagination (optional)
   * @returns {Promise<Array>} Array of resources
   */
  async getResources(category = null, limit = 20, lastResource = null) {
    try {
      const resourcesRef = collection(db, "resources");
      let q;
      
      if (category) {
        // Filter by category
        if (lastResource) {
          // Paginated query with category filter
          q = query(
            resourcesRef,
            where("category", "==", category),
            orderBy("timestamp", "desc"),
            startAfter(lastResource),
            limit(limit)
          );
        } else {
          // Initial query with category filter
          q = query(
            resourcesRef,
            where("category", "==", category),
            orderBy("timestamp", "desc"),
            limit(limit)
          );
        }
      } else {
        // No category filter
        if (lastResource) {
          // Paginated query without category filter
          q = query(
            resourcesRef,
            orderBy("timestamp", "desc"),
            startAfter(lastResource),
            limit(limit)
          );
        } else {
          // Initial query without category filter
          q = query(
            resourcesRef,
            orderBy("timestamp", "desc"),
            limit(limit)
          );
        }
      }
      
      const querySnapshot = await getDocs(q);
      const resources = [];
      
      querySnapshot.forEach((doc) => {
        resources.push({ id: doc.id, ...doc.data() });
      });
      
      return resources;
    } catch (error) {
      console.error("Error getting resources:", error);
      throw error;
    }
  },
  
  /**
   * Get a single resource by ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object|null>} Resource or null if not found
   */
  async getResource(resourceId) {
    try {
      const resourceRef = doc(db, "resources", resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (resourceSnap.exists()) {
        // Increment view count
        await updateDoc(resourceRef, {
          views: increment(1)
        });
        
        return { id: resourceSnap.id, ...resourceSnap.data() };
      } else {
        console.log("No resource found with ID:", resourceId);
        return null;
      }
    } catch (error) {
      console.error("Error getting resource:", error);
      throw error;
    }
  },
  
  /**
   * Create a new resource
   * @param {Object} resourceData - Resource data
   * @returns {Promise<Object>} Created resource
   */
  async createResource(resourceData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const resourcesRef = collection(db, "resources");
      
      const newResource = {
        ...resourceData,
        userId: currentUser.uid,
        username: currentUser.displayName || "User",
        timestamp: serverTimestamp(),
        likes: 0,
        views: 0
      };
      
      const docRef = await addDoc(resourcesRef, newResource);
      console.log("Resource created successfully with ID:", docRef.id);
      
      // Get the created resource
      const resourceSnap = await getDoc(docRef);
      return { id: resourceSnap.id, ...resourceSnap.data() };
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  },
  
  /**
   * Update an existing resource
   * @param {string} resourceId - Resource ID
   * @param {Object} resourceData - Updated resource data
   * @returns {Promise<Object>} Updated resource
   */
  async updateResource(resourceId, resourceData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Verify ownership
      const resourceRef = doc(db, "resources", resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (!resourceSnap.exists()) {
        throw new Error("Resource not found");
      }
      
      const existingResource = resourceSnap.data();
      
      if (existingResource.userId !== currentUser.uid) {
        throw new Error("You don't have permission to update this resource");
      }
      
      // Update the resource
      const updatedData = {
        ...resourceData,
        lastUpdated: serverTimestamp()
      };
      
      await updateDoc(resourceRef, updatedData);
      console.log("Resource updated successfully");
      
      // Get the updated resource
      const updatedSnap = await getDoc(resourceRef);
      return { id: updatedSnap.id, ...updatedSnap.data() };
    } catch (error) {
      console.error("Error updating resource:", error);
      throw error;
    }
  },
  
  /**
   * Like a resource
   * @param {string} resourceId - Resource ID
   * @returns {Promise<void>}
   */
  async likeResource(resourceId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const resourceRef = doc(db, "resources", resourceId);
      const likesRef = doc(db, "resourceLikes", `${resourceId}_${currentUser.uid}`);
      
      // Check if already liked
      const likeSnap = await getDoc(likesRef);
      
      if (likeSnap.exists()) {
        throw new Error("You have already liked this resource");
      }
      
      // Create like record
      await setDoc(likesRef, {
        resourceId,
        userId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      
      // Increment resource likes count
      await updateDoc(resourceRef, {
        likes: increment(1)
      });
      
      console.log("Resource liked successfully");
    } catch (error) {
      console.error("Error liking resource:", error);
      throw error;
    }
  },
  
  /**
   * Unlike a resource
   * @param {string} resourceId - Resource ID
   * @returns {Promise<void>}
   */
  async unlikeResource(resourceId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const resourceRef = doc(db, "resources", resourceId);
      const likesRef = doc(db, "resourceLikes", `${resourceId}_${currentUser.uid}`);
      
      // Check if liked
      const likeSnap = await getDoc(likesRef);
      
      if (!likeSnap.exists()) {
        throw new Error("You haven't liked this resource");
      }
      
      // Delete like record
      await deleteDoc(likesRef);
      
      // Decrement resource likes count
      await updateDoc(resourceRef, {
        likes: increment(-1)
      });
      
      console.log("Resource unliked successfully");
    } catch (error) {
      console.error("Error unliking resource:", error);
      throw error;
    }
  }
};

/**
 * Search Queries
 */
export const SearchQueries = {
  /**
   * Search for messages
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching messages
   */
  async searchMessages(query, limit = 20) {
    try {
      // Note: Full-text search in Firestore requires additional setup
      // This is a simple implementation that searches in the text field
      // For production, consider using Algolia, Elasticsearch, or Firebase Extensions
      
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        limit(100) // Get more messages than needed to filter client-side
      );
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      const lowerQuery = query.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        if (messageData.text && messageData.text.toLowerCase().includes(lowerQuery)) {
          messages.push({ id: doc.id, ...messageData });
        }
      });
      
      // Return limited results
      return messages.slice(0, limit);
    } catch (error) {
      console.error("Error searching messages:", error);
      throw error;
    }
  },
  
  /**
   * Search for resources
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching resources
   */
  async searchResources(query, limit = 20) {
    try {
      // Simple implementation that searches in title and description
      const resourcesRef = collection(db, "resources");
      const q = query(
        resourcesRef,
        orderBy("timestamp", "desc"),
        limit(100) // Get more resources than needed to filter client-side
      );
      
      const querySnapshot = await getDocs(q);
      const resources = [];
      const lowerQuery = query.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const resourceData = doc.data();
        if (
          (resourceData.title && resourceData.title.toLowerCase().includes(lowerQuery)) ||
          (resourceData.description && resourceData.description.toLowerCase().includes(lowerQuery)) ||
          (resourceData.content && resourceData.content.toLowerCase().includes(lowerQuery))
        ) {
          resources.push({ id: doc.id, ...resourceData });
        }
      });
      
      // Return limited results
      return resources.slice(0, limit);
    } catch (error) {
      console.error("Error searching resources:", error);
      throw error;
    }
  },
  
  /**
   * Add search query to user's search history
   * @param {string} query - Search query
   * @param {number} resultCount - Number of results found
   * @returns {Promise<Object>} Created search history entry
   */
  async addToSearchHistory(query, resultCount = 0) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const searchHistoryRef = collection(db, "searchHistory");
      
      const searchData = {
        query,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        resultCount
      };
      
      const docRef = await addDoc(searchHistoryRef, searchData);
      console.log("Search added to history with ID:", docRef.id);
      
      // Get the created search history entry
      const searchSnap = await getDoc(docRef);
      return { id: searchSnap.id, ...searchSnap.data() };
    } catch (error) {
      console.error("Error adding to search history:", error);
      throw error;
    }
  },
  
  /**
   * Get user's search history
   * @param {number} limit - Maximum number of history items to retrieve
   * @returns {Promise<Array>} Array of search history items
   */
  async getSearchHistory(limit = 10) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const searchHistoryRef = collection(db, "searchHistory");
      const q = query(
        searchHistoryRef,
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      return history;
    } catch (error) {
      console.error("Error getting search history:", error);
      throw error;
    }
  },
  
  /**
   * Clear user's search history
   * @returns {Promise<void>}
   */
  async clearSearchHistory() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      const searchHistoryRef = collection(db, "searchHistory");
      const q = query(
        searchHistoryRef,
        where("userId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Delete each document
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log("Search history cleared successfully");
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  }
};

// Export all query modules
export default {
  UserProfile: UserProfileQueries,
  ChatMessage: ChatMessageQueries,
  SavedChats: SavedChatsQueries,
  Resource: ResourceQueries,
  Search: SearchQueries
};
