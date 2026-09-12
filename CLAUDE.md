# Patchfeld – Hinweise für die Arbeit am Projekt

Lern-App für die Ausbildung Fachinformatiker/-in Systemintegration. Eine Datei (`index.html`),
kein Build-Schritt, offline lauffähig, Deutsch und Englisch.

## Regeln

- **Beide Sprachen:** Jede neue Frage, jeder UI-Text braucht Deutsch und Englisch (`de`/`en` bzw. `x('…','…')`).
- **Versionen:** Jede Stelle 0–9, `0.0.9 → 0.1.0`, `0.9.9 → 1.0.0`. Jede Änderung ist ein eigenes Release.
- **Commits:** Erste Zeile immer `vX.Y.Z: <was sich geändert hat>`, Body mit Stichpunkten DE und EN, Tag `vX.Y.Z`.
  Am einfachsten: `node tools/release.js --de "…|…" --en "…|…" --commit --push` (erzwingt der Hook `.githooks/commit-msg`).
- **Autoupdate immer erhalten:** Jedes Release wird nach GitHub gepusht (github.com/MoinMornhart/patchfeld, Pages:
  moinmornhart.github.io/patchfeld). Die App prüft dort `version.json`; gehostet lädt sie neu, lokal bietet sie den Download an,
  `start.cmd`/`start.sh` holen per `git pull`. Diesen Update-Weg nie brechen.
- **Vor jedem Release:** `node tools/check.js` muss fehlerfrei sein.
- **Fragen-IDs** nie ändern oder wiederverwenden (Lernfortschritt hängt daran).
- Fragen handlungsorientiert im IHK-Stil mit Situation, Erklärung `e` und naheliegendem Fehler `n` – siehe `docs/FRAGENFORMAT.md`.
- Gestaltung: nüchtern-technisch (Rack, Patchfeld, Status-LEDs), Bereiche in T568B-Aderfarben; Tokens in `:root`.

## Dateien

`index.html` App · `version.json` Update-Quelle · `sw.js` Offline/Updates · `CHANGELOG.md` ·
`docs/` Fragenformat & Entwicklung · `tools/release.js` · `tools/check.js`
