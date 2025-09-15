# Global lib
from fastapi import APIRouter

# Local lib
from app.services.menu_gemini_service import Intro, action

router = APIRouter()

@router.get("/intro")
async def get_intro():
    response, audio_file = await Intro()
    return {"Response": response, "Audio File": audio_file}

@router.post("/action")
async def post_action(user_input: str):
    response = await action(user_input)
    return {"Response": response}