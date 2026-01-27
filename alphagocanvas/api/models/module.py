from typing import Optional, List
from pydantic import BaseModel


# ============== MODULE MODELS ==============

class ModuleCreateRequest(BaseModel):
    """Request to create a new module"""
    Modulename: str
    Moduledescription: Optional[str] = None
    Courseid: int
    Moduleposition: Optional[int] = 0
    Modulepublished: Optional[bool] = False


class ModuleUpdateRequest(BaseModel):
    """Request to update a module"""
    Modulename: Optional[str] = None
    Moduledescription: Optional[str] = None
    Moduleposition: Optional[int] = None
    Modulepublished: Optional[bool] = None


class ModuleItemCreateRequest(BaseModel):
    """Request to create a module item"""
    Itemname: str
    Itemtype: str  # 'assignment', 'quiz', 'page', 'file', 'link', 'header'
    Itemposition: Optional[int] = 0
    Itemcontent: Optional[str] = None  # For 'page' type
    Itemurl: Optional[str] = None  # For 'link' type
    Referenceid: Optional[int] = None  # For assignment/quiz/file references


class ModuleItemUpdateRequest(BaseModel):
    """Request to update a module item"""
    Itemname: Optional[str] = None
    Itemtype: Optional[str] = None
    Itemposition: Optional[int] = None
    Itemcontent: Optional[str] = None
    Itemurl: Optional[str] = None
    Referenceid: Optional[int] = None


class ModuleItemResponse(BaseModel):
    """Module item response"""
    Itemid: int
    Itemname: str
    Itemtype: str
    Itemposition: int
    Itemcontent: Optional[str]
    Itemurl: Optional[str]
    Moduleid: int
    Referenceid: Optional[int]
    Createdat: Optional[str]
    # Additional info for referenced items
    Referenceinfo: Optional[dict] = None


class ModuleResponse(BaseModel):
    """Module response"""
    Moduleid: int
    Modulename: str
    Moduledescription: Optional[str]
    Moduleposition: int
    Modulepublished: bool
    Courseid: int
    Createdat: Optional[str]
    Items: List[ModuleItemResponse] = []


class ModuleListResponse(BaseModel):
    """List of modules for a course"""
    Courseid: int
    Coursename: Optional[str]
    Totalmodules: int
    Modules: List[ModuleResponse]


class ModuleDeleteResponse(BaseModel):
    """Response after module deletion"""
    Success: str
    Moduleid: int


class ModuleItemDeleteResponse(BaseModel):
    """Response after module item deletion"""
    Success: str
    Itemid: int


class ReorderRequest(BaseModel):
    """Request to reorder modules or items"""
    ItemIds: List[int]  # List of IDs in new order
