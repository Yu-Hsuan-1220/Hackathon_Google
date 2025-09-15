import React from 'react';
import VoiceControl from './VoiceControl';
import './PhoneContainer.css';

const PhoneContainer = ({ 
  children, 
  title = "", 
  onVoiceCommand, 
  enableVoice = true,
  showStatusBar = true 
}) => {
  const handleVoiceCommand = (command) => {
    console.log('語音指令:', command);
    
    // 處理通用語音指令
    if (command.includes('返回') || command.includes('回去')) {
      // 這裡可以觸發返回操作
      if (onVoiceCommand) {
        onVoiceCommand('navigate-back');
      }
    } else if (command.includes('主頁') || command.includes('首頁')) {
      if (onVoiceCommand) {
        onVoiceCommand('navigate-home');
      }
    } else {
      // 傳遞給父組件處理特定指令
      if (onVoiceCommand) {
        onVoiceCommand(command);
      }
    }
  };

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
      
      {enableVoice && (
        <VoiceControl 
          onVoiceCommand={handleVoiceCommand}
          isEnabled={true}
        />
      )}
    </div>
  );
};

export default PhoneContainer;