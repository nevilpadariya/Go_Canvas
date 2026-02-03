"""
Pydantic models for password reset functionality
"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class ForgotPasswordRequest(BaseModel):
    """Request model for forgot password"""
    email: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower().strip()


class ForgotPasswordResponse(BaseModel):
    """Response model for forgot password"""
    message: str
    success: bool


class ResetPasswordRequest(BaseModel):
    """Request model for resetting password"""
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class ResetPasswordResponse(BaseModel):
    """Response model for password reset"""
    message: str
    success: bool


class VerifyResetTokenRequest(BaseModel):
    """Request model to verify if a reset token is valid"""
    token: str


class VerifyResetTokenResponse(BaseModel):
    """Response model for token verification"""
    valid: bool
    message: str
    email: Optional[str] = None
