# =============================================================================
#  Instalador del estudio de videos  ·  todo queda dentro de D:\Videos_Youtube
# =============================================================================
#  Uso (PowerShell):
#    powershell -ExecutionPolicy Bypass -File instalar_windows.ps1
#    powershell -ExecutionPolicy Bypass -File instalar_windows.ps1 -Raiz "D:\Videos_Youtube"
#
#  Qué hace (y dónde lo deja):
#    00_Programas\node      Node.js portable (para Remotion)
#    00_Programas\ffmpeg    ffmpeg portable
#    00_Programas\uv        uv (gestor de Python)
#    00_Programas\python    Python 3.12 (instalado por uv, no toca tu Python de sistema)
#    00_Programas\venv      entorno con Manim, faster-whisper, etc.
#    00_Programas\cache     cachés de npm, pip/uv y modelos de Whisper (nada se descarga a C:)
#    00_Programas\fuentes   fuente Latin Modern (la de LaTeX) para el formato Lámina técnica
#  Si la carpeta no tiene el proyecto, lo descarga de GitHub (rama del proyecto).
# =============================================================================
param(
  [string]$Raiz = "D:\Videos_Youtube",
  [string]$Rama = "claude/busy-albattani-cjop0n",
  [string]$AudioEP01 = "$env:USERPROFILE\Downloads\EP01_NARRACION_COMPLETA.wav"
)
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # Invoke-WebRequest es mucho más rápido así
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Paso($t) { Write-Host "`n==> $t" -ForegroundColor Cyan }
function Descargar($url, $destino) {
  Write-Host "    descargando $url"
  Invoke-WebRequest -Uri $url -OutFile $destino -UseBasicParsing
}

$Prog = Join-Path $Raiz "00_Programas"
$Cache = Join-Path $Prog "cache"
$Tmp = Join-Path $Cache "descargas"
New-Item -ItemType Directory -Force -Path $Raiz, $Prog, $Cache, $Tmp | Out-Null

# --------------------------------------------------------------------------- 0. proyecto
if (-not (Test-Path (Join-Path $Raiz "01_Motor\estudio\package.json"))) {
  Paso "Descargando el proyecto desde GitHub"
  $zip = Join-Path $Tmp "proyecto.zip"
  Descargar "https://github.com/NicolasPlata2004/ADANISS-2R/archive/refs/heads/$Rama.zip" $zip
  $ext = Join-Path $Tmp "proyecto"
  if (Test-Path $ext) { Remove-Item -Recurse -Force $ext }
  Expand-Archive $zip -DestinationPath $ext
  $origen = Get-ChildItem $ext | Select-Object -First 1
  Copy-Item -Recurse -Force (Join-Path $origen.FullName "Videos_Youtube\*") $Raiz
}

# --------------------------------------------------------------------------- 1. Node.js portable
$Node = Join-Path $Prog "node"
if (-not (Test-Path (Join-Path $Node "node.exe"))) {
  Paso "Node.js (LTS 22, portable)"
  $versiones = Invoke-RestMethod "https://nodejs.org/dist/index.json"
  $v = ($versiones | Where-Object { $_.version -like "v22.*" -and $_.lts } | Select-Object -First 1).version
  $zip = Join-Path $Tmp "node.zip"
  Descargar "https://nodejs.org/dist/$v/node-$v-win-x64.zip" $zip
  Expand-Archive $zip -DestinationPath $Tmp -Force
  Move-Item (Join-Path $Tmp "node-$v-win-x64") $Node
}

# --------------------------------------------------------------------------- 2. ffmpeg portable
$Ffmpeg = Join-Path $Prog "ffmpeg"
if (-not (Test-Path (Join-Path $Ffmpeg "bin\ffmpeg.exe"))) {
  Paso "ffmpeg (portable)"
  $zip = Join-Path $Tmp "ffmpeg.zip"
  Descargar "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" $zip
  Expand-Archive $zip -DestinationPath (Join-Path $Tmp "ffmpeg") -Force
  $dir = Get-ChildItem (Join-Path $Tmp "ffmpeg") -Directory | Select-Object -First 1
  Move-Item $dir.FullName $Ffmpeg
}

