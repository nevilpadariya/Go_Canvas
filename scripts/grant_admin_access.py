#!/usr/bin/env python3
"""
Grant Admin Access Script
Updates a user's role to 'Admin' based on their Userid
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

def grant_admin_access(user_id):
    """Grant admin access to the specified user ID"""
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        return False
    
    # Convert postgres:// to postgresql:// if needed
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Configure connection args
    connect_args = {}
    if "sslmode=require" in database_url or "supabase.co" in database_url:
        connect_args["sslmode"] = "require"
    
    try:
        # Create engine
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            connect_args=connect_args
        )
        
        with engine.connect() as connection:
            # Check if user exists first
            print(f"🔍 Checking for user with ID: {user_id}")
            # Note: Column names might need quotes if they are case sensitive in PG
            result = connection.execute(text(f'SELECT "Userid", "Useremail", "Userrole" FROM usertable WHERE "Userid" = {user_id}'))
            user = result.fetchone()
            
            if not user:
                print(f"❌ User with ID {user_id} not found!")
                print(f"🆕 Creating new Admin user with ID {user_id}...")
                
                # Insert new user with plain text password (as application currently uses plain text)
                connection.execute(text(f"""
                    INSERT INTO usertable ("Userid", "Useremail", "Userpassword", "Userrole")
                    VALUES ({user_id}, 'admin_{user_id}@gocanvas.com', '{user_id}', 'Admin')
                """))
                connection.commit()
                print(f"✅ Success! Created Admin user with ID {user_id} and password '{user_id}'")
                return True
            
            print(f"   Found user: {user[1]} (Current Role: {user[2]})")
            
            # Update role to Admin
            print(f"📝 Updating role to 'Admin'...")
            connection.execute(text(f'UPDATE usertable SET "Userrole" = \'Admin\' WHERE "Userid" = {user_id}'))
            connection.commit()
            
            # Verify update
            result = connection.execute(text(f'SELECT "Userid", "Useremail", "Userrole" FROM usertable WHERE "Userid" = {user_id}'))
            updated_user = result.fetchone()
            print(f"✅ Success! User {updated_user[1]} is now role: {updated_user[2]}")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Database error: {str(e)}")
        return False

if __name__ == "__main__":
    # User ID to update (hardcoded for safety or pass as arg)
    target_user_id = 8980
    
    if len(sys.argv) > 1:
        try:
            target_user_id = int(sys.argv[1])
        except ValueError:
            print("Error: User ID must be an integer")
            sys.exit(1)
            
    success = grant_admin_access(target_user_id)
    sys.exit(0 if success else 1)
