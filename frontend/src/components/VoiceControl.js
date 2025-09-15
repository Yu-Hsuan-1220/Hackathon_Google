import React, { useState, useEffect, useRef } from 'react';
import './VoiceControl.css';

const VoiceControl = ({ onVoiceCommand, isEnabled = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 檢查瀏覽器是否支援語音識別
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      
      // 更詳細的語音識別設定
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-TW'; // 繁體中文
      recognition.maxAlternatives = 1;
      
      // 添加更多語音識別設定（如果瀏覽器支援）
      if ('webkitSpeechRecognition' in window) {
        recognition.serviceURI = undefined; // 使用預設服務
      }

      recognition.onstart = () => {
        console.log('🎤 語音識別已開始');
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('🛑 語音識別已結束');
        setIsListening(false);
        
        // 如果麥克風仍啟用且沒有錯誤，自動重新開始
        if (isMicrophoneEnabled) {
          console.log('⚡ 準備重新開始語音識別...');
          setTimeout(() => {
            if (isMicrophoneEnabled && recognitionRef.current) {
              try {
                console.log('🔄 重新開始語音識別');
                recognitionRef.current.start();
              } catch (error) {
                console.error('❌ 重新開始失敗:', error);
                if (error.name === 'InvalidStateError') {
                  console.log('⏳ 等待更長時間後重試...');
                  setTimeout(() => {
                    if (isMicrophoneEnabled && recognitionRef.current) {
                      try {
                        recognitionRef.current.start();
                      } catch (e) {
                        console.error('❌ 第二次重試也失敗:', e);
                      }
                    }
                  }, 1000);
                }
              }
            }
          }, 500); // 增加延遲時間
        }
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          console.log(`📝 識別結果 ${i}: "${transcript}" (信心度: ${confidence || 'N/A'})`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // 顯示當前識別的文字
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript.trim()) {
          console.log('🗣️ 當前識別:', currentTranscript);
          setTranscript(currentTranscript);
        }

        // 處理最終結果
        if (finalTranscript && finalTranscript.trim() && onVoiceCommand) {
          console.log('✅ 發送語音指令:', finalTranscript.trim());
          onVoiceCommand(finalTranscript.trim());
          
          // 延遲清除，讓用戶看到結果
          setTimeout(() => {
            setTranscript('');
          }, 3000);
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ 語音識別錯誤:', event.error, event);
        setIsListening(false);
        
        // 根據不同錯誤類型處理
        switch (event.error) {
          case 'no-speech':
            console.log('🔇 未檢測到語音，繼續監聽...');
            // 不需要特別處理，讓 onend 自動重啟
            break;
          case 'audio-capture':
            console.error('🎤 無法捕獲音頻，請檢查麥克風');
            setIsMicrophoneEnabled(false);
            alert('無法捕獲音頻，請檢查麥克風是否正常工作');
            break;
          case 'not-allowed':
            console.error('🚫 麥克風權限被拒絕');
            setIsMicrophoneEnabled(false);
            alert('麥克風權限被拒絕，請在瀏覽器設定中允許麥克風存取');
            break;
          case 'network':
            console.error('🌐 網路錯誤，語音識別服務無法連接');
            // 稍後重試
            setTimeout(() => {
              if (isMicrophoneEnabled && recognitionRef.current) {
                console.log('🔄 網路錯誤後重試...');
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.error('❌ 網路錯誤重試失敗:', e);
                }
              }
            }, 2000);
            break;
          default:
            console.error('❓ 未知錯誤:', event.error);
            break;
        }
      };

      recognition.onspeechstart = () => {
        console.log('🗣️ 檢測到語音開始');
      };

      recognition.onspeechend = () => {
        console.log('🤐 語音結束');
      };

      recognition.onsoundstart = () => {
        console.log('🔊 檢測到聲音');
      };

      recognition.onsoundend = () => {
        console.log('🔇 聲音結束');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isMicrophoneEnabled, onVoiceCommand]);

  const toggleMicrophone = async () => {
    if (!isSupported || !isEnabled) {
      console.log('❌ 語音識別不受支援或未啟用');
      return;
    }

    if (isMicrophoneEnabled) {
      // 關閉麥克風
      console.log('🔴 關閉麥克風');
      setIsMicrophoneEnabled(false);
      setIsListening(false);
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('停止語音識別時發生錯誤:', error);
        }
      }
    } else {
      // 開啟麥克風
      try {
        console.log('🟢 嘗試開啟麥克風...');
        
        // 先檢查權限狀態
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({name: 'microphone'});
          console.log('🎤 麥克風權限狀態:', permission.state);
        }
        
        // 請求麥克風權限
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        });
        
        console.log('✅ 麥克風權限獲得，音頻流:', stream);
        
        // 立即關閉音頻流，我們只需要權限
        stream.getTracks().forEach(track => track.stop());
        
        setIsMicrophoneEnabled(true);
        
        // 等待狀態更新後再開始語音識別
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              console.log('🎯 開始語音識別');
              recognitionRef.current.start();
            } catch (error) {
              console.error('❌ 啟動語音識別失敗:', error);
              if (error.name === 'InvalidStateError') {
                console.log('⚠️ 語音識別已在運行，等待重置...');
                setTimeout(() => {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {
                    console.error('❌ 重試啟動失敗:', e);
                  }
                }, 1000);
              }
            }
          }
        }, 100);
        
      } catch (error) {
        console.error('❌ 無法獲得麥克風權限:', error);
        
        let errorMessage = '無法獲得麥克風權限。';
        if (error.name === 'NotAllowedError') {
          errorMessage += '\n請在瀏覽器設定中允許此網站使用麥克風。';
        } else if (error.name === 'NotFoundError') {
          errorMessage += '\n未找到麥克風設備，請檢查硬體連接。';
        } else if (error.name === 'NotReadableError') {
          errorMessage += '\n麥克風被其他應用程式佔用，請關閉其他使用麥克風的程式。';
        }
        
        alert(errorMessage);
        setIsMicrophoneEnabled(false);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-control unsupported">
        <span className="unsupported-text">您的瀏覽器不支援語音識別</span>
      </div>
    );
  }

  return (
    <div className="voice-control">
      <button 
        className={`mic-button ${isMicrophoneEnabled ? 'enabled' : 'disabled'} ${isListening ? 'listening' : ''}`}
        onClick={toggleMicrophone}
        disabled={!isEnabled}
        title={isMicrophoneEnabled ? '關閉麥克風' : '開啟麥克風'}
      >
        <div className="mic-icon">
          {isMicrophoneEnabled ? '🎤' : '🎙️'}
        </div>
        {isListening && <div className="listening-indicator"></div>}
      </button>
      
      {transcript && (
        <div className="transcript">
          <span className="transcript-label">識別中:</span>
          <span className="transcript-text">{transcript}</span>
        </div>
      )}
      
      <div className="voice-status">
        {isMicrophoneEnabled ? (
          isListening ? '🔴 正在聆聽...' : '🟢 等待語音中...'
        ) : '⚫ 點擊開啟語音'}
      </div>
      
      {/* 調試信息 - 開發時可見 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <small>
            支援: {isSupported ? '✅' : '❌'} | 
            啟用: {isEnabled ? '✅' : '❌'} | 
            麥克風: {isMicrophoneEnabled ? '🟢' : '🔴'} | 
            監聽: {isListening ? '🎤' : '💤'}
          </small>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;