# --------------------------------------------------------------------------- 3. uv + Python + paquetes
$Uv = Join-Path $Prog "uv"
if (-not (Test-Path (Join-Path $Uv "uv.exe"))) {
  Paso "uv (gestor de Python)"
  $zip = Join-Path $Tmp "uv.zip"
  Descargar "https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-pc-windows-msvc.zip" $zip
  Expand-Archive $zip -DestinationPath $Uv -Force
}

# entorno de esta sesión (también lo usa entorno.ps1)
. (Join-Path $Prog "entorno.ps1") -Raiz $Raiz

$Venv = Join-Path $Prog "venv"
if (-not (Test-Path (Join-Path $Venv "Scripts\python.exe"))) {
  Paso "Python 3.12 + Manim + Whisper (en 00_Programas, no toca tu Python)"
  & (Join-Path $Uv "uv.exe") python install 3.12
  & (Join-Path $Uv "uv.exe") venv $Venv --python 3.12
}
& (Join-Path $Uv "uv.exe") pip install --python (Join-Path $Venv "Scripts\python.exe") -r (Join-Path $Raiz "00_Programas\requisitos.txt")

# --------------------------------------------------------------------------- 4. Remotion (npm)
Paso "Remotion y Three.js (npm install)"
Push-Location (Join-Path $Raiz "01_Motor\estudio")
& (Join-Path $Node "npm.cmd") install --no-audit --no-fund
& (Join-Path $Node "npx.cmd") remotion browser ensure
Pop-Location

# --------------------------------------------------------------------------- 5. fuente Latin Modern (formato Lámina técnica)
$Fuentes = Join-Path $Prog "fuentes"
if (-not (Test-Path (Join-Path $Fuentes "lmroman10-regular.otf"))) {
  Paso "Fuente Latin Modern (solo para tu usuario, no requiere administrador)"
  try {
    $zip = Join-Path $Tmp "lm.zip"
    Descargar "https://www.gust.org.pl/projects/e-foundry/latin-modern/download/lm2.004otf.zip" $zip
    Expand-Archive $zip -DestinationPath (Join-Path $Tmp "lm") -Force
    New-Item -ItemType Directory -Force -Path $Fuentes | Out-Null
    Get-ChildItem (Join-Path $Tmp "lm") -Recurse -Filter "lmroman10-*.otf" | Copy-Item -Destination $Fuentes
    $dirUsuario = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Fonts"
    New-Item -ItemType Directory -Force -Path $dirUsuario | Out-Null
    foreach ($f in Get-ChildItem $Fuentes -Filter *.otf) {
      Copy-Item $f.FullName $dirUsuario -Force
      New-ItemProperty -Path "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -Name "$($f.BaseName) (OpenType)" -Value (Join-Path $dirUsuario $f.Name) -PropertyType String -Force | Out-Null
    }
  } catch { Write-Warning "No pude instalar Latin Modern ($_). Manim usará otra fuente serif." }
}

# --------------------------------------------------------------------------- 6. LaTeX (para ecuaciones de Manim)
if (-not (Get-Command latex -ErrorAction SilentlyContinue)) {
  Write-Warning "No encuentro LaTeX. Para las ecuaciones de Manim instala MiKTeX: https://miktex.org/download (elige 'instalar paquetes faltantes: Sí')."
}

# --------------------------------------------------------------------------- 7. audio del EP01
$destAudio = Join-Path $Raiz "02_Episodios\EP01\audio\EP01_NARRACION_COMPLETA.wav"
if ((Test-Path $AudioEP01) -and -not (Test-Path $destAudio)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $destAudio) | Out-Null
  Copy-Item $AudioEP01 $destAudio
}

Paso "Listo"
Write-Host "  Estudio visual:     cd $Raiz\01_Motor\estudio ; npx remotion studio"
Write-Host "  Producir episodio:  $Raiz\producir.bat EP01"
Write-Host "  Episodio nuevo:     $Raiz\producir.bat EP02 C:\ruta\EP02_NARRACION.wav"
