"""Page API models for Canvas-style course pages."""
from typing import Optional
from pydantic import BaseModel


class PageCreateRequest(BaseModel):
    Pagetitle: str
    Pagebody: Optional[str] = None
    Pageslug: Optional[str] = None


class PageUpdateRequest(BaseModel):
    Pagetitle: Optional[str] = None
    Pagebody: Optional[str] = None
    Pageslug: Optional[str] = None


class PageResponse(BaseModel):
    Pageid: int
    Courseid: int
    Pagetitle: str
    Pagebody: Optional[str] = None
    Pageslug: Optional[str] = None
    Createdat: Optional[str] = None
    Updatedat: Optional[str] = None
