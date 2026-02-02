from typing import Annotated
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from alphagocanvas.api.models.token import TokenData, Token
from alphagocanvas.api.models.signup import SignupRequest, SignupResponse
from alphagocanvas.api.models.google_auth import GoogleAuthRequest
from alphagocanvas.api.services.authentication_service import get_user, create_user, generate_id
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

    role = None
    authenticated = False

    user = get_user(username, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found, or Invalid Credentials")
    if password == user.Userpassword:
        authenticated = True
    if not authenticated:
        raise HTTPException(status_code=401, detail="Incorrect useremail or password")
    # check user role if it is admin:
    # fetch the information from the admin table and also attach the role in the token
    if authenticated:
        if user.Userrole == "Student":
            role = "Student"

        # check user role if it is student:
        # fetch the information from the student table and also attach the role in the token
        if user.Userrole == "Admin":
            role = "Admin"

        # check user role if it is faculty:
        # fetch the information from the faculty table and also attach the role in the token
        if user.Userrole == "Faculty":
            role = "Faculty"

        # Create token data
        # call create function from utils
        token = TokenData(useremail=user.Useremail, userpassword=password, userrole=role, userid=user.Userid)

        encoded_token = create_token(token)

        # Encoded token
        token_encoded = Token(access_token=encoded_token, token_type="Bearer")

        return token_encoded


@router.post("/auth/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest, db: database_dependency):
    """
    Authenticate user with Google OAuth token
    
    :param auth_data: Google authentication request containing the credential token
    :param db: database_dependency object
    :return: encoded JWT token for the user
    """
    try:
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
        
        # Check if user already exists
        user = db.query(UserTable).filter(UserTable.Useremail == email).first()
        
        if user:
            # User exists, create token
            token = TokenData(
                useremail=user.Useremail,
                userpassword=user.Userpassword,
                userrole=user.Userrole,
                userid=user.Userid
            )
            encoded_token = create_token(token)
            return Token(access_token=encoded_token, token_type="Bearer")
        
        # User doesn't exist - create new user (default to Student role)
        # This is a simplified approach - you might want to ask user to choose their role
        assigned_id = generate_id(db, "Student")
        
        # Generate a random password for Google users (they'll use Google to login)
        import secrets
        random_password = secrets.token_urlsafe(32)
        
        # Create user in UserTable
        new_user = UserTable(
            Userid=assigned_id,
            Useremail=email,
            Userpassword=random_password,
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
        
        # Commit the transaction
        db.commit()
        db.refresh(new_user)
        
        # Create token for new user
        token = TokenData(
            useremail=new_user.Useremail,
            userpassword=new_user.Userpassword,
            userrole=new_user.Userrole,
            userid=new_user.Userid
        )
        encoded_token = create_token(token)
        return Token(access_token=encoded_token, token_type="Bearer")
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")
