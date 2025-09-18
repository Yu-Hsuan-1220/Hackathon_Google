import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import BasicLessonPage from './components/BasicLessonPage';
import GuitarGripPage from './components/GuitarGripPage';
import ChordPracticePage from './components/ChordPracticePage';
import SingleNotePage from './components/SingleNotePage';
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
  const [poseResult, setPoseResult] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [navigationSource, setNavigationSource] = useState(null);
  const [userName, setUserName] = useState(() => (localStorage.getItem('userName') || '').trim());

  useEffect(() => {
    const saved = (localStorage.getItem('userName') || '').trim();
    if (saved) setUserName(saved);
    setIsFirstTime(!(saved && saved !== ''));
  }, []);

  const handleFirstTimeComplete = (name) => {
    const n = (name || '').trim();
    if (n) {
      localStorage.setItem('userName', n);
      localStorage.setItem('usr_id', n);
    }
    setUserName(n);
    setIsFirstTime(false);
    setCurrentScreen('home');
  };

  const handlePoseResult = (result) => {
    setPoseResult(result);
    setCurrentScreen('result');
  };

  const handleRetryPose = () => {
    setPoseResult(null);
    setCurrentScreen('camera');
  };

  // 在初始化時就決定要進入哪個畫面，避免先掛載 first-time 再切換
  const initialScreen = (localStorage.getItem('userName') || '').trim() !== '' ? 'home' : 'first-time';
  const [currentScreen, setCurrentScreen] = useState(initialScreen);

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
      case 'first-time':
        return <FirstTimeUserPage onComplete={handleFirstTimeComplete} />;
      
      case 'tuner':
        return (
          <TunerPage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'single-note-lesson':
<<<<<<< HEAD
=======
        return (
          <SingleNoteLessonPage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'home':
        return <HomePage onNavigate={(screen) => handleNavigate(screen, 'home')} />;
      
      case 'guitar-lesson':
>>>>>>> b671a7e (單音gg)
        return (
          <SingleNoteLessonPage 
            onNavigate={setCurrentScreen}
          />
        );
      
      case 'home':
        return <HomePage userName={userName} onNavigate={(screen) => handleNavigate(screen, 'home')} />;
      
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
            onNavigateToBasicLesson={() => setCurrentScreen('basic-lesson')}
          />
        );

      case 'chord-practice':
        return (
          <ChordPracticePage 
            onNavigate={setCurrentScreen}
          />
        );

      case 'single-note':
        return (
          <SingleNotePage 
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
            songId={navigationSource === 'basic-lesson' ? 'twinkle-star' : null}
          />
        );
      
      case 'song-twinkle-star':
        return (
          <SongTwinkleStarPage
            onBack={() => setCurrentScreen(navigationSource === 'basic-lesson' ? 'basic-lesson' : 'song-tutorial')}
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