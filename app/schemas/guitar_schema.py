from pydantic import BaseModel

class IntroResponse(BaseModel):
    Intro: str

class ActionResponse(BaseModel):
    Action: bool