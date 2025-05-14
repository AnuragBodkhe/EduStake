// Import Firebase Storage functions
import { uploadFile as firebaseUploadFile } from './firebase-storage.js';

// Add Firebase Storage CSS
const firebaseStorageStyles = document.createElement('link');
firebaseStorageStyles.rel = 'stylesheet';
firebaseStorageStyles.href = './firebase-storage.css';
document.head.appendChild(firebaseStorageStyles);

// Form validation for login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (validateEmail(email) && password.length >= 6) {
          // Simulate login success
          showToast('Logging in...', 'success');
          
          // Here you would typically make an API call to authenticate
          // For demo purposes, we're just redirecting after a delay
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          showToast('Please check your email and password', 'error');
        }
      });
    }
    
    // Form validation for registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        if (!validateEmail(email)) {
          showToast('Please enter a valid email address', 'error');
          return;
        }
        
        if (username.length < 3) {
          showToast('Username must be at least 3 characters', 'error');
          return;
        }
        
        if (password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
        }
        
        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }
        
        if (!terms) {
          showToast('You must agree to the Terms of Service', 'error');
          return;
        }
        
        // Simulate registration success
        showToast('Account created successfully!', 'success');
        
        // Here you would typically make an API call to register the user
        // For demo purposes, we're just redirecting after a delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      });
    }
    
    // DOM Elements
    const addCollegeBtn = document.getElementById('add-college-btn');
    const addCollegeItem = document.getElementById('add-college-item');
    const addCollegeModal = document.getElementById('add-college-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelAddCollegeBtn = document.getElementById('cancel-add-college');
    const submitAddCollegeBtn = document.getElementById('submit-add-college');
    const collegeNameInput = document.getElementById('college-name');
    const collegeShortInput = document.getElementById('college-short');
    const collegeLogoUrlInput = document.getElementById('college-logo-url');
    const logoPreviewImg = document.getElementById('logo-preview-img');
    const collegeList = document.querySelector('.college-list');
    
    // Event Listeners
    addCollegeBtn.addEventListener('click', showAddCollegeModal);
    addCollegeItem.addEventListener('click', showAddCollegeModal);
    closeModalBtn.addEventListener('click', hideAddCollegeModal);
    cancelAddCollegeBtn.addEventListener('click', hideAddCollegeModal);
    submitAddCollegeBtn.addEventListener('click', addNewCollege);
    
    // Logo preview functionality
    if (collegeLogoUrlInput) {
        collegeLogoUrlInput.addEventListener('input', function() {
            const logoUrl = this.value.trim();
            if (logoUrl) {
                logoPreviewImg.src = logoUrl;
                logoPreviewImg.onerror = function() {
                    logoPreviewImg.src = 'https://via.placeholder.com/32';
                    showToast('Invalid image URL', 'error');
                };
            } else {
                logoPreviewImg.src = 'https://via.placeholder.com/32';
            }
        });
    }
    
    // Click handlers for college items
    const collegeItems = document.querySelectorAll('.college-item');
    collegeItems.forEach(item => {
        // Remove any existing click listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Add click event listener to new college item
        newItem.addEventListener('click', function(e) {
            // Only proceed if the click wasn't on the remove button
            if (!e.target.classList.contains('remove-button')) {
            // Remove active class from all college items
                document.querySelectorAll('.college-item').forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
                this.classList.add('active');
            
            // Update community header (in a real app, this would load actual college data)
                const collegeName = this.querySelector('.college-name').textContent;
            document.querySelector('.community-header h2').textContent = collegeName + ' Community';
            }
        });
        
        // Re-add remove button functionality
        const removeBtn = newItem.querySelector('.remove-button');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent college item click event
                const collegeItem = this.closest('.college-item');
                const collegeName = collegeItem.querySelector('.college-name').textContent;
                
                // Don't allow removing the last college
                const collegeCount = document.querySelectorAll('.college-item').length;
                if (collegeCount <= 1) {
                    showToast('Cannot remove the last college', 'error');
                    return;
                }
                
                showConfirmDialog(
                    'Remove College', 
                    `Are you sure you want to remove "${collegeName}"?`, 
                    function() {
                        // If removing active college, activate another one
                        if (collegeItem.classList.contains('active') && collegeCount > 1) {
                            const nextCollege = collegeItem.nextElementSibling || collegeItem.previousElementSibling;
                            if (nextCollege) {
                                nextCollege.classList.add('active');
                                // Update community header
                                const nextCollegeName = nextCollege.querySelector('.college-name').textContent;
                                document.querySelector('.community-header h2').textContent = nextCollegeName + ' Community';
                            }
                        }
                        
                        // Animation for smooth removal
                        collegeItem.style.height = collegeItem.offsetHeight + 'px';
                        collegeItem.style.overflow = 'hidden';
                        
                        setTimeout(() => {
                            collegeItem.style.height = '0';
                            collegeItem.style.padding = '0';
                            collegeItem.style.margin = '0';
                            
                            setTimeout(() => {
                                collegeItem.remove();
                                showToast(`"${collegeName}" removed`, 'info');
                            }, 300);
                        }, 10);
                    }
                );
            });
        }
    });
    
    // Function to upload file to Firebase Storage
    function uploadFile(file, index, totalFiles) {
        // Get the upload animation and chat messages container
        const uploadAnimation = document.getElementById('upload-animation');
        const chatMessages = document.querySelector('.chat-messages');
        const progressBar = document.getElementById('upload-progress-bar');
        const uploadText = document.querySelector('.upload-text');
        
        // Update upload text with file name
        if (uploadText) {
            uploadText.textContent = `Uploading ${file.name}...`;
        }
        
        // Move the upload animation to the chat messages
        if (chatMessages && uploadAnimation) {
            chatMessages.appendChild(uploadAnimation);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Show the animation
        uploadAnimation.classList.add('active');
        progressBar.style.width = '0%';
        
        // Get current channel ID (in a real app, this would be from your state management)
        const currentChannelId = document.querySelector('.channel.active')?.getAttribute('data-channel-id') || 'general-chat';
        
        // Create message data
        const messageData = {
            channelId: currentChannelId,
            userId: 'current-user-id', // In a real app, this would be the authenticated user's ID
            username: 'Current User', // In a real app, this would be the authenticated user's username
            content: '', // Empty content for file-only messages
        };
        
        // Upload to Firebase Storage
        firebaseUploadFile(
            file, 
            `messages/${currentChannelId}`,
            { contentType: file.type },
            (progress) => {
                // Update progress bar
                progressBar.style.width = `${progress}%`;
            }
        ).then(fileData => {
            // Hide upload animation
            uploadAnimation.classList.remove('active');
            
            // Add file to chat messages
            addFileToChat(file, fileData.url);
            
            // Show success popup
            showSuccessPopup(`${file.name} uploaded successfully`);
            
            // Clean up file preview if this is the last file
            if (index === totalFiles - 1) {
                const filePreviewContainer = document.getElementById('file-preview-container');
                const selectedFilesContainer = document.querySelector('.selected-files');
                
                // Clear selected files
                if (selectedFilesContainer) {
                    selectedFilesContainer.innerHTML = '';
                }
                
                // Hide the container
                if (filePreviewContainer) {
                    filePreviewContainer.style.display = 'none';
                }
            }
            
            return fileData;
        }).catch(error => {
            console.error("Upload failed:", error);
            uploadAnimation.classList.remove('active');
            showToast("Upload failed: " + error.message, "error");
        });
    }
    
    // Function to add file to chat
    function addFileToChat(file, downloadURL = null) {
        const chatMessages = document.querySelector('.chat-messages');
        const currentChannelId = document.querySelector('.channel.active')?.getAttribute('data-channel-id') || 'general-chat';
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Create message avatar
        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        avatarElement.innerHTML = '<img src="https://ui-avatars.com/api/?name=Current+User&background=random" alt="User Avatar">';
        
        // Create message content container
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        // Create message header
        const headerElement = document.createElement('div');
        headerElement.className = 'message-header';
        headerElement.innerHTML = `
            <span class="message-author">Current User</span>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        `;
        
        // Create message body
        const bodyElement = document.createElement('div');
        bodyElement.className = 'message-body';
        
        // Create attachment element based on file type
        const attachmentElement = document.createElement('div');
        attachmentElement.className = 'message-attachment';
        
        if (file.type.startsWith('image/')) {
            // For images, create an image element
            const imgElement = document.createElement('div');
            imgElement.className = 'image-attachment';
            
            // Use the download URL from Firebase if available, otherwise create a temporary object URL
            const imageUrl = downloadURL || URL.createObjectURL(file);
            
            imgElement.innerHTML = `
                <img src="${imageUrl}" alt="${file.name}" />
                <div class="attachment-info">
                    <span class="attachment-name">${file.name}</span>
                    <span class="attachment-size">${formatFileSize(file.size)}</span>
                </div>
            `;
            
            attachmentElement.appendChild(imgElement);
        } else {
            // For other files, create a file attachment element
            const fileElement = document.createElement('div');
            fileElement.className = 'file-attachment';
            
            // Determine file icon based on type
            let fileIcon = 'fa-file';
            if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
            else if (file.type.includes('word') || file.type.includes('document')) fileIcon = 'fa-file-word';
            else if (file.type.includes('excel') || file.type.includes('sheet')) fileIcon = 'fa-file-excel';
            else if (file.type.includes('video')) fileIcon = 'fa-file-video';
            else if (file.type.includes('audio')) fileIcon = 'fa-file-audio';
            else if (file.type.includes('zip') || file.type.includes('archive')) fileIcon = 'fa-file-archive';
            
            fileElement.innerHTML = `
                <div class="file-icon"><i class="fas ${fileIcon}"></i></div>
                <div class="attachment-info">
                    <span class="attachment-name">${file.name}</span>
                    <span class="attachment-size">${formatFileSize(file.size)}</span>
                </div>
                <a href="${downloadURL || '#'}" class="download-button" ${downloadURL ? 'download' : ''} target="_blank">
                    <i class="fas fa-download"></i>
                </a>
            `;
            
            attachmentElement.appendChild(fileElement);
        }
        
        // Append attachment to message body
        bodyElement.appendChild(attachmentElement);
        
        // Assemble message
        contentElement.appendChild(headerElement);
        contentElement.appendChild(bodyElement);
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        
        // Add message to chat
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Update channel messages
        channelMessages[currentChannelId] = chatMessages.innerHTML;
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Function to load messages with attachments from Firebase
    async function loadMessagesWithAttachments(channelId) {
        try {
            const chatMessages = document.querySelector('.chat-messages');
            if (!chatMessages) return;
            
            // Clear current messages
            chatMessages.innerHTML = '';
            
            // Add loading indicator
            const loadingElement = document.createElement('div');
            loadingElement.className = 'loading-messages';
            loadingElement.innerHTML = '<div class="spinner"></div><p>Loading messages...</p>';
            chatMessages.appendChild(loadingElement);
            
            // In a real app, you would fetch messages from Firebase here
            // For example:
            // const messagesRef = ref(database, 'messages');
            // const messagesQuery = query(messagesRef, orderByChild('channelId'), equalTo(channelId));
            // const snapshot = await get(messagesQuery);
            
            // For demo purposes, we'll use the stored HTML
            setTimeout(() => {
                // Remove loading indicator
                loadingElement.remove();
                
                // Load messages from channelMessages object
                if (channelMessages[channelId]) {
                    chatMessages.innerHTML = channelMessages[channelId];
                } else {
                    // If no messages, show welcome message
                    chatMessages.innerHTML = `
                        <div class="message system-message">
                            <div class="message-content">
                                Welcome to the beginning of the <strong>${channelId}</strong> channel.
                            </div>
                        </div>
                    `;
                }
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        } catch (error) {
            console.error('Error loading messages:', error);
            showToast('Error loading messages', 'error');
        }
    }
    
    // Function to display images from Firebase Storage
    function displayStorageImage(imageUrl, container) {
        if (!imageUrl || !container) return;
        
        const imgElement = document.createElement('img');
        imgElement.className = 'storage-image';
        imgElement.alt = 'Uploaded image';
        
        // Add loading state
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'image-loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div>';
        container.appendChild(loadingSpinner);
        
        // Load image
        imgElement.onload = () => {
            // Remove loading spinner
            loadingSpinner.remove();
            container.appendChild(imgElement);
            
            // Add lightbox functionality
            imgElement.addEventListener('click', () => {
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <img src="${imageUrl}" alt="Fullsize image">
                        <button class="close-lightbox"><i class="fas fa-times"></i></button>
                    </div>
                `;
                document.body.appendChild(lightbox);
                
                // Close lightbox on click
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox || e.target.closest('.close-lightbox')) {
                        lightbox.remove();
                    }
                });
            });
        };
        
        imgElement.onerror = () => {
            loadingSpinner.remove();
            container.innerHTML = '<div class="image-error"><i class="fas fa-exclamation-triangle"></i> Failed to load image</div>';
        };
        
        imgElement.src = imageUrl;
    }
    
    // Function to handle channel switching
    function switchChannel(channelId) {
        // Update active channel
        document.querySelectorAll('.channel').forEach(channel => {
            channel.classList.remove('active');
        });
        
        const selectedChannel = document.querySelector(`.channel[data-channel-id="${channelId}"]`);
        if (selectedChannel) {
            selectedChannel.classList.add('active');
        }
        
        // Update channel header
        const channelHeader = document.querySelector('.channel-header h2');
        if (channelHeader) {
            channelHeader.textContent = `# ${channelId.replace(/-/g, ' ')}`;
        }
        
        // Load messages for this channel
        loadMessagesWithAttachments(channelId);
    }
    
    // Add event listeners to channel items
    document.querySelectorAll('.channel').forEach(channel => {
        channel.addEventListener('click', function() {
            const channelId = this.getAttribute('data-channel-id');
            if (channelId) {
                switchChannel(channelId);
            }
        });
    });
    
    // Initialize with default channel
    const defaultChannel = document.querySelector('.channel.active')?.getAttribute('data-channel-id') || 'general-chat';
    loadMessagesWithAttachments(defaultChannel);
    
    // Store messages for each channel
    const channelMessages = {
        'general-chat': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>general-chat</strong> channel.
                </div>
            </div>
        `,
        'announcements': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>announcements</strong> channel.
                </div>
            </div>
        `,
        'campus-events': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>campus-events</strong> channel.
                </div>
            </div>
        `,
        'study-guides': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>study-guides</strong> channel.
                </div>
            </div>
        `,
        'practice-tests': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>practice-tests</strong> channel.
                </div>
            </div>
        `,
        'lecture-notes': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>lecture-notes</strong> channel.
                </div>
            </div>
        `,
        'video-tutorials': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>video-tutorials</strong> channel.
                </div>
            </div>
        `,
        'computer-science': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>computer-science</strong> channel.
                </div>
            </div>
        `,
        'mathematics': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>mathematics</strong> channel.
                </div>
            </div>
        `,
        'operating-systems': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>operating-systems</strong> channel.
                </div>
            </div>
        `,
        'data-structures': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>data-structures</strong> channel.
                </div>
            </div>
        `,
        'algorithms': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>algorithms</strong> channel.
                </div>
            </div>
        `,
        'software-engineering': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>software-engineering</strong> channel.
                </div>
            </div>
        `,
        'database-systems': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>database-systems</strong> channel.
                </div>
            </div>
        `,
        'electrical-engineering': `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>electrical-engineering</strong> channel.
                </div>
            </div>
        `
    };
    
    // Current active channel
    let currentChannel = 'general-chat';
    
    // Click handlers for channels
    const channels = document.querySelectorAll('.channel');
    channels.forEach(channel => {
        // Remove any existing click listeners
        const newChannel = channel.cloneNode(true);
        channel.parentNode.replaceChild(newChannel, channel);
        
        // Add click event listener to new channel
        newChannel.addEventListener('click', function(e) {
            // Only proceed if the click wasn't on the remove button
            if (!e.target.classList.contains('remove-button')) {
                // Save current messages
                channelMessages[currentChannel] = document.querySelector('.chat-messages').innerHTML;
                
            // Remove active class from all channels
                document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
            // Add active class to clicked channel
                this.classList.add('active');
                
                // Get channel name and update the current channel
                const channelName = this.querySelector('span').textContent;
                currentChannel = channelName;
                
                // Update chat header
            document.querySelector('.channel-name').textContent = channelName;
                
                // Update channel topic based on selected channel
                const topicElement = document.querySelector('.channel-topic');
                switch(channelName) {
                    case 'general-chat':
                        topicElement.textContent = 'General discussion for MIT students';
                        break;
                    case 'announcements':
                        topicElement.textContent = 'Important announcements from administrators';
                        break;
                    case 'campus-events':
                        topicElement.textContent = 'Upcoming events, workshops, and activities';
                        break;
                    case 'study-guides':
                        topicElement.textContent = 'Comprehensive study guides for various courses';
                        break;
                    case 'practice-tests':
                        topicElement.textContent = 'Sample exams and practice questions';
                        break;
                    case 'lecture-notes':
                        topicElement.textContent = 'Notes from lectures and class discussions';
                        break;
                    case 'video-tutorials':
                        topicElement.textContent = 'Educational videos and tutorials';
                        break;
                    case 'computer-science':
                        topicElement.textContent = 'Discussions on algorithms, programming, and computer theory';
                        break;
                    case 'mathematics':
                        topicElement.textContent = 'Calculus, algebra, statistics and more';
                        break;
                    case 'operating-systems':
                        topicElement.textContent = 'Process management, memory management, and file systems';
                        break;
                    case 'data-structures':
                        topicElement.textContent = 'Arrays, linked lists, trees, graphs, and hash tables';
                        break;
                    case 'algorithms':
                        topicElement.textContent = 'Algorithm design, analysis, and implementation';
                        break;
                    case 'software-engineering':
                        topicElement.textContent = 'Software development principles and practices';
                        break;
                    case 'database-systems':
                        topicElement.textContent = 'Database design, SQL, and data management';
                        break;
                    case 'electrical-engineering':
                        topicElement.textContent = 'Circuit design, electronics, and signal processing';
                        break;
                    default:
                        topicElement.textContent = 'Study group for ' + channelName;
                }
                
                // Load messages for the selected channel
                const chatMessages = document.querySelector('.chat-messages');
                if (channelMessages[channelName]) {
                    chatMessages.innerHTML = channelMessages[channelName];
                } else {
                    // If no messages yet, show default system message
                    chatMessages.innerHTML = `<div class="message system-message">
                        <div class="message-content">
                            Welcome to the beginning of the <strong>${channelName}</strong> channel.
                        </div>
                    </div>`;
                }
            }
        });
        
        // Re-add remove button functionality
        const removeBtn = newChannel.querySelector('.remove-button');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent channel click event
                
                const channel = this.closest('.channel');
                const subjectName = channel.querySelector('span').textContent;
                
                showConfirmDialog(
                    'Remove Subject', 
                    `Are you sure you want to remove the "${subjectName}" study group?`, 
                    function() {
                        // Animation for smooth removal
                        channel.style.height = channel.offsetHeight + 'px';
                        channel.style.overflow = 'hidden';
                        
                        setTimeout(() => {
                            channel.style.height = '0';
                            channel.style.padding = '0';
                            channel.style.margin = '0';
                            
                            setTimeout(() => {
                                channel.remove();
                                showToast(`"${subjectName}" study group removed`, 'info');
                            }, 300);
                        }, 10);
                    }
                );
            });
        }
    });
    
    // Setup remove buttons for study group subjects
    setupSubjectRemoveButtons();
    
    // Setup remove buttons for colleges
    setupCollegeRemoveButtons();
    
    // Add delete buttons to existing messages
    addDeleteButtonsToExistingMessages();
    
    // Add download functionality to all file attachments
    setupFileDownloads();
    
    // Add file attachment button functionality
    const attachButton = document.querySelector('.attachment-buttons .icon-button');
    if (attachButton) {
    attachButton.addEventListener('click', function() {
            // Create a hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Trigger click on the file input
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    handleFileUpload(file);
                }
                // Remove the input from the DOM
                document.body.removeChild(fileInput);
            });
        });
    }
    
    // Handle file uploads
    function handleFileUpload(file) {
        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        let fileType = '';
        let iconSvg = '';
        
        // Determine file type and icon
        if (['pdf'].includes(fileExtension)) {
            fileType = 'pdf-file';
            iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>';
        } else if (['doc', 'docx'].includes(fileExtension)) {
            fileType = 'word-file';
            iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285f4" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path><path fill="#8ab4f8" d="M14 3v5h5z"></path><path fill="white" d="M10.29 14.47L8.5 19h-2l2.67-7h1.8l2.67 7h-2l-1.8-4.53z"></path></svg>';
        } else if (['ppt', 'pptx'].includes(fileExtension)) {
            fileType = 'ppt-file';
            iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#db4437" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path><path fill="#f5b8b4" d="M14 3v5h5z"></path><path fill="white" d="M10 14v-3h2v3h1l-2 3-2-3h1z"></path></svg>';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            fileType = 'image-file';
            // For images, we'll create a preview instead of using an icon
        } else {
            fileType = 'generic-file';
            iconSvg = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"></path></svg>';
        }
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        // Send a message with the file attachment
        sendMessageWithAttachment(file, fileType, iconSvg, fileSize);
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    function sendMessageWithAttachment(file, fileType, iconSvg, fileSize) {
        // Create message elements
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            username: 'Guest User',
            email: 'guest@example.com',
            profilePic: 'https://via.placeholder.com/40'
        };
        
        // Create avatar
        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        
        const avatarImage = document.createElement('img');
        avatarImage.src = currentUser.profilePic || 'https://via.placeholder.com/40';
        avatarImage.alt = 'Avatar';
        avatarImage.className = 'user-avatar';
        
        // Add click event to avatar to show profile
        avatarImage.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
        
        avatarElement.appendChild(avatarImage);
        
        // Create message info container
        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';
        
        // Create message header
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Add username
        const senderName = document.createElement('span');
        senderName.className = 'sender-name user-display-name';
        senderName.textContent = currentUser.username;
        
        // Add click event to username to show profile
        senderName.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
        
        // Add timestamp
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        const now = new Date();
        messageTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageHeader.appendChild(senderName);
        messageHeader.appendChild(messageTime);
        
        // Add message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = 'Shared a file: ' + file.name;
        
        // Create attachment element
        const attachment = document.createElement('div');
        attachment.className = `attachment ${fileType}`;
        
        if (fileType === 'image-file') {
            // For images, create a preview
            const img = document.createElement('img');
            img.className = 'attachment-image';
            img.alt = file.name;
            
            // Create a temporary URL for the image
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            
            attachment.appendChild(img);
            
            // Add image actions
            const imageActions = document.createElement('div');
            imageActions.className = 'image-actions';
            
            // Download button
            const downloadButton = document.createElement('button');
            downloadButton.className = 'icon-button';
            downloadButton.title = 'Download image';
            downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>';
            downloadButton.addEventListener('click', () => downloadFile(file));
            
            // Fullscreen button
            const fullscreenButton = document.createElement('button');
            fullscreenButton.className = 'icon-button';
            fullscreenButton.title = 'View fullscreen';
            fullscreenButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42 2.89 2.87L15 21h6v-6z"></path></svg>';
            
            imageActions.appendChild(downloadButton);
            imageActions.appendChild(fullscreenButton);
            attachment.appendChild(imageActions);
        } else {
            // For non-image files
            // Create file icon
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-icon';
            fileIcon.innerHTML = iconSvg;
            
            // Create file info
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const fileSizeElement = document.createElement('div');
            fileSizeElement.className = 'file-size';
            fileSizeElement.textContent = fileSize;
            
            fileInfo.appendChild(fileName);
            fileInfo.appendChild(fileSizeElement);
            
            // Download button
            const downloadButton = document.createElement('button');
            downloadButton.className = 'download-button';
            downloadButton.title = 'Download file';
            downloadButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>';
            downloadButton.addEventListener('click', () => downloadFile(file));
            
            attachment.appendChild(fileIcon);
            attachment.appendChild(fileInfo);
            attachment.appendChild(downloadButton);
        }
        
        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-message';
        deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
        deleteButton.addEventListener('click', function() {
            deleteMessage(messageDiv);
        });
        
        // Assemble the message
        messageInfo.appendChild(messageHeader);
        messageInfo.appendChild(messageContent);
        messageInfo.appendChild(attachment);
        
        messageDiv.appendChild(avatarElement);
        messageDiv.appendChild(messageInfo);
        messageDiv.appendChild(deleteButton);
        
        // Add to chat
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.appendChild(messageDiv);
        
        // Update the stored messages for the current channel
        if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
            channelMessages[currentChannel] = chatMessages.innerHTML;
        }
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store the file in a temporary Map (in a real app, files would be uploaded to a server)
        if (!window.uploadedFiles) window.uploadedFiles = new Map();
        window.uploadedFiles.set(file.name, file);
        
        // Show success toast
        showToast('File uploaded successfully!', 'success');
    }
    
    // Function to download a file
    function downloadFile(file) {
        // Create a temporary URL for the file
        const url = URL.createObjectURL(file);
        
        // Create a temporary link to download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        
        // Trigger click on the link
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success toast
        showToast('File downloaded successfully!', 'success');
    }
    
    // Function to simulate file download for demo purposes
    function simulateFileDownload(fileName) {
        showToast(`Downloading ${fileName}...`, 'info');
        
        // Create a progress toast to show download progress
        const toastContainer = document.querySelector('.toast-container') || 
            (() => {
                const container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
                return container;
            })();
        
        const progressToast = document.createElement('div');
        progressToast.className = 'toast info';
        
        const progressText = document.createElement('div');
        progressText.textContent = `Downloading ${fileName}...`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'file-upload-progress';
        progressBar.style.width = '0%';
        
        progressToast.appendChild(progressText);
        progressToast.appendChild(progressBar);
        toastContainer.appendChild(progressToast);
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                toastContainer.removeChild(progressToast);
                showToast(`${fileName} downloaded successfully!`, 'success');
            }
        }, 100);
    }
    
    // Function to open an image in fullscreen
    function openImageFullscreen(imageElement) {
        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        
        // Create image container
        const container = document.createElement('div');
        container.className = 'fullscreen-container';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageElement.src;
        img.alt = imageElement.alt;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'fullscreen-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Assemble the overlay
        container.appendChild(img);
        overlay.appendChild(container);
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
        
        // Close on click outside image
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // Search functionality
    const searchButton = document.querySelector('.header-actions .icon-button[title="Search"]');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            // Create the search overlay if it doesn't exist
            let searchOverlay = document.getElementById('search-overlay');
            if (!searchOverlay) {
                searchOverlay = document.createElement('div');
                searchOverlay.id = 'search-overlay';
                searchOverlay.className = 'search-overlay';
                
                // Create search container
                const searchContainer = document.createElement('div');
                searchContainer.className = 'search-container';
                
                // Create search header
                const searchHeader = document.createElement('div');
                searchHeader.className = 'search-header';
                
                const searchTitle = document.createElement('h3');
                searchTitle.textContent = 'Search Messages';
                
                const closeSearchButton = document.createElement('button');
                closeSearchButton.className = 'close-button';
                closeSearchButton.innerHTML = '&times;';
                closeSearchButton.addEventListener('click', closeSearch);
                
                searchHeader.appendChild(searchTitle);
                searchHeader.appendChild(closeSearchButton);
                
                // Create search input
                const searchInputContainer = document.createElement('div');
                searchInputContainer.className = 'search-input-container';
                
                const searchIcon = document.createElement('div');
                searchIcon.className = 'search-icon';
                searchIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>';
                
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search in conversation...';
                searchInput.id = 'search-input';
                searchInput.addEventListener('input', performSearch);
                
                searchInputContainer.appendChild(searchIcon);
                searchInputContainer.appendChild(searchInput);
                
                // Create search results container
                const searchResults = document.createElement('div');
                searchResults.className = 'search-results';
                searchResults.id = 'search-results';
                
                // Assemble the search overlay
                searchContainer.appendChild(searchHeader);
                searchContainer.appendChild(searchInputContainer);
                searchContainer.appendChild(searchResults);
                searchOverlay.appendChild(searchContainer);
                
                document.body.appendChild(searchOverlay);
            }
            
            // Show the search overlay
            searchOverlay.classList.add('visible');
            document.getElementById('search-input').focus();
        });
    }
    
    function closeSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('visible');
        }
    }
    
    function performSearch() {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim().toLowerCase();
        const searchResults = document.getElementById('search-results');
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '<div class="search-empty">Type at least 2 characters to search</div>';
            return;
        }
        
        // Get all message content
        const messages = document.querySelectorAll('.message-content');
        let results = [];
        
        messages.forEach(message => {
            const messageText = message.textContent.toLowerCase();
            if (messageText.includes(searchTerm)) {
                // Get the parent message div
                const messageDiv = message.closest('.message');
                if (messageDiv) {
                    const username = messageDiv.querySelector('.username')?.textContent || 'Unknown';
                    const timestamp = messageDiv.querySelector('.timestamp')?.textContent || '';
                    const avatarSrc = messageDiv.querySelector('.avatar')?.src || '';
                    
                    results.push({
                        username,
                        timestamp,
                        avatarSrc,
                        messageText: message.textContent,
                        element: messageDiv
                    });
                }
            }
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-empty">No messages found</div>';
            return;
        }
        
        // Display results
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            const resultAvatar = document.createElement('img');
            resultAvatar.src = result.avatarSrc;
            resultAvatar.alt = 'User avatar';
            resultAvatar.className = 'avatar';
            
            const resultInfo = document.createElement('div');
            resultInfo.className = 'result-info';
            
            const resultHeader = document.createElement('div');
            resultHeader.className = 'result-header';
            
            const resultUsername = document.createElement('span');
            resultUsername.className = 'username';
            resultUsername.textContent = result.username;
            
            const resultTimestamp = document.createElement('span');
            resultTimestamp.className = 'timestamp';
            resultTimestamp.textContent = result.timestamp;
            
            const resultText = document.createElement('div');
            resultText.className = 'result-text';
            
            // Highlight the search term in the message text
            const highlightedText = result.messageText.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="highlight">${match}</span>`
            );
            resultText.innerHTML = highlightedText;
            
            resultHeader.appendChild(resultUsername);
            resultHeader.appendChild(resultTimestamp);
            
            resultInfo.appendChild(resultHeader);
            resultInfo.appendChild(resultText);
            
            resultItem.appendChild(resultAvatar);
            resultItem.appendChild(resultInfo);
            
            // Add click handler to scroll to the original message
            resultItem.addEventListener('click', () => {
                closeSearch();
                result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                result.element.classList.add('highlight-message');
                setTimeout(() => {
                    result.element.classList.remove('highlight-message');
                }, 2000);
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    // Message input and send functionality
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Functions
    function showAddCollegeModal() {
        addCollegeModal.classList.add('show');
        collegeNameInput.focus();
    }
    
    function hideAddCollegeModal() {
        addCollegeModal.classList.remove('show');
        // Clear inputs
        collegeNameInput.value = '';
        collegeShortInput.value = '';
        if (collegeLogoUrlInput) {
            collegeLogoUrlInput.value = '';
            logoPreviewImg.src = 'https://via.placeholder.com/32';
        }
    }
    
    function addNewCollege() {
        const collegeName = collegeNameInput.value.trim();
        const collegeShort = collegeShortInput.value.trim();
        const logoUrl = collegeLogoUrlInput ? collegeLogoUrlInput.value.trim() : '';
        
        if (!collegeName || !collegeShort) {
            showToast('Please enter college name and abbreviation', 'error');
            return;
        }
        
        // Use a default logo if none provided
        const finalLogoUrl = logoUrl || 'https://via.placeholder.com/32';
        
            // Create new college item
            const newCollegeItem = document.createElement('div');
            newCollegeItem.className = 'college-item';
            
        newCollegeItem.innerHTML = `
            <div class="college-icon">
                <img src="${finalLogoUrl}" alt="${collegeShort}" class="college-logo">
            </div>
            <span class="college-name">${collegeName}</span>
            <button class="remove-button" title="Remove College">×</button>
        `;
        
        // Add click handler to select the college
        newCollegeItem.addEventListener('click', function(e) {
            if (!e.target.classList.contains('remove-button')) {
                document.querySelectorAll('.college-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Update community header
                document.querySelector('.community-header h2').textContent = `${collegeName} Community`;
                
                // Apply college theme if theme system is available
                const logoImg = this.querySelector('.college-logo');
                if (typeof applyCollegeTheme === 'function' && logoImg) {
                    applyCollegeTheme(logoImg, collegeName);
                }
            }
        });
        
        // Add remove button functionality
        const removeBtn = newCollegeItem.querySelector('.remove-button');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const collegeItem = this.closest('.college-item');
            
            // Don't allow removing the last college
            const collegeCount = document.querySelectorAll('.college-item').length;
            if (collegeCount <= 1) {
                showToast('Cannot remove the last college', 'error');
                return;
            }
            
            showConfirmDialog(
                'Remove College', 
                `Are you sure you want to remove "${collegeName}"?`, 
                function() {
                    // If removing active college, activate another one
                    if (collegeItem.classList.contains('active') && collegeCount > 1) {
                        const nextCollege = collegeItem.nextElementSibling || collegeItem.previousElementSibling;
                        if (nextCollege) {
                            nextCollege.classList.add('active');
                // Update community header
                            const nextCollegeName = nextCollege.querySelector('.college-name').textContent;
                            document.querySelector('.community-header h2').textContent = nextCollegeName + ' Community';
                        }
                    }
                    
                    // Animation for smooth removal
                    collegeItem.style.height = collegeItem.offsetHeight + 'px';
                    collegeItem.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        collegeItem.style.height = '0';
                        collegeItem.style.padding = '0';
                        collegeItem.style.margin = '0';
                        
                        setTimeout(() => {
                            collegeItem.remove();
                            showToast(`"${collegeName}" removed`, 'info');
                        }, 300);
                    }, 10);
                }
            );
        });
        
        // Add new college to the list
        collegeList.appendChild(newCollegeItem);
        
        // Activate the new college
        document.querySelectorAll('.college-item').forEach(i => i.classList.remove('active'));
        newCollegeItem.classList.add('active');
        document.querySelector('.community-header h2').textContent = `${collegeName} Community`;
        
        // Apply theme for the new college
        const logoImg = newCollegeItem.querySelector('.college-logo');
        if (typeof applyCollegeTheme === 'function' && logoImg) {
            // Add a slight delay to ensure the image is loaded
            setTimeout(() => {
                applyCollegeTheme(logoImg, collegeName);
            }, 100);
        }
        
        // Clear inputs and hide modal
        collegeNameInput.value = '';
        collegeShortInput.value = '';
        if (collegeLogoUrlInput) {
            collegeLogoUrlInput.value = '';
            logoPreviewImg.src = 'https://via.placeholder.com/32';
        }
        
        hideAddCollegeModal();
        showToast(`"${collegeName}" added successfully`, 'success');
    }
    
    function sendMessage(content) {
        const messageInput = document.getElementById('message-input');
        const fileInput = document.getElementById('file-input');
        const chatMessages = document.querySelector('.chat-messages');
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            username: 'Guest User',
            email: 'guest@example.com',
            profilePic: 'https://via.placeholder.com/40'
        };

        // If content is provided as parameter, use it, otherwise get from input
        const messageText = content || (messageInput ? messageInput.value.trim() : '');

        // Don't send empty messages if there's no text and no files
        if (!messageText && (!fileInput || !fileInput.files || fileInput.files.length === 0)) {
            return;
        }
        
        // Get current time for the message
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Create message avatar
        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        
        const avatarImage = document.createElement('img');
        avatarImage.src = currentUser.profilePic || 'https://via.placeholder.com/40';
        avatarImage.alt = 'Avatar';
        avatarImage.className = 'user-avatar';
        
        // Add click event to avatar to show profile
        avatarImage.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
        
        avatarElement.appendChild(avatarImage);
        
        // Create message info container
        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';
        
        // Add sender name and time
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const senderName = document.createElement('span');
        senderName.className = 'sender-name user-display-name';
        senderName.textContent = currentUser.username;
        
        // Add click event to username to show profile
        senderName.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = timeString;
        
        messageHeader.appendChild(senderName);
        messageHeader.appendChild(messageTime);
        
        // Add message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Process file uploads if any
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            // Handle file uploads (using existing code)
            handleFileUpload(fileInput.files[0]);
        } else {
            // Add text message
            messageContent.textContent = messageText;
            
            // Clear input field if it exists
            if (messageInput) {
                messageInput.value = '';
            }
            
            // Add message to UI
            messageInfo.appendChild(messageHeader);
            messageInfo.appendChild(messageContent);
            messageElement.appendChild(avatarElement);
            messageElement.appendChild(messageInfo);
            
            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-message';
            deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
            deleteButton.addEventListener('click', function() {
                deleteMessage(messageElement);
            });
            messageElement.appendChild(deleteButton);
            
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    function showToast(message, type) {
        // Check if toast container exists
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            // Create toast container
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            toastContainer.removeChild(toast);
        });
        
        toast.appendChild(closeBtn);
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(function() {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 3000);
    }

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
    
    // Function to delete a message
    function deleteMessage(messageElement) {
        // No confirmation dialog, directly proceed with deletion
        // Create delete animation
        messageElement.classList.add('message-deleting');
        
        // After animation completes, remove the message
        setTimeout(() => {
            const chatMessages = document.querySelector('.chat-messages');
            if (chatMessages && messageElement.parentNode === chatMessages) {
                chatMessages.removeChild(messageElement);
                
                // Update the stored messages for the current channel
                if (typeof currentChannel !== 'undefined' && channelMessages[currentChannel]) {
                    channelMessages[currentChannel] = chatMessages.innerHTML;
                }
                
                // Show toast
                showToast('Message deleted', 'success');
            }
        }, 300);
    }

    // Function to show custom confirmation dialog
    function showConfirmDialog(title, message, confirmCallback) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        // Create dialog title
        const dialogTitle = document.createElement('div');
        dialogTitle.className = 'confirm-dialog-title';
        dialogTitle.textContent = title;
        
        // Create dialog message
        const dialogMessage = document.createElement('div');
        dialogMessage.className = 'confirm-dialog-message';
        dialogMessage.textContent = message;
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'confirm-dialog-buttons';
        
        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'confirm-dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'confirm-dialog-button delete';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            confirmCallback();
        });
        
        // Assemble the dialog
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(deleteButton);
        
        dialog.appendChild(dialogTitle);
        dialog.appendChild(dialogMessage);
        dialog.appendChild(buttonsContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Focus delete button
        deleteButton.focus();
    }

    // Function to add delete buttons to existing messages
    function addDeleteButtonsToExistingMessages() {
        const existingMessages = document.querySelectorAll('.message:not(.system-message)');
        
        existingMessages.forEach(message => {
            const messageHeader = message.querySelector('.message-header');
            if (messageHeader) {
                // Check if message actions already exist
                let messageActions = messageHeader.querySelector('.message-actions');
                
                if (!messageActions) {
                    messageActions = document.createElement('div');
                    messageActions.className = 'message-actions';
                    
                    // Add delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'message-action delete-button';
                    deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
                    deleteButton.title = 'Delete message';
                    deleteButton.addEventListener('click', function() {
                        deleteMessage(message);
                    });
                    
                    messageActions.appendChild(deleteButton);
                    messageHeader.appendChild(messageActions);
                }
            }
        });
    }

    // Function to handle study group subject removal
    function setupSubjectRemoveButtons() {
        const removeButtons = document.querySelectorAll('.channel .remove-button');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent channel click event
                
                const channel = this.closest('.channel');
                const subjectName = channel.querySelector('span').textContent;
                
                showConfirmDialog(
                    'Remove Subject', 
                    `Are you sure you want to remove the "${subjectName}" study group?`, 
                    function() {
                        // Animation for smooth removal
                        channel.style.height = channel.offsetHeight + 'px';
                        channel.style.overflow = 'hidden';
                        
                        setTimeout(() => {
                            channel.style.height = '0';
                            channel.style.padding = '0';
                            channel.style.margin = '0';
                            
                            setTimeout(() => {
                                channel.remove();
                                showToast(`"${subjectName}" study group removed`, 'info');
                            }, 300);
                        }, 10);
                    }
                );
            });
        });
    }

    // Function to setup download buttons for files
    function setupFileDownloads() {
        // Add click handlers for existing download buttons
    const downloadButtons = document.querySelectorAll('.download-button');
    downloadButtons.forEach(button => {
            if (!button.hasAttribute('data-initialized')) {
                button.setAttribute('data-initialized', 'true');
        button.addEventListener('click', function() {
                    // Get the file name from the nearest file-name element
                    const fileNameElement = this.closest('.attachment').querySelector('.file-name');
                    if (fileNameElement) {
                        const fileName = fileNameElement.textContent;
                        // Create a simulated download for demo purposes
                        simulateFileDownload(fileName);
                    } else {
                        // For image attachments that don't have a file-name element
                        const imageElement = this.closest('.attachment').querySelector('img');
                        if (imageElement) {
                            simulateFileDownload(imageElement.alt || 'image.png');
                        } else {
                            showToast('File download started!', 'success');
                        }
                    }
                });
            }
        });
        
        // Add click handlers for fullscreen buttons on images
        const fullscreenButtons = document.querySelectorAll('.image-actions .icon-button[title="View fullscreen"]');
    fullscreenButtons.forEach(button => {
            if (!button.hasAttribute('data-initialized')) {
                button.setAttribute('data-initialized', 'true');
        button.addEventListener('click', function() {
                    const imageElement = this.closest('.attachment').querySelector('img');
                    if (imageElement) {
                        openImageFullscreen(imageElement);
                    }
                });
            }
        });
    }
    
    // Observer to watch for changes in the chat messages and update functionality
    const chatMessagesObserver = new MutationObserver(() => {
        addDeleteButtonsToExistingMessages();
        setupFileDownloads();
    });
    
    // Start observing chat messages for changes
    chatMessagesObserver.observe(document.querySelector('.chat-messages'), {
        childList: true,
        subtree: true
    });

    // Function to handle college removal
    function setupCollegeRemoveButtons() {
        const removeButtons = document.querySelectorAll('.college-item .remove-button');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent college item click event
                
                const collegeItem = this.closest('.college-item');
                const collegeName = collegeItem.querySelector('.college-name').textContent;
                
                // Don't allow removing the last college
                const collegeCount = document.querySelectorAll('.college-item').length;
                if (collegeCount <= 1) {
                    showToast('Cannot remove the last college', 'error');
                    return;
                }
                
                showConfirmDialog(
                    'Remove College', 
                    `Are you sure you want to remove "${collegeName}"?`, 
                    function() {
                        // If removing active college, activate another one
                        if (collegeItem.classList.contains('active') && collegeCount > 1) {
                            const nextCollege = collegeItem.nextElementSibling || collegeItem.previousElementSibling;
                            if (nextCollege) {
                                nextCollege.classList.add('active');
                                // Update community header
                                const nextCollegeName = nextCollege.querySelector('.college-name').textContent;
                                document.querySelector('.community-header h2').textContent = nextCollegeName + ' Community';
                            }
                        }
                        
                        // Animation for smooth removal
                        collegeItem.style.height = collegeItem.offsetHeight + 'px';
                        collegeItem.style.overflow = 'hidden';
                        
                        setTimeout(() => {
                            collegeItem.style.height = '0';
                            collegeItem.style.padding = '0';
                            collegeItem.style.margin = '0';
                            
                            setTimeout(() => {
                                collegeItem.remove();
                                showToast(`"${collegeName}" removed`, 'info');
                            }, 300);
                        }, 10);
                    }
                );
            });
        });
    }

    // Setup remove Communities section button
    const removeCommunityBtn = document.getElementById('remove-community-section-btn');
    if (removeCommunityBtn) {
        removeCommunityBtn.addEventListener('click', function() {
            showConfirmDialog(
                'Remove Communities', 
                'Are you sure you want to remove the entire Communities section?', 
                function() {
                    // Find the parent section that contains all community elements
                    const sidebarSection = removeCommunityBtn.closest('.sidebar-section');
                    
                    // Animation for smooth removal
                    sidebarSection.style.height = sidebarSection.offsetHeight + 'px';
                    sidebarSection.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        sidebarSection.style.height = '0';
                        sidebarSection.style.padding = '0';
                        sidebarSection.style.margin = '0';
                        
                        setTimeout(() => {
                            sidebarSection.remove();
                            showToast('Communities section removed', 'info');
                        }, 300);
                    }, 10);
                }
            );
        });
    }

    // Community search functionality
    const communitySearchInput = document.getElementById('community-search-input');
    const communityItems = document.querySelectorAll('.college-item');
    const noResultsMessage = document.getElementById('no-results-message');
    
    if (communitySearchInput) {
        communitySearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let resultsFound = false;
            
            communityItems.forEach(item => {
                const collegeName = item.querySelector('.college-name').textContent.toLowerCase();
                const collegeAbbr = item.querySelector('.college-icon').textContent.toLowerCase();
                
                if (collegeName.includes(searchTerm) || collegeAbbr.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    resultsFound = true;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            if (resultsFound || searchTerm === '') {
                noResultsMessage.style.display = 'none';
            } else {
                noResultsMessage.style.display = 'block';
            }
        });
        
        // Clear search on Escape key
        communitySearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                // Trigger the input event to refresh the list
                this.dispatchEvent(new Event('input'));
            }
        });
    }

    // Initialize all click handlers and interactive elements
    function initializeInteractiveElements() {
        console.log('Initializing interactive elements...');
        
        // First, remove existing event listeners by cloning and replacing elements
        
        // College items
        const collegeList = document.querySelector('.college-list');
        if (collegeList) {
            const collegeItems = collegeList.querySelectorAll('.college-item');
            collegeItems.forEach(item => {
                // Remove any existing click listeners by cloning
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                // Add click event listener to new college item
                newItem.addEventListener('click', function(e) {
                    // Only proceed if the click wasn't on the remove button
                    if (!e.target.classList.contains('remove-button')) {
                        // Remove active class from all college items
                        document.querySelectorAll('.college-item').forEach(i => i.classList.remove('active'));
                        // Add active class to clicked item
                        this.classList.add('active');
                        
                        // Update community header
                        const collegeName = this.querySelector('.college-name').textContent;
                        const communityHeader = document.querySelector('.community-header h2');
                        if (communityHeader) {
                            communityHeader.textContent = collegeName + ' Community';
                        }
                        
                        console.log('College clicked:', collegeName);
                    }
                });
                
                // Re-add remove button functionality
                const removeBtn = newItem.querySelector('.remove-button');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // Prevent college item click event
                        const collegeItem = this.closest('.college-item');
                        const collegeName = collegeItem.querySelector('.college-name').textContent;
                        
                        // Handle remove functionality
                        console.log('Remove college clicked:', collegeName);
                        
                        // Your existing remove logic here
                        // ...
                    });
                }
            });
        }
        
        // Channel items
        const channelsSections = document.querySelectorAll('.channels-section');
        if (channelsSections.length > 0) {
            channelsSections.forEach(section => {
                const channels = section.querySelectorAll('.channel');
                channels.forEach(channel => {
                    // Remove any existing click listeners by cloning
                    const newChannel = channel.cloneNode(true);
                    channel.parentNode.replaceChild(newChannel, channel);
                    
                    // Add click event listener to new channel
                    newChannel.addEventListener('click', function(e) {
                        // Only proceed if the click wasn't on the remove button
                        if (!e.target.classList.contains('remove-button')) {
                            // Save current messages if available
                            if (typeof channelMessages !== 'undefined' && typeof currentChannel !== 'undefined') {
                                const chatMessages = document.querySelector('.chat-messages');
                                if (chatMessages) {
                                    channelMessages[currentChannel] = chatMessages.innerHTML;
                                }
                            }
                            
                            // Remove active class from all channels
                            document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
                            // Add active class to clicked channel
                            this.classList.add('active');
                            
                            // Get channel name and update the current channel
                            const channelName = this.querySelector('span').textContent;
                            if (typeof currentChannel !== 'undefined') {
                                currentChannel = channelName;
                            }
                            
                            // Update chat header if it exists
                            const channelNameElement = document.querySelector('.channel-name');
                            if (channelNameElement) {
                                channelNameElement.textContent = channelName;
                            }
                            
                            console.log('Channel clicked:', channelName);
                            
                            // Your existing channel selection logic here
                            // ...
                        }
                    });
                    
                    // Re-add remove button functionality
                    const removeBtn = newChannel.querySelector('.remove-button');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation(); // Prevent channel click event
                            
                            const channel = this.closest('.channel');
                            const subjectName = channel.querySelector('span').textContent;
                            
                            console.log('Remove channel clicked:', subjectName);
                            
                            // Your existing remove logic here
                            // ...
                        });
                    }
                });
            });
        }
        
        console.log('Interactive elements initialized.');
    }

    // Call this function when DOM is loaded
    setTimeout(initializeInteractiveElements, 100);

    // Profile Dropdown and Modal Functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Profile dropdown toggle
        const optionsButton = document.querySelector('.options-button');
        const profileDropdown = document.querySelector('.profile-dropdown');
        
        if (optionsButton && profileDropdown) {
            optionsButton.addEventListener('click', function(e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!profileDropdown.contains(e.target) && !optionsButton.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
        
        // Profile view modal
        const viewProfileBtn = document.getElementById('view-profile-btn');
        const viewProfileModal = document.getElementById('view-profile-modal');
        
        if (viewProfileBtn && viewProfileModal) {
            viewProfileBtn.addEventListener('click', function() {
                openModal(viewProfileModal);
                profileDropdown.classList.remove('show');
            });
        }
        
        // Profile edit modal
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const editProfileModal = document.getElementById('edit-profile-modal');
        
        if (editProfileBtn && editProfileModal) {
            editProfileBtn.addEventListener('click', function() {
                openModal(editProfileModal);
                profileDropdown.classList.remove('show');
            });
        }
        
        // Handle profile edit form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const displayName = document.getElementById('display-name').value;
                const email = document.getElementById('email').value;
                const bio = document.getElementById('bio').value;
                
                // Get selected status
                let selectedStatus = '';
                const statusOptions = document.querySelectorAll('input[name="status"]');
                statusOptions.forEach(option => {
                    if (option.checked) {
                        selectedStatus = option.value;
                    }
                });
                
                // Update user information in UI
                document.getElementById('username').textContent = displayName;
                
                // Update status indicator
                const statusIndicator = document.querySelector('.status');
                statusIndicator.className = 'status';
                statusIndicator.classList.add(selectedStatus);
                
                // Update the view profile modal
                document.getElementById('profile-display-name').textContent = displayName;
                document.getElementById('profile-email').textContent = email;
                document.getElementById('profile-bio').textContent = bio || 'No bio provided';
                
                // Close the modal
                closeModal(editProfileModal);
                
                // Show success message
                showNotification('Profile updated successfully!', 'success');
            });
        }
        
        // Cancel edit profile form
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
                closeModal(editProfileModal);
            });
        }
        
        // Close view profile modal
        const closeViewProfileBtn = document.getElementById('close-view-profile-btn');
        if (closeViewProfileBtn && viewProfileModal) {
            closeViewProfileBtn.addEventListener('click', function() {
                closeModal(viewProfileModal);
            });
        }
        
        // Sign out functionality
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function() {
                // Only close the dropdown, auth.js will handle the actual logout
                if (profileDropdown) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
    });

    // Utility function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-notification">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Close notification on button click
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }

    // Helper function to open modals
    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    // Helper function to close modals
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Add emoji picker functionality
    function initializeEmojiPicker() {
        // Only target the main content area's message input container
        const contentArea = document.querySelector('main.content-area');
        if (!contentArea) {
            console.log('Main content area not found');
            return;
        }
        
        const messageInputContainer = contentArea.querySelector('.message-input-container');
        if (!messageInputContainer) {
            console.log('Message input container not found in main content area');
            return;
        }
        
        // Get emoji elements from the chat area only
        const emojiButton = messageInputContainer.querySelector('.emoji-button');
        const emojiPicker = messageInputContainer.querySelector('.emoji-picker');
        const messageInput = messageInputContainer.querySelector('.message-input');
        
        // Safety check before proceeding
        if (!emojiButton || !emojiPicker || !messageInput) {
            console.log('Required emoji elements not found in chat area');
            return;
        }
        
        console.log('Emoji picker initialized in chat area');
        
        // Set first emoji group as active
        const emojiGroups = messageInputContainer.querySelectorAll('.emoji-group');
        if (emojiGroups.length > 0) {
            emojiGroups[0].setAttribute('data-active', 'true');
        }
        
        // Toggle emoji picker
        emojiButton.addEventListener('click', function(e) {
            e.stopPropagation();
            emojiPicker.classList.toggle('active');
            
            // If opening the picker, focus the search input
            if (emojiPicker.classList.contains('active')) {
                const emojiSearchInput = messageInputContainer.querySelector('#emoji-search-input');
                if (emojiSearchInput) {
        setTimeout(() => {
                        emojiSearchInput.focus();
                    }, 100);
                }
            }
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', function(e) {
            if (emojiPicker.classList.contains('active') && 
                !emojiPicker.contains(e.target) && 
                e.target !== emojiButton) {
                emojiPicker.classList.remove('active');
            }
        });
        
        // Handle emoji category selection
        const emojiCategories = messageInputContainer.querySelectorAll('.emoji-category');
        emojiCategories.forEach(category => {
            category.addEventListener('click', function() {
                // Remove active class from all categories
                emojiCategories.forEach(cat => cat.classList.remove('active'));
                
                // Add active class to clicked category
                this.classList.add('active');
                
                // Hide all emoji groups
                emojiGroups.forEach(group => group.removeAttribute('data-active'));
                
                // Show the selected emoji group
                const categoryName = this.getAttribute('data-category');
                const targetGroup = messageInputContainer.querySelector(`.emoji-group[data-category="${categoryName}"]`);
                if (targetGroup) {
                    targetGroup.setAttribute('data-active', 'true');
                }
            });
        });
        
        // Handle emoji search
        const emojiSearchInput = messageInputContainer.querySelector('#emoji-search-input');
        if (emojiSearchInput) {
            emojiSearchInput.addEventListener('input', function() {
                const searchValue = this.value.toLowerCase();
                const emojis = messageInputContainer.querySelectorAll('.emoji');
                
                if (searchValue) {
                    // Show all emoji groups during search
                    emojiGroups.forEach(group => {
                        group.setAttribute('data-active', 'true');
                        group.style.display = 'grid';
                    });
                    
                    // Filter emojis based on search
                    emojis.forEach(emoji => {
                        const emojiTitle = emoji.getAttribute('title').toLowerCase();
                        if (emojiTitle.includes(searchValue)) {
                            emoji.style.display = 'flex';
                        } else {
                            emoji.style.display = 'none';
                        }
                    });
                } else {
                    // Reset to default view
                    emojiGroups.forEach(group => {
                        group.style.display = '';
                        group.removeAttribute('data-active');
                    });
                    
                    // Show only the active category
                    const activeCategory = messageInputContainer.querySelector('.emoji-category.active');
                    if (activeCategory) {
                        const categoryName = activeCategory.getAttribute('data-category');
                        const targetGroup = messageInputContainer.querySelector(`.emoji-group[data-category="${categoryName}"]`);
                        if (targetGroup) {
                            targetGroup.setAttribute('data-active', 'true');
                        }
                    }
                    
                    // Reset all emojis to visible
                    emojis.forEach(emoji => {
                        emoji.style.display = '';
                    });
                }
            });
        }
        
        // Handle emoji selection
        const emojis = messageInputContainer.querySelectorAll('.emoji');
        emojis.forEach(emoji => {
            emoji.addEventListener('click', function() {
                // Get current cursor position
                const cursorPosition = messageInput.selectionStart;
                
                // Get current input value
                const currentValue = messageInput.value;
                
                // Insert emoji at cursor position
                const emojiChar = this.textContent;
                const newValue = currentValue.substring(0, cursorPosition) + 
                                emojiChar + 
                                currentValue.substring(cursorPosition);
                
                // Update input value
                messageInput.value = newValue;
                
                // Move cursor position after the inserted emoji
                messageInput.selectionStart = cursorPosition + emojiChar.length;
                messageInput.selectionEnd = cursorPosition + emojiChar.length;
                
                // Close emoji picker
                emojiPicker.classList.remove('active');
                
                // Focus back on the message input
                messageInput.focus();
            });
        });
    }

    // Call the initialization function when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize interactive elements
        initializeInteractiveElements();
        
        // Initialize emoji picker in the chat area
        initializeEmojiPicker();
    });

    // Set up message input and sending
    initializeMessageInput();
    initializeFileUpload();
});

function initializeFileUpload() {
    const fileInput = document.getElementById('file-input');
    const attachButton = document.getElementById('attach-file-btn');
    const chatMessages = document.querySelector('.chat-messages');

    if (!fileInput || !attachButton) return;

    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Create upload status container
        const uploadStatusContainer = document.createElement('div');
        uploadStatusContainer.className = 'upload-status';
        uploadStatusContainer.style.display = 'block';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        progressBar.appendChild(progress);
        
        const statusText = document.createElement('span');
        statusText.className = 'status-text';
        statusText.textContent = 'Uploading files...';
        
        uploadStatusContainer.appendChild(progressBar);
        uploadStatusContainer.appendChild(statusText);
        
        chatMessages.appendChild(uploadStatusContainer);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();

                await new Promise((resolve, reject) => {
                    reader.onload = async (event) => {
                        try {
                            // Update progress
                            const percent = ((i + 1) / files.length) * 100;
                            progress.style.width = `${percent}%`;
                            statusText.textContent = `Uploading ${i + 1}/${files.length}: ${file.name}`;

                            // Create file preview message
                            const filePreview = document.createElement('div');
                            filePreview.className = 'message';
                            
                            let fileContent = '';
                            if (file.type.startsWith('image/')) {
                                fileContent = `<img src="${event.target.result}" alt="${file.name}" style="max-width: 300px; max-height: 200px;">`;
                            } else {
                                fileContent = `<div class="file-attachment">
                                    <i class="fas fa-file"></i>
                                    <span>${file.name}</span>
                                    <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                                </div>`;
                            }

                            filePreview.innerHTML = fileContent;
                            chatMessages.appendChild(filePreview);
                            
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            // Upload complete
            statusText.textContent = 'Upload complete!';
            setTimeout(() => {
                uploadStatusContainer.remove();
            }, 2000);

            // Clear file input
            fileInput.value = '';
        } catch (error) {
            console.error('Error uploading files:', error);
            statusText.textContent = 'Error uploading files';
            statusText.style.color = '#ed4245';
        }
    });
}

function initializeMessageInput() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const fileInput = document.getElementById('file-input');
    const attachButton = document.getElementById('attach-file-btn');
    
    if (!messageInput || !sendButton) return;
    
    // Enable/disable send button based on input
    messageInput.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            sendButton.removeAttribute('disabled');
        } else {
            sendButton.setAttribute('disabled', 'disabled');
        }
    });
    
    // Send message on Enter (but allow Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim().length > 0) {
                sendMessage(this.value);
            }
        }
    });
    
    // Send button click
    sendButton.addEventListener('click', function() {
        if (messageInput.value.trim().length > 0) {
            sendMessage(messageInput.value);
        }
    });
    
    // File attachment
    if (attachButton && fileInput) {
        attachButton.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                handleFileUpload(this.files[0]);
            }
        });
    }
}

function initializeUI() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);
            
            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 10 + 'px';
            tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
            
            setTimeout(() => tooltipEl.classList.add('active'), 10);
            
            this.addEventListener('mouseleave', function onMouseLeave() {
                tooltipEl.classList.remove('active');
                setTimeout(() => tooltipEl.remove(), 200);
                this.removeEventListener('mouseleave', onMouseLeave);
            });
        });
    });

    // Modal initialization for all modals
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('[data-close-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        });
    });
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });
    
    // Close modal when clicking on backdrop
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            e.target.classList.remove('active');
        }
    });
    
    // College community search functionality
    const communitySearchInput = document.getElementById('community-search');
    if (communitySearchInput) {
        communitySearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const communities = document.querySelectorAll('.college-item');
            
            communities.forEach(community => {
                const communityName = community.querySelector('.college-name').textContent.toLowerCase();
                if (communityName.includes(searchTerm)) {
                    community.style.display = 'flex';
                } else {
                    community.style.display = 'none';
                }
            });
        });
    }
    
    // Message input functionality
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    if (messageInput && sendButton) {
        // Enable/disable send button based on input
        messageInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                sendButton.removeAttribute('disabled');
            } else {
                sendButton.setAttribute('disabled', 'disabled');
            }
        });
        
        // Send message on Enter (but allow Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.value.trim().length > 0) {
                    sendMessage(this.value);
                    this.value = '';
                    sendButton.setAttribute('disabled', 'disabled');
                }
            }
        });
        
        // Send button click
        sendButton.addEventListener('click', function() {
            if (messageInput.value.trim().length > 0) {
                sendMessage(messageInput.value);
                messageInput.value = '';
                sendButton.setAttribute('disabled', 'disabled');
            }
        });
    }
}

// Function to make the college communities section scrollable while keeping user profile fixed
function initializeSidebarLayout() {
    const communitiesContainer = document.querySelector('.college-communities');
    const sidebarContent = document.querySelector('.sidebar-content');
    
    if (communitiesContainer && sidebarContent) {
        const userProfileHeight = document.querySelector('.user-profile').offsetHeight;
        const sidebarHeaderHeight = document.querySelector('.sidebar-header').offsetHeight;
        const availableHeight = sidebarContent.offsetHeight - userProfileHeight - sidebarHeaderHeight;
        
        communitiesContainer.style.maxHeight = `${availableHeight}px`;
        communitiesContainer.style.overflowY = 'auto';
    }
}

// Call this function when the window resizes
window.addEventListener('resize', initializeSidebarLayout);
// Also call it after the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSidebarLayout);

// Function to show user profile when clicking on avatar or username in chat
function showUserProfile(user) {
    // Get or create the user profile modal
    let profileViewModal = document.getElementById('chat-profile-modal');
    
    if (!profileViewModal) {
        profileViewModal = document.createElement('div');
        profileViewModal.id = 'chat-profile-modal';
        profileViewModal.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content profile-modal-content';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            profileViewModal.style.display = 'none';
        });
        
        // Create profile container
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';
        
        // Create profile header with avatar
        const profileHeader = document.createElement('div');
        profileHeader.className = 'profile-header';
        
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'profile-avatar-large';
        
        const avatarImg = document.createElement('img');
        avatarImg.id = 'profile-view-avatar';
        avatarImg.alt = 'Profile Picture';
        
        avatarContainer.appendChild(avatarImg);
        profileHeader.appendChild(avatarContainer);
        
        // Create profile info section
        const profileInfo = document.createElement('div');
        profileInfo.className = 'profile-info';
        
        // Display name
        const displayName = document.createElement('h2');
        displayName.id = 'chat-profile-display-name';
        
        // Email
        const email = document.createElement('p');
        email.className = 'profile-id';
        email.id = 'chat-profile-email';
        
        // Bio heading
        const bioHeading = document.createElement('h3');
        bioHeading.textContent = 'About Me';
        
        // Bio text
        const bio = document.createElement('p');
        bio.id = 'chat-profile-bio';
        bio.className = 'user-bio';
        
        // Assemble profile info
        profileInfo.appendChild(displayName);
        profileInfo.appendChild(email);
        profileInfo.appendChild(bioHeading);
        profileInfo.appendChild(bio);
        
        // Assemble modal content
        modalContent.appendChild(closeButton);
        modalContent.appendChild(profileHeader);
        modalContent.appendChild(profileInfo);
        
        profileViewModal.appendChild(modalContent);
        document.body.appendChild(profileViewModal);
        
        // Close when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === profileViewModal) {
                profileViewModal.style.display = 'none';
            }
        });
    }
    
    // Update profile view with user data
    const avatarImg = document.getElementById('profile-view-avatar');
    const displayName = document.getElementById('chat-profile-display-name');
    const email = document.getElementById('chat-profile-email');
    const bio = document.getElementById('chat-profile-bio');
    
    if (avatarImg) avatarImg.src = user.profilePic || 'https://via.placeholder.com/150';
    if (displayName) displayName.textContent = user.username;
    if (email) email.textContent = user.email;
    if (bio) bio.textContent = user.bio || 'No bio available';
    
    // Show the modal
    profileViewModal.style.display = 'flex';
}

// ... existing code ...
document.addEventListener('DOMContentLoaded', function() {
    // Initialize everything
    initializeUI();
    initializeMessageInput();
    
    // Add immediate event listener for send button as a fallback
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', function() {
            if (messageInput.value.trim()) {
                sendMessage(messageInput.value);
            }
        });
        
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.value.trim()) {
                    sendMessage(this.value);
                }
            }
        });
    }
});
// ... existing code ...

// Simple, direct sendMessage function that won't conflict with other functions
window.sendMessage = function(content) {
    console.log("Main sendMessage function called with:", content);
    
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    
    // Get user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: 'Guest User',
        email: 'guest@example.com',
        profilePic: 'https://via.placeholder.com/40'
    };
    
    // Get the message text
    let messageText = content;
    if (!messageText && messageInput) {
        messageText = messageInput.value.trim();
    }
    
    if (!messageText) {
        console.log("No message to send");
        return;
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // WhatsApp-style message layout
    messageElement.innerHTML = `
        <div class="message-avatar">
            <img src="${currentUser.profilePic || 'https://via.placeholder.com/40'}" 
                 alt="Avatar" class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        </div>
        <div class="message-info">
            <div class="message-header">
                <span class="sender-name" style="font-weight: bold; color: #128C7E;">${currentUser.username}</span>
                <span class="message-time" style="font-size: 0.75rem; color: #888;">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="message-content" style="padding-top: 2px;">${messageText}</div>
        </div>
        <button class="delete-message" style="background: none; border: none; color: #888; cursor: pointer; padding: 5px; opacity: 0.6;">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
            </svg>
        </button>
    `;
    
    // Add hover effect for delete button
    const deleteButton = messageElement.querySelector('.delete-message');
    if (deleteButton) {
        deleteButton.addEventListener('mouseover', function() {
            this.style.opacity = '1';
        });
        
        deleteButton.addEventListener('mouseout', function() {
            this.style.opacity = '0.6';
        });
        
        deleteButton.addEventListener('click', function() {
            messageElement.remove();
        });
    }
    
    // Add profile click event
    const userAvatar = messageElement.querySelector('.user-avatar');
    const userName = messageElement.querySelector('.sender-name');
    
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
    }
    
    if (userName) {
        userName.addEventListener('click', function() {
            showUserProfile(currentUser);
        });
    }
    
    // Add to chat
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input if it exists
    if (messageInput) {
        messageInput.value = '';
    }
    
    console.log("Message sent by:", currentUser.username);
    
    return true;
};

// Direct event listeners for the message input and send button
document.addEventListener('DOMContentLoaded', function() {
    console.log("Setting up message input handlers");
    
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            window.sendMessage();
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendMessage();
            }
        });
    }
});

// Mock user data (to be replaced with Firebase Auth)
let currentUser = {
    username: 'Student_User',
    email: 'student@example.com',
    avatar: 'https://via.placeholder.com/150',
    status: 'online', // online, away, offline
};

// Display user information in the sidebar
function displayUserInfo() {
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEls = document.querySelectorAll('.user-avatar');
    
    if (userNameEl) userNameEl.textContent = currentUser.username;
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    
    userAvatarEls.forEach(avatar => {
        avatar.src = currentUser.avatar;
        avatar.alt = `${currentUser.username}'s avatar`;
    });
}

// Display user information in the profile modal
function displayProfileInfo() {
    const profileNameEl = document.getElementById('profile-display-name');
    const profileEmailEl = document.getElementById('profile-email');
    
    if (profileNameEl) profileNameEl.textContent = currentUser.username;
    if (profileEmailEl) profileEmailEl.textContent = currentUser.email;
}

// Initialize user display
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    
    // Profile view button
    const profileViewBtn = document.getElementById('profile-view-btn');
    const profileViewModal = document.getElementById('profile-view-modal');
    const closeProfileViewBtn = document.getElementById('close-profile-view');
    
    if (profileViewBtn && profileViewModal) {
        profileViewBtn.addEventListener('click', function() {
            displayProfileInfo();
            profileViewModal.style.display = 'flex';
        });
    }
    
    if (closeProfileViewBtn && profileViewModal) {
        closeProfileViewBtn.addEventListener('click', function() {
            profileViewModal.style.display = 'none';
        });
    }
    
    // Close any modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});