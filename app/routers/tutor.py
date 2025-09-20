# Global lib
from fastapi import APIRouter

# Local lib
from app.services.tutor_gemini_service import ask

router = APIRouter()

@router.post("/ask")
async def post_action(user_input: str):
    response = await ask(user_input)
    return {"Response": response}