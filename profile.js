document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const optionsButton = document.querySelector('.options-button');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const viewProfileBtn = document.getElementById('view-profile-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editFromViewBtn = document.getElementById('edit-from-view-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const profileViewModal = document.getElementById('profile-view-modal');
    const profileEditModal = document.getElementById('profile-edit-modal');
    const closeProfileViewBtn = document.getElementById('close-profile-view');
    const closeProfileEditBtn = document.getElementById('close-profile-edit');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarFileInput = document.getElementById('avatar-file');
    const profileForm = document.getElementById('profile-edit-form');
    const profileEditAvatar = document.getElementById('profile-edit-avatar');
    
    // Quick access buttons
    const quickViewProfileBtn = document.getElementById('quick-view-profile');
    const quickEditProfileBtn = document.getElementById('quick-edit-profile');
    const quickSignOutBtn = document.getElementById('quick-sign-out');

    // Sample user data - in a real app, this would come from the server
    // Make userData globally accessible
    window.userData = {
        displayName: 'Alex Johnson',
        bio: 'Computer Science student passionate about web development and AI.',
        email: 'alex.johnson@example.com',
        status: 'online',
        memberSince: 'September 2022',
        avatar: 'https://i.pravatar.cc/300?img=12',
        communities: ['MIT', 'Stanford University', 'Carnegie Mellon']
    };

    // Toggle profile dropdown
    if (optionsButton) {
        optionsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!optionsButton.contains(e.target) && profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Quick View Profile
    if (quickViewProfileBtn) {
        quickViewProfileBtn.addEventListener('click', () => {
            displayProfileData();
            profileViewModal.style.display = 'flex';
        });
    }

    // Quick Edit Profile
    if (quickEditProfileBtn) {
        quickEditProfileBtn.addEventListener('click', () => {
            populateEditForm();
            profileEditModal.style.display = 'flex';
        });
    }

    // Quick Sign Out - handled by auth.js
    
    // View Profile
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', () => {
            displayProfileData();
            profileViewModal.style.display = 'flex';
            profileDropdown.classList.remove('show');
        });
    }

    // Edit Profile from dropdown
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            populateEditForm();
            profileEditModal.style.display = 'flex';
            profileDropdown.classList.remove('show');
        });
    }

    // Edit Profile from view modal
    if (editFromViewBtn) {
        editFromViewBtn.addEventListener('click', () => {
            populateEditForm();
            profileViewModal.style.display = 'none';
            profileEditModal.style.display = 'flex';
        });
    }

    // Sign Out - handled by auth.js

    // Close profile view modal
    if (closeProfileViewBtn) {
        closeProfileViewBtn.addEventListener('click', () => {
            profileViewModal.style.display = 'none';
        });
    }

    // Close profile edit modal
    if (closeProfileEditBtn) {
        closeProfileEditBtn.addEventListener('click', () => {
            profileEditModal.style.display = 'none';
        });
    }

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Change avatar
    if (changeAvatarBtn && avatarFileInput) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileEditAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Submit profile form
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Get form data
            const formData = new FormData(profileForm);
            // Update user data
            window.userData.displayName = formData.get('display-name');
            window.userData.bio = formData.get('bio');
            window.userData.email = formData.get('email');
            window.userData.status = formData.get('status');
            
            if (profileEditAvatar.src !== window.userData.avatar) {
                window.userData.avatar = profileEditAvatar.src;
            }

            // Update UI with new data
            updateUIWithUserData();
            
            // Close modal
            profileEditModal.style.display = 'none';
            
            // Show success message
            showNotification('Profile updated successfully!');
        });
    }

    // Display profile data in view modal
    function displayProfileData() {
        const nameElement = document.getElementById('profile-display-name');
        const bioElement = document.getElementById('profile-bio');
        const emailElement = document.getElementById('profile-email');
        const avatarElement = document.querySelector('#profile-view-modal .profile-avatar-large img');

        // Get user data from localStorage instead of window.userData
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || window.userData;

        if (nameElement) nameElement.textContent = currentUser.displayName || currentUser.username;
        if (bioElement) bioElement.textContent = currentUser.bio || 'No bio available';
        if (emailElement) emailElement.textContent = currentUser.email;
        if (avatarElement) avatarElement.src = currentUser.avatar || currentUser.profilePic || 'https://via.placeholder.com/150';

        // Update status indicator
        const statusIndicator = document.querySelector('#profile-view-modal .status');
        if (statusIndicator) {
            statusIndicator.className = 'status ' + (currentUser.status || 'online');
        }
    }

    // Populate edit form with existing data
    function populateEditForm() {
        const nameInput = document.getElementById('display-name');
        const bioInput = document.getElementById('bio');
        const emailInput = document.getElementById('email');
        const statusRadios = document.querySelectorAll('input[name="status"]');

        // Get user data from localStorage instead of window.userData
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || window.userData;

        if (nameInput) nameInput.value = currentUser.displayName || currentUser.username;
        if (bioInput) bioInput.value = currentUser.bio || '';
        if (emailInput) emailInput.value = currentUser.email;
        
        // Set the correct status radio button
        if (statusRadios.length > 0) {
            statusRadios.forEach(radio => {
                if (radio.value === (currentUser.status || 'online')) {
                    radio.checked = true;
                }
            });
        }
        
        if (profileEditAvatar) profileEditAvatar.src = currentUser.avatar || currentUser.profilePic || 'https://via.placeholder.com/150';
    }

    // Update UI elements with new user data
    function updateUIWithUserData() {
        // Get updated user data
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || window.userData;
        
        // Update sidebar user display
        const usernameElement = document.getElementById('username');
        const profileIdElement = document.querySelector('.profile-id');
        const profileAvatar = document.querySelector('.profile-avatar img');
        
        if (usernameElement) usernameElement.textContent = currentUser.displayName || currentUser.username;
        if (profileIdElement) profileIdElement.textContent = '@' + (currentUser.displayName || currentUser.username).toLowerCase().replace(/\s+/g, '');
        if (profileAvatar) profileAvatar.src = currentUser.avatar || currentUser.profilePic || 'https://via.placeholder.com/64';
        
        // Update status indicator
        const statusIndicator = document.querySelector('.profile-avatar .status');
        if (statusIndicator) {
            statusIndicator.className = 'status ' + (currentUser.status || 'online');
        }

        // Update bio displays
        const bioElements = document.querySelectorAll('.user-bio');
        bioElements.forEach(element => {
            element.textContent = currentUser.bio || 'No bio available';
        });
    }

    // Show notification
    function showNotification(message) {
        // Check if notification already exists and remove it
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Initialize UI with user data
    updateUIWithUserData();
});