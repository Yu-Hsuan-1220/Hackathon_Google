import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './FirstTimeUserPage.css';

function FirstTimeUserPage({ onComplete }) {
  const [userName, setUserName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      callIntroAPI();
    }
  }, []);

  const callIntroAPI = async () => {
    const response = await fetch('http://localhost:8000/first_used/intro');
    const data = await response.json();
    
    const audio = new Audio('/firstused_intro.wav');
    audio.play();
    
    // 音檔播放完後自動啟動語音辨識
    audio.onended = () => {
      startVoiceRecognition();
    };
  };

  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserName(transcript);
      setIsListening(false);
      setShowConfirm(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // 智能停止收音 - 5秒後自動停止
    setTimeout(() => {
      recognition.stop();
    }, 5000);
  };

  const startListening = () => {
    setShowConfirm(false);
    startVoiceRecognition();
  };

  const confirmName = () => {
    if (userName.trim()) {
      // 將名字存儲到 localStorage 作為 usr_id，供之後所有 API 使用
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('usr_id', userName.trim());
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
      <div className="name-input-container">
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