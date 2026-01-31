import json
from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from alphagocanvas.api.models.module import (
    ModuleCreateRequest, ModuleUpdateRequest, ModuleResponse,
    ModuleItemCreateRequest, ModuleItemUpdateRequest, ModuleItemResponse,
    ModuleListResponse, ModuleDeleteResponse, ModuleItemDeleteResponse
)
from alphagocanvas.database.models import ModuleTable, ModuleItemTable


# ============== MODULE OPERATIONS ==============

def create_module(db: Session, request: ModuleCreateRequest) -> ModuleResponse:
    """Create a new module for a course"""
    
    # Get the max position for ordering
    max_pos_query = text("""
        SELECT COALESCE(MAX("Moduleposition"), -1) as maxpos FROM modules WHERE "Courseid" = :courseid
    """)
    result = db.execute(max_pos_query, {"courseid": request.Courseid}).fetchone()
    next_position = (result.maxpos if result else -1) + 1
    
    module = ModuleTable(
        Modulename=request.Modulename,
        Moduledescription=request.Moduledescription,
        Moduleposition=request.Moduleposition if request.Moduleposition else next_position,
        Modulepublished=request.Modulepublished or False,
        Courseid=request.Courseid,
        Createdat=datetime.now().isoformat()
    )
    
    db.add(module)
    db.commit()
    db.refresh(module)
    
    return ModuleResponse(
        Moduleid=module.Moduleid,
        Modulename=module.Modulename,
        Moduledescription=module.Moduledescription,
        Moduleposition=module.Moduleposition or 0,
        Modulepublished=module.Modulepublished or False,
        Courseid=module.Courseid,
        Createdat=module.Createdat,
        Items=[]
    )


def get_module(db: Session, module_id: int) -> ModuleResponse:
    """Get a single module with its items"""
    module = db.query(ModuleTable).filter(ModuleTable.Moduleid == module_id).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Get items
    items = get_module_items(db, module_id)
    
    return ModuleResponse(
        Moduleid=module.Moduleid,
        Modulename=module.Modulename,
        Moduledescription=module.Moduledescription,
        Moduleposition=module.Moduleposition or 0,
        Modulepublished=module.Modulepublished or False,
        Courseid=module.Courseid,
        Createdat=module.Createdat,
        Items=items
    )


def get_modules_by_course(db: Session, course_id: int, include_unpublished: bool = True) -> ModuleListResponse:
    """Get all modules for a course"""
    
    # Get course name
    course_query = text('SELECT "Coursename" FROM courses WHERE "Courseid" = :courseid')
    course = db.execute(course_query, {"courseid": course_id}).fetchone()
    course_name = course.Coursename if course else None
    
    # Build query based on whether to include unpublished
    if include_unpublished:
        modules = db.query(ModuleTable).filter(
            ModuleTable.Courseid == course_id
        ).order_by(ModuleTable.Moduleposition).all()
    else:
        modules = db.query(ModuleTable).filter(
            ModuleTable.Courseid == course_id,
            ModuleTable.Modulepublished == True
        ).order_by(ModuleTable.Moduleposition).all()
    
    module_responses = []
    for mod in modules:
        items = get_module_items(db, mod.Moduleid)
        module_responses.append(ModuleResponse(
            Moduleid=mod.Moduleid,
            Modulename=mod.Modulename,
            Moduledescription=mod.Moduledescription,
            Moduleposition=mod.Moduleposition or 0,
            Modulepublished=mod.Modulepublished or False,
            Courseid=mod.Courseid,
            Createdat=mod.Createdat,
            Items=items
        ))
    
    return ModuleListResponse(
        Courseid=course_id,
        Coursename=course_name,
        Totalmodules=len(module_responses),
        Modules=module_responses
    )


def update_module(db: Session, module_id: int, request: ModuleUpdateRequest) -> ModuleResponse:
    """Update a module"""
    module = db.query(ModuleTable).filter(ModuleTable.Moduleid == module_id).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    if request.Modulename is not None:
        module.Modulename = request.Modulename
    if request.Moduledescription is not None:
        module.Moduledescription = request.Moduledescription
    if request.Moduleposition is not None:
        module.Moduleposition = request.Moduleposition
    if request.Modulepublished is not None:
        module.Modulepublished = request.Modulepublished
    
    db.commit()
    db.refresh(module)
    
    items = get_module_items(db, module_id)
    
    return ModuleResponse(
        Moduleid=module.Moduleid,
        Modulename=module.Modulename,
        Moduledescription=module.Moduledescription,
        Moduleposition=module.Moduleposition or 0,
        Modulepublished=module.Modulepublished or False,
        Courseid=module.Courseid,
        Createdat=module.Createdat,
        Items=items
    )


