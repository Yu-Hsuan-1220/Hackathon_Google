import tempfile
import os
import random
from app.services.tuner_service import tune_guitar_string

# 單音教學序列 - 7個音符的學習順序 (C大調音階)
LESSON_SEQUENCE = [
    "C4",  # 1. Do
    "D4",  # 2. Re
    "E4",  # 3. Mi  
    "F4",  # 4. Fa
    "G4",  # 5. Sol
    "A4",  # 6. La
    "B4"   # 7. Si
]

# 音符到弦號的映射 (根據吉他指板位置)
NOTE_TO_STRING = {
    "C4": "2",  # 第二弦第一格
    "D4": "2",  # 第二弦第三格
    "E4": "1",  # 第一弦空弦
    "F4": "1",  # 第一弦第一格
    "G4": "1",  # 第一弦第三格
    "A4": "1",  # 第一弦第五格
    "B4": "1"   # 第一弦第七格
}

async def note_check(target_note: str, audio_content: bytes) -> dict:
    """
    單音檢查服務 - 根據 target_note 進行音準檢查
    
    Args:
        target_note (str): 目標音符或特殊指令（如 "AA"）
        audio_content (bytes): 音檔內容
    
    Returns:
        dict: 包含檢查結果和下一個音符
    """
    try:
        # 處理初始化請求
        if target_note == "AA":
            return {
                "success": True,
                "target_note": LESSON_SEQUENCE[0],  # 返回第一題
                "target_frequency": get_note_frequency(LESSON_SEQUENCE[0]),
                "detected_frequency": 0,
                "cents_off": 0,
                "confidence": 1,
                "is_in_tune": True,
                "tuning_tolerance": 30,
                "tuning_status": "intro",
                "determined_status": "intro",
                "audio_path": "audio/string_check/string_check_intro.wav"  # 教學介紹音檔
            }
        
        # 檢查是否為有效的音符
        if target_note not in NOTE_TO_STRING:
            return {
                "success": False,
                "target_note": target_note,
                "target_frequency": 0,
                "detected_frequency": 0,
                "cents_off": 0,
                "confidence": 0,
                "is_in_tune": False,
                "tuning_tolerance": 30,
                "tuning_status": "error",
                "determined_status": "error",
                "audio_path": None
            }
        
        # 獲取對應的弦號
        string_num = NOTE_TO_STRING[target_note]
        
        # 保存音檔到臨時文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name
        
        try:
            # 直接使用目標音符進行分析，而不是通過弦號映射
            # 這樣可以避免音符映射錯誤的問題
            print(f"DEBUG: Analyzing audio for target note: {target_note}")
            
            # 將音檔轉換為 wav 格式
            from app.services.audio_conversion_utils import convert_audio_to_wav
            wav_file_path = convert_audio_to_wav(temp_file_path)
            print(f"DEBUG: Converted to wav: {wav_file_path}")
            
            # 直接使用 tune_audio 函數分析音準
            import wave
            from app.services.tuner_utils import tune_audio
            
            with wave.open(wav_file_path, 'rb') as audio_file:
                tuning_result = tune_audio(audio_file, target_note, tolerance_cents=30)
            
            print(f"DEBUG: Tuning result: {tuning_result}")
            
            # 判斷是否成功
            is_success = tuning_result.get("tuning_status") == "in tune"
            cents_error = tuning_result.get("cents_difference", 0)
            detected_frequency = tuning_result.get("detected_frequency", 0)
            tuning_status = tuning_result.get("tuning_status", "unknown")
            
            # 清理轉換後的 wav 文件
            if wav_file_path != temp_file_path and os.path.exists(wav_file_path):
                os.remove(wav_file_path)
            
            # 獲取音檔路徑 - 傳入當前音符而不是弦號
            audio_path = get_lesson_audio_path(target_note, tuning_status)
            
            # 確定下一個音符（只有成功時才前進）
            if is_success:
                next_note = get_next_note(target_note)
            else:
                next_note = target_note  # 失敗時保持當前題目
            
            return {
                "success": is_success,
                "target_note": next_note,  # 成功時是下一題，失敗時是當前題
                "target_frequency": get_note_frequency(target_note),
                "detected_frequency": detected_frequency,
                "cents_off": cents_error,
                "confidence": 1 if is_success else 0,
                "is_in_tune": is_success,
                "tuning_tolerance": 30,
                "tuning_status": tuning_status,
                "determined_status": tuning_status.replace(" ", "_"),
                "audio_path": audio_path
            }
            
        finally:
            # 清理臨時文件
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        print(f"Error in note_check: {str(e)}")
        return {
            "success": False,
            "target_note": target_note,
            "target_frequency": 0,
            "detected_frequency": 0,
            "cents_off": 0,
            "confidence": 0,
            "is_in_tune": False,
            "tuning_tolerance": 30,
            "tuning_status": "error",
            "determined_status": "error",
            "audio_path": None
        }

def get_note_frequency(note: str) -> float:
    """獲取音符的頻率"""
    frequencies = {
        "C4": 261.63,  # Do
        "D4": 293.66,  # Re
        "E4": 329.63,  # Mi
        "F4": 349.23,  # Fa
        "G4": 392.00,  # Sol
        "A4": 440.00,  # La
        "B4": 493.88   # Si
    }
    return frequencies.get(note, 0.0)

def get_next_note(current_note: str) -> str:
    """獲取下一個要練習的音符"""
    try:
        current_index = LESSON_SEQUENCE.index(current_note)
        if current_index < len(LESSON_SEQUENCE) - 1:
            return LESSON_SEQUENCE[current_index + 1]
        else:
            # 如果已經是最後一個音符，返回空字符串表示完成
            return ""
    except ValueError:
        # 如果當前音符不在序列中，返回第一個音符
        return LESSON_SEQUENCE[0]

def get_lesson_audio_path(current_note: str, tuning_status: str) -> str:
    """獲取教學音檔路徑"""
    try:
        # 格式化調音狀態
        status_folder = tuning_status.replace(" ", "_")
        
        # 獲取當前是第幾題（從1開始）
        try:
            question_number = LESSON_SEQUENCE.index(current_note) + 1
        except ValueError:
            question_number = 1
        
        # 構建音檔路徑 - 使用 string_check 格式
        audio_path = f"audio/string_check/string_check{question_number}_{status_folder}/feedback.wav"
        
        # 檢查文件是否存在
        full_path = os.path.join("frontend/public", audio_path)
        if os.path.exists(full_path):
            return audio_path
        else:
            # 如果找不到對應的音檔，返回通用的介紹音檔
            return "audio/string_check/string_check_intro.wav"
            
    except Exception as e:
        print(f"Error getting lesson audio path: {e}")
        return "audio/string_check/string_check_intro.wav"