from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from ..services.chord_check_service import chord_check
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chord-check")
async def check_chord_endpoint(
    target_chord: str = Form(..., description="Target chord: C, D, G, or AA for intro"),
    whole_chord: int = Form(..., description="1 for whole chord check, 0 for string check"),
    string: str = Form(None, description="String number when whole_chord=0 (e.g., '1', '2', '3', '4', '5', '6')"),
    audio_file: UploadFile = File(..., description="WebM or WAV audio file")
):
    """
    Check chord or string playing
    
    Parameters:
    - target_chord: Target chord (C, D, G) or AA for intro
    - whole_chord: 1 for chord check, 0 for string check
    - string: Required when whole_chord=0, specifies the string number to check (1-6)
    - audio_file: WebM or WAV audio file to analyze
    
    Returns:
    - target_chord: Current target chord
    - whole_chord: Whether user should play whole chord (1) or individual string (0)
    - finish_lesson: true when lesson is complete (after G chord played correctly)
    - audio: Path to feedback audio file
    - details: Additional information about the check
    """
    try:
        # Debug logging
        logger.info(f"📋 Chord check request - target_chord: {target_chord}, whole_chord: {whole_chord}, string: {string}")
        logger.info(f"📋 Audio file - name: {audio_file.filename}, content_type: {audio_file.content_type}")
        
        # Validate input parameters
        if target_chord not in ["C", "D", "G", "AA"]:
            return JSONResponse(
                status_code=400,
                content={"error": "target_chord must be C, D, G, or AA"}
            )
        
        if whole_chord == 0 and not string:
            return JSONResponse(
                status_code=400,
                content={"error": "string parameter is required when whole_chord=0"}
            )
        
        # Validate file type - now accepts both WebM and WAV
        if not (audio_file.filename.lower().endswith('.wav') or audio_file.filename.lower().endswith('.webm')):
            return JSONResponse(
                status_code=400,
                content={"error": "Only WAV and WebM files are supported"}
            )
        
        # Read audio file content
        audio_content = await audio_file.read()
        
        # For AA initialization, empty audio file is allowed
        if len(audio_content) == 0 and target_chord != "AA":
            return JSONResponse(
                status_code=400,
                content={"error": "Empty audio file"}
            )
        
        # Process chord/string check
        result = await chord_check(
            target_chord=target_chord,
            audio_file_content=audio_content,
            whole_chord=bool(whole_chord),
            string=string
        )
        
        if not result.get("success", False):
            return JSONResponse(
                status_code=500,
                content={"error": result.get("error", "Unknown error occurred")}
            )
        
        # Return successful result in new format
        return JSONResponse(
            status_code=200,
            content={
                "target_chord": result.get("target_chord"),
                "whole_chord": result.get("whole_chord"),
                "finish_lesson": result.get("finish_lesson"),
                "audio": result.get("audio"),
                "details": {
                    "is_correct": result.get("is_correct"),
                    "detected_chords": result.get("detected_chords"),
                    "is_string_correct": result.get("is_string_correct"),
                    "next_string": result.get("next_string"),
                    "cent_error": result.get("cent_error"),  # 添加 cent 误差
                    "tuning_result": result.get("tuning_result"),  # 添加调音结果
                    "confidence": result.get("confidence")  # 添加置信度
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error in chord check endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@router.get("/chord-progression")
async def get_chord_progression():
    """Get the chord progression sequence"""
    return {
        "progression": ["C", "D", "G"],
        "description": "Learn to play chords in sequence: C -> D -> G"
    }

@router.get("/chord-info/{chord}")
async def get_chord_info(chord: str):
    """Get information about a specific chord"""
    chord = chord.upper()
    
    if chord not in ["C", "D", "G"]:
        return JSONResponse(
            status_code=400,
            content={"error": "Chord must be C, D, or G"}
        )
    
    chord_info = {
        "C": {
            "name": "C Major",
            "notes": ["C", "E", "G"],
            "strings": ["C3", "E3", "G3", "C4", "E4"],  # 5th to 1st string
            "description": "Basic C major chord"
        },
        "D": {
            "name": "D Major", 
            "notes": ["D", "F#", "A"],
            "strings": ["D2", "D4", "A4", "D4", "F#4"],  # 5th to 1st string
            "description": "Basic D major chord"
        },
        "G": {
            "name": "G Major",
            "notes": ["G", "B", "D"],
            "strings": ["G2", "B2", "D3", "G3", "B3", "G4"],  # 6th to 1st string
            "description": "Basic G major chord"
        }
    }
    
    return {
        "chord": chord,
        "info": chord_info[chord]
    }