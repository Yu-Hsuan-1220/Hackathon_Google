import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhoneContainer from './PhoneContainer';
import './SingleNoteLessonPage.css';

// 錄音秒數常數
const RECORD_SECONDS = 4;

// 狀態管理的初始狀態
const initialState = {
  phase: 'intro', // intro → idle → recording → uploading → playing → done
  currentNote: '', // 當前要測試的音符
  answeredNotes: new Set(), // 已作答的音符集合
  questionResults: new Map(), // 每題的結果 Map<note, {success: boolean, attempts: number}>
  error: null,
  recordingTime: 0,
  audioLevel: 0,
  isPlayingInstruction: false
};

const SingleNoteLessonPage = ({ onNavigate, navigationSource }) => {
  const [state, setState] = useState(initialState);
  const [userName] = useState(localStorage.getItem('userName') || '用戶');
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);  // 新增 streamRef
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioLevelTimerRef = useRef(null);  // 新增
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const instructionAudioRef = useRef(new Audio());
  const hasInitialized = useRef(false); // 防止重複初始化
  const startRecordingRef = useRef(null); // 保存 startRecording 函數的引用

  // 播放指導語音
  const playInstructionAudio = useCallback(async (audioPath) => {
    return new Promise((resolve) => {
      setState(prev => ({ ...prev, phase: 'playing', isPlayingInstruction: true }));

      const audio = instructionAudioRef.current;

      // 停止現有播放並重置
      audio.pause();
      audio.currentTime = 0;

      // 處理音檔路徑 - 確保正確的前端路徑格式
      let finalAudioPath = audioPath;

      // 如果是後端返回的完整路徑，需要轉換
      if (audioPath && audioPath.startsWith('frontend/public/')) {
        finalAudioPath = audioPath.replace('frontend/public/', '/');
      } else if (audioPath && audioPath.startsWith('audio/')) {
        finalAudioPath = '/' + audioPath;
      } else if (audioPath && !audioPath.startsWith('/')) {
        finalAudioPath = '/' + audioPath;
      }

      console.log('🎵 原始音檔路徑:', audioPath);
      console.log('🎵 處理後路徑:', finalAudioPath);

      const handleEnded = () => {
        console.log('✅ 指示音檔播放完成');
        setState(prev => ({ ...prev, isPlayingInstruction: false, phase: 'idle' }));
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        
        // 播放完成後自動開始錄音 (延遲500ms避免狀態衝突)
        setTimeout(() => {
          console.log('🤖 自動開始錄音...');
          if (startRecordingRef.current) {
            startRecordingRef.current();
          }
        }, 500);
        
        resolve();
      };

      const handleError = (error) => {
        console.error('🔊 語音播放錯誤:', error);
        console.error('錯誤的音檔路徑:', finalAudioPath);
        setState(prev => ({
          ...prev,
          isPlayingInstruction: false,
          phase: 'idle',  // Reset phase to idle on error too
          error: null // 不顯示音檔播放錯誤，因為這不是關鍵功能
        }));
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        
        // 播放失敗也自動開始錄音 (延遲500ms避免狀態衝突)
        setTimeout(() => {
          console.log('🤖 播放失敗，自動開始錄音...');
          if (startRecordingRef.current) {
            startRecordingRef.current();
          }
        }, 500);
        
        resolve();
      };

      const handleCanPlay = () => {
        console.log('🎵 音檔已加載，開始播放');
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.play().catch(handleError);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplaythrough', handleCanPlay);

      // 設置音源
      audio.src = finalAudioPath;
      audio.load(); // 強制重新加載
    });
  }, []);

  // 處理後端回應
  const processLessonResponse = useCallback(async (response) => {
    try {
      console.log('🔍 Processing response:', response);

      // 從後端回應中正確提取數據
      const debugInfo = response.debug_info || {};
      const nextNote = debugInfo.target_note;
      const audioPath = debugInfo.audio_path;
      const tuningStatus = debugInfo.tuning_status;
      const isSuccess = debugInfo.success;

      console.log('🔍 Extracted nextNote:', nextNote);
      console.log('🔍 Extracted audioPath:', audioPath);
      console.log('🔍 Extracted tuningStatus:', tuningStatus);
      console.log('🔍 Extracted isSuccess:', isSuccess);
      console.log('🔍 Current state.currentNote:', state.currentNote);

      // Update state FIRST, before playing audio
      if (nextNote && nextNote !== '') {
        const isRetryingSameNote = nextNote === state.currentNote;
        console.log('🔍 Is retrying same note?', isRetryingSameNote);
        console.log('🔍 Updating currentNote from', state.currentNote, 'to', nextNote);
        setState(prev => {
          console.log('🔍 setState callback - prev.currentNote:', prev.currentNote, 'new currentNote:', nextNote);
          return {
            ...prev,
            currentNote: nextNote,
            phase: audioPath ? 'playing' : 'idle'  // Set to playing if we have audio to play
          };
        });
      }

      // Update results only for non-initialization requests
      if (state.currentNote && state.currentNote !== 'AA' && state.currentNote !== '') {
        console.log('🔍 Updating results for note:', state.currentNote);
        setState(prev => {
          const newResults = new Map(prev.questionResults);
          const currentResult = newResults.get(state.currentNote) || { success: false, attempts: 0 };
          newResults.set(state.currentNote, {
            success: isSuccess || currentResult.success,
            attempts: currentResult.attempts + 1
          });

          const newAnsweredNotes = new Set(prev.answeredNotes);
          if (isSuccess) {
            newAnsweredNotes.add(state.currentNote);
          }

          return {
            ...prev,
            questionResults: newResults,
            answeredNotes: newAnsweredNotes
          };
        });
      }

      // Play instruction audio AFTER state update
      if (audioPath) {
        console.log('🔍 Playing audio:', audioPath);
        await playInstructionAudio(audioPath);
      } else {
        console.log('🔍 No audio path, setting phase to idle');
        setState(prev => ({ ...prev, phase: 'idle' }));
      }

      // Check if lesson is complete (當 nextNote 為空字符串時表示完成)
      if (nextNote === "") {
        console.log('🎉 Lesson complete!');
        setState(prev => ({ ...prev, phase: 'done' }));
        setTimeout(() => {
          onNavigate(navigationSource === 'picking-technique' ? 'picking-technique' : 'basic-lesson');
        }, 3000);
      }

    } catch (error) {
      console.error('處理回應失敗:', error);
      setState(prev => ({
        ...prev,
        error: '處理回應失敗，請重試',
        phase: 'idle'
      }));
    }
  }, [state.currentNote, onNavigate, playInstructionAudio]);

  // 音量監測 - 參考調音器 (移到前面避免初始化錯誤)
  const startAudioLevelMonitoring = useCallback((stream) => {
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
        setState(prev => ({ ...prev, audioLevel: average }));
      }, 100);

    } catch (error) {
      console.error('音量監測失敗:', error);
    }
  }, []);

  // 發送請求到後端
  const sendLessonRequest = useCallback(async (targetNote, audioBlob) => {
    setState(prev => ({ ...prev, phase: 'uploading' }));

    try {
      const formData = new FormData();
      formData.append('target_note', targetNote);
      formData.append('username', userName); // 新增用戶名
      formData.append('file', audioBlob, `lesson-${targetNote}.webm`);

      console.log(`📡 發送教學請求 - 音符: ${targetNote}, 用戶: ${userName}, 音檔大小: ${audioBlob.size} bytes`);
      console.log('📋 FormData內容:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch('http://127.0.0.1:8000/simplenote/string_check', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      console.log(`📡 回應狀態: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API回應錯誤:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📦 收到回應:', result);

      await processLessonResponse(result);

    } catch (error) {
      console.error('上傳失敗:', error);
      setState(prev => ({
        ...prev,
        error: error.message.includes('fetch') ?
          '網路連線失敗，請檢查後端服務是否啟動' :
          `請求失敗: ${error.message}`,
        phase: 'idle'
      }));
    }
  }, [processLessonResponse]);

  // 上傳錄音 - 使用 ref 來避免閉包陷阱
  const currentNoteRef = useRef('');

  // 同步 ref 與 state
  useEffect(() => {
    currentNoteRef.current = state.currentNote;
  }, [state.currentNote]);

  const uploadRecording = useCallback(async (audioBlob) => {
    try {
      console.log('📤 開始上傳錄音...');
      console.log('🔍 Current note for upload (from ref):', currentNoteRef.current);

      await sendLessonRequest(currentNoteRef.current, audioBlob);
    } catch (error) {
      console.error('上傳錄音失敗:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        phase: 'idle'
      }));
    }
  }, [sendLessonRequest]);

  // 開始錄音 - 完全參考調音器的實現
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, recordingTime: 0, audioLevel: 0 }));

      console.log('🎤 請求麥克風權限...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,           // 提升採樣率以提高頻率檢測精度
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });

      setStream(stream);
      streamRef.current = stream;  // 保存到 ref
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 收到錄音數據:', event.data.size, 'bytes');
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

      setState(prev => ({ ...prev, phase: 'recording', recordingTime: 0 }));
      mediaRecorder.start();
      console.log(`🎤 開始錄音 ${RECORD_SECONDS} 秒...`);

      // 錄音計時器 - 完全參考調音器
      let currentTime = 0;
      recordingTimerRef.current = setInterval(() => {
        currentTime += 0.1;
        setState(prev => ({ ...prev, recordingTime: currentTime }));
        if (currentTime >= RECORD_SECONDS) {
          // 直接在這裡停止錄音，避免循環依賴
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
            setStream(null);
            streamRef.current = null;
          }
        }
      }, 100);

      // 音量監測 - 完全參考調音器
      startAudioLevelMonitoring(stream);

    } catch (error) {
      console.error('錄音失敗:', error);
      if (error.name === 'NotAllowedError') {
        setState(prev => ({ ...prev, error: '請允許麥克風權限以進行調音', phase: 'idle' }));
      } else {
        setState(prev => ({ ...prev, error: '無法啟動錄音功能', phase: 'idle' }));
      }
    }
  }, [startAudioLevelMonitoring]);

  // 保存 startRecording 函數到 ref，以便在播放完成回調中使用
  startRecordingRef.current = startRecording;

  // 停止錄音 - 參考調音器的實現
  const stopRecording = useCallback(() => {
    console.log('🛑 停止錄音流程開始');

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
      setStream(null);
      streamRef.current = null;
    }
  }, [uploadRecording]);

  // 初始化 - 發送 AA 請求
  useEffect(() => {
    const initializeLesson = async () => {
      // 創建一個最小的有效WebM音檔 - 參考調音器的做法
      const webmHeader = new Uint8Array([
        0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f,
        0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81, 0x04,
        0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d
      ]);
      const dummyBlob = new Blob([webmHeader], { type: 'audio/webm' });

      console.log('🎵 初始化單音教學...');
      await sendLessonRequest('AA', dummyBlob);
    };

    if (state.phase === 'intro' && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeLesson();
    }
  }, [state.phase, sendLessonRequest]);

  // Debug: Track currentNote changes
  useEffect(() => {
    console.log('🔍 currentNote changed to:', state.currentNote);
  }, [state.currentNote]);

  // 清理資源
  useEffect(() => {
    return () => {
      console.log('🧹 清理組件資源');

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
        audioLevelTimerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (instructionAudioRef.current) {
        instructionAudioRef.current.pause();
        instructionAudioRef.current.src = '';
      }
    };
  }, []);

  // 渲染進度指示器
  const renderProgress = () => {
    const progressPercentage = (state.answeredNotes.size / 7) * 100;

    return (
      <div className="lesson-progress">
        <div className="progress-header">
          <span>進度: {state.answeredNotes.size} / 7</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="questions-status">
          {Array.from({ length: 7 }, (_, index) => {
            const questionNumber = index + 1;
            const answered = state.answeredNotes.size > index;
            const current = state.answeredNotes.size === index;

            return (
              <div
                key={questionNumber}
                className={`question-indicator ${answered ? 'answered' : ''} ${current ? 'current' : ''}`}
              >
                {questionNumber}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染音量條
  const renderVolumeBar = () => {
    if (state.phase !== 'recording') return null;

    return (
      <div className="volume-container">
        <div className="volume-label">音量</div>
        <div className="volume-bar">
          <div
            className="volume-fill"
            style={{ width: `${Math.min((state.audioLevel / 128) * 100, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // 渲染主要狀態
  const renderMainStatus = () => {
    switch (state.phase) {
      case 'intro':
        return (
          <div className="status-display">
            <div className="note-name">準備中...</div>
            <div className="status-text">正在初始化教學</div>
          </div>
        );

      case 'idle':
        return (
          <div className="status-display">
            <div className="status-label">請彈：</div>
            <div className="note-name">{state.currentNote}</div>
            <div className="status-text">點擊下方按鈕開始錄音</div>
          </div>
        );

      case 'recording':
        return (
          <div className="status-display">
            <div className="note-name">{state.currentNote}</div>
            <div className="status-text">錄音中... {Math.round(state.recordingTime * 10) / 10}s / {RECORD_SECONDS}s</div>
            {renderVolumeBar()}
          </div>
        );

      case 'uploading':
        return (
          <div className="status-display">
            <div className="note-name">{state.currentNote}</div>
            <div className="status-text">分析中...</div>
          </div>
        );

      case 'playing':
        return (
          <div className="status-display">
            <div className="note-name">{state.currentNote}</div>
            <div className="status-text">播放指導語音中...</div>
          </div>
        );

      case 'done':
        return (
          <div className="status-display">
            <div className="note-name">🎉</div>
            <div className="status-text">教學完成！</div>
            <div className="completion-message">3秒後自動返回{navigationSource === 'picking-technique' ? '撥弦技巧頁面' : '基礎教學頁面'}</div>
          </div>
        );

      default:
        return null;
    }
  };

  // 渲染控制按鈕
  const renderControls = () => {
    if (state.phase === 'done') {
      return null;
    }

    return (
      <div className="tuning-controls">
        <div className="status-indicator">
          {state.phase === 'idle' ? (
            <div className="status-message">
              🎤 語音指示完成後自動錄音
            </div>
          ) : state.phase === 'recording' ? (
            <div className="status-message">
              🎤 錄音中... ({Math.round(state.recordingTime * 10) / 10}s/{RECORD_SECONDS}s)
            </div>
          ) : state.phase === 'uploading' ? (
            <div className="status-message">
              ⏳ 分析中...
            </div>
          ) : state.phase === 'playing' ? (
            <div className="status-message">
              🔊 播放指示中...
            </div>
          ) : state.phase === 'intro' ? (
            <div className="status-message">
              🎵 初始化中...
            </div>
          ) : (
            <div className="status-message">
              ⏳ 請等待...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PhoneContainer>
      <div className="lesson-container">
        <div className="lesson-header">
          <div className="header-top">
            <button className="back-btn" onClick={() => onNavigate(navigationSource === 'picking-technique' ? 'picking-technique' : 'basic-lesson')}>
              ← 返回
            </button>
          </div>
          <h1>右手撥弦｜單音教學</h1>
          <p>跟隨指導完成 7 個音符的練習</p>
        </div>

        {renderProgress()}

        <div className="current-lesson">
          {renderMainStatus()}
        </div>

        {renderControls()}

        {state.error && (
          <div className="error-toast">
            <span>{state.error}</span>
            <button
              className="error-close"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </PhoneContainer>
  );
};

export default SingleNoteLessonPage;