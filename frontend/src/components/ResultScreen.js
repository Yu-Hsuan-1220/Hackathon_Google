import React, { useState, useEffect } from 'react';
import './ResultScreen.css';

const ResultScreen = ({ result, onBack, onRetry }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  const playAudio = async () => {
    try {
      setIsPlayingAudio(true);
      setAudioError('');
      
      console.log('🎵 開始獲取音檔...');
      
      // 使用你後端提供的端點，添加隨機參數避免緩存
      const timestamp = new Date().getTime();
      const response = await fetch(`http://127.0.0.1:8000/pose_suggestion.wav?t=${timestamp}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'audio/wav, audio/*',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 音檔請求狀態:', response.status);
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('✅ 音檔獲取成功，大小:', audioBlob.size, 'bytes');
        
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onloadeddata = () => {
            console.log('🎵 音檔載入完成');
          };
          
          audio.onended = () => {
            console.log('✅ 音檔播放結束');
            setIsPlayingAudio(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = (e) => {
            console.error('💥 音檔播放錯誤:', e);
            setAudioError('音檔播放失敗');
            setIsPlayingAudio(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
          console.log('▶️ 開始播放音檔');
          
        } else {
          throw new Error('音檔檔案為空');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`無法獲取音檔: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error('💥 播放音檔失敗:', error);
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setAudioError('網路連接失敗，請檢查後端服務是否運行在 http://127.0.0.1:8000');
      } else {
        setAudioError(`無法播放語音: ${error.message}`);
      }
      setIsPlayingAudio(false);
    }
  };

  // 自動播放語音建議
  useEffect(() => {
    if (result && result.suggestion) {
      // 延遲 2 秒播放，確保音檔已生成
      const timer = setTimeout(() => {
        playAudio();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="result-screen">
        <div className="error-message">
          沒有檢測結果
        </div>
        <button onClick={onBack} className="back-button">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="result-screen">
      <div className="result-header">
        <button onClick={onBack} className="back-button">
          ←
        </button>
        <h2>🎸 檢測結果</h2>
      </div>

      <div className="result-content">
        <div className="analysis-section">
          <h3>姿勢分析結果</h3>
          
          {/* 顯示 Gemini 的建議文字 */}
          <div className="suggestion-text">
            <h4>AI 分析建議</h4>
            <div className="suggestion-content">
              {result.suggestion || '沒有具體建議'}
            </div>
          </div>

          <div className="audio-controls">
            <button 
              onClick={playAudio}
              disabled={isPlayingAudio}
              className={`audio-button ${isPlayingAudio ? 'playing' : ''}`}
            >
              {isPlayingAudio ? '🔊 播放中...' : '🔊 播放語音建議'}
            </button>
            {audioError && (
              <div className="audio-error">
                ⚠️ {audioError}
                <button 
                  onClick={playAudio} 
                  className="retry-audio-button"
                  style={{marginLeft: '10px', padding: '5px 10px', fontSize: '12px'}}
                >
                  重試
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button onClick={onRetry} className="retry-button">
          重新拍照
        </button>
        <button onClick={onBack} className="home-button">
          返回課程
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;