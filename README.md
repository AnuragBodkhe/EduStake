# EduShare Dashboard

A modern dashboard for college communities that allows students to chat, share study resources, and collaborate in study groups.

## Features

- Left sidebar with college communities
- Add new colleges to your communities
- Chat functionality with real-time messaging
- Share study resources (PDF, Word, PowerPoint, Images)
- Voice channels for study rooms and collaboration
- Modern, responsive interface

## Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling for the application
- `script.js` - JavaScript functionality
- `assets/` - Directory for images and other assets

## How to Run

1. Clone or download this repository
2. Open the `index.html` file in a web browser
3. That's it! No server or build process required.

## Usage

### Adding a College

1. Click the "+" button next to "COLLEGE COMMUNITIES" in the left sidebar
2. Enter the college name and abbreviation
3. Choose a color for the college icon
4. Click "Add College"

### Sending Messages

1. Type your message in the input box at the bottom of the chat
2. Press Enter or click the send button

### Attaching Files

In a real implementation, clicking the attachment icon would allow you to select files to upload. In this demo, it shows an alert message.

## Technologies Used

- HTML5
- CSS3 (with CSS variables)
- Vanilla JavaScript (no frameworks)

## License

This project is open source and available for educational purposes. 

# PHP and localStorage Storage System

This is a hybrid storage system that combines the persistence of server-side PHP storage with the speed and offline capabilities of client-side localStorage.

## Files Overview

- `saveData.php` - Saves data on the server
- `getData.php` - Retrieves data from the server
- `deleteData.php` - Deletes data from the server
- `storageManager.js` - Client-side JavaScript library for interacting with both localStorage and the PHP backend
- `example.html` - Example page demonstrating how to use the storage system

## Features

- Seamless fallback between server and client storage
- Works offline with localStorage when server is unavailable
- Automatic synchronization between localStorage and server when connection is restored
- Simple Promise-based API
- JSON data storage and retrieval
- Comprehensive error handling

## Requirements

- PHP 5.6+ web server
- Modern browser with localStorage support (for client-side storage)

## Installation

1. Upload all PHP files to your web server
2. Make sure the `data` directory is writable by the web server (the system will try to create it if it doesn't exist)
3. Include `storageManager.js` in your HTML files

```html
<script src="storageManager.js"></script>
```

## Usage

### Save Data

```javascript
// Save data with a key
StorageManager.saveData('user_preferences', {
  theme: 'dark',
  fontSize: 14,
  notifications: true
})
.then(result => {
  console.log('Data saved successfully');
})
.catch(error => {
  console.error('Failed to save data:', error);
});
```

### Get Data

```javascript
// Retrieve data by key
StorageManager.getData('user_preferences')
.then(result => {
  console.log('Data retrieved:', result.data);
  console.log('Source:', result.source); // 'localStorage' or 'server'
})
.catch(error => {
  console.error('Failed to retrieve data:', error);
});
```

### Delete Data

```javascript
// Delete data by key
StorageManager.deleteData('user_preferences')
.then(result => {
  console.log('Data deleted successfully');
})
.catch(error => {
  console.error('Failed to delete data:', error);
});
```

### Get All Keys

```javascript
// Get all available storage keys
StorageManager.getAllKeys()
.then(result => {
  console.log('Available keys:', result.keys);
})
.catch(error => {
  console.error('Failed to get keys:', error);
});
```

### Check Storage Availability

```javascript
// Check if localStorage is supported
const isLocalStorageSupported = StorageManager.isLocalStorageSupported();
console.log('localStorage supported:', isLocalStorageSupported);

// Check if server storage is available
StorageManager.isServerStorageAvailable()
.then(isAvailable => {
  console.log('Server storage available:', isAvailable);
});
```

## How It Works

1. When saving data:
   - First attempts to save to localStorage for immediate availability
   - Then tries to save to the server for persistence
   - If server is unavailable, continues with localStorage only

2. When retrieving data:
   - First checks localStorage for immediate access
   - Returns data from localStorage if available
   - Also attempts to fetch from server in the background for sync
   - If data isn't in localStorage, fetches from server

3. When deleting data:
   - Removes from both localStorage and server

## Security Considerations

This system is designed for convenience, not for highly sensitive data. Consider these security enhancements for production use:

- Add authentication to the PHP endpoints
- Implement rate limiting
- Use HTTPS
- Sanitize all inputs (the current implementation does some basic sanitization)
- Consider encryption for sensitive data

## Example

Open `example.html` in your browser to see a working demonstration of the storage system.

## License

This code is available under the MIT License. 