from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import text
from starlette import status

from alphagocanvas.api.models import TokenData
from alphagocanvas.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from alphagocanvas.database import database_dependency, UserTable

# Bearer token authentication system
_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


async def get_current_user(token: Annotated[str, Depends(_oauth2_scheme)], db: database_dependency):
    """
    Retrieve the current user from the bearer token which was issued at the login time

    :param token: bearer_token which was issued to user when it has logged in first time
    :param db: database dependency which allows us to get the data of user from the database

    :return: UserTable instance containing the information about user
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        useremail = payload.get("useremail")
        userrole = payload.get("userrole")
        userid = payload.get("userid")

        if useremail is None or userrole is None or userid is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Could not validate credentials")
        user = db.query(UserTable).filter(
            UserTable.Useremail == useremail,
            UserTable.Userid == userid
        ).first()
        if user is None or not user.Isactive:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return user

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate credentials")


async def is_current_user_admin(current_user: UserTable = Depends(get_current_user)):
    """

    :param current_user: current logged-in user if get_current_user able to parse the user information

    :return: True if user is admin else False, which is used for limiting the access for APIs

    """
    if current_user.Userrole != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def is_current_user_student(current_user: UserTable = Depends(get_current_user)):
    """
    :param current_user: current logged-in user if get_current_user able to parse the user information

    :return: True if user is student else False, which is used for limiting the access for APIs.

    """
    if current_user.Userrole != "Student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    return current_user


async def is_current_user_faculty(current_user: UserTable = Depends(get_current_user)):
    """
    :param current_user: current logged-in user if get_current_user able to parse the user information

    :return: True if user is faculty else False, which is used for limiting the access for APIs.

    """
    if current_user.Userrole != "Faculty":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty access required")
    return current_user


def create_token(token: TokenData):
    """

    :param token: TokenData object with token data
    :return: encoded token
    """
    useremail = token.useremail
    userrole = token.userrole
    userid = token.userid

    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "useremail": useremail,
        "userrole": userrole,
        "userid": userid,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    encoded_token = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

    return encoded_token


def decode_token(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    return decoded_token


def get_user_name(db, user_id: int, user_role: str) -> str:
    """Get user's display name from database based on role"""
    if user_role == "Student":
        query = text("SELECT Studentfirstname, Studentlastname FROM student WHERE Studentid = :id")
        result = db.execute(query, {"id": user_id}).fetchone()
        if result:
            return f"{result.Studentfirstname} {result.Studentlastname}"
    elif user_role == "Faculty":
        query = text("SELECT Facultyfirstname, Facultylastname FROM faculty WHERE Facultyid = :id")
        result = db.execute(query, {"id": user_id}).fetchone()
        if result:
            return f"{result.Facultyfirstname} {result.Facultylastname}"
    elif user_role == "Admin":
        query = text("SELECT Username FROM users WHERE UserID = :id")
        result = db.execute(query, {"id": user_id}).fetchone()
        if result:
            return result.Username
    return "Unknown User"
