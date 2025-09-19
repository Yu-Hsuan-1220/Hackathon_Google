import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './GuitarGripPage.css';

function GuitarGripPage({ onNavigate }) {
  const hasCalledAPI = useRef(false);
  const currentAudio = useRef(null);

  const deleteAudioFile = async (filename) => {
    try {
      await fetch(`http://localhost:8000/home/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('刪除音檔失敗:', error);
    }
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
      audio.play().catch(console.error);
      audio.onended = () => {
        currentAudio.current = null;
        deleteAudioFile('guitar_grip.wav');
        startVoiceRecognition();
      };
    };
    
    audio.onerror = async () => {
      await fetch(`http://localhost:8000/guitar/grip?username=${encodeURIComponent(userName)}`);
      setTimeout(() => {
        const newAudio = new Audio(`/guitar_grip.wav`);
        currentAudio.current = newAudio;
        newAudio.play().catch(console.error);
        newAudio.onended = () => {
          currentAudio.current = null;
          deleteAudioFile('guitar_grip.wav');
          startVoiceRecognition();
        };
      }, 1000);
    };
    
    audio.load();
  };

  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await sendActionAPI(transcript);
    };

    setTimeout(() => {
      recognition.stop();
    }, 3000);
  };

  const sendActionAPI = async (voiceInput) => {
    const response = await fetch(`http://localhost:8000/guitar/action?user_input=${encodeURIComponent(voiceInput)}`, {
      method: 'POST',
    });
    
    const data = await response.json();
    const actionResult = data.Response;
    
    if (actionResult === true) {
      // 重新播放 intro
      checkAndPlayIntro();
    } else {
      // 跳轉到 camerascreen
      onNavigate('guitar-grip-camera');
    }
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