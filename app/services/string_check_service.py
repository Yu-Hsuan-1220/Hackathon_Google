import math
import wave
import tempfile
import os
import io
import asyncio
import random
import numpy as np
import librosa
from .tuner_utils import tune_audio, get_frequency_from_audio, get_note_frequency
from .audio_conversion_utils import convert_webm_to_wav

# Major scale sequence for string-pressing tutorial
MAJOR_SCALE_SEQUENCE = [
    "C3",  # Do
    "D3",  # Re
    "E3",  # Mi
    "F3",  # Fa
    "G3",  # Sol
    "A3",  # La
    "B3"   # Ti
]

# Configuration constants
CONFIDENCE_THRESHOLD = 0.7
TUNING_TOLERANCE = 50  # cents

def get_random_string_audio(note: str, status: str) -> str:
    """
    Get a random audio file from the corresponding string folder
    
    Args:
        note (str): Note name (e.g., "C3", "D3", "E3", etc.)
        status (str): Status ("in_tune", "too_high", "too_low", "not_confidence")
    
    Returns:
        str: Path to a random audio file from the folder, or None if not found
    """
    try:
        # Construct folder path for string_check audio
        folder_status = status.replace(" ", "_")
        audio_folder = os.path.join("frontend", "public", "audio", "string_check", f"{note}_{folder_status}")
        
        # Check if folder exists
        if not os.path.exists(audio_folder):
            print(f"Audio folder not found: {audio_folder}")
            return f"audio/string_check/{note}_{folder_status}/default.wav"  # Remove 'public/' prefix
        
        # Get all wav files in the folder
        wav_files = [f for f in os.listdir(audio_folder) if f.endswith('.wav')]
        
        if not wav_files:
            print(f"No WAV files found in folder: {audio_folder}")
            return f"audio/string_check/{note}_{folder_status}/default.wav"  # Remove 'public/' prefix
        
        # Select a random file
        random_file = random.choice(wav_files)
        full_path = f"audio/string_check/{note}_{folder_status}/{random_file}"  # Remove 'public/' prefix
        
        print(f"Selected random audio: {full_path}")
        return full_path
        
    except Exception as e:
        print(f"Error getting random string audio: {e}")
        return f"audio/string_check/{note}_{status}/default.wav"  # Remove 'public/' prefix

def get_next_note(current_note: str) -> str:
    """Get the next note in the major scale sequence"""
    try:
        current_index = MAJOR_SCALE_SEQUENCE.index(current_note)
        if current_index < len(MAJOR_SCALE_SEQUENCE) - 1:
            return MAJOR_SCALE_SEQUENCE[current_index + 1]
        else:
            # If it's the last note (B3), tutorial is complete - return empty string
            return ""  # Empty string indicates completion
    except ValueError:
        # If current note not in sequence, return first note
        return MAJOR_SCALE_SEQUENCE[0]

def can_progress_to_next_note(tuning_status: str, confidence: float) -> bool:
    """
    Determine if user can progress to next note based on tuning and confidence
    """
    return tuning_status == "in tune" and confidence >= CONFIDENCE_THRESHOLD

def determine_status(tuning_status: str, confidence: float) -> str:
    """
    根據調音狀態和信心度確定最終狀態
    
    Args:
        tuning_status (str): 調音狀態 ("in tune", "too high", "too low")
        confidence (float): 信心度 (0.0-1.0)
    
    Returns:
        str: 最終狀態 ("in_tune", "too_high", "too_low", "not_confidence")
    """
    if tuning_status == "in tune":
        if confidence >= CONFIDENCE_THRESHOLD:
            return "in_tune"
        else:
            return "not_confidence"
    elif tuning_status == "too high":
        return "too_high"
    elif tuning_status == "too low":
        return "too_low"
    else:
        return "not_confidence"

