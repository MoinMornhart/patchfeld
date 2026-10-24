# Stand: Patchfeld (Übergabe 2026-10-24)

## Was es ist
Windows-Lern-App (Electron) für die Ausbildung Fachinformatiker/-in Systemintegration. KI-Mentor über das Claude Agent SDK (Claude-Konto Pro/Max über Claude Code), fünf Kurse mit Level 0–10, Tages-Sessions, Lernprofil – plus Prüfungstrainer mit 360 IHK-Aufgaben. Aufgebaut **1:1 wie das Schwesterprojekt Codewerk**.

## Aktueller Stand (Version 0.2.4, Release v0.2.4 vom 2026-09-12)
- Fünf Kurse (1. Lehrjahr, 2. Lehrjahr · AP 1, 3. Lehrjahr · AP 2, Projekt & Fachgespräch, WiSo), Mentor erklärt, Lernender löst Aufgaben im Arbeitsbereich, App prüft sofort.
- Prüfungstrainer: 18 Bereiche à 20 Fragen (360), Karteikasten, Fehlerbuch, Glossar (118 Begriffe), Prüfungssimulationen; Rechenaufgaben mit Zufallswerten.
- Deutsch und Englisch (UI, Fragen, Mentor-Prompts).
- Installer (NSIS), eigenes App-Icon, Autoupdate über GitHub Releases.
- GitHub Actions: Tests grün (2026-10-24), VibeWorks-Repo-Check grün.

## Zuletzt gemacht
- 2026-10-24: Cloud-Start-Hook (`.claude/hooks/skills-cloud.sh`) – Philips Skills in Cloud-Sitzungen.
- 2026-09-16 – 09-26: VibeWorks-Repo-Check eingerichtet und aktualisiert.
- 2026-09-12: 0.2.3/0.2.4 – Umbau zur Windows-App mit KI-Mentor, Icon, Installer-Build repariert.
- 2026-09-11/12: 0.0.1–0.2.2 – Fragenkatalog auf 20 Fragen je Bereich, GitHub Pages, Autoupdate der lokalen Datei.

## Offen / Nächste Schritte
- Offene GitHub-Issues (von VibeWorks angelegt):
  - #2 Sicherheitslücken in `electron` und `zod` beheben (electron ^44.3.0 → 45.0.0 empfohlen).
  - #1 Abhängigkeiten aktualisieren: electron-builder, @anthropic-ai/claude-agent-sdk, electron-updater.
- Seit 0.2.4 (12.09.) kein neues Release – Updates kommen bei Nutzern nur über `bump` + `release` an.
- Ob die Mentor-Funktion auf echtem PC getestet ist: **unklar** (keine Notizen dazu).
- In den Chats keine weiteren offenen Punkte gefunden. Bekannte Fehler: keine dokumentiert.

## Wichtige Infos
- Technik: Electron 44, Claude Agent SDK, Tests mit `node --test`.
- Aufbau: `src/main` (main, mentor, catalog, store, updater, preload), `src/renderer` (Kurse: index.html/app.js; Trainer: trainer.html/trainer.js; catalog.js, engine.js, i18n.js), `src/shared`, `prompts/` (Mentor DE/EN), `scripts/`, `test/`.
- Befehle: `npm start`, `npm test`, `npm run selftest`, `npm run check`, `npm run graphics`, `npm run dist`.
- Release: `npm run bump -- --title "…" --de "…" --en "…"` (Commit `[Patchfeld X.Y.Z] Titel`, Tag), dann `npm run release`. Vorher `npm test` + `npm run selftest` grün.
- Fragen-IDs nie ändern/wiederverwenden (Lernfortschritt hängt dran). Format: `docs/FRAGENFORMAT.md`.
- Versionen: Stellen 0–9 mit Übertrag (0.0.9 → 0.1.0). `package.json` ist maßgeblich.
- Repo: `MoinMornhart/patchfeld` (öffentlich), GitHub Pages: moinmornhart.github.io/patchfeld. Lokal: `C:\Projekte\Patchfeld`.
- App ist nicht signiert (SmartScreen-Hinweis beim ersten Start).

## Philips Vorgaben
- Update-Funktion: ja (Autoupdate über GitHub Releases).
- Repo öffentlich.
- Git-Texte: Commits enden mit `Co-Authored-By: Claude …`; eine Regel „Verfasst mit Claude 🤖“ ist im Repo **nicht** festgelegt.
- Jeder sichtbare Text in Deutsch und Englisch; im Zweifel wie in Codewerk machen.

Diese Datei wird beim Arbeiten aktuell gehalten: nach jedem größeren Schritt „Aktueller Stand“ und „Offen“ anpassen.
