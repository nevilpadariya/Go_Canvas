"""
Discussion API Endpoints

Provides endpoints for:
- Course discussions/forums
- Discussion replies with nested threading
- Pinning and locking discussions
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.discussion import (
    DiscussionCreateRequest, DiscussionUpdateRequest, DiscussionResponse,
    DiscussionDetailResponse, DiscussionReplyCreateRequest, DiscussionReplyUpdateRequest,
    DiscussionReplyResponse, DiscussionListResponse, DiscussionDeleteResponse, ReplyDeleteResponse,
    DiscussionGradeRequest, DiscussionGradeResponse,
)
from alphagocanvas.api.services.discussion_service import (
    create_discussion, get_discussion, get_discussions_by_course, update_discussion,
    delete_discussion, set_discussion_grade, create_reply, update_reply, delete_reply
)
from alphagocanvas.api.utils.auth import decode_token, get_user_name
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/discussions", tags=["discussions"])


@router.get("/course/{courseid}", response_model=DiscussionListResponse)
async def get_course_discussions(
    courseid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """
    Get all discussions for a course.
    
    Faculty sees all (including unpublished).
    Students only see published discussions.
    """
    decoded_token = decode_token(token=token)
    user_role = decoded_token.get("userrole")
    
    include_unpublished = user_role == "Faculty"
    return get_discussions_by_course(db, courseid, include_unpublished)


@router.get("/{discussionid}", response_model=DiscussionDetailResponse)
async def get_discussion_endpoint(
    discussionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get a discussion with all its replies"""
    decode_token(token=token)
    return get_discussion(db, discussionid)


@router.post("/", response_model=DiscussionResponse)
async def create_discussion_endpoint(
    request: DiscussionCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Create a new discussion"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    user_name = get_user_name(db, user_id, user_role)
    
    return create_discussion(db, request, user_id, user_role, user_name)


@router.put("/{discussionid}", response_model=DiscussionResponse)
async def update_discussion_endpoint(
    discussionid: int,
    request: DiscussionUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Update a discussion"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return update_discussion(db, discussionid, request, user_id, user_role)


@router.put("/{discussionid}/grade", response_model=DiscussionGradeResponse)
async def grade_discussion_endpoint(
    discussionid: int,
    request: DiscussionGradeRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Set grade for a student on a graded discussion (faculty only)"""
    decoded_token = decode_token(token=token)
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can grade discussions")
    return set_discussion_grade(db, discussionid, request, decoded_token["userrole"])


@router.delete("/{discussionid}", response_model=DiscussionDeleteResponse)
async def delete_discussion_endpoint(
    discussionid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a discussion"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return delete_discussion(db, discussionid, user_id, user_role)


# ============== REPLY ENDPOINTS ==============

@router.post("/{discussionid}/replies", response_model=DiscussionReplyResponse)
async def create_reply_endpoint(
    discussionid: int,
    request: DiscussionReplyCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Create a reply to a discussion"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    user_name = get_user_name(db, user_id, user_role)
    
    return create_reply(db, discussionid, request, user_id, user_role, user_name)


@router.put("/replies/{replyid}", response_model=DiscussionReplyResponse)
async def update_reply_endpoint(
    replyid: int,
    request: DiscussionReplyUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Update a reply"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return update_reply(db, replyid, request, user_id, user_role)


@router.delete("/replies/{replyid}", response_model=ReplyDeleteResponse)
async def delete_reply_endpoint(
    replyid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a reply"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return delete_reply(db, replyid, user_id, user_role)
