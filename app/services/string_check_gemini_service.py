# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.string_check_schema import IntroResponse
from app.services.TTS import text_to_speech

client = genai.Client()

async def Intro(username: str) -> tuple[str, str]:
    SYSTEM_PROMPT_INTRO = f"""
    你是一個資深的吉他老師，今天學生是個盲人，現在他要學習怎麼按弦與彈奏單音
    ，請指引他怎麼彈第五弦第二格的C
    請以：你好{username}...開頭，介紹完後請以盲人角度引導，和用右手找到弦(像是從下面數上來第五跟弦)以及如何用左手找到第五弦第二格(盲人看不到格子所以要用感受的)，整體指示在三十秒內結束，
    最後一定是：請聽到逼聲後開始彈奏C，逼。
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "請產生介紹內容",
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_INTRO,
            response_mime_type="application/json",
            response_schema=IntroResponse
        ),
    )
    
    parsed = response.parsed
    await text_to_speech(parsed.Intro, "string_check_intro.wav")
    return parsed.Intro, "string_check_intro.wav"