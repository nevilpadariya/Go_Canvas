"""Pages API: Canvas-style course pages."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.page import PageCreateRequest, PageUpdateRequest, PageResponse
from alphagocanvas.api.services.page_service import (
    create_page,
    get_page,
    get_pages_by_course,
    update_page,
    delete_page,
)
from alphagocanvas.api.utils.auth import decode_token
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/pages", tags=["pages"])


@router.get("/course/{courseid}", response_model=List[PageResponse])
async def list_pages(courseid: int, db: database_dependency, token: str = Depends(oauth2_scheme)):
    decode_token(token=token)
    return get_pages_by_course(db, courseid)


@router.get("/{pageid}", response_model=PageResponse)
async def get_page_endpoint(pageid: int, db: database_dependency, token: str = Depends(oauth2_scheme)):
    decode_token(token=token)
    return get_page(db, pageid)


@router.post("/course/{courseid}", response_model=PageResponse)
async def create_page_endpoint(
    courseid: int,
    request: PageCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme),
):
    decoded = decode_token(token=token)
    if decoded.get("userrole") not in ("Faculty", "Admin"):
        raise HTTPException(status_code=403, detail="Only faculty or admin can create pages")
    return create_page(db, courseid, request)


@router.put("/{pageid}", response_model=PageResponse)
async def update_page_endpoint(
    pageid: int,
    request: PageUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme),
):
    decoded = decode_token(token=token)
    if decoded.get("userrole") not in ("Faculty", "Admin"):
        raise HTTPException(status_code=403, detail="Only faculty or admin can update pages")
    return update_page(db, pageid, request)


@router.delete("/{pageid}")
async def delete_page_endpoint(pageid: int, db: database_dependency, token: str = Depends(oauth2_scheme)):
    decoded = decode_token(token=token)
    if decoded.get("userrole") not in ("Faculty", "Admin"):
        raise HTTPException(status_code=403, detail="Only faculty or admin can delete pages")
    return delete_page(db, pageid)
