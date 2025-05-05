import React, { useState, useRef, useEffect } from 'react';
import './EditPostModal.css';
import CloseIcon from '@mui/icons-material/Close';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import Avatar from '@mui/material/Avatar';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import LinearProgress from '@mui/material/LinearProgress';
import VideocamIcon from '@mui/icons-material/Videocam';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

function EditPostModal({ post, userData, onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [caption, setCaption] = useState(post.caption || "");
  const [hashtags, setHashtags] = useState(post.hashtags || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
  const [existingImages, setExistingImages] = useState(post.imagePaths || []);
  const [existingVideos, setExistingVideos] = useState(post.videoPaths || []);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const videoRefs = useRef([]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      addNewFiles(newFiles);
      // Reset the input value to allow selecting the same files again
      e.target.value = '';
    }
  };

  const addNewFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const fileType = file.type.split('/')[0];
      return fileType === 'image' || fileType === 'video';
    });
    
    // Check total files won't exceed limit (10 files total including existing)
    const totalFiles = existingImages.length + existingVideos.length + selectedFiles.length + validFiles.length;
    if (totalFiles > 10) {
      alert("You can upload a maximum of 10 files");
      return;
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    validFiles.forEach(file => {
      const fileType = file.type.split('/')[0];
      const objectUrl = URL.createObjectURL(file);
      
      setPreviewUrls(prevUrls => [...prevUrls, objectUrl]);
      setFileTypes(prevTypes => [...prevTypes, fileType]);
    });
  };

  const removeFile = (index) => {
    // Revoke the object URL to prevent memory leaks
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    setFileTypes(prevTypes => prevTypes.filter((_, i) => i !== index));
    
    // Reset playing video if it was removed
    if (playingVideoIndex === index) {
      setPlayingVideoIndex(null);
    } else if (playingVideoIndex > index) {
      // Adjust playing index if files before it were removed
      setPlayingVideoIndex(playingVideoIndex - 1);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('drag-active');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addNewFiles(droppedFiles);
    }
  };

  const handleAddMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleVideoPlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (playingVideoIndex === index) {
      // Pause currently playing video
      video.pause();
      setPlayingVideoIndex(null);
    } else {
      // Pause any previously playing video
      if (playingVideoIndex !== null && videoRefs.current[playingVideoIndex]) {
        videoRefs.current[playingVideoIndex].pause();
      }
      
      // Play the new video
      video.play()
        .then(() => {
          setPlayingVideoIndex(index);
        })
        .catch(error => {
          console.error("Error playing video:", error);
        });
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const postId = post.postId;
      
      const newImageUrls = [];
      const newVideoUrls = [];
      
      // Upload new files
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileType = file.type.split('/')[0];
        const filePath = `posts/${userData.uid}/${postId}_${new Date().getTime()}_${i}`;
        const storageRef = ref(storage, filePath);
        
        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => {
                const newProgress = prev + (progress / selectedFiles.length);
                return newProgress > 100 ? 100 : newProgress;
              });
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                if (fileType === 'image') {
                  newImageUrls.push(downloadURL);
                } else if (fileType === 'video') {
                  newVideoUrls.push(downloadURL);
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      }
      
      // Create updated post object
      const updatedPost = {
        ...post,
        imagePaths: [...existingImages, ...newImageUrls],
        videoPaths: [...existingVideos, ...newVideoUrls],
        caption,
        hashtags
      };
      
      // Save updated post to backend
      const response = await fetch("http://localhost:8080/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      
      // Clean up object URLs
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      onClose(true);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
      setIsUploading(false);
    }
  };

  const renderExistingMedia = () => {
    if (existingImages.length === 0 && existingVideos.length === 0) return null;
    
    return (
      <div className="existing-media-section">
        <h3>Current Media</h3>
        <div className="existing-media-grid">
          {existingImages.map((url, index) => (
            <div key={`img-${index}`} className="existing-media-item">
              <img src={url} alt={`Media ${index}`} className="existing-media-preview" />
              <button 
                className="remove-media-button"
                onClick={() => removeExistingImage(index)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
          
          {existingVideos.map((url, index) => (
            <div key={`vid-${index}`} className="existing-media-item">
              <video 
                src={url} 
                className="existing-media-preview" 
                muted 
              />
              <div className="video-indicator">
                <VideocamIcon />
              </div>
              <button 
                className="remove-media-button"
                onClick={() => removeExistingVideo(index)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNewMediaUpload = () => {
    if (selectedFiles.length === 0) {
      return (
        <div 
          ref={dropZoneRef}
          className="file-upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAddMoreFiles}
        >
          <div className="upload-prompt">
            <AddPhotoAlternateIcon style={{ fontSize: 48, color: '#65676b' }} />
            <p>Add More Photos and Videos</p>
            <p className="drag-text">or drag and drop</p>
            <button className="select-button">Select from Computer</button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>
      );
    }

    return (
      <div className="new-media-section">
        <h3>New Media to Add</h3>
        <div className="preview-grid">
          {previewUrls.map((url, index) => (
            <div key={index} className="preview-image-container">
              {fileTypes[index] === 'image' ? (
                <img src={url} alt={`Preview ${index}`} className="preview-media" />
              ) : (
                <div className="video-preview">
                  <video
                    ref={el => videoRefs.current[index] = el}
                    src={url}
                    className="preview-media"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlay(index);
                    }}
                    onEnded={() => setPlayingVideoIndex(null)}
                  />
                  <div className="video-control-overlay">
                    {playingVideoIndex === index ? (
                      <PauseCircleOutlineIcon 
                        style={{ fontSize: 48, color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoPlay(index);
                        }}
                      />
                    ) : (
                      <PlayCircleOutlineIcon 
                        style={{ fontSize: 48, color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoPlay(index);
                        }}
                      />
                    )}
                  </div>
                  <div className="video-duration-badge">
                    <VideocamIcon fontSize="small" />
                  </div>
                </div>
              )}
              <button 
                className="remove-image-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
        <button 
          className="add-more-button" 
          onClick={handleAddMoreFiles}
        >
          <AddPhotoAlternateIcon fontSize="small" />
          Add More
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="edit-post-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="close-button" onClick={() => onClose(false)}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-user-info">
          <Avatar src={userData?.photoURL} alt={userData?.displayName} />
          <span>{userData?.displayName || "User"}</span>
        </div>
        
        <div className="modal-content">
          {renderExistingMedia()}
          {renderNewMediaUpload()}
          
          <div className="caption-input-container">
            <textarea
              className="caption-input"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            
            <input
              className="hashtag-input"
              placeholder="Add hashtags (space separated, e.g. #nature #photography)"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          {isUploading ? (
            <div className="upload-progress">
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                style={{ width: '100%' }}
              />
              <span>{Math.round(uploadProgress)}%</span>
            </div>
          ) : (
            <button 
              className="update-button" 
              onClick={handleSubmit}
            >
              Update Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
