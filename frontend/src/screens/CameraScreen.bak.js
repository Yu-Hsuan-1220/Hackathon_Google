import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const CameraScreen = () => {
  // 狀態管理
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('intro'); // intro -> camera -> analysis -> feedback
  const [statusText, setStatusText] = useState('初始化中...');
  const [sound, setSound] = useState();
  
  // 相機相關
  const cameraRef = useRef(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    initializeApp();
    
    return () => {
      // 清理音頻資源
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // 初始化應用
  const initializeApp = async () => {
    try {
      // 請求權限
      await requestPermissions();
      
      // 調用後端intro API
      await callIntroAPI();
      
    } catch (error) {
      console.error('初始化失敗:', error);
      Alert.alert('錯誤', '應用初始化失敗，請重試');
      setIsLoading(false);
    }
  };

  // 請求所需權限
  const requestPermissions = async () => {
    try {
      // 請求相機權限
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('權限錯誤', '需要相機權限才能拍攝吉他姿勢');
        return;
      }

      // 請求音頻權限
      const audioStatus = await Audio.requestPermissionsAsync();
      if (audioStatus.status !== 'granted') {
        Alert.alert('權限錯誤', '需要音頻權限才能播放語音指導');
        return;
      }

      // 請求媒體庫權限
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      if (mediaLibraryStatus.status !== 'granted') {
        console.log('媒體庫權限未授予，但應用仍可繼續');
      }

      setHasPermission(true);
    } catch (error) {
      console.error('權限請求失敗:', error);
      setHasPermission(false);
    }
  };

  // 調用後端intro API
  const callIntroAPI = async () => {
    try {
      setStatusText('獲取頁面介紹中...');
      
      const response = await fetch('http://127.0.0.1:8001/api/intro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '開始吉他姿勢檢查'
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('audio')) {
          // 如果回應是音頻文件
          const audioBlob = await response.blob();
          await playAudioFromBlob(audioBlob);
        } else {
          // 如果回應是JSON文本
          const data = await response.json();
          const introText = data.message || '歡迎使用吉他姿勢檢查器！請準備好您的吉他，我們將為您分析演奏姿勢是否正確。';
          await playTextToSpeech(introText);
        }
      } else {
        throw new Error('API調用失敗');
      }
    } catch (error) {
      console.error('調用intro API失敗:', error);
      // 降級處理：使用預設介紹
      const fallbackText = '歡迎使用吉他姿勢檢查器！請準備好您的吉他，我們將為您分析演奏姿勢是否正確。請保持正確的坐姿和持琴姿勢。';
      await playTextToSpeech(fallbackText);
    }
  };

  // 播放音頻blob
  const playAudioFromBlob = async (audioBlob) => {
    try {
      setStatusText('播放介紹中...');
      
      // 將blob轉換為base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: base64data },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setCurrentStep('camera');
            setStatusText('準備拍照...');
            setIsLoading(false);
            // 3秒後自動拍照
            setTimeout(() => {
              takePicture();
            }, 3000);
          }
        });
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('播放音頻失敗:', error);
      // 降級到TTS
      await playTextToSpeech('歡迎使用吉他姿勢檢查器！');
    }
  };

  // 使用TTS播放文字
  const playTextToSpeech = async (text) => {
    try {
      setStatusText('播放介紹中...');
      
      await Speech.speak(text, {
        language: 'zh-TW',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setCurrentStep('camera');
          setStatusText('準備拍照...');
          setIsLoading(false);
          // 3秒後自動拍照
          setTimeout(() => {
            takePicture();
          }, 3000);
        },
        onError: (error) => {
          console.error('TTS播放失敗:', error);
          setCurrentStep('camera');
          setStatusText('準備拍照...');
          setIsLoading(false);
          setTimeout(() => {
            takePicture();
          }, 3000);
        }
      });
    } catch (error) {
      console.error('TTS初始化失敗:', error);
      setCurrentStep('camera');
      setStatusText('準備拍照...');
      setIsLoading(false);
      setTimeout(() => {
        takePicture();
      }, 3000);
    }
  };

  // 自動拍照功能
  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setCurrentStep('analysis');
      setStatusText('正在拍照...');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      setStatusText('照片拍攝完成，正在分析姿勢...');
      
      // 將照片發送到後端進行分析
      await analyzePose(photo);

    } catch (error) {
      console.error('拍照失敗:', error);
      Alert.alert('拍照失敗', '請重試拍照功能');
      setIsProcessing(false);
      setCurrentStep('camera');
      setStatusText('準備拍照...');
    }
  };

  // 分析姿勢
  const analyzePose = async (photo) => {
    try {
      setStatusText('正在分析您的吉他姿勢...');

      // 準備FormData
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'guitar_pose.jpg',
      });

      const response = await fetch('http://127.0.0.1:8001/pose/check-pose', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // 檢查是否有音頻回應
        if (result.audio_url) {
          // 播放後端返回的音頻
          await playAnalysisAudio(result.audio_url, result.suggestion);
        } else {
          // 使用TTS播放文字建議
          await playAnalysisText(result.suggestion || '姿勢分析完成');
        }
      } else {
        throw new Error('姿勢分析失敗');
      }

    } catch (error) {
      console.error('姿勢分析失敗:', error);
      Alert.alert('分析失敗', '姿勢分析失敗，請重試');
      
      // 重置到拍照狀態
      setIsProcessing(false);
      setCurrentStep('camera');
      setStatusText('準備拍照...');
      
      setTimeout(() => {
        takePicture();
      }, 3000);
    }
  };

  // 播放分析結果音頻
  const playAnalysisAudio = async (audioUrl, suggestionText) => {
    try {
      setCurrentStep('feedback');
      setStatusText('播放姿勢建議中...');

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          // 播放完成，重新開始流程
          resetToStart();
        }
      });

    } catch (error) {
      console.error('播放分析音頻失敗:', error);
      // 降級到TTS
      await playAnalysisText(suggestionText);
    }
  };

  // 播放分析結果文字
  const playAnalysisText = async (text) => {
    try {
      setCurrentStep('feedback');
      setStatusText('播放姿勢建議中...');

      await Speech.speak(text, {
        language: 'zh-TW',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          // 播放完成，重新開始流程
          resetToStart();
        },
        onError: (error) => {
          console.error('TTS播放失敗:', error);
          resetToStart();
        }
      });

    } catch (error) {
      console.error('播放分析文字失敗:', error);
      resetToStart();
    }
  };

  // 重置到開始狀態
  const resetToStart = () => {
    setIsProcessing(false);
    setCurrentStep('camera');
    setStatusText('準備進行下一次檢查...');
    
    // 5秒後重新開始
    setTimeout(() => {
      setStatusText('準備拍照...');
      setTimeout(() => {
        takePicture();
      }, 3000);
    }, 5000);
  };

  // 手動拍照按鈕
  const handleManualCapture = () => {
    if (currentStep === 'camera' && !isProcessing) {
      takePicture();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>正在請求權限...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>需要相機權限才能使用此功能</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermissions}>
          <Text style={styles.retryButtonText}>重新請求權限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{statusText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 頂部狀態欄 */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>9:41</Text>
        <Text style={styles.titleText}>吉他姿勢 - Explain, judge</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.signalText}>📶</Text>
          <Text style={styles.batteryText}>🔋</Text>
        </View>
      </View>

      {/* 功能描述 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.stepText}>1. 吉他握法</Text>
      </View>

      {/* 相機預覽 */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {/* 相機覆蓋層 */}
          <View style={styles.cameraOverlay}>
            {currentStep === 'camera' && (
              <View style={styles.aimingGuide}>
                <Text style={styles.guideText}>請將吉他放在畫面中央</Text>
                <View style={styles.aimingFrame} />
              </View>
            )}
            
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.processingText}>正在處理...</Text>
              </View>
            )}
          </View>
        </Camera>
      </View>

      {/* 底部控制區 */}
      <View style={styles.bottomContainer}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        
        {currentStep === 'camera' && !isProcessing && (
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={handleManualCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}

        {/* 選項按鈕 */}
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  titleText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalText: {
    fontSize: 16,
  },
  batteryText: {
    fontSize: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#333333',
  },
  stepText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  aimingGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  aimingFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  processingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CameraScreen;