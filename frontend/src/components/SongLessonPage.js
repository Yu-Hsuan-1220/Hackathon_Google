import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import ResultScreen from './ResultScreen';
import PhoneContainer from './PhoneContainer';
import './SongLessonPage.css';

function SongLessonPage({ onNavigate }) {
  const [currentMode, setCurrentMode] = useState('lesson'); // 'lesson', 'camera', 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const lessonData = {
    title: '簡單歌曲練習',
    description: '用學過的和弦演奏簡單歌曲',
    difficulty: '中級',
    duration: '25 分鐘',
    keyPoints: [
      {
        title: '歌曲選擇',
        description: '選擇使用基本和弦的簡單歌曲，如《小星星》、《生日快樂》'
      },
      {
        title: '和弦分析',
        description: '先熟悉歌曲的和弦進行，標記出和弦轉換的位置'
      },
      {
        title: '分段練習',
        description: '將歌曲分成小段落，逐段熟練後再串聯起來'
      },
      {
        title: '節拍配合',
        description: '注意歌曲的節拍，配合旋律進行和弦轉換'
      }
    ],
    steps: [
      '選擇適合的練習歌曲',
      '分析歌曲和弦進行',
      '慢速練習',
      '逐漸加快速度'
    ]
  };

  const handleStartPractice = () => {
    setCurrentMode('camera');
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentMode('result');
  };

  const handleBackToLesson = () => {
    setCurrentMode('lesson');
    setAnalysisResult(null);
  };

  const handleVoiceCommand = (command) => {
    if (command === 'navigate-back') {
      onNavigate('guitar-lesson');
    } else if (command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('開始') || command.includes('檢測') || command.includes('練習')) {
      if (currentMode === 'lesson') {
        handleStartPractice();
      }
    }
  };

  // 相機模式
  if (currentMode === 'camera') {
    return (
      <PhoneContainer 
        title="🎤 歌曲演奏檢測"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="camera-content">
          <CameraScreen 
            onBack={handleBackToLesson}
            onResult={handleAnalysisComplete} 
          />
        </div>
      </PhoneContainer>
    );
  }

  // 結果模式
  if (currentMode === 'result') {
    return (
      <PhoneContainer 
        title="🎤 檢測結果"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="result-content">
          <ResultScreen 
            result={analysisResult} 
            onRetry={() => setCurrentMode('camera')}
            onBack={handleBackToLesson}
          />
        </div>
      </PhoneContainer>
    );
  }

  // 教學模式
  return (
    <PhoneContainer 
      title="🎤 簡單歌曲練習"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="song-lesson-page">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('guitar-lesson')}
          >
            ← 返回教學選單
          </button>
          <button 
            className="home-button"
            onClick={() => onNavigate('home')}
          >
            🏠 主頁
          </button>
        </div>
        
        <div className="lesson-content">{/* 動作要點說明欄 */}
          <div className="key-points-section">
            <h2>💡 動作要點</h2>
            <div className="key-points-grid">
              {lessonData.keyPoints.map((point, index) => (
                <div key={index} className="key-point-card">
                  <div className="key-point-header">
                    <h3>{point.title}</h3>
                  </div>
                  <p className="key-point-desc">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          <h2>📝 課程步驟</h2>
          <div className="steps-list">
            {lessonData.steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
          
          <div className="lesson-actions">
            <button 
              className="practice-button"
              onClick={handleStartPractice}
            >
              🎯 開始姿勢檢測練習
            </button>
          </div>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default SongLessonPage;