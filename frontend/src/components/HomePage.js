import React from 'react';
import PhoneContainer from './PhoneContainer';
import FeatureCarousel from './FeatureCarousel';
import './HomePage.css';

function HomePage({ onNavigate }) {
  const features = [
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
    },
    {
      id: 'song-practice',
      title: '歌曲練習',
      description: '練習你喜愛的歌曲並提升技巧',
      icon: '🎤',
      color: '#96CEB4'
    }
  ];

  const handleVoiceCommand = (command) => {
    console.log('HomePage 收到語音指令:', command);
    
    // 處理導航指令
    if (command.includes('吉他教學') || command.includes('吉他') || command.includes('教學')) {
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

  return (
    <PhoneContainer 
      title="🎸 吉他學習平台"
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
        
        <section className="recent-activity">
          <h2>最近活動</h2>
          <div className="activity-cards">
            <div className="activity-card">
              <div className="activity-icon">🎯</div>
              <div className="activity-content">
                <h4>完成吉他基礎課程</h4>
                <p>2 小時前</p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🎵</div>
              <div className="activity-content">
                <h4>練習《小星星》</h4>
                <p>1 天前</p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon">⏱️</div>
              <div className="activity-content">
                <h4>節拍器練習</h4>
                <p>3 天前</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PhoneContainer>
  );
}

export default HomePage;