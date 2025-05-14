// Script to fix interaction issues with college items and channels
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fix interactions script loaded');
    
    // Wait a short time to ensure other scripts have had a chance to run
    setTimeout(fixInteractions, 200);
    
    function fixInteractions() {
        console.log('Fixing interactions...');
        
        // Fix college items
        fixCollegeItemClicks();
        
        // Fix channel items 
        fixChannelClicks();
        
        console.log('Interactions fixed');
    }
    
    function fixCollegeItemClicks() {
        const collegeItems = document.querySelectorAll('.college-item');
        console.log('Found', collegeItems.length, 'college items');
        
        collegeItems.forEach(item => {
            // Ensure it has proper click handling
            item.style.cursor = 'pointer';
            
            // Add direct click handler
            item.onclick = function(e) {
                // Skip if click was on remove button
                if (e.target.classList.contains('remove-button')) {
                    return;
                }
                
                console.log('College clicked:', this.querySelector('.college-name').textContent);
                
                // Remove active from all
                document.querySelectorAll('.college-item').forEach(i => {
                    i.classList.remove('active');
                });
                
                // Add active to this
                this.classList.add('active');
                
                // Update header
                const collegeName = this.querySelector('.college-name').textContent;
                const communityHeader = document.querySelector('.community-header h2');
                if (communityHeader) {
                    communityHeader.textContent = collegeName + ' Community';
                }
                
                // Apply college theme if theme system is available
                const logoImg = this.querySelector('.college-logo');
                if (typeof applyCollegeTheme === 'function' && logoImg) {
                    applyCollegeTheme(logoImg, collegeName);
                }
            };
        });
    }
    
    function fixChannelClicks() {
        const channels = document.querySelectorAll('.channel');
        console.log('Found', channels.length, 'channels');
        
        channels.forEach(channel => {
            // Ensure it has proper click handling
            channel.style.cursor = 'pointer';
            
            // Add direct click handler
            channel.onclick = function(e) {
                // Skip if click was on remove button
                if (e.target.classList.contains('remove-button')) {
                    return;
                }
                
                const channelName = this.querySelector('span').textContent;
                console.log('Channel clicked:', channelName);
                
                // Remove active from all
                document.querySelectorAll('.channel').forEach(c => {
                    c.classList.remove('active');
                });
                
                // Add active to this
                this.classList.add('active');
                
                // Update channel name in header
                const channelNameEl = document.querySelector('.channel-name');
                if (channelNameEl) {
                    channelNameEl.textContent = channelName;
                }
                
                // Update channel topic
                updateChannelTopic(channelName);
                
                // Update messages
                updateChannelMessages(channelName);
            };
        });
    }
    
    function updateChannelTopic(channelName) {
        const topicElement = document.querySelector('.channel-topic');
        if (!topicElement) return;
        
        // Set the topic based on channel name
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
    }
    
    function updateChannelMessages(channelName) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        // Create a system message as default content
        const defaultMessage = `
            <div class="message system-message">
                <div class="message-content">
                    Welcome to the beginning of the <strong>${channelName}</strong> channel.
                </div>
            </div>
        `;
        
        // Set the content (in a real app, you'd load messages from a database)
        chatMessages.innerHTML = defaultMessage;
        
        // Sample message for general-chat has been removed permanently
    }
}); 