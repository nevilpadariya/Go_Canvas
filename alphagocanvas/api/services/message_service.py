from datetime import datetime
from typing import Dict, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from alphagocanvas.api.models.message import (
    MessageCreateRequest, ConversationCreateRequest, MessageResponse,
    ConversationResponse, ConversationDetailResponse, InboxResponse,
    ParticipantInfo, ConversationDeleteResponse
)
from alphagocanvas.database.models import (
    ConversationTable, ConversationParticipantTable, MessageTable
)
from alphagocanvas.api.utils.auth import get_user_name


def create_conversation(
    db: Session,
    request: ConversationCreateRequest,
    sender_id: int,
    sender_role: str,
    sender_name: str
) -> ConversationDetailResponse:
    """Create a new conversation with initial message"""
    
    # Create conversation
    conversation = ConversationTable(
        Conversationsubject=request.Conversationsubject,
        Lastmessagedate=datetime.now().isoformat(),
        Createdat=datetime.now().isoformat()
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    # Add sender as participant
    sender_participant = ConversationParticipantTable(
        Conversationid=conversation.Conversationid,
        Userid=sender_id,
        Userrole=sender_role,
        Username=sender_name,
        Isunread=False
    )
    db.add(sender_participant)
    
    # Add recipients as participants
    for i, recipient_id in enumerate(request.Recipientids):
        recipient_role = request.Recipientroles[i] if i < len(request.Recipientroles) else "Student"
        recipient_name = get_user_name(db, recipient_id, recipient_role)
        
        recipient_participant = ConversationParticipantTable(
            Conversationid=conversation.Conversationid,
            Userid=recipient_id,
            Userrole=recipient_role,
            Username=recipient_name,
            Isunread=True  # New conversation is unread for recipients
        )
        db.add(recipient_participant)
    
    # Add initial message
    message = MessageTable(
        Messagecontent=request.Initialmessage,
        Conversationid=conversation.Conversationid,
        Senderid=sender_id,
        Senderrole=sender_role,
        Sendername=sender_name,
        Isread=True,
        Createdat=datetime.now().isoformat()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Build response
    participants = get_participants(db, conversation.Conversationid)
    
    return ConversationDetailResponse(
        Conversationid=conversation.Conversationid,
        Conversationsubject=conversation.Conversationsubject,
        Lastmessagedate=conversation.Lastmessagedate,
        Participants=participants,
        Unreadcount=0,
        Lastmessage=request.Initialmessage,
        Createdat=conversation.Createdat,
        Messages=[MessageResponse(
            Messageid=message.Messageid,
            Messagecontent=message.Messagecontent,
            Conversationid=message.Conversationid,
            Senderid=message.Senderid,
            Senderrole=message.Senderrole,
            Sendername=message.Sendername,
            Isread=message.Isread,
            Createdat=message.Createdat
        )]
    )


def get_participants(db: Session, conversation_id: int) -> List[ParticipantInfo]:
    """Get all participants in a conversation"""
    participants = db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Conversationid == conversation_id
    ).all()
    
    return [ParticipantInfo(
        Userid=p.Userid,
        Userrole=p.Userrole,
        Username=p.Username,
        Isunread=p.Isunread or False
    ) for p in participants]


def get_inbox(db: Session, user_id: int) -> InboxResponse:
    """Get user's inbox with all conversations"""
    
    # Get conversations where user is a participant
    participant_convos = db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Userid == user_id
    ).all()
    
    conversation_ids = [p.Conversationid for p in participant_convos]
    unread_map = {p.Conversationid: p.Isunread for p in participant_convos}
    
    if not conversation_ids:
        return InboxResponse(
            Totalconversations=0,
            Unreadconversations=0,
            Conversations=[]
        )

    conversations = db.query(ConversationTable).filter(
        ConversationTable.Conversationid.in_(conversation_ids)
    ).order_by(ConversationTable.Lastmessagedate.desc()).all()

    participants = db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Conversationid.in_(conversation_ids)
    ).all()
    participants_map: Dict[int, List[ParticipantInfo]] = {}
    for participant in participants:
        conversation_participants = participants_map.setdefault(participant.Conversationid, [])
        conversation_participants.append(
            ParticipantInfo(
                Userid=participant.Userid,
                Userrole=participant.Userrole,
                Username=participant.Username,
                Isunread=participant.Isunread or False
            )
        )

    messages = db.query(MessageTable).filter(
        MessageTable.Conversationid.in_(conversation_ids)
    ).order_by(
        MessageTable.Conversationid,
        MessageTable.Createdat.desc()
    ).all()
    last_message_map: Dict[int, MessageTable] = {}
    for message in messages:
        if message.Conversationid not in last_message_map:
            last_message_map[message.Conversationid] = message
    
    convo_responses = []
    unread_count = 0
    
    for convo in conversations:
        convo_participants = participants_map.get(convo.Conversationid, [])
        last_message = last_message_map.get(convo.Conversationid)
        
        is_unread = unread_map.get(convo.Conversationid, False)
        if is_unread:
            unread_count += 1
        
        convo_responses.append(ConversationResponse(
            Conversationid=convo.Conversationid,
            Conversationsubject=convo.Conversationsubject,
            Lastmessagedate=convo.Lastmessagedate,
            Participants=convo_participants,
            Unreadcount=1 if is_unread else 0,
            Lastmessage=last_message.Messagecontent if last_message else None,
            Createdat=convo.Createdat
        ))
    
    return InboxResponse(
        Totalconversations=len(convo_responses),
        Unreadconversations=unread_count,
        Conversations=convo_responses
    )


