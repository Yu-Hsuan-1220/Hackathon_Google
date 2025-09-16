import React, { useState, useRef, useEffect } from 'react';
import PhoneContainer from './PhoneContainer';
import './CameraScreen.css';

const CameraScreen = ({ onBack, onResult }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('正在啟動相機...');
  const [countdown, setCountdown] = useState(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownTimer = useRef(null);
  const captureTimer = useRef(null);

  const startCamera = async () => {
    try {
      setStatusMessage('正在啟動相機...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true);
        setStatusMessage('相機就緒，3秒後自動拍照...');
        setError('');
        
        // 相機就緒後3秒自動拍照
        setTimeout(() => {
          capturePhoto();
        }, 3000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('無法啟動相機，請檢查權限設定');
      setStatusMessage('相機啟動失敗');
    }
  };



  const capturePhoto = async () => {
    if (!videoRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setStatusMessage('正在拍照...');
    setError('');

    // 說"已拍照"
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('已拍照');
      utterance.lang = 'zh-TW';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'photo.jpg');
        
        try {
          setStatusMessage('正在分析姿勢...');
          
          // 修正 API 端點路徑，確保符合 CORS 協議
          const response = await fetch('http://127.0.0.1:8000/pose/check_pose', {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          });
          
          if (!response.ok) {
            if (response.status === 500) {
              throw new Error('後端服務暫時無法使用，可能是 API 配額已用完');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          setStatusMessage('分析完成！');
          
          if (onResult) {
            onResult(result);
          }
        } catch (err) {
          console.error('分析錯誤:', err);
          if (err.message.includes('配額')) {
            setError('後端 API 配額已用完，請稍後再試');
          } else {
            setError('姿勢分析失敗，請重試');
          }
          setStatusMessage('分析失敗');
        }
        
        setIsCapturing(false);
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('拍照錯誤:', error);
      setError('拍照失敗，請重試');
      setStatusMessage('拍照失敗');
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // 清理定時器
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
      if (captureTimer.current) {
        clearTimeout(captureTimer.current);
      }
      // 清理相機串流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleVoiceCommand = (command) => {
    console.log('CameraScreen 收到語音指令:', command);
    
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
          
          {/* 倒數顯示 */}
          {countdown !== null && (
            <div className="phone-countdown-overlay">
              <div className="phone-countdown-circle">
                <span className="phone-countdown-number">{countdown}</span>
              </div>
              <p className="phone-countdown-text">請保持姿勢</p>
            </div>
          )}
          

          
          {/* 拍攝處理覆蓋層 */}
          {isCapturing && (
            <div className="phone-capture-overlay">
              <div className="phone-capture-spinner"></div>
              <p className="phone-capture-text">正在分析姿勢...</p>
            </div>
          )}
          
          {/* 錯誤覆蓋層 */}
          {error && (
            <div className="phone-error-overlay">
              <div className="phone-error-content">
                <span className="phone-error-icon">⚠️</span>
                <p className="phone-error-text">{error}</p>
                <button 
                  className="phone-retry-button" 
                  onClick={() => {
                    setError('');
                    startCamera();
                  }}
                >
                  重試
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneContainer>
  );
};

export default CameraScreen;