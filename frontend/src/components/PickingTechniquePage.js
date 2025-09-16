import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import ResultScreen from './ResultScreen';
import PhoneContainer from './PhoneContainer';
import './PickingTechniquePage.css';

function PickingTechniquePage({ onNavigate }) {
  const [currentMode, setCurrentMode] = useState('lesson'); // 'lesson', 'camera', 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const lessonData = {
    title: '右手撥弦技巧',
    description: '掌握正確的撥弦手法和節拍',
    difficulty: '中級',
    duration: '20 分鐘',
    keyPoints: [
      {
        title: '撥弦角度',
        description: '保持撥片與弦呈45度角，避免過於垂直或平行'
      },
      {
        title: '力度控制',
        description: '根據音樂需要調整撥弦力度，練習輕重變化'
      },
      {
        title: '手腕動作',
        description: '主要使用手腕動作撥弦，避免整個手臂移動'
      },
      {
        title: '節拍穩定',
        description: '保持穩定的節拍，從慢速開始逐漸加快'
      }
    ],
    steps: [
      '學習正確的撥弦手型',
      '練習下撥和上撥',
      '掌握基本節拍型',
      '配合和弦練習'
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
        title="👋 撥弦姿勢檢測"
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
        title="👋 檢測結果"
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
      title="👋 右手撥弦技巧"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="picking-technique-page">
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

export default PickingTechniquePage;