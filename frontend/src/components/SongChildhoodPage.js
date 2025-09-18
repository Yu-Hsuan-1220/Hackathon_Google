import React from 'react';
import PhoneContainer from './PhoneContainer';
import './SongChildhoodPage.css';

function SongChildhoodPage({ onNavigate }) {
  const songData = {
    title: '童年',
    artist: '羅大佑',
    difficulty: 'intermediate',
    duration: '3.5 分鐘',
    emoji: '👶',
    description: '經典懷舊歌曲，中級難度',
    chords: ['C', 'Am', 'F', 'G', 'Dm', 'Em'],
    sections: [
      {
        name: '前奏',
        chords: 'C Am F G',
        lyrics: '(間奏)'
      },
      {
        name: '主歌 A',
        chords: 'C Am F G | C Am Dm G',
        lyrics: '池塘邊的榕樹上，知了在聲聲叫著夏天'
      },
      {
        name: '主歌 B',
        chords: 'C Am F G | C Am G C',
        lyrics: '操場邊的鞦韆上，只有蝴蝶停在上面'
      },
      {
        name: '副歌',
        chords: 'Am Em F C | Am Em F G',
        lyrics: '黑板上老師的粉筆，還在拼命嘰嘰喳喳寫個不停'
      },
      {
        name: '結尾',
        chords: 'C Am F G C',
        lyrics: '等待著下課，等待著放學'
      }
    ],
    tips: [
      '注意 Am 到 Em 的和弦轉換',
      '練習右手的節拍型變化',
      '慢慢練習，不要急於求成',
      '注意歌詞的節拍重音',
      '可以先練習簡化版本的和弦進行'
    ],
    chordDiagrams: {
      'C': { frets: [0, 1, 0, 2, 3, 0], fingers: ['', '1', '', '2', '3', ''] },
      'Am': { frets: [0, 0, 2, 2, 1, 0], fingers: ['', '', '2', '3', '1', ''] },
      'F': { frets: [1, 1, 2, 3, 3, 1], fingers: ['1', '1', '2', '3', '4', '1'] },
      'G': { frets: [3, 2, 0, 0, 3, 3], fingers: ['3', '2', '', '', '4', '4'] },
      'Dm': { frets: [0, 0, 0, 2, 3, 1], fingers: ['', '', '', '1', '3', '2'] },
      'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: ['', '2', '3', '', '', ''] }
    }
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('song-tutorial');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('練習')) {
      onNavigate('song-practice');
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
      <div className="song-page childhood-theme">
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
            <span className="difficulty intermediate">中級</span>
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

          <div className="nostalgia-section">
            <h2>🎭 懷舊回憶</h2>
            <div className="nostalgia-facts">
              <div className="fact-item">
                <span className="fact-icon">📚</span>
                <span className="fact-text">羅大佑的經典代表作之一</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎸</span>
                <span className="fact-text">使用民謠吉他風格演奏</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">💫</span>
                <span className="fact-text">描述學生時代的美好回憶</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🎵</span>
                <span className="fact-text">旋律優美，適合練習情感表達</span>
              </div>
            </div>
          </div>

          <div className="difficulty-note">
            <h3>⚠️ 中級難度提醒</h3>
            <p>這首歌包含較多和弦變化，建議先熟練基本和弦後再練習。</p>
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

export default SongChildhoodPage;