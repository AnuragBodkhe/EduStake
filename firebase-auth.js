// Firebase Authentication Helper Functions
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { get, getDatabase, ref, set, update } from "firebase/database";

// These functions assume that Firebase is already initialized in the page

/**
 * Register a new user with email, password and username
 * @param {string} email User's email
 * @param {string} password User's password
 * @param {string} username User's display name
 * @returns {Promise<object>} Result object with success flag and user data or error
 */
export async function registerUser(email, password, username) {
    try {
        const auth = getAuth();
        const database = getDatabase();
        
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Realtime Database
        await set(ref(database, `users/${user.uid}`), {
            username: username,
            email: email,
            profilePicture: '',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            settings: {
                theme: 'dark',
                notifications: true
            }
        });

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log in an existing user with email and password
 * @param {string} email User's email
 * @param {string} password User's password
 * @returns {Promise<object>} Result object with success flag and user data or error
 */
export async function loginUser(email, password) {
    try {
        const auth = getAuth();
        const database = getDatabase();
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update last active timestamp
        await update(ref(database, `users/${user.uid}`), {
            lastActive: new Date().toISOString()
        });

        // Get user profile data
        const snapshot = await get(ref(database, `users/${user.uid}`));
        const userProfile = snapshot.val();
        
        return { success: true, user: { ...user, profile: userProfile } };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log out the current user
 * @returns {Promise<object>} Result object with success flag or error
 */
export async function logoutUser() {
    try {
        const auth = getAuth();
        const database = getDatabase();
        const user = auth.currentUser;
        
        if (user) {
            // Update last active before signing out
            await update(ref(database, `users/${user.uid}`), {
                lastActive: new Date().toISOString()
            });
        }
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a password reset email
 * @param {string} email User's email
 * @returns {Promise<object>} Result object with success flag or error
 */
export async function resetPassword(email) {
    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current logged in user with profile data
 * @returns {Promise<object|null>} User object with profile data or null if not logged in
 */
export async function getCurrentUser() {
    const auth = getAuth();
    const database = getDatabase();
    const user = auth.currentUser;
    
    if (!user) return null;
    
    try {
        const snapshot = await get(ref(database, `users/${user.uid}`));
        const userProfile = snapshot.val();
        return { ...user, profile: userProfile };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return user; // Return just the user auth object without profile
    }
}

/**
 * Set up a listener for authentication state changes
 * @param {Function} callback Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
    const auth = getAuth();
    return onAuthStateChanged(auth, callback);
}

/**
 * Update user profile data in the database
 * @param {string} userId User ID
 * @param {object} profileData Object containing profile data to update
 * @returns {Promise<object>} Result object with success flag or error
 */
export async function updateUserProfile(userId, profileData) {
    try {
        const database = getDatabase();
        await update(ref(database, `users/${userId}`), profileData);
        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update UI elements with user data
 * @param {object} user User object with profile data
 */
export function updateUIWithUserData(user) {
    const usernameElements = document.querySelectorAll('.user-display-name, #username');
    const emailElements = document.querySelectorAll('.user-email, .profile-id');
    const avatarElements = document.querySelectorAll('.user-avatar, .avatar-img');
    const bioElements = document.querySelectorAll('.user-bio');

    usernameElements.forEach(el => {
        if (el) el.textContent = user.profile?.username || 'User';
    });

    emailElements.forEach(el => {
        if (el) el.textContent = user.email;
    });

    avatarElements.forEach(el => {
        if (el) el.src = user.profile?.profilePicture || 'https://via.placeholder.com/150';
    });

    bioElements.forEach(el => {
        if (el) el.textContent = user.profile?.bio || 'No bio available';
    });
} 