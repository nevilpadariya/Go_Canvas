"""
Module API Endpoints

Provides endpoints for:
- Course modules management
- Module items (assignments, quizzes, pages, files, links)
- Reordering modules and items
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from alphagocanvas.api.models.module import (
    ModuleCreateRequest, ModuleUpdateRequest, ModuleResponse,
    ModuleItemCreateRequest, ModuleItemUpdateRequest, ModuleItemResponse,
    ModuleListResponse, ModuleDeleteResponse, ModuleItemDeleteResponse,
    ReorderRequest
)
from alphagocanvas.api.services.module_service import (
    create_module, get_module, get_modules_by_course, update_module, delete_module,
    reorder_modules, create_module_item, update_module_item, delete_module_item,
    reorder_module_items
)
from alphagocanvas.api.utils.auth import decode_token, is_current_user_faculty
from alphagocanvas.database import database_dependency

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/modules", tags=["modules"])


# ============== MODULE ENDPOINTS ==============

@router.get("/course/{courseid}", response_model=ModuleListResponse)
async def get_course_modules(
    courseid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """
    Get all modules for a course.
    
    Faculty sees all modules (including unpublished).
    Students only see published modules.
    """
    decoded_token = decode_token(token=token)
    user_role = decoded_token.get("userrole")
    
    # Faculty can see unpublished modules
    include_unpublished = user_role == "Faculty"
    
    return get_modules_by_course(db, courseid, include_unpublished)


@router.get("/{moduleid}", response_model=ModuleResponse)
async def get_module_endpoint(
    moduleid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Get a single module with its items"""
    decode_token(token=token)
    return get_module(db, moduleid)


@router.post("/", 
             dependencies=[Depends(is_current_user_faculty)],
             response_model=ModuleResponse)
async def create_module_endpoint(
    request: ModuleCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Create a new module (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can create modules")
    
    return create_module(db, request)


@router.put("/{moduleid}",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=ModuleResponse)
async def update_module_endpoint(
    moduleid: int,
    request: ModuleUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Update a module (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can update modules")
    
    return update_module(db, moduleid, request)


@router.delete("/{moduleid}",
               dependencies=[Depends(is_current_user_faculty)],
               response_model=ModuleDeleteResponse)
async def delete_module_endpoint(
    moduleid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a module and all its items (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can delete modules")
    
    return delete_module(db, moduleid)


@router.put("/course/{courseid}/reorder",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=List[ModuleResponse])
async def reorder_modules_endpoint(
    courseid: int,
    request: ReorderRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Reorder modules within a course (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can reorder modules")
    
    return reorder_modules(db, courseid, request.ItemIds)


# ============== MODULE ITEM ENDPOINTS ==============

@router.post("/{moduleid}/items",
             dependencies=[Depends(is_current_user_faculty)],
             response_model=ModuleItemResponse)
async def create_module_item_endpoint(
    moduleid: int,
    request: ModuleItemCreateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Add an item to a module (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can add module items")
    
    return create_module_item(db, moduleid, request)


@router.put("/items/{itemid}",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=ModuleItemResponse)
async def update_module_item_endpoint(
    itemid: int,
    request: ModuleItemUpdateRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Update a module item (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can update module items")
    
    return update_module_item(db, itemid, request)


@router.delete("/items/{itemid}",
               dependencies=[Depends(is_current_user_faculty)],
               response_model=ModuleItemDeleteResponse)
async def delete_module_item_endpoint(
    itemid: int,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Delete a module item (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can delete module items")
    
    return delete_module_item(db, itemid)


@router.put("/{moduleid}/items/reorder",
            dependencies=[Depends(is_current_user_faculty)],
            response_model=List[ModuleItemResponse])
async def reorder_module_items_endpoint(
    moduleid: int,
    request: ReorderRequest,
    db: database_dependency,
    token: str = Depends(oauth2_scheme)
):
    """Reorder items within a module (faculty only)"""
    decoded_token = decode_token(token=token)
    
    if decoded_token.get("userrole") != "Faculty":
        raise HTTPException(status_code=403, detail="Only faculty can reorder module items")
    
    return reorder_module_items(db, moduleid, request.ItemIds)
