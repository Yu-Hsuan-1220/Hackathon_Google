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
      route: 'guitar-grip'
    },
    {
      id: 2,
      title: '基本和弦練習',
      description: '學習 C、G、D 等基本和弦的按法',
      difficulty: '初級',
      duration: '15 分鐘',
      route: 'chord-practice'
    },
    {
      id: 3,
      title: '右手撥弦技巧',
      description: '掌握正確的撥弦手法和節拍',
      difficulty: '中級',
      duration: '20 分鐘',
      route: 'picking-technique'
    },
    {
      id: 4,
      title: '小星星練習',
      description: '學習彈奏經典兒歌《小星星》',
      difficulty: '中級',
      duration: '25 分鐘',
      route: 'song-practice'
    }
  ];

  const handleLessonSelect = (lesson) => {
    onNavigate(lesson.route);
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back' || command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('第一課') || command.includes('第1課') || command.includes('握法')) {
      onNavigate('guitar-grip');
    } else if (command.includes('第二課') || command.includes('第2課') || command.includes('和弦')) {
      onNavigate('chord-practice');
    } else if (command.includes('第三課') || command.includes('第3課') || command.includes('撥弦')) {
      onNavigate('picking-technique');
    } else if (command.includes('第四課') || command.includes('第4課') || command.includes('小星星') || command.includes('歌曲')) {
      onNavigate('song-practice');
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

        <div className="lessons-grid-four-columns">{lessons.map((lesson) => {
            // 為每個課程添加對應的emoji
            const lessonEmojis = {
              1: '🎸',
              2: '🎵', 
              3: '🎼',
              4: '⭐'
            };
            
            return (
              <div
                key={lesson.id}
                className={`lesson-card-compact lesson-${lesson.id}`}
                onClick={() => handleLessonSelect(lesson)}
              >
                <div className="lesson-icon">
                  {lessonEmojis[lesson.id]}
                </div>
                <div className="lesson-content">
                  <h3 className="lesson-title-compact">{lesson.title}</h3>
                  <div className="lesson-meta-compact">
                    <span className="difficulty-compact">{lesson.difficulty}</span>
                    <span className="duration-compact">{lesson.duration}</span>
                  </div>
                  <p className="lesson-description-compact">{lesson.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default GuitarLessonPage;