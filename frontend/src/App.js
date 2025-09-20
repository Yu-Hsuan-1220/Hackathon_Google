import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import BasicLessonPage from './components/BasicLessonPage';
import GuitarGripPage from './components/GuitarGripPage';
import ChordPracticePage from './components/ChordPracticePage';
import ChordLessonPage from './components/ChordLessonPage';
import PickingTechniquePage from './components/PickingTechniquePage';
import MetronomePage from './components/MetronomePage';
import SongTutorialPage from './components/SongTutorialPage';
import SongPracticePage from './components/SongPracticePage';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import FirstTimeUserPage from './components/FirstTimeUserPage';
import TunerPage from './components/TunerPage';
import SingleNoteLessonPage from './components/SingleNoteLessonPage';
import SongTwinkleStarPage from './components/SongTwinkleStarPage';
import SongHappyBirthdayPage from './components/SongHappyBirthdayPage';
import SongChildhoodPage from './components/SongChildhoodPage';
import SongMoonHeartPage from './components/SongMoonHeartPage';
import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [poseResult, setPoseResult] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [navigationSource, setNavigationSource] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 檢查是否為首次使用者和用戶名稱
    const firstTimeFlag = localStorage.getItem('isFirstTime');
    const storedUserName = localStorage.getItem('userName') || '';
    setUserName(storedUserName);
    
    if (firstTimeFlag === 'false') {
      setIsFirstTime(false);
      setCurrentScreen('home');
    } else {
      setCurrentScreen('first-time');
    }
  }, []);

  const handleFirstTimeComplete = (name) => {
    setIsFirstTime(false);
    setUserName(name || '');
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

  // 創建智能導航函數，可以跟蹤來源並傳遞數據
  const handleNavigate = (screen, sourceOrData = null) => {
    // 如果sourceOrData是字符串，則為來源；如果是對象，則為數據
    if (typeof sourceOrData === 'string') {
      setNavigationSource(sourceOrData);
    } else if (typeof sourceOrData === 'object' && sourceOrData !== null) {
      setPoseResult(sourceOrData);
      setNavigationSource(currentScreen);
    } else {
      setNavigationSource(sourceOrData || currentScreen);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px'
          }}>
            載入中...
          </div>
        );

      case 'first-time':
        return <FirstTimeUserPage onComplete={handleFirstTimeComplete} />;

      case 'tuner':
        return (
          <TunerPage
            onNavigate={setCurrentScreen}
          />
        );

      case 'single-note-lesson':
        return (
          <SingleNoteLessonPage
            onNavigate={handleNavigate}
            navigationSource={navigationSource}
          />
        );

      case 'home':
        return <HomePage onNavigate={(screen) => handleNavigate(screen, 'home')} userName={userName} />;

      case 'basic-lesson':
        return (
          <BasicLessonPage
            onBack={() => setCurrentScreen('home')}
            onNavigate={(screen) => handleNavigate(screen, 'basic-lesson')}
          />
        );

      case 'guitar-grip':
        return (
          <GuitarGripPage
            onNavigate={handleNavigate}
          />
        );

      case 'guitar-grip-camera':
        return (
          <CameraScreen
            onBack={() => handleNavigate('guitar-grip')}
            onResult={(result) => handleNavigate('guitar-grip-result', result)}
          />
        );

      case 'guitar-grip-result':
        return (
          <ResultScreen
            result={poseResult}
            onBack={() => handleNavigate('guitar-grip')}
            onRetry={() => handleNavigate('guitar-grip-camera')}
          />
        );

      case 'chord-practice':
        return (
          <ChordPracticePage
            onNavigate={setCurrentScreen}
          />
        );

      case 'chord-lesson':
        return (
          <ChordLessonPage
            onNavigate={handleNavigate}
            navigationSource={navigationSource}
          />
        );

      case 'picking-technique':
        return (
          <PickingTechniquePage
            onNavigate={handleNavigate}
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

      case 'song-twinkle-star':
        return (
          <SongTwinkleStarPage
            onBack={() => setCurrentScreen(navigationSource === 'guitar-lesson' ? 'guitar-lesson' : 'song-tutorial')}
            onHome={() => setCurrentScreen('home')}
          />
        );

      case 'song-happy-birthday':
        return (
          <SongHappyBirthdayPage
            onBack={() => setCurrentScreen('song-tutorial')}
            onHome={() => setCurrentScreen('home')}
          />
        );

      case 'song-childhood':
        return (
          <SongChildhoodPage
            onBack={() => setCurrentScreen('song-tutorial')}
            onHome={() => setCurrentScreen('home')}
          />
        );

      case 'song-moon-heart':
        return (
          <SongMoonHeartPage
            onBack={() => setCurrentScreen('song-tutorial')}
            onHome={() => setCurrentScreen('home')}
          />
        );

      default:
        return <HomePage onNavigate={setCurrentScreen} userName={userName} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;