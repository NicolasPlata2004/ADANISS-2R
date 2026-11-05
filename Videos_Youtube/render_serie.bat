@echo off
REM Renderiza la Serie Sensores en 3D (con subtitulos, sin audio) usando la tarjeta grafica.
REM   render_serie.bat                      -> los 10 episodios, uno tras otro
REM   render_serie.bat S03_PIR S07_Ultrasonico   -> solo esos
REM Cada video queda en 02_Episodios\<episodio>\final\<episodio>_3D_1080p_sin_audio.mp4
REM Si el PC no tiene GPU (o falla), borra la linea REMOTION_GL de abajo: ira por software, mas lento.
setlocal
set RAIZ=%~dp0
set EPS=%*
if "%EPS%"=="" set EPS=S01_Piezo S02_Tactil S03_PIR S04_Hall S05_Acelerometro S06_Giroscopio S07_Ultrasonico S08_LiDAR S09_Temperatura S10_Galga
set REMOTION_GL=angle
powershell -NoProfile -ExecutionPolicy Bypass -Command ". '%RAIZ%00_Programas\entorno.ps1' -Raiz '%RAIZ:~0,-1%'; Set-Location '%RAIZ%01_Motor\estudio'; foreach ($ep in ('%EPS%' -split ' ')) { if (-not $ep) { continue }; $id = $ep.Substring(0,3) + '-3D'; $out = '%RAIZ%02_Episodios\' + $ep + '\final\' + $ep + '_3D_1080p_sin_audio.mp4'; Write-Host ('[render] ' + $ep + ' -> ' + $out); npx remotion render src/index.ts $id $out; if ($LASTEXITCODE -ne 0) { Write-Host ('[error] fallo el render de ' + $ep) } }"
endlocal
