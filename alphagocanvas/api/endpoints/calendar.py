"""
Calendar API Endpoints

Provides endpoints for:
- Personal calendar events
- Assignment/quiz sync to calendar
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.calendar import (
    CalendarEventCreateRequest, CalendarEventUpdateRequest, CalendarEventResponse,
    CalendarEventsListResponse, CalendarEventDeleteResponse
)
from alphagocanvas.api.services.calendar_service import (
    create_event, get_events_for_user, update_event, delete_event, sync_assignments_to_calendar
)
from alphagocanvas.api.utils.auth import decode_token
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events", response_model=CalendarEventsListResponse)
async def get_events(
    db: database_dependency,
    start_date: str = Query(..., description="Start date (ISO format)"),
    end_date: str = Query(..., description="End date (ISO format)"),
    courseid: Optional[int] = Query(None, description="Filter by course"),
    token: str = Depends(oauth2_scheme)
):
    """Get calendar events for the current user within a date range"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    return get_events_for_user(db, user_id, start_date, end_date, courseid)


@router.post("/events", response_model=CalendarEventResponse)
async def create_event_endpoint(
    request: CalendarEventCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Create a new calendar event"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    user_role = decoded_token.get("userrole")
    
    return create_event(db, request, user_id, user_role)


@router.put("/events/{eventid}", response_model=CalendarEventResponse)
async def update_event_endpoint(
    eventid: int,
    request: CalendarEventUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Update a calendar event"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    return update_event(db, eventid, request, user_id)


@router.delete("/events/{eventid}", response_model=CalendarEventDeleteResponse)
async def delete_event_endpoint(
    eventid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a calendar event"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    return delete_event(db, eventid, user_id)


@router.post("/sync")
async def sync_calendar_endpoint(
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Sync assignments and quizzes to calendar"""
    decoded_token = decode_token(token=token)
    user_id = decoded_token.get("userid")
    
    # Get user's enrolled courses (simplified - in production, query from enrollments)
    from sqlalchemy import text
    query = text("SELECT Courseid FROM studentenrollment WHERE Studentid = :id")
    results = db.execute(query, {"id": user_id}).fetchall()
    course_ids = [r.Courseid for r in results]
    
    synced = sync_assignments_to_calendar(db, user_id, course_ids)
    
    return {"message": f"Synced {synced} items to calendar"}
