from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class UserTable(Base):
    """
    Table for users which is actually represents the database user table in actual database.
    """
    __tablename__ = 'usertable'
    Userid = Column(Integer, primary_key=True)
    Useremail = Column(String)
    Userpassword = Column(String)
    Userrole = Column(String)


class StudentTable(Base):
    """
    Table for students which is actually
    """
    __tablename__ = 'student'
    Studentid = Column(Integer, primary_key=True)
    Studentfirstname = Column(String)
    Studentlastname = Column(String)
    Studentcontactnumber = Column(String)
    Studentnotification = Column(Boolean)


class StudentEnrollmentTable(Base):
    """
    Table for students enrollments
    """
    __tablename__ = 'studentenrollment'
    Enrollmentid = Column(Integer, primary_key=True)
    Studentid = Column(Integer, ForeignKey('student.Studentid'))
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))
    EnrollmentSemester = Column(String)
    EnrollmentGrades = Column(String)
    Facultyid = Column(Integer, ForeignKey('faculty.Facultyid'))


class CourseTable(Base):
    __tablename__ = 'courses'
    Courseid = Column(Integer, primary_key=True, index=True)
    Coursename = Column(String)


class GradeTable(Base):
    """
    Table for grades which is actually
    """
    __tablename__ = 'grades'
    Gradeid = Column(Integer, primary_key=True, index=True)
    Studentid = Column(Integer, ForeignKey('student.Studentid'))
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))


class FacultyTable(Base):
    __tablename__ = 'faculty'

    Facultyid = Column(Integer, primary_key=True, index=True, onupdate="CASCADE")
    Facultyfirstname = Column(String)
    Facultylastname = Column(String)


class AssignmentTable(Base):
    __tablename__ = 'assignments'
    Assignmentid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Assignmentname = Column(String)
    Assignmentdescription = Column(Text)
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))


class QuizTable(Base):
    __tablename__ = 'quizzes'
    quizid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quizname = Column(String)
    quizdescription = Column(Text)
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))


class CourseFacultyTable(Base):
    __tablename__ = 'coursefaculty'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Coursefacultyid = Column(Integer, ForeignKey('faculty.Facultyid'))
    Coursecourseid = Column(Integer, ForeignKey("courses.Courseid"))
    Coursesemester = Column(String)
    Coursepublished = Column(Boolean)
    Coursedescription = Column(String)


class AnnouncementTable(Base):
    __tablename__ = "announcements"
    Announcementid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Announcementname = Column(String)
    Announcementdescription = Column(String)
    Courseid = Column(String)


# ============== NEW TABLES FOR CORE LMS FEATURES ==============

class FileTable(Base):
    """Table for storing uploaded files metadata"""
    __tablename__ = 'files'
    Fileid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Filename = Column(String(255), nullable=False)
    Fileoriginalname = Column(String(255), nullable=False)
    Filemimetype = Column(String(100))
    Filesize = Column(Integer)  # Size in bytes
    Fileurl = Column(String(500), nullable=False)
    Uploaderid = Column(Integer, nullable=False)
    Uploaderrole = Column(String(50), nullable=False)  # 'faculty', 'student', 'admin'
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))
    Createdat = Column(String(50))  # ISO timestamp


class SubmissionTable(Base):
    """Table for assignment submissions"""
    __tablename__ = 'submissions'
    Submissionid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Assignmentid = Column(Integer, ForeignKey('assignments.Assignmentid'), nullable=False)
    Studentid = Column(Integer, ForeignKey('student.Studentid'), nullable=False)
    Submissioncontent = Column(Text)  # Text submission content
    Submissionfileid = Column(Integer, ForeignKey('files.Fileid'))  # Reference to uploaded file
    Submissionscore = Column(String(10))  # Grade/score given
    Submissiongraded = Column(Boolean, default=False)
    Submissionfeedback = Column(Text)  # Faculty feedback
    Submitteddate = Column(String(50))  # ISO timestamp
    Gradeddate = Column(String(50))  # ISO timestamp


class SubmissionCommentTable(Base):
    """Table for inline comments on submissions"""
    __tablename__ = 'submission_comments'
    Commentid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Submissionid = Column(Integer, ForeignKey('submissions.Submissionid'), nullable=False)
    Commentcontent = Column(Text, nullable=False)
    Commentline = Column(Integer)  # Line number for inline comments
    Authorid = Column(Integer, nullable=False)
    Authorrole = Column(String(50), nullable=False)  # 'faculty', 'student'
    Createdat = Column(String(50))  # ISO timestamp


