import React, { useState } from 'react';
import HomePage from './components/HomePage';
import GuitarLessonPage from './components/GuitarLessonPage';
import MetronomePage from './components/MetronomePage';
import SongTutorialPage from './components/SongTutorialPage';
import SongPracticePage from './components/SongPracticePage';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [poseResult, setPoseResult] = useState(null);

  const handlePoseResult = (result) => {
    console.log('收到姿勢檢測結果:', result);
    setPoseResult(result);
    setCurrentScreen('result');
  };

  const handleRetryPose = () => {
    setPoseResult(null);
    setCurrentScreen('camera');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} />;
      
      case 'guitar-lesson':
        return (
          <GuitarLessonPage 
            onBack={() => setCurrentScreen('home')}
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