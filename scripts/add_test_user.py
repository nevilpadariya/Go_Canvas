#!/usr/bin/env python3
"""
Add a test user to the database
"""
import os
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import bcrypt

load_dotenv()
database_url = os.getenv("DATABASE_URL")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

print("🔧 Adding test user to database...")
print()

# Test user credentials
test_user = {
    "email": "test@gocanvas.com",
    "password": "TestPassword123",
    "role": "Student"
}

try:
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        # Hash the password with bcrypt
        hashed_password = bcrypt.hashpw(
            test_user["password"].encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Insert user
        result = conn.execute(text("""
            INSERT INTO usertable ("Useremail", "Userpassword", "Userrole")
            VALUES (:email, :password, :role)
            RETURNING "Userid"
        """), {
            "email": test_user["email"],
            "password": hashed_password,
            "role": test_user["role"]
        })
        
        conn.commit()
        user_id = result.fetchone()[0]
        
        print("✅ Test user created successfully!")
        print()
        print("📋 User Details:")
        print(f"   User ID: {user_id}")
        print(f"   Email: {test_user['email']}")
        print(f"   Password: {test_user['password']}")
        print(f"   Role: {test_user['role']}")
        print()
        print("🧪 You can now test:")
        print(f"   1. Login with: {test_user['email']} / {test_user['password']}")
        print(f"   2. Signup with a different email")
        print(f"   3. API: https://squid-app-bgn4p.ondigitalocean.app/docs")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    sys.exit(1)
