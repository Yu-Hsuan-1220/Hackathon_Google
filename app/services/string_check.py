# global lib
from fastapi import APIRouter, UploadFile, File, Form

# local lib
from app.services.string_check_service import note_check

router = APIRouter()

@router.post("/note_check")
async def post(target_note: str = Form(...), file: UploadFile = File(...)):
    # Read the uploaded file content directly as bytes
    content = await file.read()
    
    # Process the audio using the note check service
    # The service will handle the TTS feedback directly and return debug info
    result = await note_check(target_note, content)
    
    return {
        "status": "processing_complete", 
        "target_note": target_note,
        "debug_info": result
    }