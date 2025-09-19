from google import genai
from google.genai import types
from app.schemas.home_schema import IntroResponse, ActionResponse
from app.services.TTS import text_to_speech
import os
client = genai.Client()



SYSTEM_PROMPT_ACTION = """
以下是這個APP的功能，判斷回覆要到哪個功能，回傳1到6的數字。
1. 基礎教學
2. 調音器
3. 節拍器
4. 歌曲教學
5. 歌曲練習
6. 其他
"""

async def Intro(username: str) -> str:
    SYSTEM_PROMPT_INTRO = f"""
    你現在要介紹一個APP中menu的功能，這個APP是用來幫助初學者學習彈吉他的，以下是介紹的模板，幫我小幅度修改這個模板。
    介紹模板大概如下:
    你好{username}，很高興你來學習彈吉他，以下我會介紹這個APP的功能。
    在這裡你會可以從0開始學習如何彈吉他。
    可以讓你從0基礎到學會完整一首歌曲，未來也可以新增自己想學的歌曲讓我們。
    現在你可以選擇以下功能:
    1. 基礎教學
    2. 調音器
    3. 節拍器
    4. 歌曲教學
    5. 歌曲練習
    請選擇你想要的功能，開始你的吉他之旅！
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
    await text_to_speech(parsed.Intro, "home_intro.wav")
    return parsed.Intro, "home_intro.wav"

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

async def delete(filename:str):
    file_path = "frontend/public"
    print(os.path.join(file_path, filename))
    os.remove(os.path.join(file_path, filename))
    return True