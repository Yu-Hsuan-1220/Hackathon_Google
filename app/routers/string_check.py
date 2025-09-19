# global lib
from fastapi import APIRouter, UploadFile, File, Form

# local lib
from app.services.string_check_service import note_check

router = APIRouter()

@router.post("/string_check")
async def post(target_note: str = Form(...), file: UploadFile = File(...)):
    # Read the uploaded file content directly as bytes
    content = await file.read()
    
    # Process the audio using the note check service
<<<<<<< HEAD
    result = await note_check(target_note, content)
    
    # 返回前端期望的格式
    return {
        "status": "processing_complete", 
<<<<<<< HEAD
        "target_note": target_note,  # Current note being tested
        "debug_info": debug_info
<<<<<<< HEAD
    }
=======
    # The service will handle the TTS feedback directly and return debug info
    result = await note_check(target_note, content)
    
    return {
        "status": "processing_complete", 
        "target_note": result.get("target_note", target_note),
        "debug_info": result
    }
>>>>>>> b671a7e (單音gg)
=======
    }
>>>>>>> b2ddf84 (single note and tuner fix)
=======
        "target_note": result.get("target_note"),  # 下一題的音符（成功時前進，失敗時保持）
        "debug_info": result,
        # 為了向後兼容和語義清晰，提供額外字段
        "next_note": result.get("target_note"),    # 與 target_note 相同
        "current_note": target_note,               # 當前測試的音符
        "audio_path": result.get("audio_path"),
        "wav_path": result.get("audio_path"),      # 向後兼容
        "tuning_result": "success" if result.get("success") else "retry",
        "finish": result.get("target_note") == ""  # 當下一個音符為空時表示完成
    }
>>>>>>> 81dc24f (fuck)
