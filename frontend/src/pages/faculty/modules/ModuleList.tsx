import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  Type,
  Eye,
  EyeOff,
  GripVertical,
  BookOpen
} from 'lucide-react';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface ModuleItem {
  Itemid: number;
  Itemname: string;
  Itemtype: string;
  Itemposition: number;
  Itemcontent?: string;
  Itemurl?: string;
  Moduleid: number;
  Referenceid?: number;
  Createdat?: string;
  Referenceinfo?: any;
}

interface Module {
  Moduleid: number;
  Modulename: string;
  Moduledescription?: string;
  Moduleposition: number;
  Modulepublished: boolean;
  Courseid: number;
  Createdat?: string;
  Items: ModuleItem[];
}

interface ModuleListProps {
  courseId: number;
  isEditable?: boolean;
}

const ModuleList: React.FC<ModuleListProps> = ({ courseId, isEditable = true }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingItem, setEditingItem] = useState<ModuleItem | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  

  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [modulePublished, setModulePublished] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('page');
  const [itemContent, setItemContent] = useState('');
  const [itemUrl, setItemUrl] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/modules/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data.Modules || []);
    } catch (err: any) {

      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to load modules');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
       fetchModules();
    }
  }, [courseId]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4 text-red-500" />;
      case 'quiz': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'page': return <FileText className="h-4 w-4 text-green-500" />;
      case 'file': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'link': return <LinkIcon className="h-4 w-4 text-purple-500" />;
      case 'header': return <Type className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };


  const handleOpenModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleName(module.Modulename);
      setModuleDescription(module.Moduledescription || '');
      setModulePublished(module.Modulepublished);
    } else {
      setEditingModule(null);
      setModuleName('');
      setModuleDescription('');
      setModulePublished(false);
    }
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    const token = localStorage.getItem('token');
    try {
      if (editingModule) {
        await axios.put(
          `${baseUrl}/modules/${editingModule.Moduleid}`,
          {
            Modulename: moduleName,
            Moduledescription: moduleDescription,
            Modulepublished: modulePublished,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${baseUrl}/modules/`,
          {
            Modulename: moduleName,
            Moduledescription: moduleDescription,
            Courseid: courseId,
            Modulepublished: modulePublished,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModuleDialogOpen(false);
      fetchModules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this module and all its items?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${baseUrl}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchModules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete module');
    }
  };

  const handleTogglePublish = async (module: Module) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${baseUrl}/modules/${module.Moduleid}`,
        { Modulepublished: !module.Modulepublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchModules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update module');
    }
  };


  const handleOpenItemDialog = (moduleId: number, item?: ModuleItem) => {
    setCurrentModuleId(moduleId);
    if (item) {
      setEditingItem(item);
      setItemName(item.Itemname);
      setItemType(item.Itemtype);
      setItemContent(item.Itemcontent || '');
      setItemUrl(item.Itemurl || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemType('page');
      setItemContent('');
      setItemUrl('');
    }
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    const token = localStorage.getItem('token');
    try {
      if (editingItem) {
        await axios.put(
          `${baseUrl}/modules/items/${editingItem.Itemid}`,
          {
            Itemname: itemName,
            Itemtype: itemType,
            Itemcontent: itemContent,
            Itemurl: itemUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${baseUrl}/modules/${currentModuleId}/items`,
          {
            Itemname: itemName,
            Itemtype: itemType,
            Itemcontent: itemContent,
            Itemurl: itemUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setItemDialogOpen(false);
      fetchModules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${baseUrl}/modules/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchModules();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isEditable && (
        <div className="mb-6 flex justify-end">
          <Button onClick={() => handleOpenModuleDialog()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>
      )}

      {modules.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">
              No modules yet. {isEditable && 'Click "Add Module" to create one.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={modules.map(m => `module-${m.Moduleid}`)}>
          {modules.map((module) => (
            <AccordionItem key={module.Moduleid} value={`module-${module.Moduleid}`} className="border rounded-lg bg-card px-2">
               <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 flex-1">
                     <AccordionTrigger className="hover:no-underline py-2 pr-4">
                       <span className="text-lg font-semibold text-left">{module.Modulename}</span>
                     </AccordionTrigger>
                     <Badge variant={module.Modulepublished ? "default" : "secondary"}>
                        {module.Modulepublished ? 'Published' : 'Unpublished'}
                     </Badge>
                  </div>
                  
                  {isEditable && (
                    <div className="flex items-center gap-1 z-10 relative">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleTogglePublish(module); }} title={module.Modulepublished ? 'Unpublish' : 'Publish'}>
                           {module.Modulepublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModuleDialog(module); }}>
                           <Edit className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.Moduleid); }} className="text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  )}
               </div>
              
              <AccordionContent className="pt-0 pb-4">
                 {module.Moduledescription && (
                    <p className="text-sm text-muted-foreground mb-4 pl-4">{module.Moduledescription}</p>
                 )}

                 <div className="flex flex-col gap-2 pl-4">
                    {module.Items.map((item) => (
                       <div key={item.Itemid} className="flex items-center p-3 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors group">
                           <div className="mr-3 mt-1">
                              {getItemIcon(item.Itemtype)}
                           </div>
                           <div className="flex-1">
                              <p className="font-medium text-sm">{item.Itemname}</p>
                              <p className="text-xs text-muted-foreground capitalize">{item.Itemtype}</p>
                           </div>
                           
                           {isEditable && (
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenItemDialog(module.Moduleid, item)}>
                                    <Edit className="h-3 w-3" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.Itemid)}>
                                    <Trash2 className="h-3 w-3" />
                                 </Button>
                              </div>
                           )}
                       </div>
                    ))}
                    
                    {isEditable && (
                       <Button variant="ghost" size="sm" className="self-start mt-2 gap-2 text-muted-foreground hover:text-primary" onClick={() => handleOpenItemDialog(module.Moduleid)}>
                          <Plus className="h-3 w-3" /> Add Item
                       </Button>
                    )}
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}


      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
            <DialogDescription>
               Fill in the details for the module.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moduleDescription">Description (optional)</Label>
              <Textarea
                id="moduleDescription"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleSaveModule}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
             <DialogDescription>
               Add content or resources to your module.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemType">Item Type</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger id="itemType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {itemType === 'page' && (
              <div className="grid gap-2">
                <Label htmlFor="itemContent">Content</Label>
                <Textarea
                  id="itemContent"
                  value={itemContent}
                  onChange={(e) => setItemContent(e.target.value)}
                  rows={4}
                />
              </div>
            )}
            
            {itemType === 'link' && (
              <div className="grid gap-2">
                <Label htmlFor="itemUrl">URL</Label>
                <Input
                  id="itemUrl"
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleSaveItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleList;
