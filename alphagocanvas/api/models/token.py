from datetime import datetime

from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    useremail: str
    userpassword: Optional[str] = None
    userrole: str
    userid : int
