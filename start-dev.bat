@echo off
setlocal
title NoteSync Dev Launcher

echo ================================
echo  NoteSync - Dev Launcher
echo ================================

REM --- 1. Make sure Docker is running ---------------------------------
docker info >nul 2>&1
if %errorlevel%==0 goto docker_ready

echo [1/4] Docker is not running - starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

:wait_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if not %errorlevel%==0 (
    echo        ...waiting for Docker to come up
    goto wait_docker
)

:docker_ready
echo [1/4] Docker is running.

REM --- 2. Start (or create) the local MongoDB container ---------------
docker start notesync-mongo-dev >nul 2>&1
if %errorlevel%==0 (
    echo [2/4] MongoDB container started ^(existing^).
) else (
    echo [2/4] Creating MongoDB container...
    docker run -d --name notesync-mongo-dev -p 27017:27017 -v notesync_mongo_dev:/data/db mongo:6 >nul
    if not %errorlevel%==0 (
        echo ERROR: could not start MongoDB container. Is port 27017 in use?
        pause
        exit /b 1
    )
)

REM --- 3. Backend in its own terminal window --------------------------
echo [3/4] Starting backend ^(http://localhost:5000^)...
start "NoteSync Backend" cmd /k "cd /d %~dp0backend && set MONGODB_URI=mongodb://localhost:27017/notesync && npm run dev"

REM --- 4. Frontend in its own terminal window -------------------------
echo [4/4] Starting frontend ^(http://localhost:3000^)...
start "NoteSync Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All services launched:
echo   MongoDB   - localhost:27017  (container: notesync-mongo-dev)
echo   Backend   - http://localhost:5000/api/health
echo   Frontend  - http://localhost:3000
echo.
echo Close the Backend/Frontend windows to stop them.
echo Stop MongoDB with:  docker stop notesync-mongo-dev
echo.
endlocal
