# Simple Classes CRUD Setup Guide

## Quick Setup (5 minutes)

### 1. Database Setup
1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create database named `compuplay` (if not exists)
4. Import `src/database_schema.sql` into the database

### 2. File Structure
Make sure your files are organized like this:
```
CompuPlay/
├── backend/
│   ├── api/
│   │   └── classes.php
│   └── config/
│       └── database.php
├── frontend/
│   ├── index.html
│   └── app.js
└── src/
    └── database_schema.sql
```

### 3. Configure Database
Edit `backend/config/database.php` if your MySQL credentials are different:
- Default: `localhost`, `root`, no password

### 4. Configure API URL
Edit `frontend/app.js` line 4:
```javascript
const API_BASE = 'http://localhost/CompuPlay/backend/api/classes.php';
```
Change this to match your XAMPP htdocs path.

### 5. Run the Application

**Option A: Using XAMPP (Recommended)**
1. Place the `CompuPlay` folder in `C:\xampp\htdocs\`
2. Open browser: `http://localhost/CompuPlay/frontend/`

**Option B: Using PHP Built-in Server**
1. Open terminal in `CompuPlay` directory
2. Run: `php -S localhost:8000 -t frontend`
3. Open browser: `http://localhost:8000/`

**Note:** For Option B, you'll need to update the API_BASE URL in `app.js` to:
```javascript
const API_BASE = 'http://localhost:8000/../backend/api/classes.php';
```

## Features

✅ **Create Class** - Top bar button opens modal to create new class
✅ **View Classes** - Cards display all classes
✅ **Edit Class** - Click 3-dots menu → Edit
✅ **Delete Class** - Click 3-dots menu → Delete (with confirmation)
✅ **View Class Details** - Click on any card to see full details

## Troubleshooting

**CORS Errors:**
- Make sure PHP files are being served through a web server (XAMPP), not directly opened

**Database Connection Failed:**
- Check XAMPP MySQL is running
- Verify database name is `compuplay`
- Check credentials in `backend/config/database.php`

**API Not Found:**
- Verify the API_BASE URL in `app.js` matches your setup
- Check file paths are correct

## Testing

1. Create a test class with name "Math 101"
2. Click the card to view details
3. Click 3-dots → Edit to modify
4. Click 3-dots → Delete to remove

## Next Steps

After testing, you can:
- Add authentication
- Improve styling
- Add more features (student management, etc.)
- Integrate with Laravel if needed

