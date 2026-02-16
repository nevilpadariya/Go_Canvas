from typing import Annotated
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import func

from alphagocanvas.api.models.token import TokenData, Token
from alphagocanvas.api.models.signup import SignupRequest, SignupResponse
from alphagocanvas.api.models.google_auth import GoogleAuthRequest, GoogleAuthResponse, SetPasswordRequest
from alphagocanvas.api.models.password_reset import (
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    VerifyResetTokenRequest, VerifyResetTokenResponse
)
from alphagocanvas.api.services.authentication_service import get_user, create_user, generate_id
from alphagocanvas.api.services.password_reset_service import (
    create_password_reset_token, verify_reset_token, reset_password
)
from alphagocanvas.api.utils.passwords import hash_password, is_hashed_password, verify_password
from alphagocanvas.api.utils import create_token
from alphagocanvas.database import database_dependency
from alphagocanvas.database.models import UserTable, StudentTable, FacultyTable
from alphagocanvas.config import GOOGLE_CLIENT_ID

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


@router.post("/signup", response_model=SignupResponse)
async def signup(signup_data: SignupRequest, db: database_dependency):
    """
    Create a new user account
    
    :param signup_data: Signup form data (first name, last name, email, password, role)
    :param db: database_dependency object
    :return: Created user information with assigned Student_id or Faculty_id
    """
    try:
        result = create_user(signup_data, db)
        
        id_type = "Student_id" if signup_data.Userrole == "Student" else "Faculty_id"
        
        return SignupResponse(
            message="Account created successfully",
            userid=result["userid"],
            assigned_id=result["assigned_id"],
            id_type=id_type,
            useremail=result["useremail"],
            userrole=result["userrole"]
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@router.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: database_dependency):
    """

    :param form_data: Oauth2PasswordRequestForm data
    :param db: database_dependency object

    :return: encoded generated token
    """
    if not form_data:
        raise HTTPException(status_code=404, detail="No payload found")

    username = form_data.username  # Can be email or Student_id/Faculty_id
    password = form_data.password

    user = get_user(username, db)
    if not user or not verify_password(password, user.Userpassword):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.Isactive:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Seamless migration for legacy plain-text rows.
    if not is_hashed_password(user.Userpassword):
        user.Userpassword = hash_password(password)
        db.commit()
        db.refresh(user)

    token = TokenData(useremail=user.Useremail, userrole=user.Userrole, userid=user.Userid)
    encoded_token = create_token(token)
    return Token(access_token=encoded_token, token_type="Bearer")


@router.post("/auth/google", response_model=GoogleAuthResponse)
async def google_auth(auth_data: GoogleAuthRequest, db: database_dependency):
    """
    Authenticate user with Google OAuth token
    
    :param auth_data: Google authentication request containing the credential token
    :param db: database_dependency object
    :return: encoded JWT token for the user
    """
    try:
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=503, detail="Google authentication is not configured")
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        # Extract user information from Google token
        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        if not idinfo.get("email_verified", False):
            raise HTTPException(status_code=400, detail="Google account email is not verified")

        # Check if user already exists (case-insensitive email comparison)
        user = db.query(UserTable).filter(func.lower(UserTable.Useremail) == email.lower()).first()
        
        if user:
            if not user.Isactive:
                raise HTTPException(status_code=403, detail="Account is deactivated")
            # User exists, create token
            token = TokenData(
                useremail=user.Useremail,
                userrole=user.Userrole,
                userid=user.Userid
            )
            encoded_token = create_token(token)
            return GoogleAuthResponse(
                access_token=encoded_token,
                token_type="Bearer",
                is_new_user=False
            )
        
        # User doesn't exist - create new user (default to Student role)
        assigned_id = generate_id(db, "Student")
        
        # Generate a temporary placeholder password for Google users
        import secrets
        temp_password = secrets.token_urlsafe(32)
        
        # Create user in UserTable with temporary password
        new_user = UserTable(
            Userid=assigned_id,
            Useremail=email.lower(),
            Userpassword=hash_password(temp_password),
            Userrole="Student",
            Createdat=datetime.utcnow().isoformat(),
            Isactive=True
        )
        db.add(new_user)
        
        # Create student record
        new_student = StudentTable(
            Studentid=assigned_id,
            Studentfirstname=first_name,
            Studentlastname=last_name,
            Studentcontactnumber="",
            Studentnotification=True
        )
        db.add(new_student)
        
        try:
            # Commit the transaction
            db.commit()
            db.refresh(new_user)
        except Exception as commit_error:
            db.rollback()
            # If duplicate, user was created by another process - fetch and return
            if "unique" in str(commit_error).lower() or "duplicate" in str(commit_error).lower():
                user = db.query(UserTable).filter(func.lower(UserTable.Useremail) == email.lower()).first()
                if user:
                    token = TokenData(
                        useremail=user.Useremail,
                        userrole=user.Userrole,
                        userid=user.Userid
                    )
                    encoded_token = create_token(token)
                    return GoogleAuthResponse(
                        access_token=encoded_token,
                        token_type="Bearer",
                        is_new_user=False
                    )
            raise commit_error
        
        # Return user details for password setup (no token yet)
        return GoogleAuthResponse(
            access_token="",  # Empty token - user needs to set password first
            token_type="Bearer",
            is_new_user=True,
            user_id=new_user.Userid,
            assigned_id=str(assigned_id),
            user_email=new_user.Useremail,
            needs_password=True
        )
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")


