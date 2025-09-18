import React from 'react';
import PhoneContainer from './PhoneContainer';
import './ChordPracticePage.css';

function ChordPracticePage({ onNavigate }) {
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
    ]
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
      title="🎵 基本和弦練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="chord-practice-page">
        <div className="chord-lesson-nav">
          <button 
            className="chord-back-button"
            onClick={() => onNavigate('basic-lesson')}
          >
            ← 返回基礎教學
          </button>
          <button 
            className="chord-home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="chord-lesson-content">
          <div className="chord-key-points-section">
            <h3>💡 練習要點</h3>
            <div className="chord-key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="chord-key-point-card">
                  <div className="chord-key-point-header">
                    <h4>{point.title}</h4>
                  </div>
                  <p className="chord-key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="chord-practice-actions">
            <button 
              className="chord-practice-button"
              onClick={() => {
                // TODO: 添加導航邏輯
                console.log('開始和弦練習');
              }}
            >
              🎸 開始練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default ChordPracticePage;