def calculate_confidence(detected_freq: float, target_freq: float, audio_file_content: bytes = None) -> float:
    """
    Calculate confidence using Harmonic-to-Noise Ratio (HNR) method
    Higher HNR indicates cleaner pitch detection
    
    Args:
        detected_freq: Detected frequency (kept for compatibility)
        target_freq: Target frequency (kept for compatibility) 
        audio_file_content: Audio data as bytes for HNR analysis
    
    Returns:
        float: Confidence score between 0.0 and 1.0
    """
    if audio_file_content is None:
        # Fallback to frequency-based method if no audio data
        if detected_freq <= 0 or target_freq <= 0:
            return 0.0
        freq_ratio = detected_freq / target_freq
        if 0.5 <= freq_ratio <= 2.0:
            cents_diff = abs(1200 * math.log2(freq_ratio))
            if cents_diff <= 50:
                confidence = 1.0 - (cents_diff / 100)
            else:
                confidence = 0.5 - (cents_diff - 50) / 200
            return max(0.0, min(1.0, confidence))
        else:
            return 0.1
    
    try:
        # Load audio data for HNR analysis
        y, sr = librosa.load(io.BytesIO(audio_file_content), sr=None)
        
        if len(y) == 0:
            return 0.0
        
        # Method 1: Harmonic-to-Noise Ratio (HNR)
        # Separate harmonic and percussive components
        harmonic, percussive = librosa.effects.hpss(y)
        
        # Calculate power of harmonic vs percussive components
        harmonic_power = np.mean(harmonic ** 2)
        percussive_power = np.mean(percussive ** 2)
        noise_power = np.mean((y - harmonic) ** 2)  # Residual as noise
        
        # Use the larger of percussive or noise power as noise estimate
        total_noise_power = max(percussive_power, noise_power)
        
        if total_noise_power == 0 or total_noise_power < 1e-10:
            return 1.0  # Perfect harmonic content, no noise
        
        if harmonic_power == 0:
            return 0.0  # No harmonic content
        
        # Calculate HNR in dB
        hnr_db = 10 * np.log10(harmonic_power / total_noise_power)
        
        # Normalize HNR to 0-1 confidence score
        # Typical HNR values:
        # > 20 dB: Excellent (confidence = 1.0)
        # 10-20 dB: Good (confidence = 0.5-1.0)
        # 0-10 dB: Fair (confidence = 0.2-0.5)
        # < 0 dB: Poor (confidence = 0.0-0.2)
        
        if hnr_db >= 20:
            confidence = 1.0
        elif hnr_db >= 10:
            confidence = 0.5 + (hnr_db - 10) / 20  # Linear scale from 0.5 to 1.0
        elif hnr_db >= 0:
            confidence = 0.2 + (hnr_db / 10) * 0.3  # Linear scale from 0.2 to 0.5
        else:
            confidence = max(0.0, 0.2 + hnr_db / 50)  # Gradual decay below 0 dB
        
        return float(np.clip(confidence, 0.0, 1.0))
        
    except Exception as e:
        print(f"Error calculating HNR confidence: {e}")
        # Fallback to frequency-based method
        if detected_freq <= 0 or target_freq <= 0:
            return 0.0
        freq_ratio = detected_freq / target_freq
        if 0.5 <= freq_ratio <= 2.0:
            cents_diff = abs(1200 * math.log2(freq_ratio))
            if cents_diff <= 50:
                confidence = 1.0 - (cents_diff / 100)
            else:
                confidence = 0.5 - (cents_diff - 50) / 200
            return max(0.0, min(1.0, confidence))
        else:
            return 0.1

