import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongTutorialPage.css';

function SongTutorialPage({ onNavigate }) {
  const lessonData = {
    title: '歌曲教學',
    description: '學習經典歌曲的演奏方法和技巧',
    difficulty: '各種難度',
    duration: '依歌曲而定',
    keyPoints: [
      {
        title: '歌曲分析',
        description: '了解歌曲結構、和弦進行和節拍型態'
      },
      {
        title: '和弦學習',
        description: '熟悉歌曲中使用的各種和弦按法'
      },
      {
        title: '節奏掌握',
        description: '掌握歌曲的節拍和撥弦節奏型'
      },
      {
        title: '演奏技巧',
        description: '學習適合歌曲風格的演奏技巧和表現方式'
      }
    ]
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('home');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    }
  };

  return (
    <PhoneContainer 
      title="🎵 歌曲教學"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="song-tutorial-page">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ← 返回主頁
          </button>
        </div>
        
        <div className="lesson-content">
          <div className="key-points-section">
            <h2>💡 教學重點</h2>
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
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongTutorialPage;