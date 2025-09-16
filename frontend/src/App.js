import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GuitarLessonPage from './components/GuitarLessonPage';
import GuitarGripPage from './components/GuitarGripPage';
import ChordPracticePage from './components/ChordPracticePage';
import PickingTechniquePage from './components/PickingTechniquePage';
import SongLessonPage from './components/SongLessonPage';
import MetronomePage from './components/MetronomePage';
import SongTutorialPage from './components/SongTutorialPage';
import SongPracticePage from './components/SongPracticePage';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import FirstTimeUserPage from './components/FirstTimeUserPage';
import TunerPage from './components/TunerPage';
import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [poseResult, setPoseResult] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [navigationSource, setNavigationSource] = useState(null);

  useEffect(() => {
    // 檢查是否為首次使用者
    const firstTimeFlag = localStorage.getItem('isFirstTime');
    if (firstTimeFlag === 'false') {
      setIsFirstTime(false);
    } else {
      setCurrentScreen('first-time');
    }
  }, []);

  const handleFirstTimeComplete = () => {
    setIsFirstTime(false);
    localStorage.setItem('isFirstTime', 'false');
    setCurrentScreen('tuner');
  };

  const handlePoseResult = (result) => {
    setPoseResult(result);
    setCurrentScreen('result');
  };

  const handleRetryPose = () => {
    setPoseResult(null);
    setCurrentScreen('camera');
  };

  // 創建智能導航函數，可以跟蹤來源
  const handleNavigate = (screen, source = null) => {
    setNavigationSource(source || currentScreen);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'first-time':
        return <FirstTimeUserPage onComplete={handleFirstTimeComplete} />;
      
      case 'tuner':
        return (
          <TunerPage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} />;
      
      case 'guitar-lesson':
        return (
          <GuitarLessonPage 
            onBack={() => setCurrentScreen('home')}
            onNavigate={(screen) => handleNavigate(screen, 'guitar-lesson')}
          />
        );

      case 'guitar-grip':
        return (
          <GuitarGripPage 
            onNavigate={setCurrentScreen}
          />
        );

      case 'chord-practice':
        return (
          <ChordPracticePage 
            onNavigate={setCurrentScreen}
          />
        );

      case 'picking-technique':
        return (
          <PickingTechniquePage 
            onNavigate={setCurrentScreen}
          />
        );

      case 'song-lesson':
        return (
          <SongLessonPage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'metronome':
        return (
          <MetronomePage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'song-tutorial':
        return (
          <SongTutorialPage 
            onBack={() => setCurrentScreen('home')}
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'song-practice':
        return (
          <SongPracticePage 
            onBack={() => setCurrentScreen('home')}
            onNavigate={setCurrentScreen}
            songId={navigationSource === 'guitar-lesson' ? 'twinkle-star' : null}
          />
        );
      
      case 'camera':
        return (
          <CameraScreen 
            onBack={() => setCurrentScreen('home')}
            onResult={handlePoseResult}  // 確保這裡正確傳遞
          />
        );
      
      case 'result':
        return (
          <ResultScreen 
            result={poseResult}
            onBack={() => setCurrentScreen('home')}
            onRetry={handleRetryPose}
          />
        );
      
      default:
        return <HomePage onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;