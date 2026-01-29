from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from alphagocanvas.api.models.token import TokenData, Token
from alphagocanvas.api.models.signup import SignupRequest, SignupResponse
from alphagocanvas.api.services.authentication_service import get_user, create_user
from alphagocanvas.api.utils import create_token
from alphagocanvas.database import database_dependency

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

    print(f"Login attempt with username: {username}")

    role = None
    authenticated = False

    user = get_user(username, db)  # Updated to accept email or ID
    if user:
        print(f"User found: {user.Userrole}, {user.Userid}, {user.Useremail}")
    # user = db.query(UserTable).filter(UserTable.Useremail == email).first()
    # user does not exists:
    #    """ return -> Invalid Credentials -> User does not exist or false username or password"""
    # return Error -> Invalid credentials -> User does not exist

    if not user:
        raise HTTPException(status_code=401, detail="User not found, or Invalid Credentials")

    # check the authenticity (accept email or ID for login)
    if password == user.Userpassword:
        print(authenticated)
        authenticated = True

    # REPLACE THE CODE HERE ONCE USER DATA IS GENERATED

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