def get_conversation(db: Session, conversation_id: int, user_id: int) -> ConversationDetailResponse:
    """Get a conversation with all messages"""
    
    # Verify user is a participant
    participant = db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Conversationid == conversation_id,
        ConversationParticipantTable.Userid == user_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")
    
    conversation = db.query(ConversationTable).filter(
        ConversationTable.Conversationid == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Mark as read for this user
    participant.Isunread = False
    db.commit()
    
    # Get messages
    messages = db.query(MessageTable).filter(
        MessageTable.Conversationid == conversation_id
    ).order_by(MessageTable.Createdat).all()
    
    participants = get_participants(db, conversation_id)
    
    return ConversationDetailResponse(
        Conversationid=conversation.Conversationid,
        Conversationsubject=conversation.Conversationsubject,
        Lastmessagedate=conversation.Lastmessagedate,
        Participants=participants,
        Unreadcount=0,
        Createdat=conversation.Createdat,
        Messages=[MessageResponse(
            Messageid=m.Messageid,
            Messagecontent=m.Messagecontent,
            Conversationid=m.Conversationid,
            Senderid=m.Senderid,
            Senderrole=m.Senderrole,
            Sendername=m.Sendername,
            Isread=m.Isread,
            Createdat=m.Createdat
        ) for m in messages]
    )


def send_message(
    db: Session,
    conversation_id: int,
    request: MessageCreateRequest,
    sender_id: int,
    sender_role: str,
    sender_name: str
) -> MessageResponse:
    """Send a message in a conversation"""
    
    # Verify user is a participant
    participant = db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Conversationid == conversation_id,
        ConversationParticipantTable.Userid == sender_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")
    
    # Create message
    message = MessageTable(
        Messagecontent=request.Messagecontent,
        Conversationid=conversation_id,
        Senderid=sender_id,
        Senderrole=sender_role,
        Sendername=sender_name,
        Isread=False,
        Createdat=datetime.now().isoformat()
    )
    db.add(message)
    
    # Update conversation last message date
    conversation = db.query(ConversationTable).filter(
        ConversationTable.Conversationid == conversation_id
    ).first()
    if conversation:
        conversation.Lastmessagedate = datetime.now().isoformat()
    
    # Mark as unread for other participants
    db.query(ConversationParticipantTable).filter(
        ConversationParticipantTable.Conversationid == conversation_id,
        ConversationParticipantTable.Userid != sender_id
    ).update({"Isunread": True})
    
    db.commit()
    db.refresh(message)
    
    return MessageResponse(
        Messageid=message.Messageid,
        Messagecontent=message.Messagecontent,
        Conversationid=message.Conversationid,
        Senderid=message.Senderid,
        Senderrole=message.Senderrole,
        Sendername=message.Sendername,
        Isread=message.Isread,
        Createdat=message.Createdat
    )
