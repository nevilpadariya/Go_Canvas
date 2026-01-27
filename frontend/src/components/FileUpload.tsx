import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

interface FileUploadProps {
  onFileUploaded?: (fileInfo: UploadedFile) => void;
  onFileRemoved?: (fileId: number) => void;
  courseId?: number;
  maxFiles?: number;
  acceptedTypes?: string;
  disabled?: boolean;
}

export interface UploadedFile {
  Fileid: number;
  Filename: string;
  Fileoriginalname: string;
  Filemimetype: string | null;
  Filesize: number;
  Fileurl: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error?: string;
  uploadedFile?: UploadedFile;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  courseId,
  maxFiles = 5,
  acceptedTypes = '.pdf,.doc,.docx,.txt,.py,.java,.cpp,.js,.ts,.html,.css,.png,.jpg,.jpeg,.zip',
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseid', courseId.toString());
    }

    try {
      const response = await axios.post<UploadedFile>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFiles((prev) =>
                prev.map((f) =>
                  f.file.name === file.name ? { ...f, progress } : f
                )
              );
            }
          },
        }
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Upload failed';
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name ? { ...f, error: errorMessage } : f
        )
      );
      return null;
    }
  };

  const handleFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    setError(null);
    const newFiles = Array.from(selectedFiles);

    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add files to state
    const fileWithProgress: FileWithProgress[] = newFiles.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
    }));
    setFiles((prev) => [...prev, ...fileWithProgress]);

    // Upload each file
    for (const file of newFiles) {
      const result = await uploadFile(file);
      if (result) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === file.name
              ? { ...f, uploaded: true, uploadedFile: result }
              : f
          )
        );
        onFileUploaded?.(result);
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];
    
    // If file was uploaded, call delete API
    if (fileToRemove.uploadedFile?.Fileid) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/files/${fileToRemove.uploadedFile.Fileid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onFileRemoved?.(fileToRemove.uploadedFile.Fileid);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card
      sx={{
        border: isDragOver ? '2px dashed #75CA67' : '2px dashed #DDDDDD',
        backgroundColor: isDragOver ? 'rgba(117, 202, 103, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent>
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            textAlign: 'center',
            py: 4,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleInputChange}
            style={{ display: 'none' }}
            id="file-upload-input"
            disabled={disabled}
          />
          <label htmlFor="file-upload-input">
            <CloudUploadIcon
              sx={{ fontSize: 48, color: '#75CA67', mb: 2, cursor: 'pointer' }}
            />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Drag and drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or
            </Typography>
            <Button
              variant="contained"
              component="span"
              disabled={disabled}
              sx={{
                backgroundColor: '#75CA67',
                '&:hover': { backgroundColor: '#528d48' },
              }}
            >
              Browse Files
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Supported formats: PDF, DOC, DOCX, TXT, code files, images (max 10MB each)
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {files.length > 0 && (
          <List sx={{ mt: 2 }}>
            {files.map((fileItem, index) => (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {fileItem.uploaded ? (
                    <CheckCircleIcon sx={{ color: '#75CA67' }} />
                  ) : (
                    <InsertDriveFileIcon sx={{ color: '#999' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={fileItem.file.name}
                  secondary={
                    fileItem.error ? (
                      <Typography color="error" variant="caption">
                        {fileItem.error}
                      </Typography>
                    ) : (
                      formatFileSize(fileItem.file.size)
                    )
                  }
                />
                {!fileItem.uploaded && !fileItem.error && (
                  <Box sx={{ width: 100, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={fileItem.progress}
                      sx={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#75CA67',
                        },
                      }}
                    />
                  </Box>
                )}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
