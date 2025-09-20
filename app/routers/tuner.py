# global lib
from fastapi import APIRouter, UploadFile, File, Form
import tempfile
import os

# local lib
from app.services.tuner_service import tune_guitar_string
from app.services.tuner_gemini_service import Intro

router = APIRouter()

@router.post("/tuner")
async def post(string_num: str = Form(...), username: str = Form(...), file: UploadFile = File(...)):
    # Handle string_num = "0" case - generate personalized tuner intro
    if string_num == "0":
        intro_text, audio_filename = await Intro(username)
        return {
            "tuning_status": False,
            "string_num": "6", 
            "tuning_finish": False,
            "cents_error": 0,
            "audio_path": "frontend/public/audio/tuner/tuner_intro.wav"
        }
    
    # Save uploaded file to temporary location with correct extension
    file_extension = ".webm" if file.content_type in ["audio/webm", "video/webm"] else ".wav"
    print(f"DEBUG: File content type: {file.content_type}")
    print(f"DEBUG: Using extension: {file_extension}")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        content = await file.read()
        print(f"DEBUG: Read {len(content)} bytes from uploaded file")
        temp_file.write(content)
        temp_file_path = temp_file.name
        
    print(f"DEBUG: Saved file to: {temp_file_path}")
    print(f"DEBUG: File exists: {os.path.exists(temp_file_path)}")
    print(f"DEBUG: File size: {os.path.getsize(temp_file_path) if os.path.exists(temp_file_path) else 'N/A'}")
    
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