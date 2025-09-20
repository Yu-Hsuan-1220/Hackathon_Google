# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.tutor_schema import AskResponse 
from app.services.TTS import text_to_speech

client = genai.Client()

SYSTEM_PROMPT_ASK = """
你是一個專業的吉他老師，
現在您的學生會問你一些關於吉他的問題，
請用簡單的回答問題，不用說其他不相干的。
"""

async def ask(statement: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            statement,
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_ASK,
            response_mime_type="application/json",
            response_schema=AskResponse
        ),

    )
    parsed = response.parsed
    await text_to_speech(parsed.Answer, "guitar_ask.wav")
    return parsed.Answer, "guitar_ask.wav"


