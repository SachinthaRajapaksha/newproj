import React, { useState } from 'react';
import './DeleteConfirmModal.css';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';

function DeleteConfirmModal({ postId, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:8080/post/${postId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      // Close modal and notify parent component that post was deleted
      onClose(true);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>Delete Post</h2>
          <button className="close-button" onClick={() => onClose(false)}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="delete-modal-content">
          <DeleteIcon className="delete-icon" />
          <p className="delete-message">Are you sure you want to delete this post?</p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="cancel-button" 
            onClick={() => onClose(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="confirm-delete-button" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
