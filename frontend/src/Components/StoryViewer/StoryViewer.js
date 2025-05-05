import React, { useState, useEffect } from 'react';
import './StoryViewer.css';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Avatar from '@mui/material/Avatar';

function StoryViewer({ isOpen, onClose, stories, initialStoryIndex }) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex || 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset progress when story changes
    setProgress(0);
    
    const currentStory = stories[currentIndex];
    const isVideo = currentStory?.mediaType === 'video';
    
    if (!isVideo) {
      // For images, use a timer to progress
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            // Move to next story after current one completes
            if (currentIndex < stories.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              onClose();
            }
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total (50ms * 100)
      
      return () => clearInterval(timer);
    }
    
    // For videos, progress is handled by video element
  }, [currentIndex, isOpen, stories, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVideoEnded = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const video = e.target;
    const percentage = (video.currentTime / video.duration) * 100;
    setProgress(percentage);
  };

  if (!isOpen || !stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.mediaType === 'video';

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer">
        <div className="story-header">
          <div className="progress-container">
            {stories.map((_, index) => (
              <div 
                key={index} 
                className={`progress-bar ${index === currentIndex ? 'active' : index < currentIndex ? 'completed' : ''}`}
              >
                <div 
                  className="progress-fill" 
                  style={{ width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="story-user-info">
          <Avatar src={currentStory.userImage || null} />
          <span className="username">{currentStory.userName || 'User'}</span>
        </div>
        
        <button className="close-viewer-button" onClick={onClose}>
          <CloseIcon />
        </button>
        
        <div className="story-content">
          {isVideo ? (
            <video 
              src={currentStory.path} 
              autoPlay 
              controls={false}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <img src={currentStory.path} alt="Story" />
          )}
        </div>
        
        {currentIndex > 0 && (
          <button className="nav-button prev-button" onClick={handlePrevious}>
            <ArrowBackIosNewIcon />
          </button>
        )}
        
        {currentIndex < stories.length - 1 && (
          <button className="nav-button next-button" onClick={handleNext}>
            <ArrowForwardIosIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default StoryViewer;
