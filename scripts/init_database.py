#!/usr/bin/env python3
"""
Database Initialization Script

This script creates all database tables defined in the SQLAlchemy models.
Run this script to initialize your DigitalOcean PostgreSQL database.

Usage:
    python3 scripts/init_database.py
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

# Import all models
from alphagocanvas.database.models import (
    Base,
    UserTable,
    StudentTable,
    StudentEnrollmentTable,
    CourseTable,
    GradeTable,
    FacultyTable,
    AssignmentTable,
    QuizTable,
    CourseFacultyTable,
    AnnouncementTable,
    FileTable,
    SubmissionTable,
    SubmissionCommentTable,
    ModuleTable,
    ModuleItemTable,
    DiscussionTable,
    DiscussionReplyTable,
    CalendarEventTable,
    ConversationTable,
    ConversationParticipantTable,
    MessageTable,
)


def init_database():
    """Initialize database by creating all tables"""
    
    # Load environment variables
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("   Make sure .env file exists with DATABASE_URL set")
        return False
    
    # Handle postgres:// vs postgresql:// schemes
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    print("🔄 Initializing database...")
    print(f"📋 Database: {database_url.split('@')[1].split('/')[1].split('?')[0]}")
    print()
    
    try:
        # Create engine with SSL support
        connect_args = {}
        if "sslmode=require" in database_url:
            connect_args["sslmode"] = "require"
        
        engine = create_engine(database_url, connect_args=connect_args)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to: {version.split(',')[0]}")
            print()
        
        # Get existing tables
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if existing_tables:
            print(f"📊 Found {len(existing_tables)} existing tables:")
            for table in existing_tables:
                print(f"   - {table}")
            print()
        
        # Create all tables
        print("🔨 Creating tables...")
        Base.metadata.create_all(bind=engine)
        
        # Get all created tables
        inspector = inspect(engine)
        all_tables = inspector.get_table_names()
        new_tables = [t for t in all_tables if t not in existing_tables]
        
        print()
        print("✅ Database initialization complete!")
        print(f"📊 Total tables: {len(all_tables)}")
        
        if new_tables:
            print(f"🆕 Newly created tables ({len(new_tables)}):")
            for table in sorted(new_tables):
                print(f"   - {table}")
        else:
            print("ℹ️  All tables already existed")
        
        print()
        print("🎉 Your database is ready to use!")
        
        # Show all tables with their columns
        print()
        print("📋 Database Schema:")
        for table_name in sorted(all_tables):
            columns = inspector.get_columns(table_name)
            print(f"\n   {table_name} ({len(columns)} columns):")
            for col in columns:
                col_type = str(col['type'])
                nullable = "" if col['nullable'] else " NOT NULL"
                primary = " [PK]" if col.get('primary_key') else ""
                print(f"      - {col['name']}: {col_type}{nullable}{primary}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database:")
        print(f"   {str(e)}")
        print()
        print("💡 Troubleshooting:")
        print("   1. Check your DATABASE_URL in .env file")
        print("   2. Ensure database is accessible")
        print("   3. Verify SSL settings (sslmode=require for DigitalOcean)")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("  Go Canvas - Database Initialization")
    print("=" * 60)
    print()
    
    success = init_database()
    
    if success:
        print()
        print("✅ Ready to accept user signups and data!")
        sys.exit(0)
    else:
        sys.exit(1)
