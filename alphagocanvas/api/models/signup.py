from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


class SignupRequest(BaseModel):
    """Request model for user signup"""
    Userfirstname: str = Field(..., min_length=1, max_length=100, description="User's first name")
    Userlastname: str = Field(..., min_length=1, max_length=100, description="User's last name")
    Useremail: EmailStr = Field(..., description="User's email address")
    Userpassword: str = Field(..., min_length=8, description="User's password (minimum 8 characters)")
    Userrole: str = Field(..., description="User role: 'Student' or 'Faculty'")

    @field_validator('Userrole')
    @classmethod
    def validate_role(cls, v):
        if v not in ['Student', 'Faculty']:
            raise ValueError('Role must be either "Student" or "Faculty"')
        return v


class SignupResponse(BaseModel):
    """Response model for successful signup"""
    message: str
    userid: int
    assigned_id: int  # Student_id or Faculty_id
    id_type: str  # "Student_id" or "Faculty_id"
    useremail: str
    userrole: str
