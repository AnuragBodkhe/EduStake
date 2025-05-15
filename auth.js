// Firebase Authentication Functions
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { get, ref, set, update } from "firebase/database";
import { auth, database } from "./firebase-config.js";

// Handle user registration
async function registerUser(email, password, username) {
    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
            // Try to create user profile in Realtime Database
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
        } catch (dbError) {
            console.error('Database write error:', dbError);
            // Even if database write fails, we can still consider registration 
            // successful since the auth account was created
            return { 
                success: true, 
                user,
                warning: "Account created, but profile data could not be saved. Database permission error."
            };
        }

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Handle user login
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
            // Try to update last active timestamp
            await update(ref(database, `users/${user.uid}`), {
                lastActive: new Date().toISOString()
            });
            
            // Try to get user profile data
            try {
                const snapshot = await get(ref(database, `users/${user.uid}`));
                const userProfile = snapshot.val();
                return { success: true, user: { ...user, profile: userProfile } };
            } catch (profileError) {
                console.error('Profile fetch error:', profileError);
                return { 
                    success: true, 
                    user,
                    warning: "Logged in successfully, but couldn't fetch profile data. Database permission error."
                };
            }
        } catch (dbError) {
            console.error('Database update error:', dbError);
            // Even if database update fails, we can still proceed with login
            return { 
                success: true, 
                user,
                warning: "Logged in successfully, but couldn't update profile data. Database permission error."
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Handle user logout
async function logoutUser() {
    try {
        const user = auth.currentUser;
        if (user) {
            try {
                // Try to update last active before signing out
                await update(ref(database, `users/${user.uid}`), {
                    lastActive: new Date().toISOString()
                });
            } catch (dbError) {
                console.error('Database update error during logout:', dbError);
            }
        }
        
        // Preserve user profiles before logout
        if (window.UserProfileManager) {
            window.UserProfileManager.preserveProfilesOnLogout();
        }
        
        // Preserve all data (resources, chats, messages) before logout
        if (window.LocalStorageManager) {
            window.LocalStorageManager.preserveDataOnLogout();
        }
        
        // Sign out the user
        await signOut(auth);
        
        // Redirect to landing page - this is the critical part
        console.log('Redirecting to landing page...');
        setTimeout(() => {
            window.location.href = 'landing.html';
        }, 100);
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Auth state observer
function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Update UI with user data
function updateUIWithUserData(user) {
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set up auth state observer
    onAuthStateChange(async (user) => {
        if (user) {
            // User is signed in
            const snapshot = await get(ref(database, `users/${user.uid}`));
            const userProfile = snapshot.val();
            
            if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
                window.location.href = 'index.html';
            } else {
                updateUIWithUserData({ ...user, profile: userProfile });
            }
        } else {
            // User is signed out
            if (!window.location.pathname.endsWith('login.html') && 
                !window.location.pathname.endsWith('register.html') && 
                !window.location.pathname.endsWith('landing.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messagesContainer = document.getElementById('messages-container');
            
            const result = await loginUser(email, password);
            
            if (result.success) {
                messagesContainer.innerHTML = '<div class="success-message"><p>Login successful!</p></div>';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                messagesContainer.innerHTML = `<div class="error-messages"><p>${result.error}</p></div>`;
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms').checked;
            
            const messagesContainer = document.getElementById('messages-container');
            let errors = [];
            
            if (!username) errors.push('Username is required');
            if (!email) errors.push('Email is required');
            if (!password) errors.push('Password is required');
            if (password !== confirmPassword) errors.push('Passwords do not match');
            if (!termsAccepted) errors.push('You must accept the Terms of Service');
            
            if (errors.length > 0) {
                let errorHTML = '<div class="error-messages"><ul>';
                errors.forEach(error => {
                    errorHTML += `<li>${error}</li>`;
                });
                errorHTML += '</ul></div>';
                messagesContainer.innerHTML = errorHTML;
                return;
            }
            
            const result = await registerUser(email, password, username);
            
            if (result.success) {
                messagesContainer.innerHTML = '<div class="success-message"><p>Registration successful! Redirecting to login...</p></div>';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                messagesContainer.innerHTML = `<div class="error-messages"><p>${result.error}</p></div>`;
            }
        });
    }

    // Logout handler
    const logoutButtons = document.querySelectorAll('.logout-button, #sign-out-btn, #quick-sign-out');
    logoutButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Show logout confirmation modal instead of direct logout
                const logoutModal = document.getElementById('logout-confirmation-modal');
                if (logoutModal) {
                    logoutModal.style.display = 'flex';
                } else {
                    // If modal doesn't exist, proceed with direct logout
                    logoutUser();
                }
            });
        }
    });

    // Handle logout confirmation modal
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', function() {
            const logoutModal = document.getElementById('logout-confirmation-modal');
            if (logoutModal) {
                logoutModal.style.display = 'none';
            }
            window.triggerLogout();
        });
    }

    // Handle logout cancellation
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const closeLogoutBtn = document.getElementById('close-logout-confirm');
    const logoutModal = document.getElementById('logout-confirmation-modal');
    
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', function() {
            if (logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }
    
    if (closeLogoutBtn) {
        closeLogoutBtn.addEventListener('click', function() {
            if (logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside
    if (logoutModal) {
        window.addEventListener('click', function(event) {
            if (event.target === logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }

    // Create a global direct logout function
    window.triggerLogout = function() {
        console.log("Logout triggered");
        const auth = window.firebaseAuth || firebase.auth();
        auth.signOut().then(() => {
            console.log("User signed out successfully");
            window.location.href = 'landing.html';
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    };
});

// Global logout function
window.triggerLogout = async function() {
    try {
        const user = auth.currentUser;
        if (user) {
            try {
                // Try to update last active before signing out
                await update(ref(database, `users/${user.uid}`), {
                    lastActive: new Date().toISOString()
                });
            } catch (dbError) {
                console.error('Database update error during logout:', dbError);
            }
        }
        
        // Preserve user profiles before logout
        if (window.UserProfileManager) {
            window.UserProfileManager.preserveProfilesOnLogout();
        }
        
        // Preserve all data (resources, chats, messages) before logout
        if (window.LocalStorageManager) {
            window.LocalStorageManager.preserveDataOnLogout();
        }
        
        // Sign out the user
        await signOut(auth);
        
        // Redirect to landing page
        console.log('Redirecting to landing page...');
        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Logout error:', error);
        
        // Even if there's an error during logout, still try to preserve data
        try {
            if (window.LocalStorageManager) {
                window.LocalStorageManager.preserveDataOnLogout();
            }
        } catch (preserveError) {
            console.error('Error preserving data during logout error:', preserveError);
        }
    }
};

export { loginUser, logoutUser, onAuthStateChange, registerUser, updateUIWithUserData };

