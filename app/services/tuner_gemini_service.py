# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.tuner_schema import IntroResponse
from app.services.TTS import text_to_speech

client = genai.Client()

async def Intro(username: str) -> tuple[str, str]:
    SYSTEM_PROMPT_INTRO = f"""
    你是一個資深的吉他老師，今天學生是個盲人，準備要開始學怎麼調音，我想要你向他簡單介紹什麼是調音以及什麼其重要性
    請以：你好{username}...開頭，介紹完後請以盲人角度引導他如何找到第六弦旋鈕，並叫他記住旋鈕位置，以及如和用右手找到弦並撥動，整體指示在三十秒內結束，請注意第六弦旋鈕位於上排三個旋鈕中最靠近身體的
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
    await text_to_speech(parsed.Intro, "audio/tuner/tuner_intro.wav")
    return parsed.Intro, "audio/tuner/tuner_intro.wav"