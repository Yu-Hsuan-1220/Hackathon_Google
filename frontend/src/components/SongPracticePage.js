import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongPracticePage.css';

function SongPracticePage({ onNavigate }) {
  const practiceSongs = [
    {
      id: 2,
      title: '生日快樂',
      emoji: '🎂',
      description: '慶祝生日的經典歌曲',
      difficulty: '初級',
      chords: ['C', 'F', 'G', 'Am'],
      route: 'song-happy-birthday'
    },
    {
      id: 3,
      title: '童年',
      emoji: '🌈',
      description: '羅大佑經典懷舊歌曲',
      difficulty: '中級',
      chords: ['C', 'Am', 'F', 'G', 'Dm', 'Em'],
      route: 'song-childhood'
    },
    {
      id: 4,
      title: '月亮代表我的心',
      emoji: '🌙',
      description: '鄧麗君經典愛情歌曲',
      difficulty: '高級',
      chords: ['C', 'Am', 'F', 'G', 'Em', 'Dm', 'A7', 'D7'],
      route: 'song-moon-heart'
    }
  ];

  // 語音命令處理
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('返回') || lowerCommand.includes('主頁')) {
      onNavigate('home');
    } else if (lowerCommand.includes('生日')) {
      onNavigate('song-happy-birthday');
    } else if (lowerCommand.includes('童年')) {
      onNavigate('song-childhood');
    } else if (lowerCommand.includes('月亮')) {
      onNavigate('song-moon-heart');
    }
  };

  return (
    <PhoneContainer 
      title="🎤 歌曲練習"
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
          {practiceSongs.map((song) => {
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
                  <p className="lesson-description-compact">{song.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongPracticePage;