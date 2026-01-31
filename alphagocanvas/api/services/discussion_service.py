from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from alphagocanvas.api.models.discussion import (
    DiscussionCreateRequest, DiscussionUpdateRequest, DiscussionResponse,
    DiscussionDetailResponse, DiscussionReplyCreateRequest, DiscussionReplyUpdateRequest,
    DiscussionReplyResponse, DiscussionListResponse, DiscussionDeleteResponse, ReplyDeleteResponse,
    DiscussionGradeRequest, DiscussionGradeResponse,
)
from alphagocanvas.database.models import DiscussionTable, DiscussionReplyTable, DiscussionGradeTable


# ============== DISCUSSION OPERATIONS ==============

def create_discussion(
    db: Session,
    request: DiscussionCreateRequest,
    author_id: int,
    author_role: str,
    author_name: str
) -> DiscussionResponse:
    """Create a new discussion topic"""
    
    discussion = DiscussionTable(
        Discussiontitle=request.Discussiontitle,
        Discussioncontent=request.Discussioncontent,
        Discussionpinned=request.Discussionpinned or False,
        Discussionlocked=False,
        Discussionpublished=request.Discussionpublished if request.Discussionpublished is not None else True,
        Courseid=request.Courseid,
        Authorid=author_id,
        Authorrole=author_role,
        Authorname=author_name,
        Replycount=0,
        Points=getattr(request, "Points", None),
        Createdat=datetime.now().isoformat(),
        Updatedat=datetime.now().isoformat()
    )
    
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    
    return DiscussionResponse(
        Discussionid=discussion.Discussionid,
        Discussiontitle=discussion.Discussiontitle,
        Discussioncontent=discussion.Discussioncontent,
        Discussionpinned=discussion.Discussionpinned or False,
        Discussionlocked=discussion.Discussionlocked or False,
        Discussionpublished=discussion.Discussionpublished or True,
        Courseid=discussion.Courseid,
        Authorid=discussion.Authorid,
        Authorrole=discussion.Authorrole,
        Authorname=discussion.Authorname,
        Replycount=discussion.Replycount or 0,
        Points=getattr(discussion, "Points", None),
        Createdat=discussion.Createdat,
        Updatedat=discussion.Updatedat
    )


def get_discussion(db: Session, discussion_id: int) -> DiscussionDetailResponse:
    """Get a discussion with its replies"""
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Get top-level replies (no parent)
    replies = get_replies_for_discussion(db, discussion_id)
    
    return DiscussionDetailResponse(
        Discussionid=discussion.Discussionid,
        Discussiontitle=discussion.Discussiontitle,
        Discussioncontent=discussion.Discussioncontent,
        Discussionpinned=discussion.Discussionpinned or False,
        Discussionlocked=discussion.Discussionlocked or False,
        Discussionpublished=discussion.Discussionpublished or True,
        Courseid=discussion.Courseid,
        Authorid=discussion.Authorid,
        Authorrole=discussion.Authorrole,
        Authorname=discussion.Authorname,
        Replycount=discussion.Replycount or 0,
        Points=getattr(discussion, "Points", None),
        Createdat=discussion.Createdat,
        Updatedat=discussion.Updatedat,
        Replies=replies
    )


def get_discussions_by_course(
    db: Session,
    course_id: int,
    include_unpublished: bool = False
) -> DiscussionListResponse:
    """Get all discussions for a course"""
    
    # Get course name
    course_query = text("SELECT Coursename FROM courses WHERE Courseid = :courseid")
    course = db.execute(course_query, {"courseid": course_id}).fetchone()
    course_name = course.Coursename if course else None
    
    # Build query based on published status
    if include_unpublished:
        discussions = db.query(DiscussionTable).filter(
            DiscussionTable.Courseid == course_id
        ).order_by(
            DiscussionTable.Discussionpinned.desc(),
            DiscussionTable.Createdat.desc()
        ).all()
    else:
        discussions = db.query(DiscussionTable).filter(
            DiscussionTable.Courseid == course_id,
            DiscussionTable.Discussionpublished == True
        ).order_by(
            DiscussionTable.Discussionpinned.desc(),
            DiscussionTable.Createdat.desc()
        ).all()
    
    discussion_responses = []
    for disc in discussions:
        discussion_responses.append(DiscussionResponse(
            Discussionid=disc.Discussionid,
            Discussiontitle=disc.Discussiontitle,
            Discussioncontent=disc.Discussioncontent,
            Discussionpinned=disc.Discussionpinned or False,
            Discussionlocked=disc.Discussionlocked or False,
            Discussionpublished=disc.Discussionpublished or True,
            Courseid=disc.Courseid,
            Authorid=disc.Authorid,
            Authorrole=disc.Authorrole,
            Authorname=disc.Authorname,
            Replycount=disc.Replycount or 0,
            Points=getattr(disc, "Points", None),
            Createdat=disc.Createdat,
            Updatedat=disc.Updatedat
        ))
    
    return DiscussionListResponse(
        Courseid=course_id,
        Coursename=course_name,
        Totaldiscussions=len(discussion_responses),
        Discussions=discussion_responses
    )


