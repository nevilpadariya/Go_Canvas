"""
Email service for sending notifications and password reset emails.
Supports SMTP and can be extended for services like SendGrid, AWS SES, etc.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from alphagocanvas.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
    SMTP_FROM_EMAIL, SMTP_FROM_NAME, FRONTEND_URL
)

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending various types of emails"""

    def __init__(self):
        self.host = SMTP_HOST
        self.port = SMTP_PORT
        self.username = SMTP_USER
        self.password = SMTP_PASSWORD
        self.from_email = SMTP_FROM_EMAIL
        self.from_name = SMTP_FROM_NAME
        self.frontend_url = FRONTEND_URL

    def _is_configured(self) -> bool:
        """Check if email service is properly configured"""
        return bool(self.username and self.password)

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email using SMTP

        :param to_email: Recipient email address
        :param subject: Email subject
        :param html_body: HTML content of the email
        :param text_body: Plain text content (fallback)
        :return: True if sent successfully, False otherwise
        """
        if not self._is_configured():
            logger.warning("Email service not configured. Skipping email send.")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            # Add plain text version
            if text_body:
                msg.attach(MIMEText(text_body, "plain"))

            # Add HTML version
            msg.attach(MIMEText(html_body, "html"))

            # Connect and send
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str = "User") -> bool:
        """
        Send password reset email with reset link

        :param to_email: User's email address
        :param reset_token: Password reset token
        :param user_name: User's name for personalization
        :return: True if sent successfully
        """
        reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"

        subject = "Reset Your Go Canvas Password"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Go Canvas</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your password for your Go Canvas account. Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </p>
                    <p>This link will expire in 60 minutes.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-size: 12px; color: #666;">{reset_link}</p>
                </div>
                <div class="footer">
                    <p>This email was sent by Go Canvas Learning Management System</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {user_name},

        We received a request to reset your password for your Go Canvas account.

        Click this link to reset your password:
        {reset_link}

        This link will expire in 60 minutes.

        If you didn't request a password reset, you can safely ignore this email.

        - Go Canvas Team
        """

        return self._send_email(to_email, subject, html_body, text_body)

    def send_grade_notification(
        self,
        to_email: str,
        student_name: str,
        course_name: str,
        assignment_name: str,
        grade: str,
        feedback: Optional[str] = None
    ) -> bool:
        """
        Send notification when a grade is posted

        :param to_email: Student's email address
        :param student_name: Student's name
        :param course_name: Name of the course
        :param assignment_name: Name of the assignment
        :param grade: Grade received
        :param feedback: Optional feedback from instructor
        :return: True if sent successfully
        """
        subject = f"Grade Posted: {assignment_name}"

        feedback_section = ""
        if feedback:
            feedback_section = f"""
            <h3>Instructor Feedback:</h3>
            <p style="background-color: #e0e7ff; padding: 15px; border-radius: 6px;">{feedback}</p>
            """

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .grade-box {{ background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 6px; font-size: 24px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Go Canvas</h1>
                </div>
                <div class="content">
                    <h2>Grade Posted</h2>
                    <p>Hi {student_name},</p>
                    <p>Your grade has been posted for:</p>
                    <p><strong>Course:</strong> {course_name}<br>
                    <strong>Assignment:</strong> {assignment_name}</p>
                    <div class="grade-box">
                        Grade: {grade}
                    </div>
                    {feedback_section}
                    <p>View your grade details in Go Canvas.</p>
                </div>
                <div class="footer">
                    <p>Go Canvas Learning Management System</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {student_name},

        Your grade has been posted for:

        Course: {course_name}
        Assignment: {assignment_name}
        Grade: {grade}

        {f"Instructor Feedback: {feedback}" if feedback else ""}

        View your grade details in Go Canvas.

        - Go Canvas Team
        """

        return self._send_email(to_email, subject, html_body, text_body)

    def send_assignment_notification(
        self,
        to_email: str,
        student_name: str,
        course_name: str,
        assignment_name: str,
        due_date: str,
        description: Optional[str] = None
    ) -> bool:
        """
        Send notification when a new assignment is posted

        :param to_email: Student's email address
        :param student_name: Student's name
        :param course_name: Name of the course
        :param assignment_name: Name of the assignment
        :param due_date: Due date of the assignment
        :param description: Assignment description
        :return: True if sent successfully
        """
        subject = f"New Assignment: {assignment_name}"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .due-box {{ background-color: #f59e0b; color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Go Canvas</h1>
                </div>
                <div class="content">
                    <h2>New Assignment Posted</h2>
                    <p>Hi {student_name},</p>
                    <p>A new assignment has been posted in your course:</p>
                    <p><strong>Course:</strong> {course_name}<br>
                    <strong>Assignment:</strong> {assignment_name}</p>
                    <div class="due-box">
                        <strong>Due Date:</strong> {due_date}
                    </div>
                    {f"<p><strong>Description:</strong><br>{description}</p>" if description else ""}
                    <p>Log in to Go Canvas to view the full assignment details and submit your work.</p>
                </div>
                <div class="footer">
                    <p>Go Canvas Learning Management System</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {student_name},

        A new assignment has been posted in your course:

        Course: {course_name}
        Assignment: {assignment_name}
        Due Date: {due_date}

        {f"Description: {description}" if description else ""}

        Log in to Go Canvas to view the full assignment details.

        - Go Canvas Team
        """

        return self._send_email(to_email, subject, html_body, text_body)

    def send_announcement_notification(
        self,
        to_email: str,
        student_name: str,
        course_name: str,
        announcement_title: str,
        announcement_content: str
    ) -> bool:
        """
        Send notification when a new announcement is posted

        :param to_email: Student's email address
        :param student_name: Student's name
        :param course_name: Name of the course
        :param announcement_title: Title of the announcement
        :param announcement_content: Content of the announcement
        :return: True if sent successfully
        """
        subject = f"Announcement: {announcement_title}"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .announcement {{ background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #4F46E5; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Go Canvas</h1>
                </div>
                <div class="content">
                    <h2>New Announcement</h2>
                    <p>Hi {student_name},</p>
                    <p>A new announcement has been posted in <strong>{course_name}</strong>:</p>
                    <div class="announcement">
                        <h3>{announcement_title}</h3>
                        <p>{announcement_content}</p>
                    </div>
                    <p style="margin-top: 20px;">Log in to Go Canvas to view more details.</p>
                </div>
                <div class="footer">
                    <p>Go Canvas Learning Management System</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {student_name},

        A new announcement has been posted in {course_name}:

        {announcement_title}

        {announcement_content}

        Log in to Go Canvas to view more details.

        - Go Canvas Team
        """

        return self._send_email(to_email, subject, html_body, text_body)


# Singleton instance
email_service = EmailService()
