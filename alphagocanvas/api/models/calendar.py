from typing import Optional, List
from pydantic import BaseModel


# ============== CALENDAR EVENT MODELS ==============

class CalendarEventCreateRequest(BaseModel):
    """Request to create a calendar event"""
    Eventtitle: str
    Eventdescription: Optional[str] = None
    Eventtype: str = "event"  # 'assignment', 'quiz', 'event', 'reminder'
    Eventstart: str  # ISO datetime
    Eventend: Optional[str] = None
    Eventallday: Optional[bool] = False
    Eventcolor: Optional[str] = None
    Courseid: Optional[int] = None


class CalendarEventUpdateRequest(BaseModel):
    """Request to update a calendar event"""
    Eventtitle: Optional[str] = None
    Eventdescription: Optional[str] = None
    Eventtype: Optional[str] = None
    Eventstart: Optional[str] = None
    Eventend: Optional[str] = None
    Eventallday: Optional[bool] = None
    Eventcolor: Optional[str] = None


class CalendarEventResponse(BaseModel):
    """Calendar event response"""
    Eventid: int
    Eventtitle: str
    Eventdescription: Optional[str]
    Eventtype: str
    Eventstart: str
    Eventend: Optional[str]
    Eventallday: bool
    Eventcolor: Optional[str]
    Courseid: Optional[int]
    Coursename: Optional[str] = None
    Userid: int
    Userrole: str
    Referencetype: Optional[str]
    Referenceid: Optional[int]
    Createdat: Optional[str]


class CalendarEventsListResponse(BaseModel):
    """List of calendar events"""
    Startdate: str
    Enddate: str
    Totalevents: int
    Events: List[CalendarEventResponse]


class CalendarEventDeleteResponse(BaseModel):
    """Response after event deletion"""
    Success: str
    Eventid: int
