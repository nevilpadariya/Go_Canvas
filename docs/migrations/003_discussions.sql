-- Go-Canvas Discussions Feature - Database Migration
-- Execute this script to add tables for course discussions

-- ============== DISCUSSIONS ==============
CREATE TABLE IF NOT EXISTS discussions (
    Discussionid INT PRIMARY KEY AUTO_INCREMENT,
    Discussiontitle VARCHAR(255) NOT NULL,
    Discussioncontent TEXT NOT NULL,
    Discussionpinned BOOLEAN DEFAULT FALSE,
    Discussionlocked BOOLEAN DEFAULT FALSE,
    Discussionpublished BOOLEAN DEFAULT TRUE,
    Courseid INT NOT NULL,
    Authorid INT NOT NULL,
    Authorrole VARCHAR(50) NOT NULL,
    Authorname VARCHAR(255),
    Replycount INT DEFAULT 0,
    Createdat VARCHAR(50),
    Updatedat VARCHAR(50),
    FOREIGN KEY (Courseid) REFERENCES courses(Courseid)
);

-- ============== DISCUSSION REPLIES ==============
CREATE TABLE IF NOT EXISTS discussion_replies (
    Replyid INT PRIMARY KEY AUTO_INCREMENT,
    Replycontent TEXT NOT NULL,
    Discussionid INT NOT NULL,
    Parentreplyid INT,
    Authorid INT NOT NULL,
    Authorrole VARCHAR(50) NOT NULL,
    Authorname VARCHAR(255),
    Createdat VARCHAR(50),
    Updatedat VARCHAR(50),
    FOREIGN KEY (Discussionid) REFERENCES discussions(Discussionid) ON DELETE CASCADE,
    FOREIGN KEY (Parentreplyid) REFERENCES discussion_replies(Replyid) ON DELETE CASCADE
);

-- ============== INDEXES ==============
CREATE INDEX idx_discussions_course ON discussions(Courseid);
CREATE INDEX idx_discussions_pinned ON discussions(Discussionpinned);
CREATE INDEX idx_replies_discussion ON discussion_replies(Discussionid);
CREATE INDEX idx_replies_parent ON discussion_replies(Parentreplyid);
