import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongMoonHeartPage.css';

function SongMoonHeartPage({ onNavigate }) {
  const songData = {
    title: '月亮代表我的心',
    artist: '鄧麗君',
    difficulty: 'advanced',
    duration: '4 分鐘',
    emoji: '🌙',
    description: '經典情歌，進階難度',
    chords: ['C', 'Am', 'F', 'G', 'Dm', 'Em', 'A7', 'D7'],
    sections: [
      {
        name: '前奏',
        chords: 'C Am Dm G',
        lyrics: '(間奏)'
      },
      {
        name: '主歌 A',
        chords: 'C Em Am Em | F C Dm G',
        lyrics: '你問我愛你有多深，我愛你有幾分'
      },
      {
        name: '主歌 B',
        chords: 'C Em Am A7 | Dm G C G',
        lyrics: '我的情也真，我的愛也真'
      },
      {
        name: '副歌',
        chords: 'C Em F Em | Am F G C',
        lyrics: '月亮代表我的心'
      },
      {
        name: '間奏',
        chords: 'C Am F G | Dm G C G',
        lyrics: '(間奏演奏)'
      },
      {
        name: '結尾',
        chords: 'Am F G C',
        lyrics: '月亮代表我的心'
      }
    ],
    tips: [
      '注意 A7 和 D7 七和弦的按法',
      '練習慢板的抒情演奏風格',
      '掌握右手的指彈技巧',
      '注意歌曲的情感表達',
      '可以加入一些裝飾音符',
      '練習和弦間的順暢轉換'
    ],
    chordDiagrams: {
      'C': { frets: [0, 1, 0, 2, 3, 0], fingers: ['', '1', '', '2', '3', ''] },
      'Am': { frets: [0, 0, 2, 2, 1, 0], fingers: ['', '', '2', '3', '1', ''] },
      'F': { frets: [1, 1, 2, 3, 3, 1], fingers: ['1', '1', '2', '3', '4', '1'] },
      'G': { frets: [3, 2, 0, 0, 3, 3], fingers: ['3', '2', '', '', '4', '4'] },
      'Dm': { frets: [0, 0, 0, 2, 3, 1], fingers: ['', '', '', '1', '3', '2'] },
      'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: ['', '2', '3', '', '', ''] },
      'A7': { frets: [0, 0, 2, 0, 2, 0], fingers: ['', '', '2', '', '3', ''] },
      'D7': { frets: [0, 0, 0, 2, 1, 2], fingers: ['', '', '', '3', '1', '2'] }
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
      <div className="song-page moonheart-theme">
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
          <p className="song-artist">演唱：{songData.artist}</p>
          <div className="song-meta">
            <span className="difficulty advanced">進階</span>
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
            <div className="advanced-chords-note">
              <p>🎯 此歌曲包含七和弦（A7, D7），需要更精準的手指位置</p>
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
            <h2>💡 進階技巧</h2>
            <div className="tips-list">
              {songData.tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <span className="tip-number">{index + 1}</span>
                  <span className="tip-text">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="classic-section">
            <h2>🎭 經典傳承</h2>
            <div className="classic-facts">
              <div className="fact-item">
                <span className="fact-icon">👑</span>
                <span className="fact-text">鄧麗君的經典代表作</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎼</span>
                <span className="fact-text">華語流行音樂的永恆經典</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">💕</span>
                <span className="fact-text">最受歡迎的華語情歌之一</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎸</span>
                <span className="fact-text">適合指彈和分解和弦演奏</span>
              </div>
            </div>
          </div>

          <div className="difficulty-warning">
            <h3>⚠️ 進階難度說明</h3>
            <div className="warning-content">
              <p>這首歌曲包含以下進階元素：</p>
              <ul>
                <li>七和弦的運用（A7, D7）</li>
                <li>複雜的和弦進行</li>
                <li>需要較好的節拍感</li>
                <li>情感表達的技巧要求</li>
              </ul>
              <p>建議先熟練中級歌曲後再挑戰</p>
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

export default SongMoonHeartPage;