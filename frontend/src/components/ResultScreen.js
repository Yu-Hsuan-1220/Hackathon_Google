import React, { useState, useEffect } from 'react';
import PhoneContainer from './PhoneContainer';
import './ResultScreen.css';

const ResultScreen = ({ result, onBack, onRetry }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  const playAudio = async () => {
    try {
      setIsPlayingAudio(true);
      setAudioError('');
      
      console.log('🎵 開始獲取音檔...');
      
      // 從本地根目錄讀取音檔
      const timestamp = new Date().getTime();
      const response = await fetch(`/pose_suggestion.wav`, {
        method: 'GET',
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
        setAudioError('網路連接失敗，請檢查後端服務是否運行');
      } else if (error.message.includes('404')) {
        setAudioError('音檔尚未生成，可能後端 API 配額已用完');
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

  const handleVoiceCommand = (command) => {
    console.log('ResultScreen 收到語音指令:', command);
    
    if (command.includes('播放') || command.includes('語音')) {
      playAudio();
    } else if (command.includes('重新') || command.includes('再試')) {
      if (onRetry) onRetry();
    } else if (command.includes('返回') || command.includes('回去')) {
      if (onBack) onBack();
    }
  };

  return (
    <PhoneContainer 
      title="姿勢分析結果" 
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
    >
      <div className="result-content-wrapper">
        <div className="result-main-content">
          <div className="suggestion-card">
            <div className="card-header">
              <span className="card-icon">💡</span>
              <h4 className="card-title">改善建議</h4>
            </div>
            <div className="suggestion-content">
              {result.suggestion || '沒有具體建議'}
            </div>
          </div>

          <div className="audio-control-card">
            <button 
              onClick={playAudio}
              disabled={isPlayingAudio}
              className={`audio-play-button ${isPlayingAudio ? 'playing' : ''}`}
            >
              <span className="audio-icon">
                {isPlayingAudio ? '🔊' : '🎵'}
              </span>
              <span className="audio-text">
                {isPlayingAudio ? '播放中...' : '播放語音建議'}
              </span>
            </button>
            
            {audioError && (
              <div className="audio-error-card">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{audioError}</span>
                <button 
                  onClick={playAudio} 
                  className="retry-audio-button"
                >
                  重試
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="result-actions">
          <button 
            onClick={onRetry} 
            className="action-button retry-button"
          >
            <span className="button-icon">📷</span>
            重新拍照
          </button>
          <button 
            onClick={onBack} 
            className="action-button back-button"
          >
            <span className="button-icon">←</span>
            返回課程
          </button>
        </div>
      </div>
    </PhoneContainer>
  );
};

export default ResultScreen;