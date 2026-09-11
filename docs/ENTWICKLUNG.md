# Entwicklung

## Architektur

Die App ist **eine einzige Datei** (`index.html`) ohne Build-Schritt und ohne
Abhängigkeiten außer Google Fonts (mit Systemschrift-Fallback). Aufbau der Skriptblöcke:

| Block | Inhalt |
|---|---|
| Kern | `APP_VERSION`, `CHANGELOG`, `AREAS` (18 Bereiche mit Lehrjahr, Lernfeld, Prüfung, Aderfarbe), Hilfsfunktionen, Generatoren `GEN` |
| `BEREICH:<id>` | Fragen je Bereich (`Q.push(...)`), Format siehe [FRAGENFORMAT.md](FRAGENFORMAT.md) |
| Glossar | `GLOSSAR` – `[Begriff, Bereich, Langform, Erklärung DE, Erklärung EN, Begriff EN?]` |
| App Teil 1 | Zustand (`localStorage`, Schlüssel `patchfeld.v1`), Leitner, XP/Level/Ränge, Abzeichen, Update-Prüfung, Backup |
| App Teil 2/2b | Ansichten: Start, Lernpfad, Training, Prüfung, Mehr, Statistik, Glossar, Abzeichen, Einstellungen, Fehlerbuch, Karteikarten |
| App Teil 3 | Fragenanzeige, Runden, Prüfungssimulation, Aktionen (`data-act`), Tastatur, Start |

Rendering: Jede Ansicht ist eine Funktion in `VIEWS`, die HTML liefert; Klicks laufen
über `data-act` → `ACT`, Änderungen über `data-chg` → `CHG`, Eingaben über `data-inp` → `INP`.

### Lernlogik

- **Leitner:** Fach 1–5, Wiedervorlage nach 1 · 3 · 7 · 16 · 35 Tagen. Richtig → ein Fach
  weiter, falsch → Fach 1 und Eintrag im Fehlerbuch. Offene Fragen: „teilweise“ hält das Fach.
- **Runde:** 10 Fragen, 3 Leben. Auswahl priorisiert fällige, dann neue, dann schwache Fragen.
  Zu kleine Pools werden mit Generator-Aufgaben aufgefüllt.
- **XP:** Basis je Typ (sc 10, mc 12, match/order/in 15, open 10) × Kombo (ab 3: ×1,5, ab 5: ×2,
  ab 8: ×3), +20 für eine vollständige Runde, +30 für 10/10.
- **Level:** Level L ab `50 · (L−1) · L` XP; Ränge von Azubi (1) bis Systemarchitekt (47).
- **Serie:** zählt aufeinanderfolgende Tage mit erreichtem Tagesziel.
- **Prüfung:** AP 1 = 30 Fragen/90 min aus Lehrjahr 1+2, AP 2 = 40 Fragen/120 min
  (40 % Lehrjahr 2, 60 % Lehrjahr 3), max. 2 offene Fragen je Lehrjahr, Note nach IHK-Schlüssel
  (92/81/67/50/30 %).

## Versionen

Jede Stelle läuft von 0 bis 9: `0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`.
Die Version steht an vier Stellen und muss überall gleich sein:
`APP_VERSION` + Meta-Tag in `index.html`, `version.json`, `CHANGELOG.md`, Cache-Name in `sw.js`.

## Release-Ablauf

```sh
node tools/check.js                      # Katalog und Versionen prüfen
node tools/release.js --de "Änderung A|Änderung B" --en "Change A|Change B" --commit
```

`release.js` erhöht die Version, schreibt alle vier Stellen, erzeugt die Commit-Nachricht
und – mit `--commit` – committet und setzt den Tag `vX.Y.Z`. Die Commit-Nachricht hat immer
diese Form, damit jedes Update in der Git-Historie sichtbar ist:

```
v0.0.2: Netzwerkgrundlagen auf 20 Fragen erweitert

- Netzwerkgrundlagen auf 20 Fragen erweitert
- …

EN:
- Network fundamentals extended to 20 questions
```

Der Hook `.githooks/commit-msg` weist Commits ab, deren erste Zeile nicht mit der aktuellen
Version beginnt. Einmalig aktivieren: `git config core.hooksPath .githooks`.

## Hosting und Autoupdate

- Lokal (`file://`): läuft komplett offline. Die Update-Prüfung braucht dann eine Adresse
  zu einer gehosteten `version.json` (Einstellungen → Updates) und zeigt einen Link zur neuen Datei.
- Gehostet (z. B. GitHub Pages): `version.json` wird relativ abgefragt (beim Start, alle 6 h und
  beim Zurückkehren in den Tab). Ist die Version neuer, lädt die App neu – nie während einer
  Runde oder Prüfung. `sw.js` liefert die App offline aus und holt online immer zuerst
  die aktuelle Datei.
- GitHub Pages: Repository pushen, unter *Settings → Pages* den Branch `main` / Ordner `/`
  wählen. Die App ist dann unter `https://<nutzer>.github.io/<repo>/` erreichbar.
