# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.menu_schema import IntroResponse, ActionResponse
from app.services.TTS import text_to_speech

client = genai.Client()



SYSTEM_PROMPT_ACTION = """
以下是這個APP的功能，判斷回覆要到哪個功能，回傳1到6的數字。
1. 基本的吉他握法和姿勢
2. 按弦的方法與單音練習
3. 簡單的和弦與節奏練習
4. 最後會教你一首簡單的歌曲
5. 再介紹一次功能
6. 其他
10. 問其他問題
"""

async def Intro(username:str) -> str:
    SYSTEM_PROMPT_INTRO = f"""
    你現在要介紹一個APP中menu的功能，這個APP是用來幫助初學者學習彈吉他的，以下是介紹的模板，幫我小幅度修改這個模板。
    介紹內容如下:
    你好{username}，歡迎來到基礎教學課程，我會一步步從頭教你如何正確彈吉他。
    在這裡你會學到:
    1. 基本的吉他握法和姿勢
    2. 按弦的方法與單音練習
    3. 簡單的和弦與節奏練習
    4. 最後會教你一首簡單的歌曲
    可以讓你從0基礎到學會完整一首歌曲。
    也讓你打下良好的基礎，開始你的吉他之旅！

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
    await text_to_speech(parsed.Intro, "menu_intro.wav")
    return parsed.Intro, "menu_intro.wav"

async def action(str) -> int:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            str,
            "這個回覆要到哪個功能，回傳1到6的數字"
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_ACTION,
            response_mime_type="application/json",
            response_schema=ActionResponse
        ),

    )
    parsed = response.parsed
    return parsed.action