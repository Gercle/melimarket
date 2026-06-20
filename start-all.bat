@echo off
setlocal
rem %~dp0 es la carpeta donde esta este .bat, asi el script funciona
rem sin importar en que ruta de disco este clonado el proyecto
set ROOT=%~dp0

echo ===========================================
echo   Levantando melimarket
echo ===========================================

echo.
echo [1/4] Levantando MySQL (Docker)...
cd /d "%ROOT%"
docker compose up mysql -d

echo.
echo Esperando 5 segundos a que MySQL este listo...
timeout /t 5 /nobreak >nul

echo.
echo [2/4] Levantando API (Node)...
start "Melimarket - API" cmd /k "cd /d "%ROOT%api" && npm run dev"

echo.
echo [3/4] Levantando Worker (Java)...
start "Melimarket - Worker" cmd /k "cd /d "%ROOT%worker" && mvn spring-boot:run"

echo.
echo [4/4] Levantando Frontend (React)...
start "Melimarket - Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo.
echo ===========================================
echo   Listo. Se abrieron 3 ventanas nuevas:
echo   - API en http://localhost:3000
echo   - Worker en http://localhost:8080
echo   - Frontend en http://localhost:5173
echo ===========================================
pause
