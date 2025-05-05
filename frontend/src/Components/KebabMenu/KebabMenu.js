import React, { useState, useRef, useEffect } from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import './KebabMenu.css';

function KebabMenu({ onEdit, onDelete, onPin, canPin = true, isPinned = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  const handlePin = () => {
    onPin();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="kebab-menu-container" ref={menuRef}>
      <button 
        className="kebab-button" 
        onClick={toggleMenu}
        aria-label="Post options"
      >
        <MoreHorizIcon />
      </button>
      
      {isOpen && (
        <div className="kebab-dropdown">
          {canPin && (
            <button className="menu-item" onClick={handlePin}>
              <PushPinIcon className="menu-icon" />
              <span>{isPinned ? "Unpin post" : "Pin post"}</span>
              {isPinned && <small>This post is currently pinned to the top of your profile</small>}
            </button>
          )}
          <button className="menu-item" onClick={handleEdit}>
            <EditIcon className="menu-icon" />
            <span>Edit post</span>
          </button>
          <button className="menu-item delete-item" onClick={handleDelete}>
            <DeleteIcon className="menu-icon" />
            <span>Move to trash</span>
            <small>Items in your trash are deleted after 30 days.</small>
          </button>
        </div>
      )}
    </div>
  );
}

export default KebabMenu;
