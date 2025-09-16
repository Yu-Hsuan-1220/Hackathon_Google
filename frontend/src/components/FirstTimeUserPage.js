import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './FirstTimeUserPage.css';

function FirstTimeUserPage({ onComplete }) {
  const [userName, setUserName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // 檢查瀏覽器是否支援語音識別
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'zh-TW'; // 設定為繁體中文
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserName(transcript);
        setIsListening(false);
        setShowConfirm(true);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('語音識別錯誤:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setShowConfirm(false);
      recognition.start();
    } else {
      alert('您的瀏覽器不支援語音識別功能');
    }
  };

  const confirmName = () => {
    if (userName.trim()) {
      // 將名字存儲到 localStorage 並標記已完成首次設置
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('isFirstTime', 'false');
      localStorage.setItem('hasCompletedNameInput', 'true');
      // 調用父組件的完成回調
      if (onComplete) {
        onComplete();
      }
    }
  };

  const retryRecording = () => {
    setUserName('');
    setShowConfirm(false);
    startListening();
  };

  return (
    <PhoneContainer>
      <div className="first-time-page name-input-container">
        <div className="welcome-section">
          <h1>歡迎使用吉他學習應用</h1>
          <p className="welcome-text">
            讓我們開始您的吉他學習之旅！<br />
            請先告訴我們您的名字
          </p>
        </div>

        <div className="voice-input-section">
          {!showConfirm ? (
            <div className="recording-area">
              <div className={`microphone-button ${isListening ? 'listening' : ''}`}>
                <button 
                  onClick={startListening}
                  disabled={isListening}
                  className="mic-btn"
                >
                  🎤
                </button>
              </div>
              
              <p className="instruction">
                {isListening ? '正在聽取您的名字...' : '點擊麥克風說出您的名字'}
              </p>
              
              {isListening && (
                <div className="listening-animation">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="confirm-section">
              <h2>確認您的名字</h2>
              <div className="name-display">
                <span className="detected-name">{userName}</span>
              </div>
              
              <div className="confirm-buttons">
                <button 
                  className="confirm-btn"
                  onClick={confirmName}
                >
                  確認
                </button>
                <button 
                  className="retry-btn"
                  onClick={retryRecording}
                >
                  重新錄音
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default FirstTimeUserPage;