def update_discussion(
    db: Session,
    discussion_id: int,
    request: DiscussionUpdateRequest,
    user_id: int,
    user_role: str
) -> DiscussionResponse:
    """Update a discussion"""
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Only author or faculty can edit
    if discussion.Authorid != user_id and user_role != "Faculty":
        raise HTTPException(status_code=403, detail="Not authorized to edit this discussion")
    
    if request.Discussiontitle is not None:
        discussion.Discussiontitle = request.Discussiontitle
    if request.Discussioncontent is not None:
        discussion.Discussioncontent = request.Discussioncontent
    if request.Discussionpinned is not None:
        discussion.Discussionpinned = request.Discussionpinned
    if request.Discussionlocked is not None:
        discussion.Discussionlocked = request.Discussionlocked
    if request.Discussionpublished is not None:
        discussion.Discussionpublished = request.Discussionpublished
    if getattr(request, "Points", None) is not None:
        discussion.Points = request.Points
    
    discussion.Updatedat = datetime.now().isoformat()
    
    db.commit()
    db.refresh(discussion)
    
    return DiscussionResponse(
        Discussionid=discussion.Discussionid,
        Discussiontitle=discussion.Discussiontitle,
        Discussioncontent=discussion.Discussioncontent,
        Discussionpinned=discussion.Discussionpinned or False,
        Discussionlocked=discussion.Discussionlocked or False,
        Discussionpublished=discussion.Discussionpublished or True,
        Courseid=discussion.Courseid,
        Authorid=discussion.Authorid,
        Authorrole=discussion.Authorrole,
        Authorname=discussion.Authorname,
        Replycount=discussion.Replycount or 0,
        Points=getattr(discussion, "Points", None),
        Createdat=discussion.Createdat,
        Updatedat=discussion.Updatedat
    )


def set_discussion_grade(
    db: Session,
    discussion_id: int,
    request: DiscussionGradeRequest,
    user_role: str,
) -> DiscussionGradeResponse:
    """Set or update grade for a student on a graded discussion. Faculty only."""
    if user_role != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can grade discussions")
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == discussion_id
    ).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if not getattr(discussion, "Points", None):
        raise HTTPException(status_code=400, detail="Discussion is not graded (no points)")
    existing = db.query(DiscussionGradeTable).filter(
        DiscussionGradeTable.Discussionid == discussion_id,
        DiscussionGradeTable.Studentid == request.Studentid,
    ).first()
    if existing:
        existing.Score = request.Score
        existing.Gradedat = datetime.now().isoformat()
        db.commit()
    else:
        grade = DiscussionGradeTable(
            Discussionid=discussion_id,
            Studentid=request.Studentid,
            Score=request.Score,
            Gradedat=datetime.now().isoformat(),
        )
        db.add(grade)
        db.commit()
    return DiscussionGradeResponse(
        Success="Discussion grade set",
        Discussionid=discussion_id,
        Studentid=request.Studentid,
        Score=request.Score,
    )


def delete_discussion(db: Session, discussion_id: int, user_id: int, user_role: str) -> DiscussionDeleteResponse:
    """Delete a discussion and all its replies"""
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Only author or faculty can delete
    if discussion.Authorid != user_id and user_role != "Faculty":
        raise HTTPException(status_code=403, detail="Not authorized to delete this discussion")
    
    # Delete discussion grades first
    db.query(DiscussionGradeTable).filter(
        DiscussionGradeTable.Discussionid == discussion_id
    ).delete()
    # Delete all replies first
    db.query(DiscussionReplyTable).filter(
        DiscussionReplyTable.Discussionid == discussion_id
    ).delete()
    
    db.delete(discussion)
    db.commit()
    
    return DiscussionDeleteResponse(
        Success="Discussion deleted successfully",
        Discussionid=discussion_id
    )


# ============== REPLY OPERATIONS ==============

