import React, { useState, useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './ResultScreen.css';

const ResultScreen = ({ result, onBack, onRetry, onNavigateToBasicLesson }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const hasAnalyzed = useRef(false);
  const shouldNavigateRef = useRef(false);

  const deleteAudioFile = async (filename) => {
    try {
      await fetch(`http://localhost:8000/home/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('刪除音檔失敗:', error);
    }
  };

  const playAudio = async () => {
    setIsPlayingAudio(true);
    
    const response = await fetch(`/pose_suggestion.wav`, {
      method: 'GET',
      cache: 'no-cache'
    });
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsPlayingAudio(false);
      deleteAudioFile('pose_suggestion.wav');
      URL.revokeObjectURL(audioUrl);
      setTimeout(() => {
        handleNavigation();
      }, 1000);
    };
    
    audio.play();
  };

  // 進行姿勢分析的 API 調用
  const analyzePose = async (photoData) => {
    setIsAnalyzing(true);
    
    const response = await fetch('http://localhost:8000/pose/check_pose', {
      method: 'POST',
      body: photoData
    });
    
    const apiResult = await response.json();
    setApiResult(apiResult);
    setShouldNavigate(apiResult.next_state);
    setIsAnalyzing(false);
    
    // 儲存 next_state 到 ref 以確保在導航時能正確取得
    shouldNavigateRef.current = apiResult.next_state;
    
    // 自動播放語音建議
    setTimeout(() => {
      playAudio();
    }, 2000);
  };

  // 根據 API next_state 結果進行導航
  const handleNavigation = () => {
    const nextState = shouldNavigateRef.current;
    if (nextState) {
      onNavigateToBasicLesson();
    } else {
      if (onRetry) onRetry();
    }
  };

  // 自動進行姿勢分析
  useEffect(() => {
    if (result && result.photoData && !hasAnalyzed.current) {
      hasAnalyzed.current = true;
      analyzePose(result.photoData);
    }
  }, [result]);

  if (isAnalyzing) {
    return (
      <PhoneContainer title="分析中..." enableVoice={false}>
        <div className="result-content-wrapper">
          <div className="analyzing-content">
            <h3>正在分析你的姿勢...</h3>
          </div>
        </div>
      </PhoneContainer>
    );
  }

  const handleVoiceCommand = (command) => {
    if (command.includes('返回') || command.includes('回去')) {
      if (onBack) onBack();
    }
  };

  return (
    <PhoneContainer 
      title="姿勢分析結果" 
      onVoiceCommand={handleVoiceCommand}
      enableVoice={false}
    >
      <div className="result-content-wrapper">
        <div className="result-main-content">
          <div className="suggestion-card">
            <div className="card-header">
              <span className="result-card-icon">💡</span>
              <h4 className="result-card-title">改善建議</h4>
            </div>
            <div className="suggestion-content">
              {apiResult?.suggestion || '正在分析中...'}
            </div>
          </div>


        </div>

        <div className="result-actions">
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