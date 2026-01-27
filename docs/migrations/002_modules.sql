-- Go-Canvas Modules Feature - Database Migration
-- Execute this script to add tables for course modules

-- ============== MODULES ==============
CREATE TABLE IF NOT EXISTS modules (
    Moduleid INT PRIMARY KEY AUTO_INCREMENT,
    Modulename VARCHAR(255) NOT NULL,
    Moduledescription TEXT,
    Moduleposition INT DEFAULT 0,
    Modulepublished BOOLEAN DEFAULT FALSE,
    Courseid INT NOT NULL,
    Createdat VARCHAR(50),
    FOREIGN KEY (Courseid) REFERENCES courses(Courseid)
);

-- ============== MODULE ITEMS ==============
CREATE TABLE IF NOT EXISTS module_items (
    Itemid INT PRIMARY KEY AUTO_INCREMENT,
    Itemname VARCHAR(255) NOT NULL,
    Itemtype VARCHAR(50) NOT NULL,
    Itemposition INT DEFAULT 0,
    Itemcontent TEXT,
    Itemurl VARCHAR(500),
    Moduleid INT NOT NULL,
    Referenceid INT,
    Createdat VARCHAR(50),
    FOREIGN KEY (Moduleid) REFERENCES modules(Moduleid) ON DELETE CASCADE
);

-- ============== INDEXES ==============
CREATE INDEX idx_modules_course ON modules(Courseid);
CREATE INDEX idx_modules_position ON modules(Courseposition);
CREATE INDEX idx_module_items_module ON module_items(Moduleid);
CREATE INDEX idx_module_items_position ON module_items(Itemposition);
