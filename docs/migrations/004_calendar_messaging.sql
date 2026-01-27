-- Go-Canvas Calendar & Messaging - Database Migration
-- Execute this script to add tables for calendar and messaging features

-- ============== CALENDAR EVENTS ==============
CREATE TABLE IF NOT EXISTS calendar_events (
    Eventid INT PRIMARY KEY AUTO_INCREMENT,
    Eventtitle VARCHAR(255) NOT NULL,
    Eventdescription TEXT,
    Eventtype VARCHAR(50) NOT NULL,
    Eventstart VARCHAR(50) NOT NULL,
    Eventend VARCHAR(50),
    Eventallday BOOLEAN DEFAULT FALSE,
    Eventcolor VARCHAR(20),
    Courseid INT,
    Userid INT NOT NULL,
    Userrole VARCHAR(50) NOT NULL,
    Referencetype VARCHAR(50),
    Referenceid INT,
    Createdat VARCHAR(50),
    FOREIGN KEY (Courseid) REFERENCES courses(Courseid)
);

-- ============== CONVERSATIONS ==============
CREATE TABLE IF NOT EXISTS conversations (
    Conversationid INT PRIMARY KEY AUTO_INCREMENT,
    Conversationsubject VARCHAR(255) NOT NULL,
    Lastmessagedate VARCHAR(50),
    Createdat VARCHAR(50)
);

-- ============== CONVERSATION PARTICIPANTS ==============
CREATE TABLE IF NOT EXISTS conversation_participants (
    Participantid INT PRIMARY KEY AUTO_INCREMENT,
    Conversationid INT NOT NULL,
    Userid INT NOT NULL,
    Userrole VARCHAR(50) NOT NULL,
    Username VARCHAR(255),
    Isunread BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Conversationid) REFERENCES conversations(Conversationid) ON DELETE CASCADE
);

-- ============== MESSAGES ==============
CREATE TABLE IF NOT EXISTS messages (
    Messageid INT PRIMARY KEY AUTO_INCREMENT,
    Messagecontent TEXT NOT NULL,
    Conversationid INT NOT NULL,
    Senderid INT NOT NULL,
    Senderrole VARCHAR(50) NOT NULL,
    Sendername VARCHAR(255),
    Isread BOOLEAN DEFAULT FALSE,
    Createdat VARCHAR(50),
    FOREIGN KEY (Conversationid) REFERENCES conversations(Conversationid) ON DELETE CASCADE
);

-- ============== INDEXES ==============
CREATE INDEX idx_calendar_user ON calendar_events(Userid);
CREATE INDEX idx_calendar_start ON calendar_events(Eventstart);
CREATE INDEX idx_calendar_course ON calendar_events(Courseid);
CREATE INDEX idx_participants_conversation ON conversation_participants(Conversationid);
CREATE INDEX idx_participants_user ON conversation_participants(Userid);
CREATE INDEX idx_messages_conversation ON messages(Conversationid);
