import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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

      const response = await axios.post<SubmissionData>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/submissions/`,
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Submit Assignment: {assignmentName}</CardTitle>
      </CardHeader>
      <CardContent>
        {existingSubmission && (
          <Alert variant={existingSubmission.Submissiongraded ? 'success' : 'info'} className="mb-4">
            <AlertDescription>
              {existingSubmission.Submissiongraded ? (
                <div>
                  <strong>Graded:</strong> {existingSubmission.Submissionscore}
                  {existingSubmission.Submissionfeedback && (
                    <p className="mt-1">
                      <strong>Feedback:</strong> {existingSubmission.Submissionfeedback}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <strong>Submitted:</strong> {new Date(existingSubmission.Submitteddate).toLocaleString()}
                  <p className="text-sm text-muted-foreground mt-1">
                    You can resubmit to update your work
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {existingSubmission?.Fileinfo && (
          <div className="mb-4">
            <Label className="mb-2 block">Previously Submitted File:</Label>
            <FilePreview
              filename={existingSubmission.Fileinfo.Filename}
              originalName={existingSubmission.Fileinfo.Fileoriginalname}
              mimeType={existingSubmission.Fileinfo.Filemimetype}
              fileUrl={existingSubmission.Fileinfo.Fileurl}
              fileSize={existingSubmission.Fileinfo.Filesize}
            />
          </div>
        )}

        <Separator className="my-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textContent">Text Submission (optional)</Label>
            <Textarea
              id="textContent"
              rows={6}
              placeholder="Enter your response here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload File (optional):</Label>
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onFileRemoved={handleFileRemoved}
              maxFiles={1}
              disabled={isSubmitting}
            />
          </div>

          {uploadedFile && (
            <div className="space-y-2">
              <Label>File ready for submission:</Label>
              <FilePreview
                filename={uploadedFile.Filename}
                originalName={uploadedFile.Fileoriginalname}
                mimeType={uploadedFile.Filemimetype}
                fileUrl={uploadedFile.Fileurl}
                fileSize={uploadedFile.Filesize}
                showDownload={false}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertDescription>Assignment submitted successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
