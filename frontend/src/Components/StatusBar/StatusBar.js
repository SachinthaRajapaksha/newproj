import React, { Component } from 'react';
import "./StatusBar.css";
import Avatar from '@mui/material/Avatar';
import statusimg from "../../images/pp1.png";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StatusUploadModal from '../StatusUploadModal/StatusUploadModal';
import StoryViewer from '../StoryViewer/StoryViewer';

class StatusBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusList: [],
      showLeftNav: false,
      showRightNav: true,
      isUploadModalOpen: false,
      isStoryViewerOpen: false,
      currentStoryIndex: 0,
      selectedStory: []
    }
    this.statusBarRef = React.createRef();
  }

  componentDidMount() {
    this.getData();
    this.checkNavigation();
    window.addEventListener('resize', this.checkNavigation);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkNavigation);
  }

  checkNavigation = () => {
    if (this.statusBarRef.current) {
      const container = this.statusBarRef.current;
      this.setState({
        showLeftNav: container.scrollLeft > 0,
        showRightNav: container.scrollLeft < (container.scrollWidth - container.clientWidth)
      });
    }
  }

  handleScroll = () => {
    this.checkNavigation();
  }

  scrollLeft = () => {
    if (this.statusBarRef.current) {
      this.statusBarRef.current.scrollBy({
        left: -220,
        behavior: 'smooth'
      });
    }
  }

  scrollRight = () => {
    if (this.statusBarRef.current) {
      this.statusBarRef.current.scrollBy({
        left: 220,
        behavior: 'smooth'
      });
    }
  }

  getData = () => {
    fetch('http://localhost:8080/status')
      .then(response => response.json())
      .then(data => {
        this.setState({ statusList: data });
        setTimeout(this.checkNavigation, 100);
      });
  }

  openUploadModal = () => {
    this.setState({ isUploadModalOpen: true });
  }

  closeUploadModal = () => {
    this.setState({ isUploadModalOpen: false });
  }

  openStoryViewer = (index) => {
    this.setState({ 
      isStoryViewerOpen: true,
      currentStoryIndex: 0, // Always start at the first (and only) story
      selectedStory: [this.state.statusList[index]] // Pass only the selected story as an array with one item
    });
  }
  

  closeStoryViewer = () => {
    this.setState({ isStoryViewerOpen: false });
  }

  render() {
    return (
      <div className="statusbar__container-wrapper">
        {this.state.showLeftNav && (
          <button className="nav-button nav-button-left" onClick={this.scrollLeft}>
            <ArrowBackIosNewIcon />
          </button>
        )}
        
        <div 
          className="statusbar__container" 
          ref={this.statusBarRef}
          onScroll={this.handleScroll}
        >
          <div className="status create-story">
            <div className="create-story-button" onClick={this.openUploadModal}>
              <div className="create-story-icon">
                <AddIcon />
              </div>
              <span className="create-story-text">Share Daily Skills</span>
            </div>
          </div>
          
          {this.state.statusList.map((status, index) => (
            <div 
              className="status" 
              key={status.statusId}
              onClick={() => this.openStoryViewer(index)}
            >
              <div className="status-card">
                {status.mediaType === 'video' ? (
                  <div className="status-video-container">
                    <video 
                      src={status.path} 
                      className="status-background" 
                      muted
                    />
                    <div className="video-indicator"></div>
                  </div>
                ) : (
                  <img 
                    src={status.path} 
                    className="status-background" 
                    alt="status"
                  />
                )}
                <div className="status-overlay"></div>
                <div className="status-overlay-top"></div>
                <div className="status-user-info">
                  <Avatar 
                    className="statusbar__status" 
                    src={statusimg} 
                  />
                  <div className="statusbar__text">{status.userName || `User ${index + 1}`}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {this.state.showRightNav && (
          <button className="nav-button nav-button-right" onClick={this.scrollRight}>
            <ArrowForwardIosIcon />
          </button>
        )}
        
        <StatusUploadModal 
          isOpen={this.state.isUploadModalOpen}
          onClose={this.closeUploadModal}
          onUploadComplete={this.getData}
        />
        
        <StoryViewer 
            isOpen={this.state.isStoryViewerOpen}
            onClose={this.closeStoryViewer}
            stories={this.state.selectedStory} // Pass the selected story instead of all stories
            initialStoryIndex={this.state.currentStoryIndex}
        />

      </div>
    );
  }
}

export default StatusBar;