def delete_module(db: Session, module_id: int) -> ModuleDeleteResponse:
    """Delete a module and all its items"""
    module = db.query(ModuleTable).filter(ModuleTable.Moduleid == module_id).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Delete all items first (cascade should handle this, but being explicit)
    db.query(ModuleItemTable).filter(ModuleItemTable.Moduleid == module_id).delete()
    
    # Delete module
    db.delete(module)
    db.commit()
    
    return ModuleDeleteResponse(
        Success="Module deleted successfully",
        Moduleid=module_id
    )


def reorder_modules(db: Session, course_id: int, module_ids: List[int]) -> List[ModuleResponse]:
    """Reorder modules within a course"""
    for position, module_id in enumerate(module_ids):
        module = db.query(ModuleTable).filter(
            ModuleTable.Moduleid == module_id,
            ModuleTable.Courseid == course_id
        ).first()
        
        if module:
            module.Moduleposition = position
    
    db.commit()
    
    # Return updated list
    return get_modules_by_course(db, course_id).Modules


# ============== MODULE ITEM OPERATIONS ==============

def get_module_items(db: Session, module_id: int) -> List[ModuleItemResponse]:
    """Get all items for a module. Sets Locked=True if Unlockat is in the future."""
    items = db.query(ModuleItemTable).filter(
        ModuleItemTable.Moduleid == module_id
    ).order_by(ModuleItemTable.Itemposition).all()
    
    item_responses = []
    now_iso = datetime.now().isoformat()
    for item in items:
        reference_info = get_item_reference_info(db, item.Itemtype, item.Referenceid)
        unlockat = getattr(item, "Unlockat", None)
        prereq_raw = getattr(item, "Prerequisiteitemids", None)
        locked = bool(unlockat and now_iso < unlockat)
        item_responses.append(ModuleItemResponse(
            Itemid=item.Itemid,
            Itemname=item.Itemname,
            Itemtype=item.Itemtype,
            Itemposition=item.Itemposition or 0,
            Itemcontent=item.Itemcontent,
            Itemurl=item.Itemurl,
            Moduleid=item.Moduleid,
            Referenceid=item.Referenceid,
            Createdat=item.Createdat,
            Unlockat=unlockat,
            Prerequisiteitemids=prereq_raw,
            Locked=locked,
            Referenceinfo=reference_info
        ))
    
    return item_responses


def get_item_reference_info(db: Session, item_type: str, reference_id: Optional[int]) -> Optional[dict]:
    """Get additional info for referenced items (assignments, quizzes, files)"""
    if not reference_id:
        return None
    
    if item_type == 'assignment':
        query = text('SELECT "Assignmentid", "Assignmentname", "Assignmentdescription" FROM assignments WHERE "Assignmentid" = :id')
        result = db.execute(query, {"id": reference_id}).fetchone()
        if result:
            return {
                "id": result.Assignmentid,
                "name": result.Assignmentname,
                "description": result.Assignmentdescription
            }
    
    elif item_type == 'quiz':
        query = text('SELECT "Quizid", "Quizname", "Quizdescription" FROM quizzes WHERE "Quizid" = :id')
        result = db.execute(query, {"id": reference_id}).fetchone()
        if result:
            return {
                "id": result.quizid,
                "name": result.quizname,
                "description": result.quizdescription
            }
    
    elif item_type == 'file':
        query = text('SELECT "Fileid", "Fileoriginalname", "Fileurl", "Filemimetype" FROM files WHERE "Fileid" = :id')
        result = db.execute(query, {"id": reference_id}).fetchone()
        if result:
            return {
                "id": result.Fileid,
                "name": result.Fileoriginalname,
                "url": result.Fileurl,
                "mimetype": result.Filemimetype
            }
    
    return None


