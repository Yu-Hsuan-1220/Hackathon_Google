# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.chord_schema import IntroResponse
from app.services.TTS import text_to_speech

client = genai.Client()

async def Intro(username: str) -> tuple[str, str]:
    SYSTEM_PROMPT_INTRO = f"""
    你是一個資深的吉他老師，今天學生是個盲人，現在他要學習怎麼演奏和絃
    ，請指引他怎麼彈C和絃
    請以：你好{username}...開頭，介紹完後請以盲人角度引導如何彈奏C和絃，和用右手找到弦(像是從下面數上來第五跟弦)以及如何用左手找到第五弦第二格(盲人看不到格子所以要用感受的)，整體指示在三十秒內結束，
    參考：無名指按住第5弦（A弦）的第3格。

    中指按住第4弦（D弦）的第2格。

    食指按住第2弦（B弦）的第1格。

    第6弦（E弦）不彈奏，第3弦（G弦）和第1弦（E弦）為空弦。

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
    await text_to_speech(parsed.Intro, "chord_intro.wav")
    return parsed.Intro, "chord_intro.wav"