@router.post("/auth/google/set-password", response_model=Token)
async def set_google_user_password(request: SetPasswordRequest, db: database_dependency):
    """
    Set password for a Google user who just signed up
    
    :param request: SetPasswordRequest with email and new password
    :param db: database_dependency object
    :return: JWT token after password is set
    """
    try:
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=503, detail="Google authentication is not configured")
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        email = (idinfo.get("email") or "").lower().strip()
        if not idinfo.get("email_verified", False):
            raise HTTPException(status_code=400, detail="Google account email is not verified")
        if email != request.email.lower().strip():
            raise HTTPException(status_code=403, detail="Google identity does not match requested email")

        # Find user by email
        user = db.query(UserTable).filter(func.lower(UserTable.Useremail) == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate password
        if len(request.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Update password
        user.Userpassword = hash_password(request.password)
        db.commit()
        db.refresh(user)
        
        # Create token
        token = TokenData(
            useremail=user.Useremail,
            userrole=user.Userrole,
            userid=user.Userid
        )
        encoded_token = create_token(token)
        
        return Token(access_token=encoded_token, token_type="Bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to set password: {str(e)}")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest, db: database_dependency):
    """
    Request a password reset link

    :param request: ForgotPasswordRequest with user's email
    :param db: database_dependency object
    :return: Success message (always returns success to prevent email enumeration)
    """
    try:
        success, message = create_password_reset_token(db, request.email)
        return ForgotPasswordResponse(success=success, message=message)
    except Exception as e:
        # Don't reveal errors to prevent information leakage
        return ForgotPasswordResponse(
            success=True,
            message="If an account exists with this email, you will receive a password reset link."
        )


@router.post("/verify-reset-token", response_model=VerifyResetTokenResponse)
async def verify_token(request: VerifyResetTokenRequest, db: database_dependency):
    """
    Verify if a password reset token is valid

    :param request: VerifyResetTokenRequest with the reset token
    :param db: database_dependency object
    :return: Token validity status and masked email
    """
    try:
        valid, message, email = verify_reset_token(db, request.token)
        return VerifyResetTokenResponse(valid=valid, message=message, email=email)
    except Exception as e:
        return VerifyResetTokenResponse(
            valid=False,
            message="Invalid or expired reset link."
        )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_user_password(request: ResetPasswordRequest, db: database_dependency):
    """
    Reset user's password using the reset token

    :param request: ResetPasswordRequest with token and new password
    :param db: database_dependency object
    :return: Success/failure message
    """
    try:
        success, message = reset_password(db, request.token, request.new_password)
        if not success:
            raise HTTPException(status_code=400, detail=message)
        return ResetPasswordResponse(success=success, message=message)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")
