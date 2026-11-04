# Prepara la sesión para usar SOLO las herramientas de D:\Videos_Youtube\00_Programas
# y para que toda descarga (npm, pip, modelos de Whisper) quede dentro de esa carpeta.
param([string]$Raiz = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)))
$Prog = Join-Path $Raiz "00_Programas"
$Cache = Join-Path $Prog "cache"
$env:PATH = @(
  (Join-Path $Prog "node"),
  (Join-Path $Prog "ffmpeg\bin"),
  (Join-Path $Prog "uv"),
  (Join-Path $Prog "venv\Scripts"),
  $env:PATH
) -join ";"
$env:npm_config_cache = Join-Path $Cache "npm"
$env:UV_CACHE_DIR = Join-Path $Cache "uv"
$env:UV_PYTHON_INSTALL_DIR = Join-Path $Prog "python"
$env:PIP_CACHE_DIR = Join-Path $Cache "pip"
$env:HF_HOME = Join-Path $Cache "huggingface"           # modelos de Whisper
$env:PYTHONUTF8 = "1"
