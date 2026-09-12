@echo off
rem Patchfeld starten – holt vorher automatisch die neueste Version von GitHub.
rem Patchfeld launcher – fetches the latest version from GitHub first.
cd /d "%~dp0"
where git >nul 2>nul
if %errorlevel%==0 (
  echo Suche nach Updates ...
  git pull --ff-only --quiet 2>nul && echo Aktuell. || echo Kein Update moeglich ^(offline?^) - starte vorhandene Version.
)
start "" "%~dp0index.html"
