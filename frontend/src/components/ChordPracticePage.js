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

  return (
    <PhoneContainer
      title="🎵 基本和弦練習"
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
          </div>

          <div className="practice-section">
            <button
              className="start-practice-button"
              onClick={() => onNavigate('chord-lesson')}
            >
              🎸 開始和弦練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default ChordPracticePage;