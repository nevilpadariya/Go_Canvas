# Database Connection Troubleshooting

## Current Issue

**Error:** Password authentication failed for user "deo-db-213501"

```
connection to server at "app-84c410ed-47fe-4daa-9d06-d1c3c175ac47-do-user-32679671-0.i.db.ondigitalocean.com" (104.248.236.113), port 25060 failed: 
FATAL: password authentication failed for user "deo-db-213501"
```

## Possible Causes

1. **Incomplete Password**
   - The password shown in the screenshot might be truncated
   - Check if there's a "show/hide" or "reveal" button for the password

2. **Special Characters**
   - Password might contain special characters that need URL encoding
   - Characters like `@`, `#`, `$`, `%`, etc. need to be escaped

3. **IP Whitelist**
   - DigitalOcean database might have IP restrictions
   - Your local IP might not be whitelisted

4. **Wrong Connection Parameters**
   - Username might be different
   - Database name might be different

## Solutions to Try

### Option 1: Get Connection String (Recommended)

In your DigitalOcean Database dashboard:

1. Look for "Connection String" section
2. Select "Connection String" (not Connection Parameters)
3. Copy the entire URL that looks like:
   ```
   postgresql://username:password@host:port/database
   ```

This will have the password already properly encoded.

### Option 2: Verify Password

1. Click the "hide/show" button next to the password field
2. Copy the complete password
3. If it contains special characters, we'll need to URL-encode them

### Option 3: Check Trusted Sources

1. In DigitalOcean Database settings
2. Go to "Settings" → "Trusted Sources"
3. Add your current IP address or temporarily allow all IPs (0.0.0.0/0) for testing

### Option 4: Create New User

1. In DigitalOcean Database → "Users & Databases"
2. Create a new user with a simple password (no special chars)
3. Use that for testing

## What to Do Next

Please provide one of the following:

1. ✅ The complete **Connection String** from DigitalOcean
2. ✅ The verified complete **password** 
3. ✅ Screenshot showing IP whitelist settings

Once you provide this, I'll update the `.env` file and test the connection again.

## Current Configuration

```bash
host     = app-84c410ed-47fe-4daa-9d06-d1c3c175ac47-do-user-32679671-0.i.db.ondigitalocean.com
port     = 25060
username = deo-db-213501
password = [REDACTED - check DigitalOcean dashboard]
database = dev-db-213501
sslmode  = require
```
