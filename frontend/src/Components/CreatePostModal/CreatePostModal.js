import React, { useState, useRef, useCallback, useEffect } from 'react';
import './CreatePostModal.css';
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

function CreatePostModal({ onClose, userData }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
  
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

    // Check total files won't exceed limit (e.g., 10 files)
    if (selectedFiles.length + validFiles.length > 10) {
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

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('drag-active');
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addNewFiles(droppedFiles);
    }
  }, []);

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
    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const postId = `${userData.uid}_${new Date().getTime()}`;
      
      const imageUrls = [];
      const videoUrls = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileType = file.type.split('/')[0];
        const filePath = `posts/${userData.uid}/${postId}_${i}`;
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
                  imageUrls.push(downloadURL);
                } else if (fileType === 'video') {
                  videoUrls.push(downloadURL);
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      }
      
      // Create post object
      const post = {
        postId,
        userId: userData.uid,
        userName: userData.displayName || "User",
        imagePaths: imageUrls,
        videoPaths: videoUrls,
        caption,
        hashtags,
        likeCount: 0,
        timeStamp: new Date().getTime()
      };
      
      // Save post to backend
      const response = await fetch("http://localhost:8080/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save post");
      }
      
      // Clean up object URLs
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      onClose(true);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
      setIsUploading(false);
    }
  };

  const renderPreview = () => {
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
            <p>Add Photos and Videos</p>
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

    const gridClass = `preview-grid preview-grid-${Math.min(selectedFiles.length, 4)}`;
    
    return (
      <div className="post-preview-container">
        <div className="image-preview-header">
          <button className="edit-all-button">
            <EditIcon fontSize="small" />
            Edit All
          </button>
          <button 
            className="add-photos-button" 
            onClick={handleAddMoreFiles}
          >
            <AddPhotoAlternateIcon fontSize="small" />
            Add Photos/Videos
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
        
        <div className={gridClass}>
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
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="create-post-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Post</h2>
          <button className="close-button" onClick={() => onClose(false)}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-user-info">
          <Avatar src={userData?.photoURL} alt={userData?.displayName} />
          <span>{userData?.displayName || "User"}</span>
        </div>
        
        <div className="modal-content">
          {renderPreview()}
          
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
              className="post-button" 
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
            >
              Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;