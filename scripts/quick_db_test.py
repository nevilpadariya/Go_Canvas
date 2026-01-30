#!/usr/bin/env python3
"""
Quick database test with timeout
"""
import os
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
import psycopg2

load_dotenv()
database_url = os.getenv("DATABASE_URL")

print("Testing connection with 10 second timeout...")
print()

try:
    # Parse the URL to add connect_timeout
    if "?" in database_url:
        database_url += "&connect_timeout=10"
    else:
        database_url += "?connect_timeout=10"
    
    print(f"Connecting to: {database_url.split('@')[1].split('?')[0]}")
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    
    print(f"✅ SUCCESS! Connected to: {version}")
    
    cursor.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    print(f"❌ Connection failed: {str(e)}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