def get_replies_for_discussion(db: Session, discussion_id: int) -> List[DiscussionReplyResponse]:
    """Get all top-level replies for a discussion with nested replies"""
    # Get top-level replies (no parent)
    top_level_replies = db.query(DiscussionReplyTable).filter(
        DiscussionReplyTable.Discussionid == discussion_id,
        DiscussionReplyTable.Parentreplyid == None
    ).order_by(DiscussionReplyTable.Createdat).all()
    
    def build_reply_tree(reply: DiscussionReplyTable) -> DiscussionReplyResponse:
        # Get child replies
        child_replies = db.query(DiscussionReplyTable).filter(
            DiscussionReplyTable.Parentreplyid == reply.Replyid
        ).order_by(DiscussionReplyTable.Createdat).all()
        
        return DiscussionReplyResponse(
            Replyid=reply.Replyid,
            Replycontent=reply.Replycontent,
            Discussionid=reply.Discussionid,
            Parentreplyid=reply.Parentreplyid,
            Authorid=reply.Authorid,
            Authorrole=reply.Authorrole,
            Authorname=reply.Authorname,
            Createdat=reply.Createdat,
            Updatedat=reply.Updatedat,
            Replies=[build_reply_tree(child) for child in child_replies]
        )
    
    return [build_reply_tree(reply) for reply in top_level_replies]


def create_reply(
    db: Session,
    discussion_id: int,
    request: DiscussionReplyCreateRequest,
    author_id: int,
    author_role: str,
    author_name: str
) -> DiscussionReplyResponse:
    """Create a reply to a discussion"""
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    if discussion.Discussionlocked:
        raise HTTPException(status_code=403, detail="Discussion is locked")
    
    reply = DiscussionReplyTable(
        Replycontent=request.Replycontent,
        Discussionid=discussion_id,
        Parentreplyid=request.Parentreplyid,
        Authorid=author_id,
        Authorrole=author_role,
        Authorname=author_name,
        Createdat=datetime.now().isoformat(),
        Updatedat=datetime.now().isoformat()
    )
    
    db.add(reply)
    
    # Update reply count
    discussion.Replycount = (discussion.Replycount or 0) + 1
    discussion.Updatedat = datetime.now().isoformat()
    
    db.commit()
    db.refresh(reply)
    
    return DiscussionReplyResponse(
        Replyid=reply.Replyid,
        Replycontent=reply.Replycontent,
        Discussionid=reply.Discussionid,
        Parentreplyid=reply.Parentreplyid,
        Authorid=reply.Authorid,
        Authorrole=reply.Authorrole,
        Authorname=reply.Authorname,
        Createdat=reply.Createdat,
        Updatedat=reply.Updatedat,
        Replies=[]
    )


def update_reply(
    db: Session,
    reply_id: int,
    request: DiscussionReplyUpdateRequest,
    user_id: int,
    user_role: str
) -> DiscussionReplyResponse:
    """Update a reply"""
    reply = db.query(DiscussionReplyTable).filter(
        DiscussionReplyTable.Replyid == reply_id
    ).first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Only author or faculty can edit
    if reply.Authorid != user_id and user_role != "Faculty":
        raise HTTPException(status_code=403, detail="Not authorized to edit this reply")
    
    reply.Replycontent = request.Replycontent
    reply.Updatedat = datetime.now().isoformat()
    
    db.commit()
    db.refresh(reply)
    
    return DiscussionReplyResponse(
        Replyid=reply.Replyid,
        Replycontent=reply.Replycontent,
        Discussionid=reply.Discussionid,
        Parentreplyid=reply.Parentreplyid,
        Authorid=reply.Authorid,
        Authorrole=reply.Authorrole,
        Authorname=reply.Authorname,
        Createdat=reply.Createdat,
        Updatedat=reply.Updatedat,
        Replies=[]
    )


def delete_reply(db: Session, reply_id: int, user_id: int, user_role: str) -> ReplyDeleteResponse:
    """Delete a reply"""
    reply = db.query(DiscussionReplyTable).filter(
        DiscussionReplyTable.Replyid == reply_id
    ).first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Only author or faculty can delete
    if reply.Authorid != user_id and user_role != "Faculty":
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply")
    
    discussion = db.query(DiscussionTable).filter(
        DiscussionTable.Discussionid == reply.Discussionid
    ).first()
    
    # Delete child replies first
    db.query(DiscussionReplyTable).filter(
        DiscussionReplyTable.Parentreplyid == reply_id
    ).delete()
    
    db.delete(reply)
    
    # Update reply count
    if discussion:
        discussion.Replycount = max(0, (discussion.Replycount or 0) - 1)
    
    db.commit()
    
    return ReplyDeleteResponse(
        Success="Reply deleted successfully",
        Replyid=reply_id
    )
