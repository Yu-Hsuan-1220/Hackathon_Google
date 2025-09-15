import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './SongPracticePage.css';

function SongPracticePage({ onNavigate }) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChord, setCurrentChord] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tempo, setTempo] = useState(80);
  const [practiceMode, setPracticeMode] = useState('chords'); // 'chords' or 'full'
  const [score, setScore] = useState(0);
  const intervalRef = useRef(null);

  // 語音命令處理
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('開始') || lowerCommand.includes('播放')) {
      handleStart();
    } else if (lowerCommand.includes('停止') || lowerCommand.includes('暫停')) {
      handleStop();
    } else if (lowerCommand.includes('重新開始') || lowerCommand.includes('重置')) {
      handleReset();
    } else if (lowerCommand.includes('快一點') || lowerCommand.includes('加速')) {
      setTempo(prev => Math.min(prev + 10, 150));
    } else if (lowerCommand.includes('慢一點') || lowerCommand.includes('減速')) {
      setTempo(prev => Math.max(prev - 10, 40));
    } else if (lowerCommand.includes('返回') || lowerCommand.includes('主頁')) {
      if (selectedSong) {
        setSelectedSong(null);
      } else {
        onNavigate('home');
      }
    } else if (lowerCommand.includes('小星星')) {
      setSelectedSong(practiceSongs.find(s => s.title === '小星星'));
    } else if (lowerCommand.includes('生日')) {
      setSelectedSong(practiceSongs.find(s => s.title === '生日快樂'));
    }
  };

  // 播放控制函數
  const handleStart = () => {
    if (selectedSong) {
      setIsPlaying(true);
      setCurrentChord(0);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentChord(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const practiceSongs = [
    {
      id: 1,
      title: '小星星',
      chords: ['C', 'C', 'F', 'F', 'G', 'G', 'C', 'C'],
      duration: 16, // 總拍數
      difficulty: 'beginner'
    },
    {
      id: 2,
      title: '生日快樂',
      chords: ['C', 'C', 'F', 'C', 'C', 'G7', 'G7', 'C'],
      duration: 16,
      difficulty: 'beginner'
    },
    {
      id: 3,
      title: '童年',
      chords: ['G', 'C', 'D', 'G', 'Em', 'C', 'D', 'G'],
      duration: 16,
      difficulty: 'intermediate'
    }
  ];

  const chordDiagrams = {
    'C': {
      frets: [0, 1, 0, 2, 3, 0],
      fingers: ['', '1', '', '2', '3', '']
    },
    'F': {
      frets: [1, 1, 2, 3, 3, 1],
      fingers: ['1', '1', '2', '3', '4', '1']
    },
    'G': {
      frets: [3, 2, 0, 0, 3, 3],
      fingers: ['3', '2', '', '', '4', '4']
    },
    'G7': {
      frets: [3, 2, 0, 0, 0, 1],
      fingers: ['3', '2', '', '', '', '1']
    },
    'Am': {
      frets: [0, 0, 2, 2, 1, 0],
      fingers: ['', '', '2', '3', '1', '']
    },
    'Em': {
      frets: [0, 2, 2, 0, 0, 0],
      fingers: ['', '2', '3', '', '', '']
    },
    'D': {
      frets: [2, 0, 0, 2, 3, 2],
      fingers: ['1', '', '', '2', '3', '4']
    }
  };

  useEffect(() => {
    if (isPlaying && selectedSong) {
      const beatDuration = (60 / tempo) * 1000; // 每拍的毫秒數
      const chordDuration = beatDuration * 2; // 每個和弦持續2拍

      intervalRef.current = setInterval(() => {
        setCurrentChord(prev => {
          const next = (prev + 1) % selectedSong.chords.length;
          setProgress(((prev + 1) / selectedSong.chords.length) * 100);
          return next;
        });
      }, chordDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, selectedSong, tempo]);

  const startPractice = (song) => {
    setSelectedSong(song);
    setCurrentChord(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const pausePractice = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPractice = () => {
    setIsPlaying(false);
    setCurrentChord(0);
    setProgress(0);
  };

  const resetPractice = () => {
    setSelectedSong(null);
    setIsPlaying(false);
    setCurrentChord(0);
    setProgress(0);
    setScore(0);
  };

  const renderChordDiagram = (chordName) => {
    const chord = chordDiagrams[chordName];
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
                    <div className="finger">
                      {chord.fingers[string]}
                    </div>
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

  if (selectedSong) {
    return (
      <PhoneContainer 
        title={`🎯 練習 - ${selectedSong.title}`}
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="practice-interface">
          <div className="practice-nav">
            <button 
              className="back-button"
              onClick={resetPractice}
            >
              ← 選擇其他歌曲
            </button>
          </div>

          <div className="song-info">
            <h2>正在練習：{selectedSong.title}</h2>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <div className="progress-text">
              進度: {Math.round(progress)}%
            </div>
          </div>

          <div className="current-chord-display">
            <h3>當前和弦</h3>
            <div className="chord-container">
              {renderChordDiagram(selectedSong.chords[currentChord])}
            </div>
          </div>

          <div className="chord-sequence">
            <h3>和弦進行</h3>
            <div className="chord-list">
              {selectedSong.chords.map((chord, index) => (
                <div 
                  key={index}
                  className={`chord-item ${index === currentChord ? 'active' : ''} ${index < currentChord ? 'completed' : ''}`}
                >
                  {chord}
                </div>
              ))}
            </div>
          </div>

          <div className="practice-controls">
            <div className="tempo-control">
              <label>速度: {tempo} BPM</label>
              <input 
                type="range"
                min="60"
                max="140"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                disabled={isPlaying}
              />
            </div>

            <div className="control-buttons">
              <button 
                className={`play-button ${isPlaying ? 'playing' : ''}`}
                onClick={pausePractice}
              >
                {isPlaying ? '⏸️ 暫停' : '▶️ 播放'}
              </button>
              <button 
                className="stop-button"
                onClick={stopPractice}
              >
                ⏹️ 停止
              </button>
            </div>
          </div>

          <div className="practice-tips">
            <h3>練習建議</h3>
            <div className="tips-list">
              <div className="tip">💡 跟隨節拍，不要急躁</div>
              <div className="tip">🎯 專注於和弦轉換的流暢性</div>
              <div className="tip">🎵 可以配合哼唱旋律</div>
            </div>
          </div>
        </div>
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer 
      title="🎤 歌曲練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="practice-content">
        <div className="practice-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ←
          </button>
        </div>

        <div className="practice-intro">
          <h2>選擇要練習的歌曲</h2>
          <p>跟隨節拍練習和弦轉換，提升你的演奏技巧</p>
          
          {/* 練習模式選擇 */}
          <div className="practice-mode-selector">
            <h4>練習模式:</h4>
            <div className="mode-buttons">
              <button 
                className={`mode-btn ${practiceMode === 'chords' ? 'active' : ''}`}
                onClick={() => setPracticeMode('chords')}
              >
                🎸 和弦練習
              </button>
              <button 
                className={`mode-btn ${practiceMode === 'full' ? 'active' : ''}`}
                onClick={() => setPracticeMode('full')}
              >
                🎵 完整演奏
              </button>
            </div>
          </div>
        </div>

        <div className="songs-grid">
          {practiceSongs.map((song) => (
            <div 
              key={song.id} 
              className="practice-song-card"
              onClick={() => startPractice(song)}
            >
              <div className="song-header">
                <h3>{song.title}</h3>
                <span className={`difficulty ${song.difficulty}`}>
                  {song.difficulty === 'beginner' ? '初級' : '中級'}
                </span>
              </div>
              
              <div className="chord-preview">
                <h4>和弦進行：</h4>
                <div className="chord-list-preview">
                  {song.chords.map((chord, index) => (
                    <span key={index} className="chord-preview-item">
                      {chord}
                    </span>
                  ))}
                </div>
              </div>

              <div className="song-stats">
                <div className="stat">
                  <span className="stat-label">時長:</span>
                  <span className="stat-value">{song.duration} 拍</span>
                </div>
                <div className="stat">
                  <span className="stat-label">和弦數:</span>
                  <span className="stat-value">{song.chords.length}</span>
                </div>
              </div>

              <button className="start-practice-btn">
                🎯 開始練習
              </button>
            </div>
          ))}
        </div>

        <div className="practice-stats">
          <h3>練習統計</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{score}</div>
              <div className="stat-label">當前分數</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">完成歌曲</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">89%</div>
              <div className="stat-label">平均準確率</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2.5h</div>
              <div className="stat-label">練習時間</div>
            </div>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongPracticePage;