# Patchfeld – Hinweise für die Arbeit am Projekt

Windows-Lern-App (Electron) für die Ausbildung Fachinformatiker/-in Systemintegration – aufgebaut
**1:1 wie das Schwesterprojekt Codewerk** (`C:\Projekte\Codewerk`): KI-Mentor über das Claude Agent SDK,
fünf Kurse mit Level 0–10, Tages-Sessions, Lernprofil. Dazu kommt der Prüfungstrainer (360 IHK-Aufgaben).
Im Zweifel bei Aufbau, Skripten, README oder Release-Ablauf: in Codewerk nachsehen und genauso machen.

## Regeln

- **Erklären und Machen:** Der Mentor erklärt, der Lernende löst Aufgaben im Arbeitsbereich (Katalog oder eigene).
- **Beide Sprachen:** Jeder UI-Text (`src/renderer/i18n.js`), jede Frage (`de`/`en`) und beide Mentor-Prompts.
- **Versionen:** `package.json` ist maßgeblich. Nebenstellen 0–9, `0.0.9 → 0.1.0`, `0.9.9 → 1.0.0`.
- **Releases:** `npm run bump -- --title "…" --de "…" --en "…"` (Commit `[Patchfeld X.Y.Z] Titel` mit DE/EN-Liste, Tag),
  danach `npm run release` (Push, GitHub-Release mit Installer). Nur so kommt das Autoupdate bei den Nutzern an.
- **Vor jedem Release:** `npm test` und `npm run selftest` müssen grün sein.
- **Fragen-IDs** nie ändern oder wiederverwenden (Lernfortschritt hängt daran). Format: `docs/FRAGENFORMAT.md`.

## Aufbau

`src/main` Hauptprozess (main, mentor, catalog, store, updater, preload) · `src/renderer` Oberfläche
(index.html + app.js = Kurse, trainer.html + trainer.js = Prüfungstrainer, catalog.js = Fragen, engine.js = Aufgaben-Engine)
· `src/shared` Kurse, Version · `prompts` Mentor · `scripts` bump, release, check, graphics · `test` node --test
