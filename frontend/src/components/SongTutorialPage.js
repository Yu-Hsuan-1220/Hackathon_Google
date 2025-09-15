import React, { useState } from 'react';
import PhoneContainer from './PhoneContainer';
import './SongTutorialPage.css';

function SongTutorialPage({ onNavigate }) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // 語音命令處理
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('返回') || lowerCommand.includes('主頁')) {
      if (selectedSong) {
        setSelectedSong(null);
      } else {
        onNavigate('home');
      }
    } else if (lowerCommand.includes('初學') || lowerCommand.includes('簡單')) {
      setSelectedDifficulty('beginner');
    } else if (lowerCommand.includes('中級') || lowerCommand.includes('普通')) {
      setSelectedDifficulty('intermediate');
    } else if (lowerCommand.includes('高級') || lowerCommand.includes('困難')) {
      setSelectedDifficulty('advanced');
    } else if (lowerCommand.includes('全部') || lowerCommand.includes('所有')) {
      setSelectedDifficulty('all');
    } else if (lowerCommand.includes('小星星')) {
      setSelectedSong(songs.find(s => s.title === '小星星'));
    } else if (lowerCommand.includes('生日')) {
      setSelectedSong(songs.find(s => s.title === '生日快樂'));
    }
  };

  const songs = [
    {
      id: 1,
      title: '小星星',
      artist: '傳統兒歌',
      difficulty: 'beginner',
      duration: '2 分鐘',
      chords: ['C', 'F', 'G'],
      thumbnail: '⭐',
      description: '最適合初學者的經典歌曲',
      sections: [
        { name: '主歌', chords: 'C C F F | G G C C' },
        { name: '副歌', chords: 'F F C C | G G C C' }
      ],
      tips: [
        '先練習和弦轉換，再加入節拍',
        '注意保持穩定的節奏',
        '可以先用簡單的下撥開始'
      ]
    },
    {
      id: 2,
      title: '生日快樂',
      artist: '傳統歌曲',
      difficulty: 'beginner',
      duration: '3 分鐘',
      chords: ['C', 'F', 'G7'],
      thumbnail: '🎂',
      description: '聚會必備歌曲',
      sections: [
        { name: '主歌', chords: 'C C F C | C G7 G7 C' },
        { name: '副歌', chords: 'C C F C | G7 G7 C C' }
      ],
      tips: [
        '注意G7和弦的按法',
        '可以配合拍手練習節拍',
        '唱歌時保持和弦清晰'
      ]
    },
    {
      id: 3,
      title: '童年',
      artist: '羅大佑',
      difficulty: 'intermediate',
      duration: '4 分鐘',
      chords: ['G', 'C', 'D', 'Em'],
      thumbnail: '🌸',
      description: '經典華語流行歌曲',
      sections: [
        { name: '前奏', chords: 'G C G D' },
        { name: '主歌', chords: 'G C D G | Em C D G' },
        { name: '副歌', chords: 'Em C G D | Em C D G' }
      ],
      tips: [
        '掌握Em和弦的按法',
        '練習流暢的和弦轉換',
        '注意歌曲的情感表達'
      ]
    },
    {
      id: 4,
      title: '月亮代表我的心',
      artist: '鄧麗君',
      difficulty: 'intermediate',
      duration: '5 分鐘',
      chords: ['C', 'Am', 'F', 'G', 'Em'],
      thumbnail: '🌙',
      description: '經典華語歌曲',
      sections: [
        { name: '前奏', chords: 'C Am F G' },
        { name: '主歌', chords: 'C Am F G | C Am F G' },
        { name: '副歌', chords: 'Em Am F G | C Am F G C' }
      ],
      tips: [
        '練習Am和Em的轉換',
        '注意F和弦的按法',
        '配合歌詞練習節拍'
      ]
    },
    {
      id: 5,
      title: 'Wonderwall',
      artist: 'Oasis',
      difficulty: 'advanced',
      duration: '6 分鐘',
      chords: ['Em7', 'G', 'D', 'C', 'Am'],
      thumbnail: '🎸',
      description: '經典英文搖滾歌曲',
      sections: [
        { name: '前奏', chords: 'Em7 G D C' },
        { name: '主歌', chords: 'Em7 G D C | Em7 G D C' },
        { name: '副歌', chords: 'C D Em7 Em7 | C D G G' }
      ],
      tips: [
        '掌握Em7和弦的按法',
        '練習掃弦技巧',
        '注意節拍的變化'
      ]
    }
  ];

  const difficulties = [
    { value: 'all', label: '全部', color: '#6c757d' },
    { value: 'beginner', label: '初級', color: '#28a745' },
    { value: 'intermediate', label: '中級', color: '#ffc107' },
    { value: 'advanced', label: '高級', color: '#dc3545' }
  ];

  const filteredSongs = selectedDifficulty === 'all' 
    ? songs 
    : songs.filter(song => song.difficulty === selectedDifficulty);

  const handleSongSelect = (song) => {
    setSelectedSong(song);
  };

  const getDifficultyLabel = (difficulty) => {
    const diffMap = {
      'beginner': '初級',
      'intermediate': '中級',
      'advanced': '高級'
    };
    return diffMap[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      'beginner': '#28a745',
      'intermediate': '#ffc107',
      'advanced': '#dc3545'
    };
    return colorMap[difficulty] || '#6c757d';
  };

  if (selectedSong) {
    return (
      <PhoneContainer 
        title={`🎵 ${selectedSong.title}`}
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="song-detail">
          <div className="song-nav">
            <button 
              className="back-button"
              onClick={() => setSelectedSong(null)}
            >
              ←
            </button>
          </div>

          <div className="song-info">
            <div className="song-thumbnail">{selectedSong.thumbnail}</div>
            <h1>{selectedSong.title}</h1>
            <p className="artist">演唱者: {selectedSong.artist}</p>
            <div className="song-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(selectedSong.difficulty) }}
              >
                {getDifficultyLabel(selectedSong.difficulty)}
              </span>
              <span className="duration">{selectedSong.duration}</span>
            </div>
            <p className="description">{selectedSong.description}</p>
          </div>

          <div className="song-content">
            <div className="chords-section">
              <h3>使用和弦</h3>
              <div className="chords-list">
                {selectedSong.chords.map((chord, index) => (
                  <div key={index} className="chord-item">
                    {chord}
                  </div>
                ))}
              </div>
            </div>

            <div className="sections">
              <h3>歌曲結構</h3>
              {selectedSong.sections.map((section, index) => (
                <div key={index} className="section-item">
                  <div className="section-name">{section.name}</div>
                  <div className="section-chords">{section.chords}</div>
                </div>
              ))}
            </div>

            <div className="tips-section">
              <h3>練習建議</h3>
              <div className="tips-list">
                {selectedSong.tips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-icon">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="practice-button"
                onClick={() => onNavigate('song-practice')}
              >
                🎯 開始練習
              </button>
              <button 
                className="metronome-button"
                onClick={() => onNavigate('metronome')}
              >
                ⏱️ 使用節拍器
              </button>
            </div>
          </div>
        </div>
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer 
      title="🎵 歌曲教學"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="song-tutorial-content">
        <div className="tutorial-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ←
          </button>
        </div>

        <div className="filter-section">
          <h3>難度篩選</h3>
          <div className="difficulty-filters">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                className={`filter-btn ${selectedDifficulty === diff.value ? 'active' : ''}`}
                style={{ 
                  backgroundColor: selectedDifficulty === diff.value ? diff.color : 'transparent',
                  borderColor: diff.color,
                  color: selectedDifficulty === diff.value ? 'white' : diff.color
                }}
                onClick={() => setSelectedDifficulty(diff.value)}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div className="songs-grid">
          {filteredSongs.map((song) => (
            <div 
              key={song.id} 
              className="song-card"
              onClick={() => handleSongSelect(song)}
            >
              <div className="song-thumbnail">{song.thumbnail}</div>
              <div className="song-info">
                <h3>{song.title}</h3>
                <p className="artist">{song.artist}</p>
                <p className="description">{song.description}</p>
                <div className="song-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(song.difficulty) }}
                  >
                    {getDifficultyLabel(song.difficulty)}
                  </span>
                  <span className="duration">{song.duration}</span>
                </div>
                <div className="chords-preview">
                  和弦: {song.chords.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongTutorialPage;