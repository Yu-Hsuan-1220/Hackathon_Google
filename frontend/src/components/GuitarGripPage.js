import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './GuitarGripPage.css';
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function GuitarGripPage({ onNavigate }) {
  const hasCalledAPI = useRef(false);
  const currentAudio = useRef(null);
  const userQuestion = useRef('');

  const deleteAudioFile = async (filename) => {
    await fetch(`${API_BASE}/home/delete?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  };

  useEffect(() => {
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      checkAndPlayIntro();
    }

    // 清理音頻
    return () => {
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
        currentAudio.current = null;
      }
    };
  }, []);

  const checkAndPlayIntro = () => {
    const userName = localStorage.getItem('userName')?.trim() || '用戶';
    const audio = new Audio(`/guitar_grip.wav`);
    currentAudio.current = audio;
    
    audio.oncanplaythrough = () => {
      audio.play();
    };
    
    audio.onended = () => {
      currentAudio.current = null;
      deleteAudioFile('guitar_grip.wav');
      startVoiceRecognition();
    };
    
    audio.onerror = async () => {
      await fetch(`${API_BASE}/guitar/grip?username=${encodeURIComponent(userName)}`);
      
      // 輪詢檢查音檔是否已生成
      const checkAudioReady = () => {
        const newAudio = new Audio(`/guitar_grip.wav`);
        currentAudio.current = newAudio;
        
        newAudio.oncanplaythrough = () => {
          newAudio.play();
        };
        
        newAudio.onended = () => {
          currentAudio.current = null;
          deleteAudioFile('guitar_grip.wav');
          startVoiceRecognition();
        };
        
        newAudio.onerror = () => {
          setTimeout(checkAudioReady, 500);
        };
        
        newAudio.load();
      };
      
      setTimeout(checkAudioReady, 1000);
    };
    
    audio.load();
  };

  const startVoiceRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();

    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    let done = false;
    recognition.start();

    recognition.onresult = async (e) => {
      if (done) return;
      done = true;
      const text = e.results[0][0].transcript || '';
      recognition.stop();
      await sendActionAPI(text);
    };
    recognition.onerror = () => { try { recognition.stop(); } catch {} };
    recognition.onend = () => {};
    setTimeout(() => { try { recognition.stop(); } catch {} }, 8000);
  };

  const sendActionAPI = async (voiceInput) => {
    userQuestion.current = voiceInput;
    
    const response = await fetch(`${API_BASE}/guitar/action?user_input=${encodeURIComponent(voiceInput)}`, {
      method: 'POST',
    });
    
    const data = await response.json();
    const actionResult = data.Response;
    
    if (actionResult === 10) {
      await handleTutorAPI(userQuestion.current);
      return;
    }
    
    if (actionResult === true) {
      // 重新播放 intro
      checkAndPlayIntro();
    } else {
      // 跳轉到 camerascreen
      onNavigate('guitar-grip-camera');
    }
  };

  const handleTutorAPI = async (question) => {
    await fetch(`${API_BASE}/tutor/ask?user_input=${encodeURIComponent(question)}`, {
      method: 'POST',
    });
    
    // 輪詢檢查音檔是否已生成
    const checkAudioReady = () => {
      const audio = new Audio(`/guitar_ask.wav`);
      currentAudio.current = audio;
      
      audio.oncanplaythrough = () => {
        audio.play();
      };
      
      audio.onended = () => {
        currentAudio.current = null;
        deleteAudioFile('guitar_ask.wav');
        startVoiceRecognition();
      };
      
      audio.onerror = () => {
        setTimeout(checkAudioReady, 500);
      };
      
      audio.load();
    };
    
    setTimeout(checkAudioReady, 1000);
  };

  const lessonData = {
    title: '吉他握法',
    description: '學習正確的吉他持琴姿勢，包括坐姿和站姿',
    difficulty: '初級',
    duration: '10 分鐘',
    keyPoints: [
      {
        title: '坐姿要點',
        description: '保持背部挺直，雙腳平放地面，吉他琴身貼合身體'
      },
      {
        title: '左手位置',
        description: '拇指放在琴頸後方中央，手指自然彎曲'
      },
      {
        title: '右手姿勢',
        description: '手臂環抱琴身自然垂下，手腕略微彎曲，手指輕鬆接觸琴弦'
      },
      {
        title: '身體放鬆',
        description: '肩膀不要緊張上提，保持自然放鬆的狀態'
      }
    ]
  };

  const handleStartPractice = () => {
    // 導航到姿勢檢測相機頁面
    onNavigate('guitar-grip-camera');
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('basic-lesson');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    }
  };

  return (
    <PhoneContainer 
      title="🎸 吉他握法"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="guitar-grip-page">
        <div className="grip-lesson-nav">
          <button 
            className="grip-back-button"
            onClick={() => onNavigate('basic-lesson')}
          >
            ← 返回基礎教學
          </button>
          <button 
            className="grip-home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="grip-lesson-content">
          <div className="grip-key-points-section">
            <h2>💡 動作要點</h2>
            <div className="grip-key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="grip-key-point-card">
                  <div className="grip-key-point-header">
                    <h3>{point.title}</h3>
                  </div>
                  <p className="grip-key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grip-lesson-actions">
            <button 
              className="grip-practice-button"
              onClick={handleStartPractice}
            >
              🎯 開始姿勢檢測
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default GuitarGripPage;