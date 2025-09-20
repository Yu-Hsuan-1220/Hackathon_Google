from pydantic import BaseModel


class AskResponse(BaseModel):
    Answer: str