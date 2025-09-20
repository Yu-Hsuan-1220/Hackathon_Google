import React, { useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './BasicLessonPage.css';
const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function BasicLessonPage({ onBack, onNavigate }) {
  const hasCalledAPI = useRef(false);
  const currentAudio = useRef(null);
  const userQuestion = useRef('');

  const deleteAudioFile = async (filename) => {
    await fetch(`${API_BASE}/home/delete?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  };

  useEffect(() => {
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      checkAndPlayIntro();
    }

    return () => {
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
        currentAudio.current = null;
      }
    };
  }, []);


  const checkAndPlayIntro = () => {
    const audio = new Audio(`/menu_intro.wav`);
    currentAudio.current = audio;
    
    audio.oncanplaythrough = () => {
      audio.play();
    };
    
    audio.onended = () => {
      currentAudio.current = null;
      deleteAudioFile('menu_intro.wav');
      startVoiceRecognition();
    };
    
    audio.onerror = async () => {
      const userName = localStorage.getItem('userName') || '用戶';
      await fetch(`${API_BASE}/menu/intro?username=${encodeURIComponent(userName)}`);
      
      // 輪詢檢查音檔是否已生成
      const checkAudioReady = () => {
        const newAudio = new Audio(`/menu_intro.wav`);
        currentAudio.current = newAudio;
        
        newAudio.oncanplaythrough = () => {
          newAudio.play();
        };
        
        newAudio.onended = () => {
          currentAudio.current = null;
          deleteAudioFile('menu_intro.wav');
          startVoiceRecognition();
        };
        
        newAudio.onerror = () => {
          setTimeout(checkAudioReady, 500);
        };
        
        newAudio.load();
      };
      
      // 等待 1 秒後開始檢查
      setTimeout(checkAudioReady, 1000);
    };
    
    audio.load();
  };
  
  const startVoiceRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();

    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    let done = false;
    recognition.start();

    recognition.onresult = async (e) => {
      if (done) return;
      done = true;
      const text = e.results[0][0].transcript || '';
      recognition.stop();
      await sendActionAPI(text);
    };
    recognition.onerror = () => { try { recognition.stop(); } catch {} };
    recognition.onend = () => {};
    setTimeout(() => { try { recognition.stop(); } catch {} }, 8000);
  };

  const sendActionAPI = async (voiceInput) => {
    userQuestion.current = voiceInput;
    
    const response = await fetch(`${API_BASE}/menu/action?user_input=${encodeURIComponent(voiceInput)}`, {
      method: 'POST',
    });
    
    const data = await response.json();
    const actionId = data.Response;
    
    if (actionId === 10) {
      await handleTutorAPI(userQuestion.current);
      return;
    }
    
    // 根據 id 進行頁面跳轉
    switch(actionId) {
      case 1:
        onNavigate('guitar-grip');
        break;
      case 2:
        onNavigate('tuner');
        break;
      case 3:
        onNavigate('single-note-lesson');
        break;
      case 4:
        onNavigate('chord-lesson');
        break;
      case 5:
        onNavigate('song-twinkle-star');
        break;
      case 6:
        onNavigate('song-twinkle-star');
        break;
      default:
        break;
    }
  };

  const handleTutorAPI = async (question) => {
    await fetch(`${API_BASE}/tutor/ask?user_input=${encodeURIComponent(question)}`, {
      method: 'POST',
    });
    
    // 輪詢檢查音檔是否已生成
    const checkAudioReady = () => {
      const audio = new Audio(`/guitar_ask.wav`);
      currentAudio.current = audio;
      
      audio.oncanplaythrough = () => {
        audio.play();
      };
      
      audio.onended = () => {
        currentAudio.current = null;
        deleteAudioFile('guitar_ask.wav');
        startVoiceRecognition();
      };
      
      audio.onerror = () => {
        setTimeout(checkAudioReady, 500);
      };
      
      audio.load();
    };
    
    setTimeout(checkAudioReady, 1000);
  };

  const lessons = [
    {
      id: 1,
      title: '吉他握法',
      description: '學習正確的吉他持琴姿勢，包括坐姿和站姿',
      difficulty: '初級',
      duration: '10 分鐘',
      route: 'guitar-grip'
    },
    {
      id: 2,
      title: '調音器',
      description: '學習如何正確調音，確保吉他音準',
      difficulty: '初級',
      duration: '5 分鐘',
      route: 'tuner'
    },
    {
      id: 3,
      title: '單音練習',
      description: '掌握正確的撥弦手法和節拍',
      difficulty: '中級',
      duration: '20 分鐘',
      route: 'single-note-lesson'
    },
    {
      id: 4,
      title: '基本和弦練習',
      description: '學習 C、G、D 等基本和弦的按法',
      difficulty: '中級',
      duration: '15 分鐘',
      route: 'chord-lesson'
    },
    {
      id: 5,
      title: '生日快樂練習',
      description: '學習彈奏經典歌曲《生日快樂》',
      difficulty: '中級',
      duration: '25 分鐘',
      route: 'song-happy-birthday'
    }
  ];

  const handleLessonSelect = (lesson) => {
    onNavigate(lesson.route);
  };

  return (
    <PhoneContainer 
      title="📚 基礎教學"
      showStatusBar={true}
    >
      <div className="lesson-list">
        <div className="lesson-nav">
          <button 
            className="back-button"
            onClick={onBack}
          >
            ← 返回主頁
          </button>
        </div>

        <div className="lessons-grid-four-columns">
          {lessons.map((lesson) => {
            return (
              <div
                key={lesson.id}
                className={`lesson-card-compact lesson-${lesson.id}`}
                onClick={() => handleLessonSelect(lesson)}
              >
                <div className="lesson-icon">
                  {/* Emoji 由 CSS 控制顯示 */}
                </div>
                <div className="lesson-content">
                  <h3 className="lesson-title-compact">{lesson.title}</h3>
                  <div className="lesson-meta-compact">
                    <span className="difficulty-compact">{lesson.difficulty}</span>
                    <span className="duration-compact">{lesson.duration}</span>
                  </div>
                  <p className="lesson-description-compact">{lesson.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneContainer>
  );
}

export default BasicLessonPage;