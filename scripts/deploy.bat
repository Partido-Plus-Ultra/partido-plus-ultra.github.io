@echo off
setlocal
node "%~dp0deploy.mjs"
if errorlevel 1 (
  echo Error durante la validacion o despliegue local.
  exit /b %errorlevel%
)
echo Despliegue completado con exito.
