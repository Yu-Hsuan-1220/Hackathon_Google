import React, { useState, useRef, useEffect } from 'react';
import './CameraScreen.css';

const CameraScreen = ({ onBack, onResult }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      setError('無法啟動相機');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
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
          const response = await fetch('http://localhost:8000/pose/check_pose', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (onResult) {
            onResult(result);
          }
        } catch (err) {
          setError('分析失敗');
        }
        
        setIsCapturing(false);
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      setError('拍照失敗');
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-container">
      <div className="phone-container">
        <div className="app-header">
          <h1>吉他姿勢檢測</h1>
        </div>
        
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-stream"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="controls">
          <button onClick={onBack} disabled={isCapturing}>
            返回
          </button>
          <button 
            onClick={capturePhoto} 
            disabled={!isCameraReady || isCapturing}
          >
            {isCapturing ? '分析中...' : '拍照分析'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;