async def note_check(target_note: str, audio_file_content: bytes):
    """
    String-pressing tutorial service - Progressive major scale learning
    
    Args:
        target_note: 目標音符 ("AA" for intro, or note like "C3", "D3", etc.)
        audio_file_content: 音頻文件的字節內容
        
    Returns:
        dict: Contains next_note, wav_path, confidence, finish, cent_error, tuning_result
    """
    try:
        print(f"DEBUG: note_check called with target_note='{target_note}', audio_content_length={len(audio_file_content)}")
        print(f"DEBUG: target_note type: {type(target_note)}")
        print(f"DEBUG: audio_file_content type: {type(audio_file_content)}")
        
        # Handle intro request
        if target_note == "AA":
            return {
                "next_note": "C3",  # Start with C3
                "wav_path": "audio/string_check/string_intro.wav",  # Remove 'public/' prefix
                "confidence": 1.0,
                "finish": False,
                "cent_error": 0,
                "tuning_result": "intro"
            }
        
        # Validate target_note
        if not target_note or target_note.strip() == "":
            return {
                "next_note": "C3",
                "wav_path": get_random_string_audio("C3", "not_confidence"),
                "confidence": 0.0,
                "finish": False,
                "cent_error": 0,
                "tuning_result": "invalid_input"
            }
        
        if target_note not in MAJOR_SCALE_SEQUENCE:
            return {
                "next_note": "C3",
                "wav_path": get_random_string_audio("C3", "not_confidence"),
                "confidence": 0.0,
                "finish": False,
                "cent_error": 0,
                "tuning_result": "invalid_note"
            }
        
        # 將音頻字節數據寫入臨時文件 (WebM格式)
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_webm_file:
            temp_webm_file.write(audio_file_content)
            temp_webm_path = temp_webm_file.name
        
        try:
            print(f"DEBUG: Starting audio conversion from WebM to WAV")
            print(f"DEBUG: WebM file size: {os.path.getsize(temp_webm_path)} bytes")
            
            # 轉換 WebM 到 WAV
            temp_wav_path = convert_webm_to_wav(temp_webm_path)
            print(f"DEBUG: WAV conversion completed. WAV file: {temp_wav_path}")
            print(f"DEBUG: WAV file exists: {os.path.exists(temp_wav_path)}")
            if os.path.exists(temp_wav_path):
                print(f"DEBUG: WAV file size: {os.path.getsize(temp_wav_path)} bytes")
            
            # 使用 wave 模塊打開轉換後的音頻文件
            with wave.open(temp_wav_path, 'rb') as audio_file:
                print(f"DEBUG: Successfully opened WAV file")
                print(f"DEBUG: WAV sample rate: {audio_file.getframerate()}")
                print(f"DEBUG: WAV channels: {audio_file.getnchannels()}")
                print(f"DEBUG: WAV sample width: {audio_file.getsampwidth()}")
                print(f"DEBUG: WAV frame count: {audio_file.getnframes()}")
                print(f"DEBUG: Calling tune_audio with target_note={target_note}")
                
                # 使用 tuner_utils 中的 tune_audio 函數
                result = tune_audio(audio_file, target_note, TUNING_TOLERANCE)
                print(f"DEBUG: tune_audio completed. Result keys: {list(result.keys()) if result else 'None'}")
                if result and 'cents_difference' in result:
                    print(f"DEBUG: cents_difference = {result['cents_difference']}")
                elif result and 'error' in result:
                    print(f"DEBUG: tune_audio returned error: {result['error']}")
            
            # 清理臨時文件
            os.unlink(temp_webm_path)
            os.unlink(temp_wav_path)
            
            if "error" in result:
                print(f"DEBUG: Error detected in tune_audio result: {result.get('error')}")
                return {
                    "next_note": target_note,
                    "wav_path": get_random_string_audio(target_note, "not_confidence"),
                    "confidence": 0.0,
                    "finish": False,
                    "cent_error": 0,
                    "tuning_result": "error"
                }
            
            # 提取結果
            target_frequency = result["target_frequency"]
            detected_frequency = result["detected_frequency"]
            cents_off = result["cents_difference"]
            tuning_status = result["tuning_status"]
            
            # 計算信心度（使用 HNR 方法，傳入音頻數據）
            confidence = calculate_confidence(detected_frequency, target_frequency, audio_file_content)
            
            # 確定狀態
            status = determine_status(tuning_status, confidence)
            
            # 判斷是否可以進到下一個音符
            can_progress = can_progress_to_next_note(tuning_status, confidence)
            
            if can_progress:
                next_note = get_next_note(target_note)
                # Check if tutorial is finished (when get_next_note returns empty string)
                is_finished = (next_note == "")
                tuning_result = "success_advance"
            else:
                # Stay on the same note
                next_note = target_note
                is_finished = False
                tuning_result = status
            
            # 獲取隨機音頻路徑
            wav_path = get_random_string_audio(target_note, status)
            
            return {
                "next_note": next_note,
                "wav_path": wav_path,
                "confidence": float(round(confidence, 3)),
                "finish": is_finished,
                "cent_error": float(round(cents_off, 1)),
                "tuning_result": tuning_result,
                # Additional debugging information
                "detected_frequency": float(round(detected_frequency, 2)),
                "target_frequency": float(round(target_frequency, 2))
            }
            
        except Exception as e:
            # 清理臨時文件
            if os.path.exists(temp_webm_path):
                os.unlink(temp_webm_path)
            if 'temp_wav_path' in locals() and os.path.exists(temp_wav_path):
                os.unlink(temp_wav_path)
            raise e
            
    except Exception as e:
        print(f"Error in note_check: {e}")
        safe_note = target_note if target_note in MAJOR_SCALE_SEQUENCE else "C3"
        return {
            "next_note": safe_note,
            "wav_path": get_random_string_audio(safe_note, "not_confidence"),
            "confidence": 0.0,
            "finish": False,
            "cent_error": 0,
            "tuning_result": "error"
        }
