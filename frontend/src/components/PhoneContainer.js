import React from 'react';
import './PhoneContainer.css';

const PhoneContainer = ({ 
  children, 
  title = "", 
  showStatusBar = true 
}) => {

  return (
    <div className="phone-screen-container">
      <div className="phone-container">
        {showStatusBar && (
          <div className="status-bar">
            <span className="time">9:41</span>
            <div className="status-icons">
              <span className="wifi">📶</span>
            </div>
          </div>
        )}
        
        <div className="phone-content">
          {title && (
            <div className="phone-header">
              <h1>{title}</h1>
            </div>
          )}
          <div className="phone-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneContainer;