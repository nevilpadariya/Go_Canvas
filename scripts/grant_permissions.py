#!/usr/bin/env python3
"""
Grant Database Permissions and Initialize Schema

This script grants the necessary permissions to the database user and creates all tables.
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


def grant_permissions_and_init():
    """Grant permissions and initialize database"""
    
    # Load environment variables
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found")
        return False
    
    # Handle postgres:// vs postgresql:// schemes
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    print("🔧 Granting permissions and initializing database...")
    print()
    
    try:
        # Create engine
        connect_args = {}
        if "sslmode=require" in database_url:
            connect_args["sslmode"] = "require"
        
        engine = create_engine(database_url, connect_args=connect_args)
        
        with engine.connect() as conn:
            # Get current user and database
            result = conn.execute(text("SELECT current_user, current_database();"))
            user, database = result.fetchone()
            print(f"👤 User: {user}")
            print(f"🗄️  Database: {database}")
            print()
            
            # Grant all permissions on public schema
            print("📝 Granting permissions on public schema...")
            commands = [
                f"GRANT ALL ON SCHEMA public TO {user};",
                f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {user};",
                f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {user};",
                f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {user};",
                f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {user};"
            ]
            
            for cmd in commands:
                try:
                    conn.execute(text(cmd))
                    conn.commit()
                    print(f"   ✅ Executed: {cmd[:50]}...")
                except Exception as e:
                    # Some commands might fail if permissions already exist
                    print(f"   ⚠️  {str(e)[:60]}...")
            
            print()
            print("✅ Permissions granted successfully!")
            
        # Now create tables
        print()
        print("🔨 Creating tables...")
        
        from alphagocanvas.database.models import Base
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            
            print(f"✅ Created {len(tables)} tables:")
            for table in tables:
                print(f"   - {table}")
        
        print()
        print("🎉 Database initialization complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("  Database Permission & Initialization")
    print("=" * 60)
    print()
    
    success = grant_permissions_and_init()
    sys.exit(0 if success else 1)
