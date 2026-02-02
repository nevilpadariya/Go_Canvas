import React, { useCallback, useState } from 'react';
import { Upload, FileIcon, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/upload`,
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

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const fileWithProgress: FileWithProgress[] = newFiles.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
    }));
    setFiles((prev) => [...prev, ...fileWithProgress]);

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
    [disabled]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];
    
    if (fileToRemove.uploadedFile?.Fileid) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/${fileToRemove.uploadedFile.Fileid}`,
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
      className={cn(
        "border-2 border-dashed transition-all duration-200",
        isDragOver ? "border-primary bg-primary/5" : "border-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <CardContent className="p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "text-center py-8",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
            id="file-upload-input"
            disabled={disabled}
          />
          <label htmlFor="file-upload-input" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-1">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <Button variant="default" disabled={disabled} asChild>
              <span>Browse Files</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: PDF, DOC, DOCX, TXT, code files, images (max 10MB each)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((fileItem, index) => (
              <li
                key={index}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                {fileItem.uploaded ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  {fileItem.error ? (
                    <p className="text-xs text-destructive">{fileItem.error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  )}
                </div>
                {!fileItem.uploaded && !fileItem.error && (
                  <div className="w-20">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(index)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
