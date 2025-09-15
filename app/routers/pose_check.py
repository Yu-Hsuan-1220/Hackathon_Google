# global lib
from fastapi import APIRouter, UploadFile, File, Form
import logging

# local lib
from app.services.pose_gemini_service import check_pose, intro

router = APIRouter()

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/check_pose")
async def pose(file: UploadFile = File(...)):

    suggestion, next_state, audio_file = await check_pose(file)
    return {"suggestion": suggestion, "next_state": next_state, "Audio File": audio_file}

@router.get("/intro")
async def get_intro():
    response, audio_file = await intro()
    return {"Response": response, "Audio File": audio_file}
