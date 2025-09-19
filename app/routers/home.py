# Global lib
from fastapi import APIRouter

# Local lib
from app.services.home_gemini_service import Intro, action, delete

router = APIRouter()


@router.get("/intro")
async def get_intro(username: str):
    response, audio_file = await Intro(username)
    return {"Response": response, "Audio File": audio_file}

@router.post("/action")
async def post_action(user_input: str):
    response = await action(user_input)
    return {"Response": response}

@router.post("/delete")
async def post_delete(filename: str):
    response = await delete(filename)
    return {"Response": response}
