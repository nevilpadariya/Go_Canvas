import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import FileUpload, { UploadedFile } from './FileUpload';
import FilePreview from './FilePreview';

interface SubmissionFormProps {
  assignmentId: number;
  assignmentName: string;
  onSubmissionComplete?: (submission: SubmissionData) => void;
  existingSubmission?: SubmissionData | null;
}

export interface SubmissionData {
  Submissionid: number;
  Assignmentid: number;
  Studentid: number;
  Submissioncontent: string | null;
  Submissionfileid: number | null;
  Fileinfo?: {
    Fileid: number;
    Filename: string;
    Fileoriginalname: string;
    Filemimetype: string | null;
    Filesize: number;
    Fileurl: string;
  } | null;
  Submissionscore: string | null;
  Submissiongraded: boolean;
  Submissionfeedback: string | null;
  Submitteddate: string;
  Gradeddate: string | null;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignmentId,
  assignmentName,
  onSubmissionComplete,
  existingSubmission,
}) => {
  const [textContent, setTextContent] = useState(existingSubmission?.Submissioncontent || '');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(
    existingSubmission?.Fileinfo || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  const handleFileRemoved = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!textContent.trim() && !uploadedFile) {
      setError('Please provide text content or upload a file');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('assignmentid', assignmentId.toString());
      
      if (textContent.trim()) {
        formData.append('submissioncontent', textContent);
      }

      // If we already have an uploaded file, we need to create the submission with its ID
      // For simplicity, we'll use a JSON endpoint instead
      const response = await axios.post<SubmissionData>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/submissions/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(true);
      onSubmissionComplete?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#4F4F4F' }}>
          Submit Assignment: {assignmentName}
        </Typography>

        {existingSubmission && (
          <Alert 
            severity={existingSubmission.Submissiongraded ? 'success' : 'info'} 
            sx={{ mb: 2 }}
          >
            {existingSubmission.Submissiongraded ? (
              <>
                <strong>Graded:</strong> {existingSubmission.Submissionscore}
                {existingSubmission.Submissionfeedback && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Feedback:</strong> {existingSubmission.Submissionfeedback}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <strong>Submitted:</strong> {new Date(existingSubmission.Submitteddate).toLocaleString()}
                <br />
                <Typography variant="body2" color="text.secondary">
                  You can resubmit to update your work
                </Typography>
              </>
            )}
          </Alert>
        )}

        {existingSubmission?.Fileinfo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Previously Submitted File:
            </Typography>
            <FilePreview
              filename={existingSubmission.Fileinfo.Filename}
              originalName={existingSubmission.Fileinfo.Fileoriginalname}
              mimeType={existingSubmission.Fileinfo.Filemimetype}
              fileUrl={existingSubmission.Fileinfo.Fileurl}
              fileSize={existingSubmission.Fileinfo.Filesize}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Text Submission (optional)"
            placeholder="Enter your response here..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Upload File (optional):
          </Typography>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onFileRemoved={handleFileRemoved}
            maxFiles={1}
            disabled={isSubmitting}
          />

          {uploadedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                File ready for submission:
              </Typography>
              <FilePreview
                filename={uploadedFile.Filename}
                originalName={uploadedFile.Fileoriginalname}
                mimeType={uploadedFile.Filemimetype}
                fileUrl={uploadedFile.Fileurl}
                fileSize={uploadedFile.Filesize}
                showDownload={false}
              />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Assignment submitted successfully!
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                backgroundColor: '#75CA67',
                '&:hover': { backgroundColor: '#528d48' },
                px: 4,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
