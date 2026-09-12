#!/bin/sh
# Patchfeld starten – holt vorher automatisch die neueste Version von GitHub.
# Patchfeld launcher – fetches the latest version from GitHub first.
cd "$(dirname "$0")" || exit 1
if command -v git >/dev/null 2>&1; then
  echo "Suche nach Updates ..."
  git pull --ff-only --quiet 2>/dev/null && echo "Aktuell." || echo "Kein Update möglich (offline?) – starte vorhandene Version."
fi
FILE="$(pwd)/index.html"
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$FILE"
elif command -v open >/dev/null 2>&1; then open "$FILE"
else echo "Bitte $FILE im Browser öffnen."; fi
