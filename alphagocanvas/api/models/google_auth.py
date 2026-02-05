from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    credential: str


class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str
    is_new_user: bool = False
    user_id: int | None = None
    assigned_id: str | None = None
    user_email: str | None = None
    needs_password: bool = False


class SetPasswordRequest(BaseModel):
    email: str
    password: str
