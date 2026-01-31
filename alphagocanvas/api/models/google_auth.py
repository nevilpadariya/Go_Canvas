from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    credential: str


class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str
