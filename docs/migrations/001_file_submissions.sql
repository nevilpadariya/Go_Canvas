-- Go-Canvas Core LMS Features - Database Migration
-- Execute this script to add new tables for file submissions, modules, discussions, etc.

-- ============== FILE STORAGE ==============
CREATE TABLE IF NOT EXISTS files (
    Fileid INT PRIMARY KEY AUTO_INCREMENT,
    Filename VARCHAR(255) NOT NULL,
    Fileoriginalname VARCHAR(255) NOT NULL,
    Filemimetype VARCHAR(100),
    Filesize INT,
    Fileurl VARCHAR(500) NOT NULL,
    Uploaderid INT NOT NULL,
    Uploaderrole VARCHAR(50) NOT NULL,
    Courseid INT,
    Createdat VARCHAR(50),
    FOREIGN KEY (Courseid) REFERENCES courses(Courseid)
);

-- ============== SUBMISSIONS ==============
CREATE TABLE IF NOT EXISTS submissions (
    Submissionid INT PRIMARY KEY AUTO_INCREMENT,
    Assignmentid INT NOT NULL,
    Studentid INT NOT NULL,
    Submissioncontent TEXT,
    Submissionfileid INT,
    Submissionscore VARCHAR(10),
    Submissiongraded BOOLEAN DEFAULT FALSE,
    Submissionfeedback TEXT,
    Submitteddate VARCHAR(50),
    Gradeddate VARCHAR(50),
    FOREIGN KEY (Assignmentid) REFERENCES assignments(Assignmentid),
    FOREIGN KEY (Studentid) REFERENCES student(Studentid),
    FOREIGN KEY (Submissionfileid) REFERENCES files(Fileid)
);

-- ============== SUBMISSION COMMENTS ==============
CREATE TABLE IF NOT EXISTS submission_comments (
    Commentid INT PRIMARY KEY AUTO_INCREMENT,
    Submissionid INT NOT NULL,
    Commentcontent TEXT NOT NULL,
    Commentline INT,
    Authorid INT NOT NULL,
    Authorrole VARCHAR(50) NOT NULL,
    Createdat VARCHAR(50),
    FOREIGN KEY (Submissionid) REFERENCES submissions(Submissionid) ON DELETE CASCADE
);

-- ============== INDEXES FOR PERFORMANCE ==============
CREATE INDEX idx_submissions_assignment ON submissions(Assignmentid);
CREATE INDEX idx_submissions_student ON submissions(Studentid);
CREATE INDEX idx_files_course ON files(Courseid);
CREATE INDEX idx_comments_submission ON submission_comments(Submissionid);
