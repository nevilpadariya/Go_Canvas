"""Page service: CRUD for course pages."""
from datetime import datetime
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from alphagocanvas.api.models.page import PageCreateRequest, PageUpdateRequest, PageResponse
from alphagocanvas.database.models import PageTable


def create_page(db: Session, course_id: int, request: PageCreateRequest) -> PageResponse:
    page = PageTable(
        Courseid=course_id,
        Pagetitle=request.Pagetitle,
        Pagebody=request.Pagebody,
        Pageslug=request.Pageslug or request.Pagetitle.lower().replace(" ", "-")[:100],
        Createdat=datetime.now().isoformat(),
        Updatedat=datetime.now().isoformat(),
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return PageResponse(
        Pageid=page.Pageid,
        Courseid=page.Courseid,
        Pagetitle=page.Pagetitle,
        Pagebody=page.Pagebody,
        Pageslug=page.Pageslug,
        Createdat=page.Createdat,
        Updatedat=page.Updatedat,
    )


def get_page(db: Session, page_id: int) -> PageResponse:
    page = db.query(PageTable).filter(PageTable.Pageid == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return PageResponse(
        Pageid=page.Pageid,
        Courseid=page.Courseid,
        Pagetitle=page.Pagetitle,
        Pagebody=page.Pagebody,
        Pageslug=page.Pageslug,
        Createdat=page.Createdat,
        Updatedat=page.Updatedat,
    )


def get_pages_by_course(db: Session, course_id: int) -> List[PageResponse]:
    pages = db.query(PageTable).filter(PageTable.Courseid == course_id).all()
    return [
        PageResponse(
            Pageid=p.Pageid,
            Courseid=p.Courseid,
            Pagetitle=p.Pagetitle,
            Pagebody=p.Pagebody,
            Pageslug=p.Pageslug,
            Createdat=p.Createdat,
            Updatedat=p.Updatedat,
        )
        for p in pages
    ]


def update_page(db: Session, page_id: int, request: PageUpdateRequest) -> PageResponse:
    page = db.query(PageTable).filter(PageTable.Pageid == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    if request.Pagetitle is not None:
        page.Pagetitle = request.Pagetitle
    if request.Pagebody is not None:
        page.Pagebody = request.Pagebody
    if request.Pageslug is not None:
        page.Pageslug = request.Pageslug
    page.Updatedat = datetime.now().isoformat()
    db.commit()
    db.refresh(page)
    return PageResponse(
        Pageid=page.Pageid,
        Courseid=page.Courseid,
        Pagetitle=page.Pagetitle,
        Pagebody=page.Pagebody,
        Pageslug=page.Pageslug,
        Createdat=page.Createdat,
        Updatedat=page.Updatedat,
    )


def delete_page(db: Session, page_id: int) -> dict:
    page = db.query(PageTable).filter(PageTable.Pageid == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
    db.commit()
    return {"Success": "Page deleted", "Pageid": page_id}
