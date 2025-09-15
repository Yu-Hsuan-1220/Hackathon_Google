# global lib
from google import genai
from google.genai import types

# local lib
from app.schemas.pose_schema import PoseResponse, IntroResponse
from app.services.TTS import text_to_speech

client = genai.Client()

SYSTEM_PROMPT_POSE = """
你是一個專業的吉他老師，請幫我檢查這個人彈吉他的姿勢是否正確。
請用簡單的語言回覆。一開始就直接給建議，不用說其他不相干的，最後可以給點鼓勵的話。
以下四點是彈吉他的正確方式：
1. 吉他有弦得部分要朝向外面。
2. 琴頸大約與地面平行，微微往斜上方。
3. 左手從下面輕輕托住琴頸。
4. 右手輕放在琴身上。

如果姿勢沒有差太多的話(不要太嚴格)，請回覆可能需要加強的地方就好，並將 next_state 設為 true。
如果姿勢有嚴重的問題或圖片有問題，請指出錯誤的地方並給出建議，最後將 next_state 設為 false。
如果差不多就將 next_state 設為 true，不要太嚴格。
"""


SYSTEM_PROMPT_INTRO = """
你現在要介紹一個APP中pose的功能，這個APP是用來幫助初學者學習彈吉他的，以下是介紹的模板，幫我小幅度修改這個模板。
介紹內容如下:
歡迎使用姿勢檢查功能，這個功能是用來檢查你彈吉他的姿勢是否正確。
請將手機鏡頭對準你彈吉他的姿勢，我會幫你檢查並給出建議。
"""

async def intro() -> str:
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
    await text_to_speech(parsed.Intro, "pose_intro.wav")
    return parsed.Intro, "pose_intro.wav"

async def check_pose(file) -> str:
    img_bytes = await file.read()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=img_bytes, mime_type=file.content_type),
            "幫我檢查這個人彈吉他的姿勢是否正確？"
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_POSE,
            response_mime_type="application/json",
            response_schema=PoseResponse
        ),

    )
    parsed = response.parsed

    if parsed.next_state:
        parsed.suggestion = parsed.suggestion + "現在你已經學會正確的姿勢了，那就進入下一個階段吧。"
    await text_to_speech(parsed.suggestion, "pose_suggestion.wav")
    return parsed.suggestion, parsed.next_state, "pose_suggestion.wav"
