import React, { useState } from 'react';
import CameraScreen from './CameraScreen';
import ResultScreen from './ResultScreen';
import PhoneContainer from './PhoneContainer';
import './GuitarLessonPage.css';

function GuitarLessonPage({ onNavigate }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentMode, setCurrentMode] = useState('lessons'); // 'lessons', 'camera', 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const lessons = [
    {
      id: 1,
      title: '吉他握法',
      description: '學習正確的吉他持琴姿勢，包括坐姿和站姿',
      difficulty: '初級',
      duration: '10 分鐘',
      thumbnail: '🎸',
      steps: [
        '坐直並將吉他放在右腿上',
        '左手握住琴頸，拇指放在琴頸後方',
        '右手自然放置在琴身上',
        '保持肩膀放鬆，背部挺直'
      ]
    },
    {
      id: 2,
      title: '基本和弦練習',
      description: '學習 C、G、D 等基本和弦的按法',
      difficulty: '初級',
      duration: '15 分鐘',
      thumbnail: '🎵',
      steps: [
        '學習 C 大調和弦按法',
        '練習 G 大調和弦',
        '掌握 D 大調和弦',
        '和弦轉換練習'
      ]
    },
    {
      id: 3,
      title: '右手撥弦技巧',
      description: '掌握正確的撥弦手法和節拍',
      difficulty: '中級',
      duration: '20 分鐘',
      thumbnail: '👋',
      steps: [
        '學習正確的撥弦手型',
        '練習下撥和上撥',
        '掌握基本節拍型',
        '配合和弦練習'
      ]
    },
    {
      id: 4,
      title: '簡單歌曲練習',
      description: '用學過的和弦演奏簡單歌曲',
      difficulty: '中級',
      duration: '25 分鐘',
      thumbnail: '🎤',
      steps: [
        '選擇適合的練習歌曲',
        '分析歌曲和弦進行',
        '慢速練習',
        '逐漸加快速度'
      ]
    }
  ];

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleStartPractice = () => {
    // 啟動姿勢檢測相機
    setCurrentMode('camera');
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentMode('result');
  };

  const handleBackToLessons = () => {
    setCurrentMode('lessons');
    setSelectedLesson(null);
    setAnalysisResult(null);
  };

  const handleVoiceCommand = (command) => {
    console.log('GuitarLessonPage 收到語音指令:', command);
    
    if (command === 'navigate-back') {
      if (selectedLesson) {
        setSelectedLesson(null);
      } else {
        onNavigate('home');
      }
    } else if (command === 'navigate-home') {
      onNavigate('home');
    } else if (command.includes('開始') || command.includes('檢測') || command.includes('練習')) {
      if (selectedLesson) {
        handleStartPractice();
      }
    } else if (command.includes('課程') || command.includes('第一課') || command.includes('第1課')) {
      setSelectedLesson(lessons[0]);
    } else if (command.includes('第二課') || command.includes('第2課')) {
      setSelectedLesson(lessons[1]);
    }
  };

  // 如果在相機模式，顯示 CameraScreen
  if (currentMode === 'camera') {
    return (
      <PhoneContainer 
        title="🎸 姿勢檢測"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="camera-content">
          <CameraScreen 
            onBack={() => setCurrentMode('lessons')}
            onResult={handleAnalysisComplete} 
          />
        </div>
      </PhoneContainer>
    );
  }

  // 如果在結果模式，顯示 ResultScreen
  if (currentMode === 'result') {
    return (
      <PhoneContainer 
        title="🎸 檢測結果"
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="result-content">
          <ResultScreen 
            result={analysisResult} 
            onRetry={() => setCurrentMode('camera')}
            onBack={handleBackToLessons}
          />
        </div>
      </PhoneContainer>
    );
  }

  if (selectedLesson) {
    return (
      <PhoneContainer 
        title={`🎸 ${selectedLesson.title}`}
        onVoiceCommand={handleVoiceCommand}
        enableVoice={true}
        showStatusBar={true}
      >
        <div className="lesson-detail">
          <div className="lesson-nav">
            <button 
              className="back-button"
              onClick={() => setSelectedLesson(null)}
            >
              ←
            </button>
            <button 
              className="home-button"
              onClick={() => onNavigate('home')}
            >
              🏠 主頁
            </button>
          </div>
          
          <div className="lesson-info">
            <div className="lesson-thumbnail">{selectedLesson.thumbnail}</div>
            <div className="lesson-meta">
              <span className="difficulty">{selectedLesson.difficulty}</span>
              <span className="duration">{selectedLesson.duration}</span>
            </div>
            <p className="lesson-desc">{selectedLesson.description}</p>
          </div>
          
          <div className="lesson-content">
            <h2>課程步驟</h2>
            <div className="steps-list">
              {selectedLesson.steps.map((step, index) => (
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

  return (
    <PhoneContainer 
      title="🎸 吉他教學"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="lesson-list">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
          >
            ←
          </button>
        </div>
        
        <div className="progress-section">
          <h2>學習進度</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '25%'}}></div>
          </div>
          <p>已完成 1/4 個課程</p>
        </div>
        
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className="lesson-card"
              onClick={() => handleLessonSelect(lesson)}
            >
              <div className="lesson-thumbnail">{lesson.thumbnail}</div>
              <div className="lesson-info">
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className="lesson-meta">
                  <span className="difficulty">{lesson.difficulty}</span>
                  <span className="duration">{lesson.duration}</span>
                </div>
              </div>
              <div className="lesson-status">
                {lesson.id === 1 ? '✅' : '⭕'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default GuitarLessonPage;