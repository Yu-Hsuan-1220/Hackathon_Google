import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongLessonPage.css';

function SongLessonPage({ onNavigate }) {
  const lessonData = {
    title: '簡單歌曲練習',
    description: '用學過的和弦演奏簡單歌曲',
    difficulty: '中級',
    duration: '25 分鐘',
    keyPoints: [
      {
        title: '歌曲選擇',
        description: '選擇使用基本和弦的簡單歌曲，如《小星星》、《生日快樂》'
      },
      {
        title: '和弦分析',
        description: '先熟悉歌曲的和弦進行，標記出和弦轉換的位置'
      },
      {
        title: '分段練習',
        description: '將歌曲分成小段落，逐段熟練後再串聯起來'
      },
      {
        title: '節拍配合',
        description: '注意歌曲的節拍，配合旋律進行和弦轉換'
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
      title="🎤 簡單歌曲練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="song-lesson-page">
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
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongLessonPage;