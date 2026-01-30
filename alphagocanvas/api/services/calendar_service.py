from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from alphagocanvas.api.models.calendar import (
    CalendarEventCreateRequest, CalendarEventUpdateRequest, CalendarEventResponse,
    CalendarEventsListResponse, CalendarEventDeleteResponse
)
from alphagocanvas.database.models import CalendarEventTable


def create_event(
    db: Session,
    request: CalendarEventCreateRequest,
    user_id: int,
    user_role: str
) -> CalendarEventResponse:
    """Create a calendar event"""
    event = CalendarEventTable(
        Eventtitle=request.Eventtitle,
        Eventdescription=request.Eventdescription,
        Eventtype=request.Eventtype,
        Eventstart=request.Eventstart,
        Eventend=request.Eventend,
        Eventallday=request.Eventallday or False,
        Eventcolor=request.Eventcolor,
        Courseid=request.Courseid,
        Userid=user_id,
        Userrole=user_role,
        Createdat=datetime.now().isoformat()
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    course_name = None
    if event.Courseid:
        query = text('SELECT "Coursename" FROM courses WHERE "Courseid" = :id')
        result = db.execute(query, {"id": event.Courseid}).fetchone()
        course_name = result.Coursename if result else None
    
    return CalendarEventResponse(
        Eventid=event.Eventid,
        Eventtitle=event.Eventtitle,
        Eventdescription=event.Eventdescription,
        Eventtype=event.Eventtype,
        Eventstart=event.Eventstart,
        Eventend=event.Eventend,
        Eventallday=event.Eventallday or False,
        Eventcolor=event.Eventcolor,
        Courseid=event.Courseid,
        Coursename=course_name,
        Userid=event.Userid,
        Userrole=event.Userrole,
        Referencetype=event.Referencetype,
        Referenceid=event.Referenceid,
        Createdat=event.Createdat
    )


def get_events_for_user(
    db: Session,
    user_id: int,
    start_date: str,
    end_date: str,
    course_id: Optional[int] = None
) -> CalendarEventsListResponse:
    """Get calendar events for a user within a date range"""
    
    # Get user's own events
    query = db.query(CalendarEventTable).filter(
        CalendarEventTable.Userid == user_id,
        CalendarEventTable.Eventstart >= start_date,
        CalendarEventTable.Eventstart <= end_date
    )
    
    if course_id:
        query = query.filter(CalendarEventTable.Courseid == course_id)
    
    events = query.order_by(CalendarEventTable.Eventstart).all()
    
    event_responses = []
    for evt in events:
        course_name = None
        if evt.Courseid:
            cq = text('SELECT "Coursename" FROM courses WHERE "Courseid" = :id')
            result = db.execute(cq, {"id": evt.Courseid}).fetchone()
            course_name = result.Coursename if result else None
        
        event_responses.append(CalendarEventResponse(
            Eventid=evt.Eventid,
            Eventtitle=evt.Eventtitle,
            Eventdescription=evt.Eventdescription,
            Eventtype=evt.Eventtype,
            Eventstart=evt.Eventstart,
            Eventend=evt.Eventend,
            Eventallday=evt.Eventallday or False,
            Eventcolor=evt.Eventcolor,
            Courseid=evt.Courseid,
            Coursename=course_name,
            Userid=evt.Userid,
            Userrole=evt.Userrole,
            Referencetype=evt.Referencetype,
            Referenceid=evt.Referenceid,
            Createdat=evt.Createdat
        ))
    
    return CalendarEventsListResponse(
        Startdate=start_date,
        Enddate=end_date,
        Totalevents=len(event_responses),
        Events=event_responses
    )


def update_event(
    db: Session,
    event_id: int,
    request: CalendarEventUpdateRequest,
    user_id: int
) -> CalendarEventResponse:
    """Update a calendar event"""
    event = db.query(CalendarEventTable).filter(
        CalendarEventTable.Eventid == event_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.Userid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
    
    if request.Eventtitle is not None:
        event.Eventtitle = request.Eventtitle
    if request.Eventdescription is not None:
        event.Eventdescription = request.Eventdescription
    if request.Eventtype is not None:
        event.Eventtype = request.Eventtype
    if request.Eventstart is not None:
        event.Eventstart = request.Eventstart
    if request.Eventend is not None:
        event.Eventend = request.Eventend
    if request.Eventallday is not None:
        event.Eventallday = request.Eventallday
    if request.Eventcolor is not None:
        event.Eventcolor = request.Eventcolor
    
    db.commit()
    db.refresh(event)
    
    course_name = None
    if event.Courseid:
        query = text('SELECT "Coursename" FROM courses WHERE "Courseid" = :id')
        result = db.execute(query, {"id": event.Courseid}).fetchone()
        course_name = result.Coursename if result else None
    
    return CalendarEventResponse(
        Eventid=event.Eventid,
        Eventtitle=event.Eventtitle,
        Eventdescription=event.Eventdescription,
        Eventtype=event.Eventtype,
        Eventstart=event.Eventstart,
        Eventend=event.Eventend,
        Eventallday=event.Eventallday or False,
        Eventcolor=event.Eventcolor,
        Courseid=event.Courseid,
        Coursename=course_name,
        Userid=event.Userid,
        Userrole=event.Userrole,
        Referencetype=event.Referencetype,
        Referenceid=event.Referenceid,
        Createdat=event.Createdat
    )


def delete_event(db: Session, event_id: int, user_id: int) -> CalendarEventDeleteResponse:
    """Delete a calendar event"""
    event = db.query(CalendarEventTable).filter(
        CalendarEventTable.Eventid == event_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.Userid != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    db.delete(event)
    db.commit()
    
    return CalendarEventDeleteResponse(
        Success="Event deleted successfully",
        Eventid=event_id
    )


def sync_assignments_to_calendar(db: Session, user_id: int, course_ids: List[int]) -> int:
    """Sync assignments/quizzes to calendar events (returns count of synced items)"""
    synced_count = 0
    
    for course_id in course_ids:
        # Sync assignments
        assignments_query = text("""
            SELECT "Assignmentid", "Assignmentname", "Duedate" 
            FROM assignments WHERE "Courseid" = :courseid AND "Duedate" IS NOT NULL
        """)
        assignments = db.execute(assignments_query, {"courseid": course_id}).fetchall()
        
        for assignment in assignments:
            # Check if event already exists
            existing = db.query(CalendarEventTable).filter(
                CalendarEventTable.Referencetype == 'assignment',
                CalendarEventTable.Referenceid == assignment.Assignmentid,
                CalendarEventTable.Userid == user_id
            ).first()
            
            if not existing:
                event = CalendarEventTable(
                    Eventtitle=f"Due: {assignment.Assignmentname}",
                    Eventtype='assignment',
                    Eventstart=assignment.Duedate,
                    Eventallday=True,
                    Eventcolor='#E53935',
                    Courseid=course_id,
                    Userid=user_id,
                    Userrole='Student',
                    Referencetype='assignment',
                    Referenceid=assignment.Assignmentid,
                    Createdat=datetime.now().isoformat()
                )
                db.add(event)
                synced_count += 1
    
    db.commit()
    return synced_count
