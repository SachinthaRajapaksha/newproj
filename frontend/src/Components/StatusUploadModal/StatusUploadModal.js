import React, { useState } from 'react';
import './StatusUploadModal.css';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function StatusUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Determine if it's an image or video
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    
    setMediaType(type);
    setSelectedFile(file);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Create a reference to 'status/[mediaType]/[fileName]'
    const storageRef = ref(storage, `status/${mediaType}/${selectedFile.name}`);
    
    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress tracking
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
      },
      () => {
        // Upload completed, get download URL
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log(`${mediaType} available at:`, downloadURL);
            
            let payload = {
              statusId: Math.floor(Math.random() * 100000).toString(),
              userId: JSON.parse(localStorage.getItem("users")).uid,
              path: downloadURL,
              mediaType: mediaType,
              statusText: statusText,
              timeStamp: new Date().getTime()
            };
            
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            };
            
            fetch("http://localhost:8080/status", requestOptions)
              .then(response => response.json())
              .then(data => {
                setIsUploading(false);
                resetForm();
                onUploadComplete();
                onClose();
              })
              .catch(error => {
                console.error("Status creation failed:", error);
                setIsUploading(false);
              });
          })
          .catch(error => {
            console.error("Error getting download URL:", error);
            setIsUploading(false);
          });
      }
    );
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setStatusText('');
    setMediaType(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="status-modal-overlay">
      <div className="status-modal">
        <div className="status-modal-header">
          <h2>Create Story</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="status-modal-content">
          {!preview ? (
            <label className="file-upload-area">
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleFileSelect} 
                hidden 
              />
              <div className="file-upload-icon">
                <AddPhotoAlternateIcon fontSize="inherit" />
              </div>
              <div className="file-upload-text">
                Click to upload a photo or video
              </div>
              <div className="file-upload-hint">
                Supported formats: JPG, PNG, MP4
              </div>
            </label>
          ) : (
            <div className="preview-container">
              {mediaType === 'image' ? (
                <img src={preview} alt="Preview" />
              ) : (
                <video src={preview} controls />
              )}
            </div>
          )}
          
          {preview && (
            <div className="text-input-area">
              <textarea
                className="text-input"
                placeholder="Add a caption to your story..."
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className="create-button" 
            onClick={handleUpload}
            disabled={isUploading || (!selectedFile && !statusText)}>
            Post Story
          </button>
        </div>

      </div>
    </div>
  );
}

export default StatusUploadModal;
