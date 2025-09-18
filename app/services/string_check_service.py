import tempfile
import os
import random
from app.services.tuner_service import tune_guitar_string

# 單音教學序列 - 7個音符的學習順序
LESSON_SEQUENCE = [
    "E2",  # 第六弦
    "A2",  # 第五弦  
    "D3",  # 第四弦
    "G3",  # 第三弦
    "B3",  # 第二弦
    "E4",  # 第一弦
    "G3"   # 重複第三弦作為最後一題
]

# 音符到弦號的映射
NOTE_TO_STRING = {
    "E2": "6",  # 第六弦
    "A2": "5",  # 第五弦
    "D3": "4",  # 第四弦
    "G3": "3",  # 第三弦
    "B3": "2",  # 第二弦
    "E4": "1"   # 第一弦
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
                "audio_path": "audio/string_check/tuner_intro.wav"  # 教學介紹音檔
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
            # 使用現有的調音服務進行分析
            result = await tune_guitar_string(string_num, temp_file_path)
            
            # 判斷是否成功（在容忍範圍內）
            cents_error = abs(result.get("cents_error", 0))
            is_success = cents_error <= 30  # 30 cents 容忍度
            
            # 獲取調音狀態
            tuning_status = "in tune" if is_success else ("too high" if result.get("cents_error", 0) > 0 else "too low")
            
            # 獲取音檔路徑
            audio_path = get_lesson_audio_path(string_num, tuning_status)
            
            # 確定下一個音符
            next_note = get_next_note(target_note)
            
            return {
                "success": is_success,
                "target_note": next_note,
                "target_frequency": get_note_frequency(target_note),
                "detected_frequency": result.get("detected_frequency", 0),
                "cents_off": result.get("cents_error", 0),
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
        "E2": 82.41,
        "A2": 110.00,
        "D3": 146.83,
        "G3": 196.00,
        "B3": 246.94,
        "E4": 329.63
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

def get_lesson_audio_path(string_num: str, tuning_status: str) -> str:
    """獲取教學音檔路徑"""
    try:
        # 格式化調音狀態
        status_folder = tuning_status.replace(" ", "_")
        
        # 構建音檔路徑
        audio_path = f"audio/tuner/string{string_num}_{status_folder}/feedback.wav"
        
        # 檢查文件是否存在
        full_path = os.path.join("frontend/public", audio_path)
        if os.path.exists(full_path):
            return audio_path
        else:
            # 如果找不到對應的音檔，返回通用的介紹音檔
            return "audio/string_check/tuner_intro.wav"
            
    except Exception as e:
        print(f"Error getting lesson audio path: {e}")
        return "audio/string_check/tuner_intro.wav"