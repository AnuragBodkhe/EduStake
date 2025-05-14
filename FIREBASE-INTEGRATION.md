# Firebase Integration for EduStake

This document outlines the Firebase integration for the EduStake platform, focusing on Firebase Realtime Database and Storage for handling images and files.

## Firebase Configuration

The platform uses the following Firebase services:

- **Firebase Realtime Database**: For storing user data, messages, and file metadata
- **Firebase Storage**: For storing and retrieving images and other files
- **Firebase Analytics**: For tracking user interactions and app usage

## Database Schema

The database schema is defined in `firebase-database-schema.json` and includes the following collections:

- **users**: User profiles and settings
- **colleges**: College information and members
- **channels**: Communication channels within colleges
- **messages**: Chat messages with attachments
- **files**: File metadata for uploaded files
- **presence**: User online status
- **notifications**: User notifications

## File Storage Structure

Files in Firebase Storage are organized by channel:

```
/messages/{channelId}/{filename}
```

This structure allows for easy retrieval of files by channel and helps with permission management.

## Key Features

### Image Upload and Display

The platform supports uploading and displaying images in the chat interface:

1. Users can upload images through the file upload interface
2. Images are stored in Firebase Storage
3. Image metadata is saved in the Realtime Database
4. Images are displayed in the chat with a preview
5. Users can click on images to view them in a lightbox

### File Upload and Management

The platform supports uploading and managing various file types:

1. Files are uploaded to Firebase Storage
2. File metadata is saved in the Realtime Database
3. Files are displayed in the chat with appropriate icons based on file type
4. Users can download files directly from the chat

## Implementation Files

- **firebase-config.js**: Firebase initialization and configuration
- **firebase-storage.js**: Functions for interacting with Firebase Storage
- **firebase-storage.css**: Styles for displaying images and files
- **script.js**: Integration with the UI for uploading and displaying files

## Usage

### Uploading Files

```javascript
// Import the Firebase Storage functions
import { uploadFile, saveMessageWithAttachment } from './firebase-storage.js';

// Upload a file
uploadFile(
  file,
  `messages/${channelId}`,
  { contentType: file.type },
  (progress) => {
    // Update progress UI
    progressBar.style.width = `${progress}%`;
  }
).then(fileData => {
  // File uploaded successfully
  console.log('File uploaded:', fileData);
});
```

### Displaying Images

```javascript
// Import the Firebase Storage functions
import { getFileURL } from './firebase-storage.js';

// Display an image from Firebase Storage
function displayStorageImage(imageUrl, container) {
  if (!imageUrl || !container) return;
  
  const imgElement = document.createElement('img');
  imgElement.className = 'storage-image';
  imgElement.alt = 'Uploaded image';
  imgElement.src = imageUrl;
  
  container.appendChild(imgElement);
}
```

## Security Rules

For production use, implement appropriate Firebase Security Rules to protect your data and files. Example rules:

```
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /messages/{channelId}/{fileName} {
      allow read: if request.auth != null && 
                    exists(/databases/$(database)/documents/channels/$(channelId)/members/$(request.auth.uid));
      allow write: if request.auth != null && 
                     exists(/databases/$(database)/documents/channels/$(channelId)/members/$(request.auth.uid));
    }
  }
}

// Database Rules
{
  "rules": {
    "messages": {
      "$channelId": {
        ".read": "auth != null && root.child('channels').child($channelId).child('members').child(auth.uid).exists()",
        ".write": "auth != null && root.child('channels').child($channelId).child('members').child(auth.uid).exists()"
      }
    },
    "files": {
      ".indexOn": ["messageId", "channelId", "userId"],
      "$fileId": {
        ".read": "auth != null && root.child('channels').child(data.child('channelId').val()).child('members').child(auth.uid).exists()",
        ".write": "auth != null && root.child('channels').child(newData.child('channelId').val()).child('members').child(auth.uid).exists()"
      }
    }
  }
}
```