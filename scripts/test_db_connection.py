#!/usr/bin/env python3
"""
Database Connection Test Script
Tests connectivity to PostgreSQL database and displays connection info
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test database connection and display diagnostic information"""
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        print("\nPlease set DATABASE_URL in your .env file")
        return False
    
    print("🔍 Testing database connection...")
    print(f"\n📋 Connection Details:")
    
    # Parse and display connection info (hide password)
    try:
        # Hide password in display
        if "@" in database_url:
            parts = database_url.split("@")
            user_part = parts[0].split("://")[1].split(":")[0]
            host_part = parts[1]
            print(f"   User: {user_part}")
            print(f"   Host: {host_part.split('/')[0]}")
            print(f"   Database: {host_part.split('/')[-1].split('?')[0]}")
        
        # Check SSL mode
        if "sslmode=require" in database_url:
            print(f"   SSL: ✅ Required (secure)")
        elif "sslmode" in database_url:
            ssl_mode = database_url.split("sslmode=")[1].split("&")[0]
            print(f"   SSL: {ssl_mode}")
        else:
            print(f"   SSL: ⚠️  Not specified")
    except Exception as e:
        print(f"   Could not parse URL: {e}")
    
    # Convert postgres:// to postgresql:// if needed
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Configure connection args
    connect_args = {}
    if "sslmode=require" in database_url or "supabase.co" in database_url:
        connect_args["sslmode"] = "require"
    
    try:
        # Create engine
        print("\n🔌 Connecting to database...")
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            connect_args=connect_args
        )
        
        # Test connection
        with engine.connect() as connection:
            # Get PostgreSQL version
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connection successful!")
            print(f"\n📊 Database Info:")
            print(f"   PostgreSQL Version: {version.split(',')[0]}")
            
            # Get current database name
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]
            print(f"   Current Database: {db_name}")
            
            # Get current user
            result = connection.execute(text("SELECT current_user;"))
            db_user = result.fetchone()[0]
            print(f"   Current User: {db_user}")
            
            # Count tables
            result = connection.execute(text("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            """))
            table_count = result.fetchone()[0]
            print(f"   Tables in 'public' schema: {table_count}")
            
            # List tables if any exist
            if table_count > 0:
                result = connection.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """))
                tables = [row[0] for row in result.fetchall()]
                print(f"\n📋 Tables:")
                for table in tables:
                    print(f"   - {table}")
        
        print(f"\n✅ All tests passed! Database is ready to use.")
        return True
        
    except Exception as e:
        print(f"\n❌ Connection failed!")
        print(f"Error: {str(e)}")
        print(f"\nCommon issues:")
        print(f"  1. Incorrect DATABASE_URL format")
        print(f"  2. Database not accessible (firewall/network)")
        print(f"  3. Invalid credentials")
        print(f"  4. SSL certificate issues")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
