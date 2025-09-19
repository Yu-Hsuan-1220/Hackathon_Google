from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from ..services.chord_check_service import chord_check
import logging

router = APIRouter()
<<<<<<< HEAD
logger = logging.getLogger(__name__)
=======
logger = logging.getLogger(_name_)
>>>>>>> 491903c (final)

@router.post("/chord-check")
async def check_chord_endpoint(
    target_chord: str = Form(..., description="Target chord: C, D, or G"),
    whole_chord: bool = Form(..., description="True for whole chord check, False for string check"),
    string: str = Form(None, description="String note when whole_chord=False (e.g., 'C4', 'G3')"),
    audio_file: UploadFile = File(..., description="WAV audio file")
):
    """
    Check chord or string playing
    
    Parameters:
    - target_chord: Target chord (C, D, or G)
    - whole_chord: True for chord check, False for string check
    - string: Required when whole_chord=False, specifies the note to check
    - audio_file: WAV audio file to analyze
    
    Returns:
    - chord: Next chord the user should play (C->D->G progression)
    - whole_chord: Whether user should play whole chord (1) or individual string (0)
    - finish_lesson: True when lesson is complete (after G chord played correctly)
    - audio: Path to feedback audio file
    """
    try:
        # Validate input parameters
        if target_chord not in ["C", "D", "G"]:
            return JSONResponse(
                status_code=400,
                content={"error": "target_chord must be C, D, or G"}
            )
        
        if not whole_chord and not string:
            return JSONResponse(
                status_code=400,
                content={"error": "string parameter is required when whole_chord=False"}
            )
        
        # Validate file type
        if not audio_file.filename.lower().endswith('.wav'):
            return JSONResponse(
                status_code=400,
                content={"error": "Only WAV files are supported"}
            )
        
        # Read audio file content
        audio_content = await audio_file.read()
        
        if len(audio_content) == 0:
            return JSONResponse(
                status_code=400,
                content={"error": "Empty audio file"}
            )
        
        # Process chord/string check
        result = await chord_check(
            target_chord=target_chord,
            audio_file_content=audio_content,
            whole_chord=whole_chord,
            string=string
        )
        
        if not result.get("success", False):
            return JSONResponse(
                status_code=500,
                content={"error": result.get("error", "Unknown error occurred")}
            )
        
        # Return successful result
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "target_chord": result.get("target_chord"),
                "chord": result.get("chord"),
                "whole_chord": result.get("whole_chord"),
                "finish_lesson": result.get("finish_lesson"),
                "audio": result.get("audio"),
                "details": {
                    "is_correct": result.get("is_correct"),
                    "detected_chords": result.get("detected_chords"),
                    "is_string_correct": result.get("is_string_correct"),
                    "string_result": result.get("string_result")
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
            "strings": ["C4", "E4", "G4"],
            "description": "Basic C major chord"
        },
        "D": {
            "name": "D Major", 
            "notes": ["D", "F#", "A"],
            "strings": ["D4", "F#4", "A4"],
            "description": "Basic D major chord"
        },
        "G": {
            "name": "G Major",
            "notes": ["G", "B", "D"],
            "strings": ["G3", "B3", "D4"],
            "description": "Basic G major chord"
        }
    }
    
    return {
        "chord": chord,
        "info": chord_info[chord]
<<<<<<< HEAD
    }

=======
    }
>>>>>>> 491903c (final)
