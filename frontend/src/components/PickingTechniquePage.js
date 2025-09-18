import React from 'react';
import PhoneContainer from './PhoneContainer';
import './PickingTechniquePage.css';

function PickingTechniquePage({ onNavigate }) {
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
    ]
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('guitar-lesson');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    }
  };

  return (
    <PhoneContainer 
      title="🎼 右手撥弦技巧"
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
        
        <div className="lesson-content">
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
            
            <div className="lesson-actions">
              <button 
                className="practice-button"
                onClick={() => onNavigate('single-note-lesson')}
              >
                🎵 開始單音練習
              </button>
            </div>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default PickingTechniquePage;