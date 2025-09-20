import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SingleNotePage.css';

function SingleNotePage({ onNavigate }) {
  const lessonData = {
    title: '單音練習',
    description: '學習彈奏單個音符的基本技巧',
    difficulty: '基礎',
    duration: '20 分鐘',
    keyPoints: [
      {
        title: '指法基礎',
        description: '使用食指、中指、無名指和小指按壓琴弦'
      },
      {
        title: '撥弦技巧',
        description: '使用撥片或手指輕柔地撥動琴弦'
      },
      {
        title: '音準控制',
        description: '確保手指完全按壓琴弦，避免雜音'
      },
      {
        title: '節拍練習',
        description: '配合節拍器練習穩定的單音演奏'
      }
    ],
    exercises: [
      {
        title: '第一弦練習',
        description: '練習第一弦（最細的弦）的各個品位',
        notes: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      },
      {
        title: '音階練習',
        description: '練習C大調音階的單音演奏',
        notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
      }
    ]
  };

  return (
    <PhoneContainer 
      title="🎵 單音練習"
      showStatusBar={true}
    >
      <div className="single-note-page">
        <div className="single-lesson-nav">
          <button 
            className="single-back-button"
            onClick={() => onNavigate('basic-lesson')}
          >
            ← 返回基礎教學
          </button>
          <button 
            className="single-home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="single-lesson-content">
          <div className="single-key-points-section">
            <h3>💡 練習要點</h3>
            <div className="single-key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="single-key-point-card">
                  <div className="single-key-point-header">
                    <h4>{point.title}</h4>
                  </div>
                  <p className="single-key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="single-practice-actions">
            <button 
              className="single-practice-button"
              onClick={() => {
                // TODO: 添加導航邏輯
                console.log('開始單音練習');
              }}
            >
              🎵 開始練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SingleNotePage;