class ModuleTable(Base):
    """Table for course modules"""
    __tablename__ = 'modules'
    Moduleid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Modulename = Column(String(255), nullable=False)
    Moduledescription = Column(Text)
    Moduleposition = Column(Integer, default=0)  # For ordering
    Modulepublished = Column(Boolean, default=False)
    Courseid = Column(Integer, ForeignKey('courses.Courseid'), nullable=False)
    Createdat = Column(String(50))  # ISO timestamp


class ModuleItemTable(Base):
    """Table for items within modules (assignments, quizzes, pages, files, links)"""
    __tablename__ = 'module_items'
    Itemid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Itemname = Column(String(255), nullable=False)
    Itemtype = Column(String(50), nullable=False)  # 'assignment', 'quiz', 'page', 'file', 'link', 'header'
    Itemposition = Column(Integer, default=0)  # For ordering within module
    Itemcontent = Column(Text)  # For 'page' type content or additional info
    Itemurl = Column(String(500))  # For 'link' type or external resources
    Moduleid = Column(Integer, ForeignKey('modules.Moduleid'), nullable=False)
    Referenceid = Column(Integer)  # References assignment/quiz/file ID if applicable
    Createdat = Column(String(50))  # ISO timestamp


class DiscussionTable(Base):
    """Table for course discussion topics/threads"""
    __tablename__ = 'discussions'
    Discussionid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Discussiontitle = Column(String(255), nullable=False)
    Discussioncontent = Column(Text, nullable=False)
    Discussionpinned = Column(Boolean, default=False)
    Discussionlocked = Column(Boolean, default=False)
    Discussionpublished = Column(Boolean, default=True)
    Courseid = Column(Integer, ForeignKey('courses.Courseid'), nullable=False)
    Authorid = Column(Integer, nullable=False)
    Authorrole = Column(String(50), nullable=False)  # 'faculty', 'student'
    Authorname = Column(String(255))
    Replycount = Column(Integer, default=0)
    Createdat = Column(String(50))  # ISO timestamp
    Updatedat = Column(String(50))  # ISO timestamp


class DiscussionReplyTable(Base):
    """Table for replies to discussions"""
    __tablename__ = 'discussion_replies'
    Replyid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Replycontent = Column(Text, nullable=False)
    Discussionid = Column(Integer, ForeignKey('discussions.Discussionid'), nullable=False)
    Parentreplyid = Column(Integer, ForeignKey('discussion_replies.Replyid'))  # For nested replies
    Authorid = Column(Integer, nullable=False)
    Authorrole = Column(String(50), nullable=False)
    Authorname = Column(String(255))
    Createdat = Column(String(50))  # ISO timestamp
    Updatedat = Column(String(50))  # ISO timestamp


class CalendarEventTable(Base):
    """Table for calendar events"""
    __tablename__ = 'calendar_events'
    Eventid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Eventtitle = Column(String(255), nullable=False)
    Eventdescription = Column(Text)
    Eventtype = Column(String(50), nullable=False)  # 'assignment', 'quiz', 'event', 'reminder'
    Eventstart = Column(String(50), nullable=False)  # ISO datetime
    Eventend = Column(String(50))  # ISO datetime for events with duration
    Eventallday = Column(Boolean, default=False)
    Eventcolor = Column(String(20))  # Hex color for display
    Courseid = Column(Integer, ForeignKey('courses.Courseid'))  # Optional course association
    Userid = Column(Integer, nullable=False)  # Owner/creator
    Userrole = Column(String(50), nullable=False)
    Referencetype = Column(String(50))  # 'assignment', 'quiz' for auto-generated events
    Referenceid = Column(Integer)  # ID of referenced item
    Createdat = Column(String(50))


class ConversationTable(Base):
    """Table for message conversations"""
    __tablename__ = 'conversations'
    Conversationid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Conversationsubject = Column(String(255), nullable=False)
    Lastmessagedate = Column(String(50))
    Createdat = Column(String(50))


class ConversationParticipantTable(Base):
    """Table for conversation participants"""
    __tablename__ = 'conversation_participants'
    Participantid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Conversationid = Column(Integer, ForeignKey('conversations.Conversationid'), nullable=False)
    Userid = Column(Integer, nullable=False)
    Userrole = Column(String(50), nullable=False)
    Username = Column(String(255))
    Isunread = Column(Boolean, default=False)


class MessageTable(Base):
    """Table for messages within conversations"""
    __tablename__ = 'messages'
    Messageid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Messagecontent = Column(Text, nullable=False)
    Conversationid = Column(Integer, ForeignKey('conversations.Conversationid'), nullable=False)
    Senderid = Column(Integer, nullable=False)
    Senderrole = Column(String(50), nullable=False)
    Sendername = Column(String(255))
    Isread = Column(Boolean, default=False)
    Createdat = Column(String(50))