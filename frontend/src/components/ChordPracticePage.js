import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import ResultScreen from './ResultScreen';
import PhoneContainer from './PhoneContainer';
import './ChordPracticePage.css';

function ChordPracticePage({ onNavigate }) {
  const [currentMode, setCurrentMode] = useState('lesson'); // 'lesson', 'camera', 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const lessonData = {
    title: '基本和弦練習',
    description: '學習 C、G、D 等基本和弦的按法',
    difficulty: '初級',
    duration: '15 分鐘',
    keyPoints: [
      {
        title: '手指按壓',
        description: '用指尖按弦，確保按壓力度適中，不要過用力'
      },
      {
        title: '手指弧度',
        description: '保持手指自然彎曲，避免碰觸到相鄰的弦'
      },
      {
        title: '和弦轉換',
        description: '練習時慢慢轉換，確保每根弦都能清晰發聲'
      },
      {
        title: '節拍練習',
        description: '配合節拍器練習，建立穩定的節奏感'
      }
    ],
    steps: [
      '學習 C 大調和弦按法',
      '練習 G 大調和弦',
      '掌握 D 大調和弦',
      '和弦轉換練習'
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
    console.log('ChordPracticePage 收到語音指令:', command);
    
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
        title="🎵 和弦姿勢檢測"
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
        title="🎵 檢測結果"
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
      title="🎵 基本和弦練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="chord-practice-page">
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
        
        <div className="lesson-content">{/* 動作要點說明欄 */}
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

          <h2>📝 課程步驟</h2>
          <div className="steps-list">
            {lessonData.steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
          
          <div className="lesson-actions">
            <button 
              className="practice-button"
              onClick={handleStartPractice}
            >
              🎯 開始姿勢檢測練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default ChordPracticePage;