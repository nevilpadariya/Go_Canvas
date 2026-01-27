import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import ArticleIcon from '@mui/icons-material/Article';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import axios from 'axios';

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
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  
  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingItem, setEditingItem] = useState<ModuleItem | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  
  // Form states
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [modulePublished, setModulePublished] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('page');
  const [itemContent, setItemContent] = useState('');
  const [itemUrl, setItemUrl] = useState('');

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/modules/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data.Modules || []);
      // Expand all modules by default
      setExpandedModules(new Set(response.data.Modules?.map((m: Module) => m.Moduleid) || []));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <AssignmentIcon sx={{ color: '#E53935' }} />;
      case 'quiz': return <QuizIcon sx={{ color: '#1976D2' }} />;
      case 'page': return <ArticleIcon sx={{ color: '#43A047' }} />;
      case 'file': return <InsertDriveFileIcon sx={{ color: '#FB8C00' }} />;
      case 'link': return <LinkIcon sx={{ color: '#8E24AA' }} />;
      case 'header': return <TitleIcon sx={{ color: '#757575' }} />;
      default: return <ArticleIcon />;
    }
  };

  // Module CRUD handlers
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

  // Item CRUD handlers
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#75CA67' }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isEditable && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModuleDialog()}
            sx={{
              backgroundColor: '#75CA67',
              '&:hover': { backgroundColor: '#528d48' },
            }}
          >
            Add Module
          </Button>
        </Box>
      )}

      {modules.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No modules yet. {isEditable && 'Click "Add Module" to create one.'}
          </Typography>
        </Card>
      ) : (
        modules.map((module) => (
          <Card key={module.Moduleid} sx={{ mb: 2, overflow: 'visible' }}>
            <CardContent sx={{ pb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditable && (
                  <DragIndicatorIcon sx={{ color: '#999', cursor: 'grab' }} />
                )}
                <IconButton onClick={() => toggleModule(module.Moduleid)} size="small">
                  {expandedModules.has(module.Moduleid) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                  {module.Modulename}
                </Typography>
                <Chip
                  size="small"
                  label={module.Modulepublished ? 'Published' : 'Unpublished'}
                  color={module.Modulepublished ? 'success' : 'default'}
                  sx={{ mr: 1 }}
                />
                {isEditable && (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => handleTogglePublish(module)}
                      title={module.Modulepublished ? 'Unpublish' : 'Publish'}
                    >
                      {module.Modulepublished ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenModuleDialog(module)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteModule(module.Moduleid)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
              {module.Moduledescription && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 6, mt: 1 }}>
                  {module.Moduledescription}
                </Typography>
              )}
            </CardContent>

            <Collapse in={expandedModules.has(module.Moduleid)}>
              <List sx={{ pl: 4 }}>
                {module.Items.map((item) => (
                  <ListItem
                    key={item.Itemid}
                    sx={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1,
                      mb: 1,
                      mx: 2,
                    }}
                  >
                    <ListItemIcon>{getItemIcon(item.Itemtype)}</ListItemIcon>
                    <ListItemText
                      primary={item.Itemname}
                      secondary={item.Itemtype.charAt(0).toUpperCase() + item.Itemtype.slice(1)}
                    />
                    {isEditable && (
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleOpenItemDialog(module.Moduleid, item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteItem(item.Itemid)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
                {isEditable && (
                  <ListItem sx={{ mx: 2 }}>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenItemDialog(module.Moduleid)}
                      sx={{ color: '#75CA67' }}
                    >
                      Add Item
                    </Button>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </Card>
        ))
      )}

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Module Name"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (optional)"
            value={moduleDescription}
            onChange={(e) => setModuleDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveModule}
            variant="contained"
            sx={{ backgroundColor: '#75CA67', '&:hover': { backgroundColor: '#528d48' } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Item Type</InputLabel>
            <Select
              value={itemType}
              label="Item Type"
              onChange={(e) => setItemType(e.target.value)}
            >
              <MenuItem value="page">Page</MenuItem>
              <MenuItem value="assignment">Assignment</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="file">File</MenuItem>
              <MenuItem value="link">External Link</MenuItem>
              <MenuItem value="header">Header</MenuItem>
            </Select>
          </FormControl>
          {itemType === 'page' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              value={itemContent}
              onChange={(e) => setItemContent(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          {itemType === 'link' && (
            <TextField
              fullWidth
              label="URL"
              value={itemUrl}
              onChange={(e) => setItemUrl(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{ backgroundColor: '#75CA67', '&:hover': { backgroundColor: '#528d48' } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleList;
