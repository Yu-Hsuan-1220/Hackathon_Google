from google import genai
from google.genai import types
from app.schemas.guitar_schema import IntroResponse, ActionResponse
from app.services.TTS import text_to_speech

client = genai.Client()

SYSTEM_PROMPT_ACTION = f"""
    我問了使用者是否需要重新介紹一次彈吉他的姿勢，
    請幫我判斷使用者的回答為是或否，回傳True或False。
"""


async def Intro(username: str) -> str:
    SYSTEM_PROMPT_INTRO = f"""
    你現在要教使用者彈吉他的姿勢，使用者的名字是{username}，請幫我小幅度修改這個模板。
    教學內容如下:
    坐姿要點
    保持背部挺直，雙腳平放地面，吉他琴身貼合身體

    左手位置
    拇指放在琴頸後方中央，拖著琴頸，手指自然彎曲

    右手姿勢
    手臂環抱琴身自然垂下，手腕略微彎曲，手指輕鬆接觸琴弦

    身體放鬆
    肩膀不要緊張上提，保持自然放鬆的狀態
    請問有需要再講一次嗎?
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "幫我小幅度修改介紹內容",
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_INTRO,
            response_mime_type="application/json",
            response_schema=IntroResponse
        ),
    )
    parsed = response.parsed
    await text_to_speech(parsed.Intro, "guitar_grip.wav")
    return parsed.Intro, "guitar_grip.wav"


async def action(str)->bool:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "請幫我判斷使用者的回答為是或否，回傳True或False。",
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_ACTION,
            response_mime_type="application/json",
            response_schema=ActionResponse
        ),
    )
    parsed = response.parsed
    return parsed.Action