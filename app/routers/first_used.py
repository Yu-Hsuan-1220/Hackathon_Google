# Global lib
from fastapi import APIRouter

# Local lib
from app.services.firstused_gemini_service import Intro, confirmed_used, action

router = APIRouter()

@router.get("/intro")
async def get_intro():
    response, audio_file = await Intro()
    return {"Response": response, "Audio File": audio_file}

@router.get("/confirmed")
async def get_confirmed(user_name: str):
    response, audio_file = await confirmed_used(user_name)
    return {"Response": response, "Audio File": audio_file}

@router.get("/action")
async def get_action(user_name: str):
    response = await action(user_name)
    return {"Response": response}