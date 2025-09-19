import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhoneContainer from './PhoneContainer';
import './ChordLessonPage.css';

// 錄音秒數常數
const RECORD_SECONDS = 4;

// 和弦順序定義
const CHORD_SEQUENCE = ['C', 'G', 'F']; // 3個基本和弦

// 狀態管理的初始狀態
const initialState = {
  phase: 'intro', // intro → idle → recording → uploading → playing → done
  currentChord: '', // 當前要練習的和弦
  wholeChord: true, // true=整個和弦一起，false=逐弦練習
  currentString: null, // 當前要練的弦號 (1-6)
  completedChords: new Set(), // 已完成的和弦集合
  error: null,
  recordingTime: 0,
  audioLevel: 0,
  isPlayingInstruction: false
};

const ChordLessonPage = ({ onNavigate }) => {
  const [state, setState] = useState(initialState);
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const currentChordRef = useRef(''); // 跟踪最新的和弦狀態
  const currentStringRef = useRef(null); // 跟踪最新的弦狀態
  const wholeChordRef = useRef(true); // 跟踪是否為整和弦模式
  const audioLevelTimerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  // 取得用戶媒體流
  const getUserMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      setStream(mediaStream);
      streamRef.current = mediaStream;

      // 設置音量分析器
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      return mediaStream;
    } catch (error) {
      console.error('獲取麥克風權限失敗:', error);
      setState(prev => ({ ...prev, error: '無法存取麥克風' }));
      throw error;
    }
  }, []);

  // 開始錄音
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, phase: 'recording', recordingTime: 0, error: null }));
      
      let currentStream = streamRef.current;
      if (!currentStream) {
        currentStream = await getUserMedia();
      }

      audioChunksRef.current = [];
      
      // 尝试使用更兼容的音频格式
      let mimeType = 'audio/wav';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm;codecs=opus';
        }
      }
      
      console.log('使用音频格式:', mimeType);
      
      mediaRecorderRef.current = new MediaRecorder(currentStream, {
        mimeType: mimeType
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        uploadRecording(audioBlob);
      };

      mediaRecorderRef.current.start();

      // 錄音計時器
      recordingTimerRef.current = setInterval(() => {
        setState(prev => {
          const newTime = prev.recordingTime + 0.1;
          if (newTime >= RECORD_SECONDS) {
            clearInterval(recordingTimerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            return { ...prev, recordingTime: RECORD_SECONDS };
          }
          return { ...prev, recordingTime: newTime };
        });
      }, 100);

      // 音量檢測
      startAudioLevelDetection();

    } catch (error) {
      console.error('開始錄音失敗:', error);
      setState(prev => ({ ...prev, error: '錄音失敗', phase: 'idle' }));
    }
  }, [getUserMedia]);

  // 音量檢測
  const startAudioLevelDetection = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setState(prev => ({ ...prev, audioLevel: normalizedLevel }));
        
        if (audioLevelTimerRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectLevel);
        }
      }
    };

    audioLevelTimerRef.current = true;
    detectLevel();
  }, []);

  // 停止音量檢測
  const stopAudioLevelDetection = useCallback(() => {
    audioLevelTimerRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setState(prev => ({ ...prev, audioLevel: 0 }));
  }, []);

  // 上傳錄音
  const uploadRecording = useCallback(async (audioBlob) => {
    try {
      setState(prev => ({ ...prev, phase: 'uploading' }));
      stopAudioLevelDetection();

      const formData = new FormData();
      const currentChord = currentChordRef.current || 'AA';
      const wholeChord = wholeChordRef.current;
      const currentString = currentStringRef.current;
      
      // 在逐弦模式下，确保有弦号
      if (!wholeChord && !currentString) {
        console.error('逐弦模式下缺少弦号，取消上传');
        console.log('DEBUG: wholeChord =', wholeChord, 'currentString =', currentString);
        setState(prev => ({ 
          ...prev, 
          error: '系统正在切换到逐弦模式，请稍后再试',
          phase: 'idle'
        }));
        return;
      }
      
      formData.append('target_chord', currentChord);
      formData.append('whole_chord', wholeChord ? 1 : 0);
      formData.append('string', currentString ? String(currentString) : '');
      formData.append('audio_file', audioBlob, 'audio.webm');

      console.log('當前狀態 - currentChord ref:', currentChordRef.current);
      console.log('當前狀態 - wholeChord ref:', wholeChordRef.current);
      console.log('當前狀態 - currentString ref:', currentStringRef.current);
      console.log('發送請求:', {
        target_chord: currentChord,
        whole_chord: wholeChord ? 1 : 0,
        string: currentString ? String(currentString) : '',
        audioSize: audioBlob.size
      });

      const response = await fetch('http://127.0.0.1:8000/chord/chord-check', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('後端回應:', data);

      await processChordResponse(data);

    } catch (error) {
      console.error('上傳錄音失敗:', error);
      setState(prev => ({ 
        ...prev, 
        error: `上傳失敗: ${error.message}`,
        phase: 'idle'
      }));
    }
  }, [stopAudioLevelDetection]); // 移除狀態依賴，確保總是使用最新狀態

  // 處理和弦檢測回應
  const processChordResponse = useCallback(async (response) => {
    try {
      console.log('處理和弦回應:', response);
      console.log('更新前的 currentChord:', currentChordRef.current);

      // 更新 ref
      console.log('DEBUG: response.details?.next_string =', response.details?.next_string);
      console.log('DEBUG: response.next_string =', response.next_string);
      console.log('DEBUG: 更新前 currentStringRef.current =', currentStringRef.current);
      
      currentChordRef.current = response.target_chord;
      wholeChordRef.current = response.whole_chord === 1;
      currentStringRef.current = response.details?.next_string || response.next_string || null;
      
      console.log('DEBUG: 更新后 currentStringRef.current =', currentStringRef.current);
      
      // 更新狀態
      setState(prev => {
        console.log('狀態更新: currentChord 從', prev.currentChord, '到', response.target_chord);
        console.log('狀態更新: wholeChord 從', prev.wholeChord, '到', response.whole_chord === 1);
        console.log('狀態更新: currentString 從', prev.currentString, '到', response.details?.next_string || response.next_string);
        return {
          ...prev,
          currentChord: response.target_chord,
          wholeChord: response.whole_chord === 1,
          currentString: response.details?.next_string || response.next_string || null  // 修正：先检查 details，再检查根级别
        };
      });

      // 播放指導語音
      if (response.audio) {
        // 使用 Audio 函數直接從 frontend/public/audio/chord 播放
        let audioPath = response.audio;
        
        // 將後端返回的路徑轉換為前端可用的路徑
        if (audioPath.startsWith('audio/chord/')) {
          audioPath = `/${audioPath}`;
        } else if (audioPath.startsWith('frontend/public/')) {
          audioPath = audioPath.replace('frontend/public/', '/');
        } else if (!audioPath.startsWith('/')) {
          audioPath = `/${audioPath}`;
        }
        
        console.log('播放和弦指導音檔:', audioPath);
        const audio = new Audio(audioPath);
        
        // 播放音檔
        setState(prev => ({ ...prev, phase: 'playing' }));
        try {
          await new Promise((resolve, reject) => {
            audio.onended = () => {
              console.log('和弦指導音檔播放完成');
              // 确保状态更新后再允许录音
              setTimeout(() => {
                setState(prev => ({ ...prev, phase: 'idle' }));
              }, 100); // 等待 100ms 确保状态同步
              resolve();
            };
            audio.onerror = (error) => {
              console.error('和弦指導音檔播放失敗:', error);
              setState(prev => ({ ...prev, phase: 'idle' }));
              reject(error);
            };
            audio.play().catch(reject);
          });
        } catch (audioError) {
          console.error('音檔播放錯誤:', audioError);
          setState(prev => ({ ...prev, phase: 'idle' }));
          // 不阻止流程繼續
        }
      } else {
        // 沒有音檔時直接進入 idle 狀態
        setState(prev => ({ ...prev, phase: 'idle' }));
      }

      // 檢查是否完成課程
      if (response.finish_lesson) {
        console.log('🎉 和弦課程完成！');
        setState(prev => ({ ...prev, phase: 'done' }));
        setTimeout(() => {
          onNavigate('home');
        }, 3000);
        return;
      }

      // 檢查是否完成當前和弦
      if (response.details?.is_correct) {
        console.log(`✅ ${response.target_chord} 和弦完成`);
        setState(prev => ({
          ...prev,
          completedChords: new Set([...prev.completedChords, response.target_chord])
        }));
      }

    } catch (error) {
      console.error('處理回應失敗:', error);
      setState(prev => ({ 
        ...prev, 
        error: '處理回應失敗',
        phase: 'idle'
      }));
    }
  }, [onNavigate]);

  // 初始化
  const initializeLesson = useCallback(async () => {
    try {
      console.log('初始化和弦課程...');
      setState(prev => ({ ...prev, phase: 'intro' }));

      // 發送初始化請求 (target_chord = "AA")
      const formData = new FormData();
      formData.append('target_chord', 'AA');
      formData.append('whole_chord', 1);
      formData.append('string', '');
      
      // 創建空的音檔 Blob
      const emptyBlob = new Blob([], { type: 'audio/webm;codecs=opus' });
      formData.append('audio_file', emptyBlob, 'empty.webm');

      const response = await fetch('http://127.0.0.1:8000/chord/chord-check', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`初始化失敗: ${response.status}`);
      }

      const data = await response.json();
      console.log('初始化回應:', data);

      await processChordResponse(data);

    } catch (error) {
      console.error('初始化失敗:', error);
      setState(prev => ({ 
        ...prev, 
        error: '初始化失敗',
        phase: 'idle',
        currentChord: 'C' // 預設第一個和弦
      }));
    }
  }, [processChordResponse]);

  // 組件初始化
  useEffect(() => {
    initializeLesson();
    getUserMedia();

    return () => {
      // 清理資源
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      stopAudioLevelDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initializeLesson, getUserMedia, stopAudioLevelDetection]);

  // 清除錯誤
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 計算進度
  const getProgress = () => {
    return (state.completedChords.size / CHORD_SEQUENCE.length) * 100;
  };

  // 取得當前提示文字
  const getCurrentInstruction = () => {
    if (state.phase === 'intro') {
      return '正在初始化...';
    }
    if (state.phase === 'done') {
      return '🎉 恭喜完成和弦練習！';
    }
    if (!state.currentChord) {
      return '準備中...';
    }
    
    if (state.wholeChord) {
      return `請彈奏 ${state.currentChord} 和弦 (一次刷完整和弦)`;
    } else {
      return `請練習 ${state.currentChord} 和弦第 ${state.currentString} 弦`;
    }
  };

  return (
    <PhoneContainer>
      <div className="chord-lesson-container">
        {/* Header */}
        <div className="chord-lesson-header">
          <div className="header-top">
            <button 
              className="back-btn" 
              onClick={() => onNavigate('home')}
              disabled={state.phase === 'recording' || state.phase === 'uploading'}
            >
              ← 返回
            </button>
          </div>
          <h1>基本和弦練習</h1>
          <p>完成 3 個基本和弦的練習</p>
        </div>

        {/* 進度指示器 */}
        <div className="chord-lesson-progress">
          <div className="progress-header">
            <span>進度: {state.completedChords.size}/3</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <div className="chords-status">
            {CHORD_SEQUENCE.map((chord, index) => (
              <div 
                key={chord}
                className={`chord-indicator ${
                  state.completedChords.has(chord) ? 'completed' : 
                  state.currentChord === chord ? 'current' : 'pending'
                }`}
              >
                {chord}
              </div>
            ))}
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="chord-lesson-content">
          {/* 當前和弦顯示 */}
          <div className="chord-display">
            <div className="chord-name">
              {state.currentChord || '---'}
            </div>
            <div className="instruction">
              {getCurrentInstruction()}
            </div>
          </div>

          {/* 錄音控制區域 */}
          <div className="recording-controls">
            {state.phase === 'idle' && (
              <button 
                className="record-btn" 
                onClick={startRecording}
              >
                🎤 開始錄音
              </button>
            )}

            {state.phase === 'recording' && (
              <div className="recording-status">
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                  <span>錄音中... {state.recordingTime.toFixed(1)}s</span>
                </div>
                <div className="audio-level-container">
                  <div 
                    className="audio-level-bar" 
                    style={{ width: `${state.audioLevel * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {state.phase === 'uploading' && (
              <div className="uploading-status">
                <div className="loading-spinner"></div>
                <span>分析中...</span>
              </div>
            )}

            {state.phase === 'playing' && (
              <div className="playing-status">
                <div className="playing-indicator">
                  <div className="playing-waves">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>播放中...</span>
                </div>
              </div>
            )}

            {state.phase === 'done' && (
              <div className="completion-status">
                <div className="completion-icon">🎉</div>
                <div className="completion-text">
                  <h3>恭喜完成！</h3>
                  <p>你已經掌握了基本和弦</p>
                  <p>3秒後返回首頁...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 錯誤提示 */}
        {state.error && (
          <div className="error-toast" onClick={clearError}>
            <span>⚠️ {state.error}</span>
            <button className="close-btn">×</button>
          </div>
        )}
      </div>
    </PhoneContainer>
  );
};

export default ChordLessonPage;