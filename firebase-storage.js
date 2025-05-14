// Firebase Storage Service
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "./firebase-config.js";
import { ref as dbRef, push, set, update, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "./firebase-config.js";

// Upload file to Firebase Storage
export const uploadFile = async (file, path, metadata = {}, progressCallback) => {
  try {
    const storageRef = ref(storage, `${path}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) {
            progressCallback(progress);
          }
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save file metadata to Realtime Database
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            path: `${path}/${file.name}`,
            uploadedAt: Date.now()
          };
          
          const newFileRef = push(dbRef(database, "files"));
          await set(newFileRef, fileData);
          
          resolve({ ...fileData, id: newFileRef.key });
        }
      );
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get download URL for a file
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

// List all files in a directory
export const listFiles = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url
        };
      })
    );
    
    return files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (path, fileId) => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    // Delete from Database if fileId is provided
    if (fileId) {
      await remove(dbRef(database, `files/${fileId}`));
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Get files by message ID
export const getFilesByMessageId = async (messageId) => {
  try {
    const filesRef = dbRef(database, "files");
    const filesQuery = query(filesRef, orderByChild("messageId"), equalTo(messageId));
    const snapshot = await get(filesQuery);
    
    if (snapshot.exists()) {
      const files = [];
      snapshot.forEach((childSnapshot) => {
        files.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return files;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting files by message ID:", error);
    throw error;
  }
};

// Save message with attachment
export const saveMessageWithAttachment = async (messageData, file) => {
  try {
    // First upload the file
    const fileUpload = await uploadFile(
      file, 
      `messages/${messageData.channelId}`, 
      { contentType: file.type },
      (progress) => console.log(`Upload progress: ${progress}%`)
    );
    
    // Then create the message with the attachment
    const messagesRef = dbRef(database, "messages");
    const newMessageRef = push(messagesRef);
    
    const message = {
      ...messageData,
      timestamp: Date.now(),
      attachments: {
        [fileUpload.id]: {
          type: file.type.startsWith("image/") ? "image" : "file",
          url: fileUpload.url,
          name: file.name,
          size: file.size
        }
      }
    };
    
    // Update the file record with the message ID
    await update(dbRef(database, `files/${fileUpload.id}`), {
      messageId: newMessageRef.key
    });
    
    await set(newMessageRef, message);
    
    return {
      id: newMessageRef.key,
      ...message
    };
  } catch (error) {
    console.error("Error saving message with attachment:", error);
    throw error;
  }
};