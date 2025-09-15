import React, { useState, useEffect, useRef } from 'react';
import './FeatureCarousel.css';

const FeatureCarousel = ({ features, onFeatureSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const carouselRef = useRef(null);

  // 自動輪播功能（可選）
  useEffect(() => {
    const nextSlide = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % features.length);
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000); // 5秒自動切換

    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning, features.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // 觸控手勢處理
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // 計算每個卡片的位置和樣式
  const getCardStyle = (index) => {
    const position = (index - currentIndex + features.length) % features.length;
    const totalCards = features.length;
    
    let transform = '';
    let opacity = 1;
    let scale = 1;
    let zIndex = 1;

    if (position === 0) {
      // 中間卡片 - 最大、最前面
      transform = 'translateX(0%) rotateY(0deg)';
      scale = 1.2;
      zIndex = 10;
      opacity = 1;
    } else if (position === 1 || position === totalCards - 1) {
      // 兩側卡片
      const isRight = position === 1;
      const translateX = isRight ? '70%' : '-70%';
      const rotateY = isRight ? '-25deg' : '25deg';
      transform = `translateX(${translateX}) rotateY(${rotateY})`;
      scale = 0.8;
      zIndex = 5;
      opacity = 0.7;
    } else {
      // 隱藏的卡片
      const isRight = position < totalCards / 2;
      const translateX = isRight ? '140%' : '-140%';
      const rotateY = isRight ? '-45deg' : '45deg';
      transform = `translateX(${translateX}) rotateY(${rotateY})`;
      scale = 0.6;
      zIndex = 1;
      opacity = 0.3;
    }

    return {
      transform: `${transform} scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <div className="feature-carousel">
      <div className="carousel-header">
        <h2>🎸 學習功能</h2>
        <p>滑動或點擊選擇你想要的功能</p>
      </div>

      <div 
        className="carousel-container"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button 
          className="carousel-btn carousel-btn-prev"
          onClick={prevSlide}
          disabled={isTransitioning}
        >
          ‹
        </button>

        <div className="carousel-track">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`carousel-card ${index === currentIndex ? 'active' : ''}`}
              style={getCardStyle(index)}
              onClick={() => {
                if (index === currentIndex) {
                  onFeatureSelect(feature.id);
                } else {
                  goToSlide(index);
                }
              }}
            >
              <div className="card-content">
                <div className="card-icon">{feature.icon}</div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-description">{feature.description}</p>
                <div 
                  className="card-accent"
                  style={{ backgroundColor: feature.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="carousel-btn carousel-btn-next"
          onClick={nextSlide}
          disabled={isTransitioning}
        >
          ›
        </button>
      </div>

      {/* 指示器 */}
      <div className="carousel-indicators">
        {features.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* 當前功能信息 */}
      <div className="current-feature-info">
        <div className="feature-preview">
          <span className="preview-icon">{features[currentIndex].icon}</span>
          <div className="preview-text">
            <h4>{features[currentIndex].title}</h4>
            <p>{features[currentIndex].description}</p>
          </div>
          <button 
            className="start-button"
            style={{ backgroundColor: features[currentIndex].color }}
            onClick={() => onFeatureSelect(features[currentIndex].id)}
          >
            開始體驗
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureCarousel;