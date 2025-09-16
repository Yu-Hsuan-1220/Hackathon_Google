import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './MetronomePage.css';

function MetronomePage({ onNavigate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beat, setBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(4);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // 語音命令處理
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('開始') || lowerCommand.includes('播放')) {
      startMetronome();
    } else if (lowerCommand.includes('停止') || lowerCommand.includes('暫停')) {
      stopMetronome();
    } else if (lowerCommand.includes('快一點') || lowerCommand.includes('加速')) {
      setBpm(prev => Math.min(prev + 10, 200));
    } else if (lowerCommand.includes('慢一點') || lowerCommand.includes('減速')) {
      setBpm(prev => Math.max(prev - 10, 60));
    } else if (lowerCommand.includes('返回') || lowerCommand.includes('主頁')) {
      onNavigate('home');
    }
  };

  useEffect(() => {
    // 創建音頻上下文
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = (isAccent = false) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // 重音節拍使用較高音頻
    oscillator.frequency.setValueAtTime(
      isAccent ? 800 : 600, 
      audioContextRef.current.currentTime
    );
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01, 
      audioContextRef.current.currentTime + 0.1
    );
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  const startMetronome = () => {
    setIsPlaying(true);
    setBeat(0);
    
    intervalRef.current = setInterval(() => {
      setBeat(prevBeat => {
        const newBeat = (prevBeat + 1) % timeSignature;
        playClick(newBeat === 0); // 第一拍為重音
        return newBeat;
      });
    }, (60 / bpm) * 1000);
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    setBeat(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleBpmChange = (newBpm) => {
    setBpm(newBpm);
    if (isPlaying) {
      stopMetronome();
      setTimeout(() => startMetronome(), 100);
    }
  };

  const presetTempos = [
    { name: '慢板', bpm: 60, description: '適合初學者練習' },
    { name: '中板', bpm: 100, description: '一般練習速度' },
    { name: '快板', bpm: 140, description: '進階練習' },
    { name: '急板', bpm: 180, description: '挑戰速度' }
  ];

  return (
    <PhoneContainer 
      title="⏱️ 節拍器"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="metronome-content">
        <div className="metronome-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ← 返回
          </button>
        </div>

        {/* 第一排：滑動條控制 */}
        <div className="row-1-controls">
          <h3>速度控制</h3>
          <div className="bpm-control">
            <button 
              className="bpm-btn"
              onClick={() => handleBpmChange(Math.max(40, bpm - 5))}
            >
              -5
            </button>
            <button 
              className="bpm-btn"
              onClick={() => handleBpmChange(Math.max(40, bpm - 1))}
            >
              -1
            </button>
            <input 
              type="range"
              min="40"
              max="200"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="bpm-slider"
            />
            <button 
              className="bpm-btn"
              onClick={() => handleBpmChange(Math.min(200, bpm + 1))}
            >
              +1
            </button>
            <button 
              className="bpm-btn"
              onClick={() => handleBpmChange(Math.min(200, bpm + 5))}
            >
              +5
            </button>
          </div>
        </div>

        {/* 第二排：BPM 顯示 */}
        <div className="row-2-display">
          <div className="bpm-display">
            <span className="bpm-number">{bpm}</span>
            <span className="bpm-label">BPM</span>
          </div>
          
          <div className="beat-indicator">
            {Array.from({ length: timeSignature }, (_, index) => (
              <div 
                key={index}
                className={`beat-dot ${beat === index ? 'active' : ''} ${index === 0 ? 'accent' : ''}`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div className="control-buttons">
            <button 
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={isPlaying ? stopMetronome : startMetronome}
            >
              {isPlaying ? '⏸️ 停止' : '▶️ 開始'}
            </button>

            <div className="time-signature-control">
              <label>拍號:</label>
              <select 
                value={timeSignature} 
                onChange={(e) => setTimeSignature(parseInt(e.target.value))}
                disabled={isPlaying}
              >
                <option value={3}>3/4</option>
                <option value={4}>4/4</option>
                <option value={6}>6/8</option>
              </select>
            </div>
          </div>
        </div>

        {/* 第三排：常用速度 */}
        <div className="row-3-presets">
          <h3>常用速度</h3>
          <div className="preset-grid">
            {presetTempos.map((preset) => (
              <div 
                key={preset.name}
                className="preset-card"
                onClick={() => handleBpmChange(preset.bpm)}
              >
                <div className="preset-name">{preset.name}</div>
                <div className="preset-bpm">{preset.bpm} BPM</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default MetronomePage;