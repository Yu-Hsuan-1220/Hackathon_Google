from google import genai
from google.genai import types
from app.schemas.firstused_schema import IntroResponse, ConfirmedResponse, ActionResponse
from app.services.TTS import text_to_speech

client = genai.Client()

SYSTEM_PROMPT_INTRO = """
你現在要介紹一個APP的功能，這個APP是用來幫助初學者學習彈吉他的，以下是介紹的模板，幫我小幅度修改這個模板。
介紹內容如下:
歡迎使用我們的吉他學習APP-"盲裡偷弦"，以下我會介紹這個APP的功能。
在這裡你會可以從0開始學習如何彈吉他。
可以讓你從0基礎到學會完整一首歌曲，未來也可以新增自己想學的歌曲讓我們來幫助你，裡面也有許多小工具可以使用。
首先，請說出你的使用者名稱，開始你的吉他之旅吧！
"""

SYSTEM_PROMPT_ACTION = """
    我問了使用者名字是否確定為XXX，
    請幫我判斷使用者的回答為是或否，回傳True或False。
"""

async def Intro() -> str:

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
    await text_to_speech(parsed.Intro, "firstused_intro.wav")
    return parsed.Intro, "firstused_intro.wav"

async def confirmed_used(user_name: str) -> str:
    SYSTEM_PROMPT_CONFIRMED = f"""
    你現在要問使用者你的使用者名字是{user_name}嗎?請回答是或否。
    請幫我小幅度修改這個句子，讓它聽起來更自然。
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "幫我小幅度修改介紹內容",
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_CONFIRMED,
            response_mime_type="application/json",
            response_schema=ConfirmedResponse
        ),
    )
    parsed = response.parsed
    await text_to_speech(parsed.Confirmed, "firstused_confirmed.wav")
    return parsed.Confirmed, "firstused_confirmed.wav"

async def action(str) ->bool:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            str,
            "我問了使用者名字是否確定為XXX，請幫我判斷使用者的回答為是或否，回傳True或False"
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_ACTION,
            response_mime_type="application/json",
            response_schema=ActionResponse
        ),
    )
    parsed = response.parsed
    return parsed.Action

