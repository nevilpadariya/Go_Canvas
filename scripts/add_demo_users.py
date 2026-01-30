#!/usr/bin/env python3
"""
Add Demo Users Script
Adds 20 American student users to the database for testing/demo purposes.
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# List of 20 American names (First, Last)
DEMO_USERS = [
    ("James", "Smith"),
    ("Mary", "Johnson"),
    ("Robert", "Williams"),
    ("Patricia", "Brown"),
    ("John", "Jones"),
    ("Jennifer", "Garcia"),
    ("Michael", "Miller"),
    ("Linda", "Davis"),
    ("David", "Rodriguez"),
    ("Elizabeth", "Martinez"),
    ("William", "Hernandez"),
    ("Barbara", "Lopez"),
    ("Richard", "Gonzalez"),
    ("Susan", "Wilson"),
    ("Joseph", "Anderson"),
    ("Jessica", "Thomas"),
    ("Thomas", "Taylor"),
    ("Sarah", "Moore"),
    ("Charles", "Jackson"),
    ("Karen", "Martin")
]

def get_next_id(connection, role):
    """
    Get the next available ID based on the logic: YYMMXXX
    """
    now = datetime.now()
    year_month_prefix = int(f"{now.year % 100:02d}{now.month:02d}")  # YYMM
    
    min_id = year_month_prefix * 1000
    max_id = min_id + 999
    
    # Check max ID in usertable to be safe
    result = connection.execute(text(f"SELECT MAX(\"Userid\") FROM usertable WHERE \"Userid\" BETWEEN {min_id} AND {max_id}"))
    max_current_id = result.scalar()
    
    if max_current_id is None:
        return min_id + 1
    else:
        return max_current_id + 1

def add_demo_users():
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found")
        return False
    
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    connect_args = {}
    if "sslmode=require" in database_url or "supabase.co" in database_url:
        connect_args["sslmode"] = "require"
    
    try:
        engine = create_engine(database_url, connect_args=connect_args)
        
        with engine.connect() as connection:
            print("🔌 Connected to database. Adding users...")
            
            users_added = 0
            
            for first, last in DEMO_USERS:
                # Generate next ID
                new_id = get_next_id(connection, "Student")
                
                # Format email: firstname.lastname@example.com
                email = f"{first.lower()}.{last.lower()}@example.com"
                
                # Check duplication on email just in case
                check = connection.execute(text(f"SELECT 1 FROM usertable WHERE \"Useremail\" = '{email}'")).fetchone()
                if check:
                    print(f"⚠️  Skipping {first} {last} ({email}) - already exists")
                    continue
                
                password = str(new_id) # Using ID as password for simplicity in demo
                
                # Insert into usertable
                connection.execute(text(f"""
                    INSERT INTO usertable ("Userid", "Useremail", "Userpassword", "Userrole")
                    VALUES ({new_id}, '{email}', '{password}', 'Student')
                """))
                
                # Insert into student table
                connection.execute(text(f"""
                    INSERT INTO student ("Studentid", "Studentfirstname", "Studentlastname", "Studentcontactnumber", "Studentnotification")
                    VALUES ({new_id}, '{first}', '{last}', '', true)
                """))
                
                connection.commit()
                print(f"✅ Added: {first} {last} (ID: {new_id})")
                users_added += 1
                
            print(f"\n🎉 Successfully added {users_added} demo students!")
            return True
            
    except Exception as e:
        print(f"\n❌ Database error: {str(e)}")
        return False

if __name__ == "__main__":
    add_demo_users()
