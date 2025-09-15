# Global lib
from fastapi import APIRouter

# Local lib
from app.services.firstused_gemini_service import Intro

router = APIRouter()

@router.get("/intro")
async def get_intro():
    response, audio_file = await Intro()
    return {"Response": response, "Audio File": audio_file}
