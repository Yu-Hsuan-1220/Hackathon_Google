import React, { useState, useEffect, useRef, useReducer } from 'react';
import PhoneContainer from './PhoneContainer';
import './TunerPage.css';

// 錄音秒數常數
const RECORD_SECONDS = 4;

// 弦序資料
const stringData = [
  { string: 1, note: 'E', frequency: 329.63 },
  { string: 2, note: 'B', frequency: 246.94 },
  { string: 3, note: 'G', frequency: 196.00 },
  { string: 4, note: 'D', frequency: 146.83 },
  { string: 5, note: 'A', frequency: 110.00 },
  { string: 6, note: 'E', frequency: 82.41 }
];

/**
 * @typedef {Object} TuningResponse
 * @property {boolean} tuning_status
 * @property {number} string_num
 * @property {boolean} tuning_finish
 * @property {number} cents_error
 * @property {string} [instruction_url]
 * @property {string} [instruction_base64]
 * @property {ArrayBuffer} [instruction_arraybuffer]
 */

// 狀態管理
const initialState = {
  phase: 'idle', // idle → intro → recording → uploading → playing → done
  currentString: 0, // 0=初始化, 1-6=各弦
  stringStatus: Array(6).fill('untested'), // untested, correct, retry
  recordingTime: 0,
  audioLevel: 0,
  error: null,
  isPlayingInstruction: false,
  centsError: 0 // 新增：存儲音準誤差
};

function tuningReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_CURRENT_STRING':
      return { ...state, currentString: action.payload };
    case 'SET_STRING_STATUS':
      const newStatus = [...state.stringStatus];
      newStatus[action.stringIndex] = action.status;
      return { ...state, stringStatus: newStatus };
    case 'SET_RECORDING_TIME':
      return { ...state, recordingTime: action.payload };
    case 'SET_AUDIO_LEVEL':
      return { ...state, audioLevel: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLAYING_INSTRUCTION':
      return { ...state, isPlayingInstruction: action.payload };
    case 'SET_CENTS_ERROR':
      return { ...state, centsError: action.payload };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

function TunerPage({ onNavigate }) {
  const [state, dispatch] = useReducer(tuningReducer, initialState);
  const [userName] = useState(localStorage.getItem('userName') || '用戶');

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioLevelTimerRef = useRef(null);
  const currentAudioRef = useRef(null);

  // 初始化：進入頁面自動送出 string_num=0
  useEffect(() => {
    initializeTuning();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (audioLevelTimerRef.current) clearInterval(audioLevelTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  const initializeTuning = async () => {
    try {
      dispatch({ type: 'SET_PHASE', payload: 'intro' });
      dispatch({ type: 'RESET_ERROR' });

      // 創建空白音檔以符合 API 要求
      const emptyBlob = new Blob([new ArrayBuffer(1024)], { type: 'audio/webm;codecs=opus' });

      console.log('🎵 初始化調音器...');
      const response = await sendTuningRequest(0, emptyBlob);

      if (response) {
        await playInstructionAudio(response);
        dispatch({ type: 'SET_PHASE', payload: 'idle' });
        // 後端返回string_num="6"表示從第6弦開始
        const startString = parseInt(response.string_num);
        if (startString > 0 && startString <= 6) {
          dispatch({ type: 'SET_CURRENT_STRING', payload: startString });
        } else {
          // 預設從第6弦開始（標準調音順序）
          dispatch({ type: 'SET_CURRENT_STRING', payload: 6 });
        }
      }
    } catch (error) {
      console.error('初始化失敗:', error);
      dispatch({ type: 'SET_ERROR', payload: '初始化失敗，請重試' });
      dispatch({ type: 'SET_PHASE', payload: 'idle' });
      // 發生錯誤時預設從第6弦開始
      dispatch({ type: 'SET_CURRENT_STRING', payload: 6 });
    }
  };

  const sendTuningRequest = async (stringNum, audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('string_num', String(stringNum));
      formData.append('file', audioBlob, `string-${stringNum}.webm`);

      console.log(`📡 發送調音請求 - 弦號: ${stringNum}`);

      const response = await fetch('http://127.0.0.1:8000/tuner/tuner', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 收到回應:', data);
      return data;

    } catch (error) {
      console.error('API 請求失敗:', error);
      if (error.message.includes('fetch')) {
        throw new Error('網路連接失敗，請檢查後端服務');
      }
      throw error;
    }
  };

  const playInstructionAudio = async (response) => {
    try {
      dispatch({ type: 'SET_PLAYING_INSTRUCTION', payload: true });

      // 從後端回應中獲取音檔路徑
      let audioPath = response.audio_path;

      if (!audioPath) {
        throw new Error('沒有找到音檔路徑');
      }

      // 轉換後端路徑為前端可用路徑
      // 後端返回: "audio/tuner/xxx.wav" -> 前端使用: "/audio/tuner/xxx.wav"
      if (!audioPath.startsWith('/')) {
        audioPath = '/' + audioPath;
      }

      console.log('🎵 播放音檔路徑:', audioPath);

      const audio = new Audio(audioPath);
      currentAudioRef.current = audio;

      console.log('▶️ 播放指示音檔');

      audio.onended = () => {
        console.log('✅ 指示音檔播放完成');
        dispatch({ type: 'SET_PLAYING_INSTRUCTION', payload: false });
        currentAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('🔊 音檔播放錯誤:', e);
        console.error('錯誤的音檔路徑:', audioPath);
        dispatch({ type: 'SET_PLAYING_INSTRUCTION', payload: false });
        dispatch({ type: 'SET_ERROR', payload: '音檔播放失敗' });
        currentAudioRef.current = null;
      };

      await audio.play();

    } catch (error) {
      console.error('播放指示音檔失敗:', error);
      dispatch({ type: 'SET_PLAYING_INSTRUCTION', payload: false });
      dispatch({ type: 'SET_ERROR', payload: '無法播放語音指示' });
    }
  };

  const startRecording = async () => {
    try {
      dispatch({ type: 'RESET_ERROR' });

      console.log('🎤 請求麥克風權限...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 24000
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🎤 錄音結束');
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus'
        });

        console.log('📦 音檔大小:', audioBlob.size, 'bytes');
        uploadRecording(audioBlob);
      };

      dispatch({ type: 'SET_PHASE', payload: 'recording' });
      dispatch({ type: 'SET_RECORDING_TIME', payload: 0 });

      mediaRecorder.start();
      console.log(`🎤 開始錄音 ${RECORD_SECONDS} 秒...`);

      // 錄音計時器
      let currentTime = 0;
      recordingTimerRef.current = setInterval(() => {
        currentTime += 0.1;
        dispatch({ type: 'SET_RECORDING_TIME', payload: currentTime });
        if (currentTime >= RECORD_SECONDS) {
          stopRecording();
        }
      }, 100);

      // 音量監測
      startAudioLevelMonitoring(stream);

    } catch (error) {
      console.error('錄音失敗:', error);
      if (error.name === 'NotAllowedError') {
        dispatch({ type: 'SET_ERROR', payload: '請允許麥克風權限以進行調音' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: '無法啟動錄音功能' });
      }
      dispatch({ type: 'SET_PHASE', payload: 'idle' });
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (audioLevelTimerRef.current) {
      clearInterval(audioLevelTimerRef.current);
      audioLevelTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startAudioLevelMonitoring = (stream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      audioLevelTimerRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        dispatch({ type: 'SET_AUDIO_LEVEL', payload: average });
      }, 100);

    } catch (error) {
      console.error('音量監測失敗:', error);
    }
  };

  const uploadRecording = async (audioBlob) => {
    try {
      dispatch({ type: 'SET_PHASE', payload: 'uploading' });

      const response = await sendTuningRequest(state.currentString, audioBlob);

      if (response) {
        // 儲存cents_error用於UI顯示
        if (typeof response.cents_error === 'number') {
          dispatch({ type: 'SET_CENTS_ERROR', payload: response.cents_error });
        }

        // 更新弦的狀態
        const status = response.tuning_status ? 'correct' : 'retry';
        dispatch({
          type: 'SET_STRING_STATUS',
          stringIndex: state.currentString - 1,
          status
        });

        dispatch({ type: 'SET_PHASE', payload: 'playing' });
        await playInstructionAudio(response);

        // 根據結果決定下一步
        if (response.tuning_finish) {
          // 調音完成
          dispatch({ type: 'SET_PHASE', payload: 'done' });
          setTimeout(() => {
            onNavigate('home');
          }, 3000);
        } else if (response.tuning_status) {
          // 調對了，根據後端返回的string_num決定下一弦
          // 後端會返回下一弦的號碼 (從6到1)
          const nextString = parseInt(response.string_num);
          if (nextString > 0 && nextString <= 6 && nextString !== state.currentString) {
            dispatch({ type: 'SET_CURRENT_STRING', payload: nextString });
          }
          dispatch({ type: 'SET_PHASE', payload: 'idle' });
        } else {
          // 調錯了，停留同一弦
          dispatch({ type: 'SET_PHASE', payload: 'idle' });
        }
      }

    } catch (error) {
      console.error('上傳錄音失敗:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PHASE', payload: 'idle' });
    }
  };

  const getDirectionHint = (centsError) => {
    if (centsError > 0) {
      return { text: '音太高，請放鬆弦', color: '#FF5722' };
    } else if (centsError < 0) {
      return { text: '音太低，請拉緊弦', color: '#FF9800' };
    }
    return { text: '音準正確', color: '#4CAF50' };
  };

  const getPhaseText = () => {
    switch (state.phase) {
      case 'idle':
        return `請彈第 ${state.currentString} 弦 (${stringData[state.currentString - 1]?.note})`;
      case 'intro':
        return '正在初始化調音器...';
      case 'recording':
        return `錄音中... ${state.recordingTime.toFixed(1)}/${RECORD_SECONDS}s`;
      case 'uploading':
        return '正在分析音準...';
      case 'playing':
        return '播放語音指示中...';
      case 'done':
        return '調音完成！即將返回主頁...';
      default:
        return '準備中...';
    }
  };

  const canStartRecording = () => {
    return state.phase === 'idle' && !state.isPlayingInstruction && state.currentString > 0;
  };

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
          <p>智能調音器 - 跟著語音指示調音</p>
          <div className="progress-info">
            請彈 {state.currentString} 弦 ({stringData[state.currentString - 1]?.note || 'E'})
          </div>
        </div>

        {/* 弦位選擇器 */}
        <div className="string-selector">
          {stringData.map((string, index) => (
            <div
              key={index}
              className={`string-button ${state.currentString === string.string ? 'active' : ''
                } ${state.stringStatus[index] === 'correct' ? 'tuned' : ''}`}
            >
              <div className="string-number">{string.string}</div>
              <div className="string-note">{string.note}</div>
              {state.stringStatus[index] === 'correct' && (
                <span className="check-mark">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* 當前調音狀態 */}
        <div className="current-tuning">
          <div className="current-string-info">
            <h2>調彈第 {state.currentString} 弦</h2>
            <div className="note-name">
              {stringData[state.currentString - 1]?.note || 'E'}
            </div>
            <div className="target-freq">
              目標頻率: {stringData[state.currentString - 1]?.frequency || 82.41} Hz
            </div>
          </div>

          <div className="frequency-display">
            <div className="detected-freq">
              {state.phase === 'recording' && `音量: ${Math.round(state.audioLevel)}%`}
              {state.centsError !== 0 && state.phase === 'idle' && (
                `誤差: ${state.centsError > 0 ? '+' : ''}${state.centsError.toFixed(1)} cents`
              )}
            </div>
          </div>

          <div className="tuning-status">
            {getPhaseText()}
          </div>
        </div>

        {/* 調音提示 */}
        {state.centsError !== 0 && state.currentString > 0 && state.phase === 'idle' && (
          <div className="frequency-display">
            <div
              className="detected-freq"
              style={{ color: getDirectionHint(state.centsError).color }}
            >
              {getDirectionHint(state.centsError).text}
            </div>
          </div>
        )}

        {/* 錄音進度條 */}
        {state.phase === 'recording' && (
          <div className="tuning-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(state.recordingTime / RECORD_SECONDS) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 錄音控制 */}
        <div className="tuning-controls">
          {canStartRecording() ? (
            <button
              className="start-tuning-btn"
              onClick={startRecording}
            >
              🎤 開始錄音 ({RECORD_SECONDS}秒)
            </button>
          ) : (
            <button
              className="stop-tuning-btn"
              disabled
            >
              {state.isPlayingInstruction ? '🔊 播放指示中...' :
                state.phase === 'recording' ? '🎤 錄音中...' :
                  state.phase === 'uploading' ? '⏳ 分析中...' :
                    '⏳ 請等待...'}
            </button>
          )}
        </div>

        {/* 錯誤顯示 */}
        {state.error && (
          <div className="frequency-display" style={{ background: 'rgba(244, 67, 54, 0.2)', padding: '10px', borderRadius: '8px' }}>
            <div className="detected-freq" style={{ color: '#f44336' }}>
              ⚠️ {state.error}
            </div>
            <button
              className="start-tuning-btn"
              style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }}
              onClick={() => dispatch({ type: 'RESET_ERROR' })}
            >
              關閉
            </button>
          </div>
        )}

        {/* 整體進度 */}
        <div className="tuning-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(state.stringStatus.filter(s => s === 'correct').length / 6) * 100}%`
              }}
            ></div>
          </div>
          <div className="frequency-display">
            <div className="detected-freq">
              {state.stringStatus.filter(s => s === 'correct').length}/6 弦已調好
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="tuner-footer">
          <button
            className="skip-btn"
            onClick={() => onNavigate('home')}
          >
            跳過調音
          </button>
          {state.stringStatus.filter(s => s === 'correct').length === 6 && (
            <button
              className="complete-btn"
              onClick={() => onNavigate('home')}
            >
              完成調音
            </button>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default TunerPage;