def create_module_item(db: Session, module_id: int, request: ModuleItemCreateRequest) -> ModuleItemResponse:
    """Add an item to a module"""
    # Verify module exists
    module = db.query(ModuleTable).filter(ModuleTable.Moduleid == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Get max position
    max_pos_query = text("""
        SELECT COALESCE(MAX("Itemposition"), -1) as maxpos FROM module_items WHERE "Moduleid" = :moduleid
    """)
    result = db.execute(max_pos_query, {"moduleid": module_id}).fetchone()
    next_position = (result.maxpos if result else -1) + 1
    
    prereq_json = json.dumps(request.Prerequisiteitemids) if getattr(request, "Prerequisiteitemids", None) else None
    item = ModuleItemTable(
        Itemname=request.Itemname,
        Itemtype=request.Itemtype,
        Itemposition=request.Itemposition if request.Itemposition else next_position,
        Itemcontent=request.Itemcontent,
        Itemurl=request.Itemurl,
        Moduleid=module_id,
        Referenceid=request.Referenceid,
        Unlockat=getattr(request, "Unlockat", None),
        Prerequisiteitemids=prereq_json,
        Createdat=datetime.now().isoformat()
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    reference_info = get_item_reference_info(db, item.Itemtype, item.Referenceid)
    
    unlockat = getattr(item, "Unlockat", None)
    prereq_raw = getattr(item, "Prerequisiteitemids", None)
    now_iso = datetime.now().isoformat()
    locked = bool(unlockat and now_iso < unlockat)
    return ModuleItemResponse(
        Itemid=item.Itemid,
        Itemname=item.Itemname,
        Itemtype=item.Itemtype,
        Itemposition=item.Itemposition or 0,
        Itemcontent=item.Itemcontent,
        Itemurl=item.Itemurl,
        Moduleid=item.Moduleid,
        Referenceid=item.Referenceid,
        Createdat=item.Createdat,
        Unlockat=unlockat,
        Prerequisiteitemids=prereq_raw,
        Locked=locked,
        Referenceinfo=reference_info
    )


def update_module_item(db: Session, item_id: int, request: ModuleItemUpdateRequest) -> ModuleItemResponse:
    """Update a module item"""
    item = db.query(ModuleItemTable).filter(ModuleItemTable.Itemid == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Module item not found")
    
    if request.Itemname is not None:
        item.Itemname = request.Itemname
    if request.Itemtype is not None:
        item.Itemtype = request.Itemtype
    if request.Itemposition is not None:
        item.Itemposition = request.Itemposition
    if request.Itemcontent is not None:
        item.Itemcontent = request.Itemcontent
    if request.Itemurl is not None:
        item.Itemurl = request.Itemurl
    if request.Referenceid is not None:
        item.Referenceid = request.Referenceid
    if getattr(request, "Unlockat", None) is not None:
        item.Unlockat = request.Unlockat
    if getattr(request, "Prerequisiteitemids", None) is not None:
        item.Prerequisiteitemids = json.dumps(request.Prerequisiteitemids)
    
    db.commit()
    db.refresh(item)
    
    reference_info = get_item_reference_info(db, item.Itemtype, item.Referenceid)
    unlockat = getattr(item, "Unlockat", None)
    prereq_raw = getattr(item, "Prerequisiteitemids", None)
    now_iso = datetime.now().isoformat()
    locked = bool(unlockat and now_iso < unlockat)
    return ModuleItemResponse(
        Itemid=item.Itemid,
        Itemname=item.Itemname,
        Itemtype=item.Itemtype,
        Itemposition=item.Itemposition or 0,
        Itemcontent=item.Itemcontent,
        Itemurl=item.Itemurl,
        Moduleid=item.Moduleid,
        Referenceid=item.Referenceid,
        Createdat=item.Createdat,
        Unlockat=unlockat,
        Prerequisiteitemids=prereq_raw,
        Locked=locked,
        Referenceinfo=reference_info
    )


def delete_module_item(db: Session, item_id: int) -> ModuleItemDeleteResponse:
    """Delete a module item"""
    item = db.query(ModuleItemTable).filter(ModuleItemTable.Itemid == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Module item not found")
    
    db.delete(item)
    db.commit()
    
    return ModuleItemDeleteResponse(
        Success="Module item deleted successfully",
        Itemid=item_id
    )


def reorder_module_items(db: Session, module_id: int, item_ids: List[int]) -> List[ModuleItemResponse]:
    """Reorder items within a module"""
    for position, item_id in enumerate(item_ids):
        item = db.query(ModuleItemTable).filter(
            ModuleItemTable.Itemid == item_id,
            ModuleItemTable.Moduleid == module_id
        ).first()
        
        if item:
            item.Itemposition = position
    
    db.commit()
    
    return get_module_items(db, module_id)
