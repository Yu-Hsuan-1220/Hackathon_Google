# global lib
from fastapi import APIRouter

# local lib
from app.services.guitar_gemini_service import Intro, action

router = APIRouter()

@router.get("/grip")
async def get_intro(username: str):
    response, audio_file = await Intro(username)
    return {"Response": response, "Audio File": audio_file}

@router.post("/action")
async def post_action(user_input: str):
    response = await action(user_input)
    return {"Response": response}