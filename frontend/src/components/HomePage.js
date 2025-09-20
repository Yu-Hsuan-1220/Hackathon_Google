import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import FeatureCarousel from './FeatureCarousel';
import './HomePage.css';

function HomePage({ onNavigate, userName }) {
  const hasCalledAPI = useRef(false);
  const currentAudio = useRef(null);
  const userQuestion = useRef('');

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

  const deleteAudioFile = async (filename) => {
    await fetch(`http://localhost:8000/home/delete?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  };

  const checkAndPlayIntro = () => {
    const audio = new Audio(`/home_intro.wav`);
    currentAudio.current = audio;
    
    audio.oncanplaythrough = () => {
      audio.play();
    };
    
    audio.onended = () => {
      currentAudio.current = null;
      deleteAudioFile('home_intro.wav');
      startVoiceRecognition();
    };
    
    audio.onerror = async () => {
      await fetch(`http://localhost:8000/home/intro?username=${encodeURIComponent(userName || '用戶')}`);
      
      // 輪詢檢查音檔是否已生成
      const checkAudioReady = () => {
        const newAudio = new Audio(`/home_intro.wav`);
        currentAudio.current = newAudio;
        
        newAudio.oncanplaythrough = () => {
          newAudio.play();
        };
        
        newAudio.onended = () => {
          currentAudio.current = null;
          deleteAudioFile('home_intro.wav');
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
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await sendActionAPI(transcript);
    };

    recognition.start();
    setTimeout(() => recognition.stop(), 3000);
  };

  const sendActionAPI = async (voiceInput) => {
    userQuestion.current = voiceInput;
    
    const response = await fetch(`http://localhost:8000/home/action?user_input=${encodeURIComponent(voiceInput)}`, {
      method: 'POST',
    });
    
    const data = await response.json();
    const actionId = data.Response;
    console.log('Received action ID:', actionId);
    
    if (actionId === 10) {
      await handleTutorAPI(userQuestion.current);
      return;
    }
    
    if (actionId === 6 || actionId === 9) {
      await handleReplayIntro();
      return;
    }
    
    // 根據 id 進行頁面跳轉
    switch(actionId) {
      case 1:
        onNavigate('basic-lesson');
        break;
      case 2:
        onNavigate('tuner');
        break;
      case 3:
        onNavigate('metronome');
        break;
      case 4:
        onNavigate('song-tutorial');
        break;
      case 5:
        onNavigate('song-practice');
        break;
    }
  };

  const handleTutorAPI = async (question) => {
    await fetch(`http://localhost:8000/tutor/ask?user_input=${encodeURIComponent(question)}`, {
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

  const handleReplayIntro = async () => {
    await fetch(`http://localhost:8000/home/intro?username=${encodeURIComponent(userName || '用戶')}`);
    
    // 輪詢檢查音檔是否已生成
    const checkAudioReady = () => {
      const audio = new Audio(`/home_intro.wav`);
      currentAudio.current = audio;
      
      audio.oncanplaythrough = () => {
        audio.play();
      };
      
      audio.onended = () => {
        currentAudio.current = null;
        deleteAudioFile('home_intro.wav');
        startVoiceRecognition();
      };
      
      audio.onerror = () => {
        setTimeout(checkAudioReady, 500);
      };
      
      audio.load();
    };
    
    setTimeout(checkAudioReady, 1000);
  };
  
  const features = [
    {
      id: 'tuner',
      title: '調音器',
      description: '為您的吉他進行精準調音，確保音準完美',
      icon: '🎼',
      color: '#9B59B6'
    },
    {
      id: 'basic-lesson',
      title: '基礎教學',
      description: '學習正確的吉他姿勢和彈奏技巧',
      icon: '🎸',
      color: '#FF6B6B'
    },
    {
      id: 'metronome',
      title: '節拍器',
      description: '練習節拍感和保持穩定的演奏速度',
      icon: '⏱️',
      color: '#4ECDC4'
    },
    {
      id: 'song-tutorial',
      title: '歌曲教學',
      description: '學習經典歌曲的演奏方法',
      icon: '🎵',
      color: '#45B7D1'
    },
    {
      id: 'song-practice',
      title: '歌曲練習',
      description: '跟著節拍練習彈奏歌曲',
      icon: '🎶',
      color: '#E74C3C'
    }
  ];

  const handleVoiceCommand = (command) => {
    // 語音指令由 API 處理
  };

  const handleResetUserData = () => {
    // 清除所有本地存儲的使用者資料
    localStorage.removeItem('userName');
    localStorage.removeItem('isFirstTime');
    localStorage.removeItem('hasCompletedNameInput');
    localStorage.removeItem('hasCompletedTuning');
    
    // 重新載入頁面以觸發首次使用者流程
    window.location.reload();
  };

  return (
    <PhoneContainer 
      title={`🎸 歡迎回來，${userName || '用戶'}！`}
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="home-content">
        {/* 使用新的功能陳列組件 */}
        <FeatureCarousel 
          features={features}
          onFeatureSelect={onNavigate}
        />
        
        {/* 管理者專用按鈕 */}
        <div className="admin-section">
          <button 
            className="admin-reset-btn"
            onClick={handleResetUserData}
            title="重置所有使用者資料"
          >
            ⚙️ 管理者專用
          </button>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default HomePage;