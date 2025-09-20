import React, { useState, useRef, useEffect } from 'react';
import PhoneContainer from './PhoneContainer';
import './CameraScreen.css';

const CameraScreen = ({ onBack, onResult }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('正在載入...');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const hasCalledIntro = useRef(false);
  const currentAudio = useRef(null);

  const deleteAudioFile = async (filename) => {
    await fetch(`http://localhost:8000/home/delete?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  };

  // 播放相機介紹音檔
  const playIntro = () => {
    const audio = new Audio('/pose_intro.wav');
    currentAudio.current = audio;
    
    audio.oncanplaythrough = () => {
      audio.play();
    };
    
    audio.onended = () => {
      currentAudio.current = null;
      deleteAudioFile('pose_intro.wav');
      startCamera();
    };
    
    audio.onerror = async () => {
      await fetch(`http://localhost:8000/pose/intro`);
      
      // 輪詢檢查音檔是否已生成
      const checkAudioReady = () => {
        const newAudio = new Audio(`/pose_intro.wav`);
        currentAudio.current = newAudio;
        
        newAudio.oncanplaythrough = () => {
          newAudio.play();
        };
        
        newAudio.onended = () => {
          currentAudio.current = null;
          deleteAudioFile('pose_intro.wav');
          startCamera();
        };
        
        newAudio.onerror = () => {
          setTimeout(checkAudioReady, 500);
        };
        
        newAudio.load();
      };
      
      setTimeout(checkAudioReady, 1000);
    };
    
    audio.load();
  };

  const startCamera = async () => {
    setStatusMessage('正在啟動相機...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setStatusMessage('相機就緒，3秒後自動拍照...');
      
      setTimeout(() => {
        capturePhoto();
      }, 3000);
    }
  };



  const capturePhoto = async () => {
    if (!videoRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setStatusMessage('正在拍照...');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');
      
      setStatusMessage('拍照完成！');
      
      if (onResult) {
        onResult({ photoData: formData });
      }
      
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    if (!hasCalledIntro.current) {
      hasCalledIntro.current = true;
      playIntro();
    }
    return () => {
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
        currentAudio.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleVoiceCommand = (command) => {
    if (command.includes('返回') || command.includes('回去')) {
      if (onBack) onBack();
    }
  };

  return (
    <PhoneContainer 
      title="握法姿勢分析" 
      onVoiceCommand={handleVoiceCommand}
      enableVoice={false}
    >
      <div className="camera-screen-wrapper">
        {/* 相機區域佔據剩餘空間 */}
        <div className="camera-view-area">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="phone-camera-video"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* 返回按鈕在左下角 */}
          <button 
            className="bottom-left-back-button" 
            onClick={onBack} 
            disabled={isCapturing}
          >
            ← 返回
          </button>

          {/* 狀態顯示在頂部 */}
          <div className="camera-status-overlay">
            <p className="status-text">{statusMessage}</p>
          </div>
          

          

          
          {/* 拍攝處理覆蓋層 */}
          {isCapturing && (
            <div className="phone-capture-overlay">
              <div className="phone-capture-spinner"></div>
              <p className="phone-capture-text">正在拍照...</p>
            </div>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
};

export default CameraScreen;