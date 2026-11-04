@echo off
REM Produce un episodio:   producir.bat EP01
REM Episodio nuevo:        producir.bat EP02 C:\ruta\EP02_NARRACION.wav
setlocal
set RAIZ=%~dp0
set EP=%1
if "%EP%"=="" (
  echo Uso: producir.bat EP01 [ruta\al\audio.wav]
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -Command ". '%RAIZ%00_Programas\entorno.ps1' -Raiz '%RAIZ:~0,-1%'; if ('%2' -ne '') { python '%RAIZ%01_Motor\scripts\producir.py' %EP% --audio '%2' } else { python '%RAIZ%01_Motor\scripts\producir.py' %EP% }"
endlocal
