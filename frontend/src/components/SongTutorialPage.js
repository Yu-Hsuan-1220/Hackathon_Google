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

  const songsList = [
    {
      id: 'twinkle-star',
      title: '小星星',
      emoji: '⭐',
      difficulty: '初級',
      chords: ['C', 'F', 'G'],
      route: 'song-twinkle-star'
    }
    // 其他歌曲暫時隱藏
    // {
    //   id: 'happy-birthday',
    //   title: '生日快樂',
    //   emoji: '🎂',
    //   difficulty: '初級',
    //   chords: ['C', 'F', 'G', 'Am'],
    //   route: 'song-happy-birthday'
    // },
    // {
    //   id: 'childhood',
    //   title: '童年',
    //   emoji: '🌈',
    //   difficulty: '中級',
    //   chords: ['C', 'Am', 'F', 'G', 'Dm', 'Em'],
    //   route: 'song-childhood'
    // },
    // {
    //   id: 'moon-heart',
    //   title: '月亮代表我的心',
    //   emoji: '🌙',
    //   difficulty: '高級',
    //   chords: ['C', 'Am', 'F', 'G', 'Em', 'Dm', 'A7', 'D7'],
    //   route: 'song-moon-heart'
    // }
  ];

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
      <div className="lesson-list">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ← 返回主頁
          </button>
        </div>
        
        <div className="lessons-grid-four-columns">
          {songsList.map((song) => {
            // 為每個歌曲添加對應的樣式類
            const difficultyClass = {
              '初級': 'beginner',
              '中級': 'intermediate', 
              '高級': 'advanced'
            }[song.difficulty] || 'beginner';

            return (
              <div 
                key={song.id} 
                className={`lesson-card-compact ${difficultyClass}`}
                onClick={() => onNavigate(song.route)}
              >
                <div className="lesson-icon">{song.emoji}</div>
                <div className="lesson-content">
                  <h3 className="lesson-title-compact">{song.title}</h3>
                  <div className="lesson-meta-compact">
                    <span className={`difficulty-compact ${difficultyClass}`}>
                      {song.difficulty}
                    </span>
                    <span className="duration-compact">{song.chords.length} 和弦</span>
                  </div>
                  <p className="lesson-description-compact">學習演奏這首經典歌曲</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongTutorialPage;