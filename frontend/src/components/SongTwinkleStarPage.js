import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongTwinkleStarPage.css';

function SongTwinkleStarPage({ onBack, onHome }) {
  const songData = {
    title: '小星星',
    artist: '傳統兒歌',
    difficulty: 'beginner',
    duration: '2 分鐘',
    emoji: '⭐',
    description: '最適合初學者的經典歌曲',
    chords: ['C', 'F', 'G'],
    sections: [
      {
        name: '主歌',
        chords: 'C C F F | G G C C',
        lyrics: '一閃一閃亮晶晶，滿天都是小星星'
      },
      {
        name: '副歌', 
        chords: 'F F C C | G G C C',
        lyrics: '掛在天空放光明，好像許多小眼睛'
      }
    ],
    tips: [
      '先練習和弦轉換，再加入節拍',
      '注意保持穩定的節奏',
      '可以先用簡單的下撥開始',
      '配合唱歌練習會更有趣'
    ],
    chordDiagrams: {
      'C': { frets: [0, 1, 0, 2, 3, 0], fingers: ['', '1', '', '2', '3', ''] },
      'F': { frets: [1, 1, 2, 3, 3, 1], fingers: ['1', '1', '2', '3', '4', '1'] },
      'G': { frets: [3, 2, 0, 0, 3, 3], fingers: ['3', '2', '', '', '4', '4'] }
    }
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onBack();
    } else if (command === 'navigate-home') {
      onHome();
    } else if (command.includes('練習')) {
      onBack(); // 返回到來源頁面
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
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="song-page">
        <div className="song-nav">
          <button 
            className="back-button"
            onClick={() => onBack()}
          >
            ← 返回歌曲選單
          </button>
          <button 
            className="home-button"
            onClick={() => onHome()}
          >
            🏠 主頁
          </button>
        </div>

        <div className="song-header">
          <div className="song-emoji-large">{songData.emoji}</div>
          <h1 className="song-title">{songData.title}</h1>
          <p className="song-artist">演唱：{songData.artist}</p>
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
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongTwinkleStarPage;
