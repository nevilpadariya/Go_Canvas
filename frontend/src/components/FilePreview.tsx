import React from 'react';
import { Download, FileText, Image, Code, FileIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  filename: string;
  originalName: string;
  mimeType?: string | null;
  fileUrl: string;
  fileSize?: number;
  showDownload?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  filename,
  originalName,
  mimeType,
  fileUrl,
  fileSize,
  showDownload = true,
}) => {
  const getFileIcon = () => {
    if (!mimeType) return <FileIcon className="h-10 w-10 text-muted-foreground" />;

    if (mimeType.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    }
    if (mimeType.includes('image')) {
      return <Image className="h-10 w-10 text-green-500" />;
    }
    if (
      mimeType.includes('text') ||
      mimeType.includes('javascript') ||
      mimeType.includes('python') ||
      mimeType.includes('java')
    ) {
      return <Code className="h-10 w-10 text-blue-500" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="h-10 w-10 text-blue-600" />;
    }

    return <FileIcon className="h-10 w-10 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = mimeType?.includes('image');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

  return (
    <Card className="flex items-center p-4 bg-muted rounded-lg">
      {isImage ? (
        <img
          src={fullUrl}
          alt={originalName}
          className="w-14 h-14 object-cover rounded mr-3"
        />
      ) : (
        <div className="mr-3">{getFileIcon()}</div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate max-w-[250px]">{originalName}</p>
        {fileSize && (
          <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
        )}
      </div>

      {showDownload && (
        <a href={fullUrl} download={originalName} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
            <Download className="h-5 w-5" />
          </Button>
        </a>
      )}
    </Card>
  );
};

export default FilePreview;
