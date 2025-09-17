# global lib
from fastapi import APIRouter, UploadFile, File, Form
import tempfile
import os

# local lib
from app.services.tuner_service import tune_guitar_string

router = APIRouter()

@router.post("/tuner")
async def post(string_num: str, file: UploadFile = File(...)):
    # Handle string_num = "0" case - return tuner intro
    if string_num == "0":
        return {
            "tuning_status": False,
            "string_num": "6", 
            "tuning_finish": False,
            "cents_error": 0,
            "audio_path": "audio/tuner/tuner_intro.wav"
        }
    
    # Save uploaded file to temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Process the file
        result = await tune_guitar_string(string_num, temp_file_path)
        return {
            "tuning_status": result["tuning_status"], 
            "string_num": result["string_num"], 
            "tuning_finish": result["tuning_finish"],
            "cents_error": result["cents_error"],
            "audio_path": result.get("audio_path")
        }
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)



