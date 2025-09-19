import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './FirstTimeUserPage.css';

function FirstTimeUserPage({ onComplete }) {
  const [userName, setUserName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [step, setStep] = useState('intro'); // intro, name, confirm, action
  const hasCalledAPI = useRef(false);

  const handleSkip = () => {
    localStorage.setItem('userName', '訪客');
    localStorage.setItem('usr_id', '訪客');
    onComplete();
  };

  useEffect(() => {
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      playIntro();
    }
  }, []);

  // 播放 intro 音檔
  const playIntro = () => {
    const audio = new Audio('/firstused_intro.wav');
    
    audio.oncanplaythrough = () => {
      // 音檔存在，直接播放
      audio.play();
      audio.onended = () => {
        setStep('name');
        startVoiceRecognition((name) => {
          setUserName(name);
          setStep('confirm');
          sendConfirmAPI(name);
        });
      };
    };
    
    audio.onerror = async () => {
      // 音檔不存在，發送API請求
      await fetch('http://localhost:8000/first_used/intro');
      setTimeout(() => {
        const newAudio = new Audio('/firstused_intro.wav');
        newAudio.play();
        newAudio.onended = () => {
          setStep('name');
          startVoiceRecognition((name) => {
            setUserName(name);
            setStep('confirm');
            sendConfirmAPI(name);
          });
        };
      }, 1000);
    };
    
    audio.load();
  };

  const startVoiceRecognition = (callback) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = true;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
        recognition.stop();
        callback(transcript.trim());
      }
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    setTimeout(() => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    }, 8000);
  };

  // 發送名字到 first_used/confirmed
  const sendConfirmAPI = async (name) => {
    await fetch(`http://localhost:8000/first_used/confirmed?user_name=${encodeURIComponent(name)}`);
    playConfirmAudio();
  };

  // 播放確認語音，語音輸入是否確認
  const playConfirmAudio = () => {
    setTimeout(() => {
      const audio = new Audio('/firstused_confirmed.wav');
      audio.play();
      audio.onended = () => {
        setStep('action');
        setTimeout(() => {
          startVoiceRecognition((confirmText) => {
            sendActionAPI(confirmText);
          });
        }, 1000);
      };
    }, 1000);
  };

  // 發送用戶確認語音到 action API
  const sendActionAPI = async (confirmText) => {
    const response = await fetch(`http://localhost:8000/first_used/action?user_name=${encodeURIComponent(confirmText)}`);
    const data = await response.json();
    
    if (data.Response === true) {
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('usr_id', userName.trim());
      onComplete();
    } else {
      setStep('name');
      startVoiceRecognition((name) => {
        setUserName(name);
        setStep('confirm');
        sendConfirmAPI(name);
      });
    }
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
          <button onClick={handleSkip} className="skip-button">
            跳過設定
          </button>
        </div>
        <div className="voice-input-section">
          {step === 'name' && (
            <div className="recording-area">
              <div className={`microphone-button ${isListening ? 'listening' : ''}`}>
                <span className="mic-btn">🎤</span>
              </div>
              <p className="instruction">{isListening ? '正在聽取您的名字...' : '請說出您的名字'}</p>
              {isListening && (
                <div className="listening-animation">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
          )}
          {step === 'confirm' && (
            <div className="confirm-section">
              <h2>確認您的名字</h2>
              <div className="name-display">
                <span className="detected-name">{userName}</span>
              </div>
              <p className="instruction">請語音確認是否正確</p>
              {isListening && (
                <div className="listening-animation">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
          )}
          {step === 'action' && (
            <div className="confirm-section">
              <h2>請語音確認</h2>
              <p className="instruction">請說「是」或「否」</p>
              {isListening && (
                <div className="listening-animation">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default FirstTimeUserPage;