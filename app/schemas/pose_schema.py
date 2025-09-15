from pydantic import BaseModel

class PoseResponse(BaseModel):
    suggestion: str
    next_state: bool

class IntroResponse(BaseModel):
    Intro: str