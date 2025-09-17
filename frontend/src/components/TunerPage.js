import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './TunerPage.css';

function TunerPage({ onNavigate }) {
  const [currentString, setCurrentString] = useState(0);
  const [tuningStatus, setTuningStatus] = useState(Array(6).fill(false));
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 新增音量顯示
  const [userName] = useState(localStorage.getItem('userName') || '用戶');
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);

  // 吉他六弦的標準頻率 (Hz)
  const stringFrequencies = [
    { note: 'E', frequency: 82.41, string: 6 },   // 第六弦 (最粗)
    { note: 'A', frequency: 110.00, string: 5 },  // 第五弦
    { note: 'D', frequency: 146.83, string: 4 },  // 第四弦
    { note: 'G', frequency: 196.00, string: 3 },  // 第三弦
    { note: 'B', frequency: 246.94, string: 2 },  // 第二弦
    { note: 'E', frequency: 329.63, string: 1 }   // 第一弦 (最細)
  ];

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      console.log('請求麥克風權限...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      console.log('麥克風權限獲得，初始化音頻上下文...');
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100
      });
      
      // 確保音頻上下文處於運行狀態
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // 改進分析器設置，專門針對吉他頻率
      analyserRef.current.fftSize = 16384; // 更大的FFT尺寸提高低頻解析度
      analyserRef.current.smoothingTimeConstant = 0.1; // 減少平滑化，提高響應速度
      analyserRef.current.minDecibels = -80; // 降低最小分貝閾值
      analyserRef.current.maxDecibels = -20; // 調整最大分貝閾值
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Float32Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      console.log('開始音頻分析，FFT大小:', analyserRef.current.fftSize);
      console.log('緩衝區長度:', bufferLength);
      detectPitch();
    } catch (err) {
      console.error('無法訪問麥克風:', err);
      alert(`請允許訪問麥克風以使用調音功能。錯誤: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setFrequency(0);
    setAudioLevel(0);
  };

  const detectPitch = () => {
    if (!analyserRef.current || !isListening) return;

    // 使用Float32Array獲得更精確的頻域數據
    analyserRef.current.getFloatFrequencyData(dataArrayRef.current);
    
    // 改進的音高檢測算法
    const sampleRate = audioContextRef.current.sampleRate;
    const nyquist = sampleRate / 2;
    const bufferLength = dataArrayRef.current.length;
    
    // 尋找吉他頻率範圍內的峰值 (70Hz - 450Hz)
    const minFreq = 70;
    const maxFreq = 450;
    const minIndex = Math.floor((minFreq / nyquist) * bufferLength);
    const maxIndexRange = Math.floor((maxFreq / nyquist) * bufferLength);
    
    // 找到最強的頻率峰值
    let peaks = [];
    for (let i = minIndex + 1; i < maxIndexRange - 1; i++) {
      if (dataArrayRef.current[i] > dataArrayRef.current[i-1] && 
          dataArrayRef.current[i] > dataArrayRef.current[i+1] &&
          dataArrayRef.current[i] > -50) { // 調整閾值到-50dB
        const freq = (i * nyquist) / bufferLength;
        peaks.push({ index: i, magnitude: dataArrayRef.current[i], frequency: freq });
      }
    }
    
    // 按強度排序峰值
    peaks.sort((a, b) => b.magnitude - a.magnitude);
    
    if (peaks.length > 0) {
      const strongestPeak = peaks[0];
      setAudioLevel(strongestPeak.magnitude);
      
      // 使用二次插值提高頻率精度
      const index = strongestPeak.index;
      if (index > 0 && index < bufferLength - 1) {
        const y1 = dataArrayRef.current[index - 1];
        const y2 = dataArrayRef.current[index];
        const y3 = dataArrayRef.current[index + 1];
        
        // 拋物線插值
        const a = (y1 - 2 * y2 + y3) / 2;
        const b = (y3 - y1) / 2;
        
        if (a !== 0) {
          const peakOffset = -b / (2 * a);
          const interpolatedIndex = index + peakOffset;
          const interpolatedFreq = (interpolatedIndex * nyquist) / bufferLength;
          
          setFrequency(interpolatedFreq);
          console.log(`檢測到頻率: ${interpolatedFreq.toFixed(2)} Hz, 強度: ${strongestPeak.magnitude.toFixed(1)} dB`);
          
          // 檢查是否接近目標頻率 (放寬容差)
          const targetFreq = stringFrequencies[currentString].frequency;
          const tolerance = 8; // 放寬容差到 8Hz
          
          if (Math.abs(interpolatedFreq - targetFreq) < tolerance) {
            markStringAsTuned(currentString);
          }
        }
      }
    } else {
      // 沒有檢測到明顯峰值
      const maxDb = Math.max(...dataArrayRef.current.slice(minIndex, maxIndexRange));
      setAudioLevel(maxDb);
      if (maxDb < -70) {
        console.log(`請彈奏第${currentString + 1}弦 - 音量太低: ${maxDb.toFixed(1)} dB`);
      } else {
        console.log(`未檢測到清晰的音高峰值，最大強度: ${maxDb.toFixed(1)} dB`);
      }
    }
    
    if (isListening) {
      requestAnimationFrame(detectPitch);
    }
  };

  const markStringAsTuned = (stringIndex) => {
    const newStatus = [...tuningStatus];
    newStatus[stringIndex] = true;
    setTuningStatus(newStatus);
    
    // 如果所有弦都調好了
    if (newStatus.every(status => status)) {
      setTimeout(() => {
        completeTuning();
      }, 1000);
    } else {
      // 自動移動到下一條弦
      setTimeout(() => {
        if (stringIndex < 5) {
          setCurrentString(stringIndex + 1);
        }
      }, 1500);
    }
  };

  const completeTuning = () => {
    localStorage.setItem('hasCompletedTuning', 'true');
    stopListening();
    onNavigate('home');
  };

  const selectString = (index) => {
    setCurrentString(index);
  };

  const skipTuning = () => {
    localStorage.setItem('hasCompletedTuning', 'true');
    onNavigate('home');
  };

  const getTuningMessage = () => {
    const targetFreq = stringFrequencies[currentString].frequency;
    const diff = frequency - targetFreq;
    
    if (Math.abs(diff) < 5) {
      return { text: '完美！', color: '#4CAF50' };
    } else if (diff > 5) {
      return { text: '太高了，請放鬆弦', color: '#FF5722' };
    } else if (diff < -5) {
      return { text: '太低了，請拉緊弦', color: '#FF9800' };
    }
    return { text: '開始調音', color: '#2196F3' };
  };

  const currentStringInfo = stringFrequencies[currentString];
  const tuningMessage = getTuningMessage();
  const completedCount = tuningStatus.filter(status => status).length;

  return (
    <PhoneContainer>
      <div className="tuner-container">
        <div className="tuner-header">
          <div className="header-top">
            <button 
              className="back-btn"
              onClick={() => onNavigate('home')}
              title="返回主頁"
            >
              ← 返回
            </button>
            <h1>Hi {userName}！</h1>
          </div>
          <p>讓我們為您的吉他調音</p>
          <div className="progress-info">
            <span>{completedCount}/6 條弦已調好</span>
          </div>
        </div>

        <div className="string-selector">
          {stringFrequencies.map((string, index) => (
            <div
              key={index}
              className={`string-button ${currentString === index ? 'active' : ''} ${tuningStatus[index] ? 'tuned' : ''}`}
              onClick={() => selectString(index)}
            >
              <div className="string-number">{string.string}</div>
              <div className="string-note">{string.note}</div>
              {tuningStatus[index] && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>

        <div className="current-tuning">
          <div className="current-string-info">
            <h2>第 {currentStringInfo.string} 弦</h2>
            <p className="note-name">{currentStringInfo.note}</p>
            <p className="target-freq">{currentStringInfo.frequency.toFixed(2)} Hz</p>
          </div>

          <div className="frequency-display">
            <div className="detected-freq">
              {frequency > 0 ? frequency.toFixed(2) : '--'} Hz
            </div>
            <div 
              className="tuning-status"
              style={{ color: tuningMessage.color }}
            >
              {tuningMessage.text}
            </div>
            
            {/* 調試信息 */}
            <div className="debug-info" style={{ 
              fontSize: '12px', 
              color: '#ccc', 
              marginTop: '10px',
              textAlign: 'center' 
            }}>
              {isListening && (
                <>
                  <div>🎤 正在監聽音頻...</div>
                  <div>目標: {currentStringInfo.frequency.toFixed(2)} Hz</div>
                  <div>音量: {audioLevel.toFixed(1)} dB</div>
                  {frequency > 0 && (
                    <div>偏差: {(frequency - currentStringInfo.frequency).toFixed(2)} Hz</div>
                  )}
                  
                  {/* 音量條 */}
                  <div style={{ 
                    marginTop: '5px',
                    background: '#333',
                    height: '4px',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.max(0, Math.min(100, (audioLevel + 90) * 100 / 90))}%`,
                      height: '100%',
                      background: audioLevel > -60 ? '#4CAF50' : '#FF5722',
                      transition: 'width 0.1s'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>
                    {audioLevel > -60 ? '音量足夠 ✓' : '音量太低，請彈響琴弦'}
                  </div>
                </>
              )}
              {!isListening && <div>點擊開始調音按鈕</div>}
            </div>
          </div>

          <div className="tuning-controls">
            {!isListening ? (
              <button className="start-tuning-btn" onClick={startListening}>
                🎤 開始調音
              </button>
            ) : (
              <button className="stop-tuning-btn" onClick={stopListening}>
                ⏹ 停止調音
              </button>
            )}
          </div>
        </div>

        <div className="tuning-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(completedCount / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="tuner-footer">
          <button className="skip-btn" onClick={skipTuning}>
            跳過調音
          </button>
          
          {completedCount === 6 && (
            <button className="complete-btn" onClick={completeTuning}>
              完成設置
            </button>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default TunerPage;