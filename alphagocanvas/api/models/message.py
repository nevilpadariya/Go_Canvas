from typing import Optional, List
from pydantic import BaseModel


# ============== MESSAGE/CONVERSATION MODELS ==============

class MessageCreateRequest(BaseModel):
    """Request to send a message"""
    Messagecontent: str


class ConversationCreateRequest(BaseModel):
    """Request to start a new conversation"""
    Conversationsubject: str
    Recipientids: List[int]  # List of user IDs
    Recipientroles: List[str]  # Corresponding roles
    Initialmessage: str


class ParticipantInfo(BaseModel):
    """Participant information"""
    Userid: int
    Userrole: str
    Username: Optional[str]
    Isunread: bool


class MessageResponse(BaseModel):
    """Message response"""
    Messageid: int
    Messagecontent: str
    Conversationid: int
    Senderid: int
    Senderrole: str
    Sendername: Optional[str]
    Isread: bool
    Createdat: Optional[str]


class ConversationResponse(BaseModel):
    """Conversation response"""
    Conversationid: int
    Conversationsubject: str
    Lastmessagedate: Optional[str]
    Participants: List[ParticipantInfo]
    Unreadcount: int = 0
    Lastmessage: Optional[str] = None
    Createdat: Optional[str]


class ConversationDetailResponse(ConversationResponse):
    """Conversation with messages"""
    Messages: List[MessageResponse]


class InboxResponse(BaseModel):
    """User inbox"""
    Totalconversations: int
    Unreadconversations: int
    Conversations: List[ConversationResponse]


class ConversationDeleteResponse(BaseModel):
    """Response after leaving a conversation"""
    Success: str
    Conversationid: int
