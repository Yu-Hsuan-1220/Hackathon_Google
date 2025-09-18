import React, { useEffect, useRef } from 'react';
import PhoneContainer from './PhoneContainer';
import './BasicLessonPage.css';

function BasicLessonPage({ onBack, onNavigate }) {
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;
      checkAndPlayIntro();
    }
  }, []);


  const checkAndPlayIntro = () => {
    const audio = new Audio(`/menu_intro.wav`);
    
    // 檢查音檔是否存在
    audio.oncanplaythrough = () => {
      // 音檔存在，直接播放
      audio.play();
      audio.onended = () => {
        startVoiceRecognition();
      };
    };
    
    audio.onerror = async () => {
      // 音檔不存在，發送API請求
      await fetch(`http://localhost:8000/menu/intro`);
      setTimeout(() => {
        const newAudio = new Audio(`/menu_intro.wav`);
        newAudio.play();
        newAudio.onended = () => {
          startVoiceRecognition();
        };
      }, 1000);
    };
    
    audio.load();

  };
  
  const startVoiceRecognition = () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'zh-TW';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.start();

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        await sendActionAPI(transcript);
      };

      // 智能停止收音 - 3秒後自動停止
      setTimeout(() => {
        recognition.stop();
      }, 3000);
    } catch (error) {
      console.log('語音辨識不支持');
    }
  };

  const sendActionAPI = async (voiceInput) => {
    try {
      const response = await fetch(`http://localhost:8000/menu/action?user_input=${encodeURIComponent(voiceInput)}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      const actionId = data.Response;
      
      // 根據 id 進行頁面跳轉
      switch(actionId) {
        case 1:
          onNavigate('guitar-grip');
          break;
        case 2:
          onNavigate('tuner');
          break;
        case 3:
          onNavigate('single-note');
          break;
        case 4:
          onNavigate('chord-practice');
          break;
        case 5:
          onNavigate('song-twinkle-star');
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('API調用失敗');
    }
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
      route: 'single-note'
    },
    {
      id: 4,
      title: '基本和弦練習',
      description: '學習 C、G、D 等基本和弦的按法',
      difficulty: '中級',
      duration: '15 分鐘',
      route: 'chord-practice'
    },
    {
      id: 5,
      title: '小星星練習',
      description: '學習彈奏經典兒歌《小星星》',
      difficulty: '中級',
      duration: '25 分鐘',
      route: 'song-twinkle-star'
    }
  ];

  const handleLessonSelect = (lesson) => {
    onNavigate(lesson.route);
  };

  const handleVoiceCommand = (command) => {
    // 簡化的語音指令處理
  };

  return (
    <PhoneContainer 
      title="📚 基礎教學"
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
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