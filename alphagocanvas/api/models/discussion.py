from typing import Optional, List
from pydantic import BaseModel


# ============== DISCUSSION MODELS ==============

class DiscussionCreateRequest(BaseModel):
    """Request to create a new discussion"""
    Discussiontitle: str
    Discussioncontent: str
    Courseid: int
    Discussionpinned: Optional[bool] = False
    Discussionpublished: Optional[bool] = True


class DiscussionUpdateRequest(BaseModel):
    """Request to update a discussion"""
    Discussiontitle: Optional[str] = None
    Discussioncontent: Optional[str] = None
    Discussionpinned: Optional[bool] = None
    Discussionlocked: Optional[bool] = None
    Discussionpublished: Optional[bool] = None


class DiscussionReplyCreateRequest(BaseModel):
    """Request to create a reply"""
    Replycontent: str
    Parentreplyid: Optional[int] = None  # For nested replies


class DiscussionReplyUpdateRequest(BaseModel):
    """Request to update a reply"""
    Replycontent: str


class DiscussionReplyResponse(BaseModel):
    """Discussion reply response"""
    Replyid: int
    Replycontent: str
    Discussionid: int
    Parentreplyid: Optional[int]
    Authorid: int
    Authorrole: str
    Authorname: Optional[str]
    Createdat: Optional[str]
    Updatedat: Optional[str]
    Replies: List['DiscussionReplyResponse'] = []  # Nested replies


class DiscussionResponse(BaseModel):
    """Discussion response"""
    Discussionid: int
    Discussiontitle: str
    Discussioncontent: str
    Discussionpinned: bool
    Discussionlocked: bool
    Discussionpublished: bool
    Courseid: int
    Authorid: int
    Authorrole: str
    Authorname: Optional[str]
    Replycount: int
    Createdat: Optional[str]
    Updatedat: Optional[str]


class DiscussionDetailResponse(DiscussionResponse):
    """Discussion with replies"""
    Replies: List[DiscussionReplyResponse] = []


class DiscussionListResponse(BaseModel):
    """List of discussions for a course"""
    Courseid: int
    Coursename: Optional[str]
    Totaldiscussions: int
    Discussions: List[DiscussionResponse]


class DiscussionDeleteResponse(BaseModel):
    """Response after discussion deletion"""
    Success: str
    Discussionid: int


class ReplyDeleteResponse(BaseModel):
    """Response after reply deletion"""
    Success: str
    Replyid: int


# Enable forward references for nested replies
DiscussionReplyResponse.model_rebuild()
