@echo off
echo ============================================
echo   CapitalIQ - Automatic Setup Script
echo ============================================
echo.

echo Step 1: Moving to clean location C:\myapp
cd /d C:\
if not exist myapp mkdir myapp
cd myapp

echo Step 2: Copying project files...
if not exist capitaliq mkdir capitaliq
if not exist capitaliq\src mkdir capitaliq\src
if not exist capitaliq\public mkdir capitaliq\public

copy "%~dp0src\capital_one_dashboard.jsx" "capitaliq\src\capital_one_dashboard.jsx" >nul
copy "%~dp0src\index.js" "capitaliq\src\index.js" >nul
copy "%~dp0package.json" "capitaliq\package.json" >nul
copy "%~dp0public\index.html" "capitaliq\public\index.html" >nul

echo Step 3: Installing dependencies (this takes 3-5 minutes)...
cd capitaliq
call npm install

echo.
echo Step 4: Starting the app...
echo.
echo ============================================
echo   App will open at http://localhost:3000
echo   Press Ctrl+C to stop it
echo ============================================
echo.
call npm start
