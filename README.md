# Patchfeld

Spielerische Lern-App für die dreijährige Ausbildung **Fachinformatiker/-in für
Systemintegration** – vom ersten Lehrjahr bis zur Abschlussprüfung Teil 2.
Gebaut für 5–15 Minuten am Abend, am Handy wie am PC.

*English below.*

## Starten

- **Lokal:** `index.html` im Browser öffnen. Keine Installation, kein Build-Schritt,
  alles läuft offline (nur die Schriftarten werden bei Verbindung von Google Fonts
  geladen, sonst greifen Systemschriften).
- **Englisch:** in den Einstellungen umschalten oder `index.html?lang=en` öffnen.
- **Als Web-App (optional):** den Ordner auf einen Webserver legen (z. B. GitHub
  Pages). Dann greifen `sw.js` (Offline-Cache) und `manifest.webmanifest`
  (auf dem Handy „Zum Startbildschirm hinzufügen“), und Updates kommen automatisch.

## Funktionen

| Bereich | Umfang |
|---|---|
| Inhalte | 18 Bereiche in 3 Lehrjahren, jeder Frage ist Lehrjahr, Lernfeld (Rahmenlehrplan 2020) und Prüfungsbezug (AP 1 / AP 2 / WiSo) zugeordnet |
| Fragetypen | Single Choice, Mehrfachauswahl, Rechenaufgaben mit Zufallswerten, Zuordnung, Reihenfolge, offene Fragen mit Musterlösung und Selbsteinschätzung |
| Lernmechanik | Runden à 10 Fragen mit 3 Leben, XP, Level, Ränge (Azubi → Systemarchitekt), Tagesziel, Tagesserie, Kombo-Multiplikator, Abzeichen |
| Wiederholung | Leitner-Karteikasten mit 5 Fächern (1 · 3 · 7 · 16 · 35 Tage), Fehlerbuch, Karteikartenmodus |
| Prüfung | Simulation AP 1 (30 Fragen, 90 min) und AP 2 (40 Fragen, 120 min), Auswertung nach Themengebiet, drei schwächste Bereiche, Note nach IHK-Schlüssel |
| Übersicht | Startseite mit fälligen Karten, Tagesziel, Serie und Vorschlag; Lernpfad als Patchfeld; Prüfungscountdown mit Tagesempfehlung; Statistik |
| Bedienung | Maus/Touch oder Tastatur (1–9 wählen, Enter prüfen/weiter), sichtbarer Fokus, Dunkelmodus |
| Daten | Fortschritt im `localStorage`, Export/Import als JSON |
| Updates | Versionsprüfung über `version.json`, automatische Aktualisierung bei gehosteter App, „Was ist neu“-Dialog |

## Tastatur

| Taste | Wirkung |
|---|---|
| `1`–`9` | Antwort wählen (Mehrfachauswahl: umschalten, Reihenfolge: nächsten Schritt setzen) |
| `Enter` | Antwort prüfen, danach weiter |
| `1`/`2`/`3` nach Musterlösung | Selbsteinschätzung: nicht gewusst / teilweise / sicher |
| `←` `→` / Leertaste | Karteikarten blättern / umdrehen |

## Versionen und Updates

Jede Stelle der Versionsnummer läuft von 0 bis 9:
`0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`.
Jede Änderung wird als eigene Version veröffentlicht – mit Commit-Nachricht
`vX.Y.Z: …`, Git-Tag `vX.Y.Z`, Eintrag in `CHANGELOG.md`, in `version.json` und im
In-App-Changelog. Details: [docs/ENTWICKLUNG.md](docs/ENTWICKLUNG.md).

**Autoupdate:** Die App fragt beim Start und alle 6 Stunden `version.json` ab.
Läuft sie von einem Webserver, lädt sie eine neue Version automatisch (nie während
einer Runde oder Prüfung). Als lokale Datei kann sie sich nicht selbst
überschreiben – trägt man in den Einstellungen die Adresse einer gehosteten
`version.json` ein, zeigt sie einen Hinweis mit Link zur neuen Datei.

## Projektstruktur

```
index.html            die komplette App (Kern, Fragen je Bereich, Glossar, UI)
version.json          aktuelle Version + Änderungen (für die Update-Prüfung)
sw.js                 Service Worker für Offline/Updates (nur gehostet aktiv)
manifest.webmanifest  PWA-Manifest, icon.svg
CHANGELOG.md          alle Versionen, deutsch und englisch
docs/                 Fragenformat, Entwicklung und Release-Ablauf
tools/release.js      Version erhöhen, Changelog schreiben, committen, taggen
tools/check.js        Fragenkatalog prüfen (Struktur, beide Sprachen, Generatoren)
.githooks/commit-msg  erzwingt „vX.Y.Z: …“ in jeder Commit-Nachricht
```

---

## English

Patchfeld is a gamified learning app for the three-year German apprenticeship
**IT specialist for system integration** (Fachinformatiker/-in Systemintegration),
from year 1 to the final exam part 2. Open `index.html` (or `index.html?lang=en`)
in a browser – no build step, works offline. Progress is stored locally and can be
exported/imported as JSON. Every update is released as its own version
(`0.0.1 … 0.0.9 → 0.1.0 …`), visible in the commit message, git tag, changelog and
the in-app “What’s new” dialog. When hosted (e.g. GitHub Pages) the app updates
itself automatically.
