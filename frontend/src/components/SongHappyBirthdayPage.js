import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongHappyBirthdayPage.css';

function SongHappyBirthdayPage({ onNavigate }) {
  const songData = {
    title: '生日快樂',
    artist: '傳統歌曲',
    difficulty: 'beginner',
    duration: '1.5 分鐘',
    emoji: '🎂',
    description: '經典慶祝歌曲，簡單易學',
    chords: ['C', 'F', 'G', 'Am'],
    sections: [
      {
        name: '主歌 A',
        chords: 'C C F C',
        lyrics: '祝你生日快樂'
      },
      {
        name: '主歌 B',
        chords: 'C G G C',
        lyrics: '祝你生日快樂'
      },
      {
        name: '高潮',
        chords: 'C C F C',
        lyrics: '祝你生日快樂'
      },
      {
        name: '結尾',
        chords: 'Am F G C',
        lyrics: '祝你生日快樂'
      }
    ],
    tips: [
      '這首歌節奏較慢，適合練習和弦轉換',
      '注意 Am 和弦的手指位置',
      '可以配合慶祝場合練習',
      '試著用不同的節拍型演奏'
    ],
    chordDiagrams: {
      'C': { frets: [0, 1, 0, 2, 3, 0], fingers: ['', '1', '', '2', '3', ''] },
      'F': { frets: [1, 1, 2, 3, 3, 1], fingers: ['1', '1', '2', '3', '4', '1'] },
      'G': { frets: [3, 2, 0, 0, 3, 3], fingers: ['3', '2', '', '', '4', '4'] },
      'Am': { frets: [0, 0, 2, 2, 1, 0], fingers: ['', '', '2', '3', '1', ''] }
    }
  };

  const renderChordDiagram = (chordName) => {
    const chord = songData.chordDiagrams[chordName];
    if (!chord) return <div className="chord-diagram">和弦圖不可用</div>;

    return (
      <div className="chord-diagram">
        <div className="chord-name">{chordName}</div>
        <div className="fretboard">
          {[0, 1, 2, 3].map(fret => (
            <div key={fret} className="fret">
              {chord.frets.map((fretNum, string) => (
                <div key={string} className="string">
                  {fretNum === fret && fret > 0 && (
                    <div className="finger">{chord.fingers[string]}</div>
                  )}
                  {fret === 0 && fretNum === 0 && (
                    <div className="open">O</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PhoneContainer 
      title={`${songData.emoji} ${songData.title}`}
      showStatusBar={true}
    >
      <div className="song-page birthday-theme">
        <div className="song-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('song-tutorial')}
          >
            ← 返回歌曲選單
          </button>
          <button 
            className="home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>

        <div className="song-header">
          <div className="song-emoji-large">{songData.emoji}</div>
          <h1 className="song-title">{songData.title}</h1>
          <p className="song-artist">類型：{songData.artist}</p>
          <div className="song-meta">
            <span className="difficulty beginner">初級</span>
            <span className="duration">{songData.duration}</span>
          </div>
        </div>

        <div className="song-content">
          <div className="chords-section">
            <h2>🎸 使用和弦</h2>
            <div className="chords-grid">
              {songData.chords.map((chord, index) => (
                <div key={index} className="chord-container">
                  {renderChordDiagram(chord)}
                </div>
              ))}
            </div>
          </div>

          <div className="sections-section">
            <h2>🎵 歌曲結構</h2>
            {songData.sections.map((section, index) => (
              <div key={index} className="section-card">
                <h3 className="section-name">{section.name}</h3>
                <div className="section-chords">{section.chords}</div>
                <div className="section-lyrics">{section.lyrics}</div>
              </div>
            ))}
          </div>

          <div className="tips-section">
            <h2>💡 練習要點</h2>
            <div className="tips-list">
              {songData.tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <span className="tip-number">{index + 1}</span>
                  <span className="tip-text">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="celebration-section">
            <h2>🎉 慶祝小知識</h2>
            <div className="celebration-facts">
              <div className="fact-item">
                <span className="fact-icon">🎵</span>
                <span className="fact-text">這首歌是世界上最多人會唱的歌之一</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎂</span>
                <span className="fact-text">適合在生日派對上彈奏演唱</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎸</span>
                <span className="fact-text">只需要 4 個基本和弦就能完整演奏</span>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <button 
              className="practice-button"
              onClick={() => onNavigate('song-practice')}
            >
              🎯 開始練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongHappyBirthdayPage;