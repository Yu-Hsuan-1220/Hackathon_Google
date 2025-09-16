import React from 'react';
import PhoneContainer from './PhoneContainer';
import FeatureCarousel from './FeatureCarousel';
import './HomePage.css';

function HomePage({ onNavigate }) {
  const userName = localStorage.getItem('userName') || '用戶';
  const features = [
    {
      id: 'tuner',
      title: '調音器',
      description: '為您的吉他進行精準調音，確保音準完美',
      icon: '🎼',
      color: '#9B59B6'
    },
    {
      id: 'guitar-lesson',
      title: '吉他教學',
      description: '學習正確的吉他姿勢和彈奏技巧',
      icon: '🎸',
      color: '#FF6B6B'
    },
    {
      id: 'metronome',
      title: '節拍器',
      description: '練習節拍感和保持穩定的演奏速度',
      icon: '⏱️',
      color: '#4ECDC4'
    },
    {
      id: 'song-tutorial',
      title: '歌曲教學',
      description: '學習經典歌曲的演奏方法',
      icon: '🎵',
      color: '#45B7D1'
    }
  ];

  const handleVoiceCommand = (command) => {
    console.log('HomePage 收到語音指令:', command);
    
    // 處理導航指令
    if (command.includes('調音器') || command.includes('調音')) {
      onNavigate('tuner');
    } else if (command.includes('吉他教學') || command.includes('吉他') || command.includes('教學')) {
      onNavigate('guitar-lesson');
    } else if (command.includes('節拍器') || command.includes('節拍')) {
      onNavigate('metronome');
    } else if (command.includes('歌曲教學') || (command.includes('歌曲') && command.includes('教學'))) {
      onNavigate('song-tutorial');
    } else if (command.includes('歌曲練習') || command.includes('練習')) {
      onNavigate('song-practice');
    } else if (command.includes('姿勢檢測') || command.includes('檢測')) {
      onNavigate('guitar-lesson');
    }
  };

  const handleResetUserData = () => {
    if (window.confirm('確定要重置所有使用者資料嗎？這將清除您的姓名和學習進度。')) {
      // 清除所有本地存儲的使用者資料
      localStorage.removeItem('userName');
      localStorage.removeItem('isFirstTime');
      localStorage.removeItem('hasCompletedNameInput');
      localStorage.removeItem('hasCompletedTuning');
      
      // 重新載入頁面以觸發首次使用者流程
      window.location.reload();
    }
  };

  return (
    <PhoneContainer 
      title={`🎸 歡迎回來，${userName}！`}
      onVoiceCommand={handleVoiceCommand}
      enableVoice={true}
      showStatusBar={true}
    >
      <div className="home-content">
        {/* 使用新的功能陳列組件 */}
        <FeatureCarousel 
          features={features}
          onFeatureSelect={onNavigate}
        />
        
        {/* 管理者專用按鈕 */}
        <div className="admin-section">
          <button 
            className="admin-reset-btn"
            onClick={handleResetUserData}
            title="重置所有使用者資料"
          >
            ⚙️ 管理者專用
          </button>
        </div>
      </div>
    </PhoneContainer>
  );
}

export default HomePage;