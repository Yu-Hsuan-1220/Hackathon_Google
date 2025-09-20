# global lib
from fastapi import APIRouter, UploadFile, File, Form

# local lib
from app.services.string_check_service import note_check
from app.services.string_check_gemini_service import Intro

router = APIRouter()

@router.post("/string_check")
async def post(target_note: str = Form(...), username: str = Form(...), file: UploadFile = File(...)):
    # Handle target_note = "AA" case - generate personalized string check intro
    if target_note == "AA":
        intro_text, audio_filename = await Intro(username)
        return {
            "status": "intro_generated",
            "target_note": "C",  # First note to practice
            "debug_info": {
                "target_note": "C",
                "audio_path": "frontend/public/string_check_intro.wav",
                "tuning_status": False,
                "success": False,
                "confidence": 0.0,
                "cent_error": 0,
                "finish": False,
                "cents_off": 0,
                "detected_frequency": 0,
                "target_frequency": 0,
                "raw_detected_frequency": 0,
                "octave_corrected": False
            }
        }
    
    # Read the uploaded file content directly as bytes
    content = await file.read()
    
    # Process the audio using the note check service
    result = await note_check(target_note, content)
    
    # Transform the result to match frontend expectations
    debug_info = {
        "target_note": result.get("next_note"),  # Frontend expects target_note to be the NEXT note
        "audio_path": result.get("wav_path"),    # Frontend expects audio_path, not wav_path
        "tuning_status": result.get("tuning_result"),
        "success": result.get("tuning_result") == "success_advance",  # True if user can progress
        "confidence": result.get("confidence", 0.0),
        "cent_error": result.get("cent_error", 0),
        "finish": result.get("finish", False),
        # Additional debugging information
        "cents_off": result.get("cent_error", 0),  # Alternative naming for cent error
        "detected_frequency": result.get("detected_frequency", 0),
        "target_frequency": result.get("target_frequency", 0),
        "raw_detected_frequency": result.get("raw_detected_frequency", 0),
        "octave_corrected": result.get("octave_corrected", False)
    }
    
    return {
        "status": "processing_complete", 
        "target_note": target_note,  # Current note being tested
        "debug_info": debug_info
    }