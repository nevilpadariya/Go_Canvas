"""
Messaging API Endpoints

Provides endpoints for:
- Inbox management
- Conversations
- Messages
"""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.message import (
    MessageCreateRequest, ConversationCreateRequest, MessageResponse,
    ConversationDetailResponse, InboxResponse
)
from alphagocanvas.api.services.message_service import (
    create_conversation, get_inbox, get_conversation, send_message
)
from alphagocanvas.api.utils.auth import decode_token, get_user_name
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/inbox", response_model=InboxResponse)
async def get_inbox_endpoint(
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get user's inbox with all conversations"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    return get_inbox(db, user_id)


@router.get("/conversations/{conversationid}", response_model=ConversationDetailResponse)
async def get_conversation_endpoint(
    conversationid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get a conversation with all messages"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    return get_conversation(db, conversationid, user_id)


@router.post("/conversations", response_model=ConversationDetailResponse)
async def create_conversation_endpoint(
    request: ConversationCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Start a new conversation"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    user_name = get_user_name(db, user_id, user_role)
    
    return create_conversation(db, request, user_id, user_role, user_name)


@router.post("/conversations/{conversationid}/messages", response_model=MessageResponse)
async def send_message_endpoint(
    conversationid: int,
    request: MessageCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Send a message in a conversation"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    user_name = get_user_name(db, user_id, user_role)
    
    return send_message(db, conversationid, request, user_id, user_role, user_name)
