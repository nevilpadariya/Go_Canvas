import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Link,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
    if (!mimeType) return <InsertDriveFileIcon sx={{ fontSize: 40, color: '#999' }} />;

    if (mimeType.includes('pdf')) {
      return <PictureAsPdfIcon sx={{ fontSize: 40, color: '#E53935' }} />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon sx={{ fontSize: 40, color: '#43A047' }} />;
    }
    if (
      mimeType.includes('text') ||
      mimeType.includes('javascript') ||
      mimeType.includes('python') ||
      mimeType.includes('java')
    ) {
      return <CodeIcon sx={{ fontSize: 40, color: '#1976D2' }} />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <DescriptionIcon sx={{ fontSize: 40, color: '#2196F3' }} />;
    }

    return <InsertDriveFileIcon sx={{ fontSize: 40, color: '#999' }} />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = mimeType?.includes('image');
  const isPdf = mimeType?.includes('pdf');
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
      }}
    >
      {isImage ? (
        <Box
          component="img"
          src={fullUrl}
          alt={originalName}
          sx={{
            width: 60,
            height: 60,
            objectFit: 'cover',
            borderRadius: 1,
            mr: 2,
          }}
        />
      ) : (
        <Box sx={{ mr: 2 }}>{getFileIcon()}</Box>
      )}

      <CardContent sx={{ flex: 1, py: 0, '&:last-child': { pb: 0 } }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 250,
          }}
        >
          {originalName}
        </Typography>
        {fileSize && (
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(fileSize)}
          </Typography>
        )}
      </CardContent>

      {showDownload && (
        <Link href={fullUrl} download={originalName} target="_blank">
          <IconButton
            sx={{
              color: '#75CA67',
              '&:hover': { backgroundColor: 'rgba(117, 202, 103, 0.1)' },
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Link>
      )}
    </Card>
  );
};

export default FilePreview;
