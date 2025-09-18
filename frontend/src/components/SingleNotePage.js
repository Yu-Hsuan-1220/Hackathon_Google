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

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('basic-lesson');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    }
  };

  return (
    <PhoneContainer 
      title="🎵 單音練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="single-note-page">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('basic-lesson')}
          >
            ← 返回基礎教學
          </button>
          <button 
            className="home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="lesson-content">
          <div className="lesson-header">
            <h2>{lessonData.title}</h2>
            <p className="lesson-description">{lessonData.description}</p>
            <div className="lesson-meta">
              <span className="difficulty">難度: {lessonData.difficulty}</span>
              <span className="duration">時長: {lessonData.duration}</span>
            </div>
          </div>

          <div className="key-points-section">
            <h3>💡 練習要點</h3>
            <div className="key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="key-point-card">
                  <div className="key-point-header">
                    <h4>{point.title}</h4>
                  </div>
                  <p className="key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="exercises-section">
            <h3>🎯 練習項目</h3>
            {lessonData.exercises.map((exercise, index) => (
              <div key={index} className="exercise-card">
                <h4>{exercise.title}</h4>
                <p>{exercise.description}</p>
                <div className="notes-display">
                  {exercise.notes.map((note, noteIndex) => (
                    <span key={noteIndex} className="note-badge">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SingleNotePage;