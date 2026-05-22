@echo off
title SkillMeter.Ai Dev Suite Control Panel
echo =======================================================================
echo          SKILLMETER.AI - FULL STACK ECOSYSTEM DEVELOPMENT SUITE
echo                 "Transforming Content into Competence"
echo =======================================================================
echo.
echo [1/3] Initializing FastAPI AI Orchestrator (Port 8001)...
start "FastAPI AI Orchestrator" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn ai_services.main:app --port 8001 --reload"

echo [2/3] Initializing Django Web API & DB (Port 8000)...
start "Django DRF Web API" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

echo [3/3] Initializing Next.js App Router (Port 3000)...
start "Next.js Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================================
echo All modules are launched in separate terminals!
echo.
echo FastAPI Endpoint:     http://localhost:8001/docs
echo Django DRF Backend:   http://localhost:8000/api/
echo Next.js Web Client:   http://localhost:3000/
echo =======================================================================
echo.
echo Press any key to exit this control panel. Keep the other terminal windows open.
pause > nul
