import React from 'react';
import PhoneContainer from './PhoneContainer';
import './GuitarLessonPage.css';

function GuitarLessonPage({ onNavigate }) {
  const lessons = [
    {
      id: 1,
      title: '吉他握法',
      description: '學習正確的吉他持琴姿勢，包括坐姿和站姿',
      difficulty: '初級',
      duration: '10 分鐘',
      thumbnail: '🎸',
      route: 'guitar-grip'
    },
    {
      id: 2,
      title: '基本和弦練習',
      description: '學習 C、G、D 等基本和弦的按法',
      difficulty: '初級',
      duration: '15 分鐘',
      thumbnail: '🎵',
      route: 'chord-practice'
    },
    {
      id: 3,
      title: '右手撥弦技巧',
      description: '掌握正確的撥弦手法和節拍',
      difficulty: '中級',
      duration: '20 分鐘',
      thumbnail: '👋',
      route: 'picking-technique'
    },
    {
      id: 4,
      title: '歌曲練習',
      description: '用學過的和弦演奏簡單歌曲',
      difficulty: '中級',
      duration: '25 分鐘',
      thumbnail: '🎤',
      route: 'song-tutorial'
    }
  ];

  const handleLessonSelect = (lesson) => {
    onNavigate(lesson.route);
  };

  const handleVoiceCommand = (command) => {
    console.log('GuitarLessonPage 收到語音指令:', command);
    
    if (command === 'navigate-back' || command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('第一課') || command.includes('第1課') || command.includes('握法')) {
      onNavigate('guitar-grip');
    } else if (command.includes('第二課') || command.includes('第2課') || command.includes('和弦')) {
      onNavigate('chord-practice');
    } else if (command.includes('第三課') || command.includes('第3課') || command.includes('撥弦')) {
      onNavigate('picking-technique');
    } else if (command.includes('第四課') || command.includes('第4課') || command.includes('歌曲')) {
      onNavigate('song-tutorial');
    }
  };

  return (
    <PhoneContainer 
      title="🎸 吉他教學"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="lesson-list">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ← 返回主頁
          </button>
        </div>

        <div className="lessons-grid-four-columns">{lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="lesson-card-compact"
              onClick={() => handleLessonSelect(lesson)}
            >
              <div className="lesson-thumbnail-large">{lesson.thumbnail}</div>
              <div className="lesson-content">
                <h3 className="lesson-title-compact">{lesson.title}</h3>
                <div className="lesson-meta-compact">
                  <span className="difficulty-compact">{lesson.difficulty}</span>
                  <span className="duration-compact">{lesson.duration}</span>
                </div>
                <p className="lesson-description-compact">{lesson.description}</p>
                <button className="start-lesson-btn-compact">
                  開始學習
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default GuitarLessonPage;