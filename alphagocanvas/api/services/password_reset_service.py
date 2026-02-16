"""
Password reset service for handling forgot password and reset password functionality
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from alphagocanvas.database.models import UserTable, PasswordResetTable, StudentTable, FacultyTable
from alphagocanvas.config import PASSWORD_RESET_EXPIRE_MINUTES
from alphagocanvas.api.services.email_service import email_service
from alphagocanvas.api.utils.passwords import hash_password


def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)


def get_user_name(db: Session, user: UserTable) -> str:
    """Get user's display name based on their role"""
    if user.Userrole == "Student":
        student = db.query(StudentTable).filter(
            StudentTable.Studentid == user.Userid
        ).first()
        if student:
            return f"{student.Studentfirstname} {student.Studentlastname}"
    elif user.Userrole == "Faculty":
        faculty = db.query(FacultyTable).filter(
            FacultyTable.Facultyid == user.Userid
        ).first()
        if faculty:
            return f"{faculty.Facultyfirstname} {faculty.Facultylastname}"
    return "User"


def create_password_reset_token(db: Session, email: str) -> Tuple[bool, str]:
    """
    Create a password reset token for the given email address

    :param db: Database session
    :param email: User's email address
    :return: Tuple of (success, message)
    """
    # Find user by email
    user = db.query(UserTable).filter(
        UserTable.Useremail == email.lower().strip()
    ).first()

    if not user:
        # Don't reveal if email exists or not for security
        return True, "If an account exists with this email, you will receive a password reset link."

    if not user.Isactive:
        return True, "If an account exists with this email, you will receive a password reset link."

    # Invalidate any existing unused tokens for this user
    db.query(PasswordResetTable).filter(
        PasswordResetTable.Userid == user.Userid,
        PasswordResetTable.Used == False
    ).update({"Used": True})

    # Generate new token
    token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES)

    # Create new reset record
    reset_record = PasswordResetTable(
        Userid=user.Userid,
        Resettoken=token,
        Expiresat=expires_at.isoformat(),
        Used=False,
        Createdat=datetime.utcnow().isoformat()
    )
    db.add(reset_record)
    db.commit()

    # Get user's name for email personalization
    user_name = get_user_name(db, user)

    # Send reset email
    email_sent = email_service.send_password_reset_email(
        to_email=user.Useremail,
        reset_token=token,
        user_name=user_name
    )

    if not email_sent:
        # Log but don't fail - email service might not be configured
        pass

    return True, "If an account exists with this email, you will receive a password reset link."


def verify_reset_token(db: Session, token: str) -> Tuple[bool, str, Optional[str]]:
    """
    Verify if a password reset token is valid

    :param db: Database session
    :param token: Password reset token
    :return: Tuple of (is_valid, message, email)
    """
    reset_record = db.query(PasswordResetTable).filter(
        PasswordResetTable.Resettoken == token
    ).first()

    if not reset_record:
        return False, "Invalid or expired reset link.", None

    if reset_record.Used:
        return False, "This reset link has already been used.", None

    # Check expiration
    expires_at = datetime.fromisoformat(reset_record.Expiresat)
    if datetime.utcnow() > expires_at:
        return False, "This reset link has expired. Please request a new one.", None

    # Get user email
    user = db.query(UserTable).filter(
        UserTable.Userid == reset_record.Userid
    ).first()

    if not user:
        return False, "User not found.", None

    # Mask email for privacy
    email = user.Useremail
    local_part, domain = email.split("@", 1)
    if len(local_part) <= 2:
        masked_local = f"{local_part[0]}*"
    else:
        masked_local = f"{local_part[0]}{'*' * (len(local_part) - 2)}{local_part[-1]}"
    masked_email = f"{masked_local}@{domain}"

    return True, "Token is valid.", masked_email


def reset_password(db: Session, token: str, new_password: str) -> Tuple[bool, str]:
    """
    Reset user's password using the reset token

    :param db: Database session
    :param token: Password reset token
    :param new_password: New password
    :return: Tuple of (success, message)
    """
    # Find the reset record
    reset_record = db.query(PasswordResetTable).filter(
        PasswordResetTable.Resettoken == token
    ).first()

    if not reset_record:
        return False, "Invalid or expired reset link."

    if reset_record.Used:
        return False, "This reset link has already been used."

    # Check expiration
    expires_at = datetime.fromisoformat(reset_record.Expiresat)
    if datetime.utcnow() > expires_at:
        return False, "This reset link has expired. Please request a new one."

    # Find the user
    user = db.query(UserTable).filter(
        UserTable.Userid == reset_record.Userid
    ).first()

    if not user:
        return False, "User not found."

    if not user.Isactive:
        return False, "This account has been deactivated."

    try:
        # Store reset password as a secure hash.
        user.Userpassword = hash_password(new_password)

        # Mark token as used
        reset_record.Used = True

        db.commit()

        return True, "Your password has been reset successfully. You can now log in with your new password."

    except Exception as e:
        db.rollback()
        return False, f"Failed to reset password: {str(e)}"
