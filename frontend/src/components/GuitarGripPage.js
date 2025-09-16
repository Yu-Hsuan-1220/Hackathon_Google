import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import ResultScreen from './ResultScreen';
import PhoneContainer from './PhoneContainer';
import './GuitarGripPage.css';

function GuitarGripPage({ onNavigate }) {
  const [currentMode, setCurrentMode] = useState('lesson'); // 'lesson', 'camera', 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  
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
        description: '拇指放在琴頸後方中央，手指自然彎曲，避免碰觸其他弦'
      },
      {
        title: '右手姿勢',
        description: '手臂自然垂下，手腕略微彎曲，手指輕鬆接觸琴弦'
      },
      {
        title: '身體放鬆',
        description: '肩膀不要緊張上提，保持自然放鬆的狀態'
      }
    ]
  };

  const handleStartPractice = () => {
    setCurrentMode('camera');
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentMode('result');
  };

  const handleBackToLesson = () => {
    setCurrentMode('lesson');
    setAnalysisResult(null);
  };

  const handleVoiceCommand = (command) => {
    console.log('GuitarGripPage 收到語音指令:', command);
    
    if (command === 'navigate-back') {
      onNavigate('guitar-lesson');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('開始') || command.includes('檢測') || command.includes('練習')) {
      if (currentMode === 'lesson') {
        handleStartPractice();
      }
    }
  };

  // 相機模式
  if (currentMode === 'camera') {
    return (
      <PhoneContainer 
        title="🎸 握法姿勢檢測"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="camera-content">
          <CameraScreen 
            onBack={handleBackToLesson}
            onResult={handleAnalysisComplete} 
          />
        </div>
      </PhoneContainer>
    );
  }

  // 結果模式
  if (currentMode === 'result') {
    return (
      <PhoneContainer 
        title="🎸 檢測結果"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="result-content">
          <ResultScreen 
            result={analysisResult} 
            onRetry={() => setCurrentMode('camera')}
            onBack={handleBackToLesson}
          />
        </div>
      </PhoneContainer>
    );
  }

  // 教學模式
  return (
    <PhoneContainer 
      title="🎸 吉他握法"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="guitar-grip-page">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('guitar-lesson')}
          >
            ← 返回教學選單
          </button>
          <button 
            className="home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="lesson-content">
          {/* 動作要點說明欄 */}
          <div className="key-points-section">
            <h2>💡 動作要點</h2>
            <div className="key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="key-point-card">
                  <div className="key-point-header">
                    <h3>{point.title}</h3>
                  </div>
                  <p className="key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lesson-actions">
            <button 
              className="practice-button"
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