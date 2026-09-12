# Fragenformat

Alle Fragen stehen in `src/renderer/catalog.js`, je Bereich in einem eigenen Abschnitt mit
dem Kommentar `/* ===== BEREICH:<id> – … ===== */`. Jede Frage ist ein Objekt in
`Q.push(...)`. Nach jeder Änderung: `npm run check` und `npm test`.

Der Katalog wird dreifach genutzt: vom Prüfungstrainer (`trainer.html`), vom Arbeitsbereich
der Kurse (`app.js`) und vom Mentor im Hauptprozess (`src/main/catalog.js`, Werkzeug
`load_exam_task`). Instanziierung, Bewertung und Darstellung stecken in `src/renderer/engine.js`.

## Gemeinsame Felder

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `id` | ja | `<bereich>-<nr>`, z. B. `net-07`. Nie wiederverwenden oder umnummerieren – der Lernfortschritt hängt an der ID. |
| `a` | ja | Bereich (`hw`, `bs`, `net`, `kfm`, `ergo`, `dienste`, `ad`, `linux`, `speicher`, `sec`, `ds`, `sql`, `itsm`, `integ`, `cloud`, `ha`, `pm`, `fg`). Lehrjahr, Lernfeld und Prüfungsbezug kommen aus `AREAS`. |
| `t` | ja | Typ: `sc`, `mc`, `in`, `match`, `order`, `open` |
| `de`, `en` | ja | Texte in beiden Sprachen, **gleiche Struktur** (gleich viele Optionen, Paare, Schritte) |

Textfelder in `de`/`en`:

| Feld | Bedeutung |
|---|---|
| `s` | Betriebliche Situation (Handlungssituation wie in der IHK-Prüfung) |
| `q` | Die eigentliche Aufgabe |
| `e` | Warum die Lösung richtig ist (1–3 Sätze) |
| `n` | Warum die **naheliegendste** falsche Antwort nicht passt |

## Typen

```js
// Single Choice – c = Index der richtigen Option (Optionen werden in der App gemischt)
{id:'net-06', a:'net', t:'sc', c:0, de:{s, q, o:['richtig','falsch','falsch','falsch'], e, n}, en:{…}}

// Mehrfachauswahl – c = Array der richtigen Indizes (mind. 1, nicht alle)
{id:'sec-06', a:'sec', t:'mc', c:[0,2], de:{s, q, o:[…], e, n}, en:{…}}

// Zuordnung – p = Paare [links, rechts], rechte Seiten eindeutig, 3–6 Paare
{id:'dienste-06', a:'dienste', t:'match', de:{s, q, p:[['SSH','22/TCP'], …], e, n}, en:{…}}

// Reihenfolge – o = Schritte in RICHTIGER Reihenfolge, 3–9 Schritte
{id:'itsm-06', a:'itsm', t:'order', de:{s, q, o:['Schritt 1', …], e, n}, en:{…}}

// Eingabe/Rechnen mit festen Werten – f = Felder mit Lösung, l = Beschriftungen je Sprache
{id:'kfm-06', a:'kfm', t:'in', f:[{v:1234.5, tol:0.05, u:'€'}], de:{s, q, l:['Bezugspreis'], e, n}, en:{…, l:['Landed cost']}}
//   v als Zahl → numerischer Vergleich mit Toleranz tol; v als Text → Textvergleich
//   (Leerzeichen, Groß-/Kleinschreibung und führendes „/“ werden ignoriert, z. B. IP-Adressen, „/26“)

// Offene Frage (Fachgespräch) – m = Musterlösung, k = Stichpunkte zur Selbstkontrolle
{id:'fg-06', a:'fg', t:'open', de:{s, q, m:'• …\n• …', k:['Punkt 1','Punkt 2']}, en:{…}}

// Rechenaufgabe mit Zufallswerten – Generator aus GEN (Kern-Skript)
{id:'net-07', a:'net', gen:'subnetHost'}
```

Optionale Felder in `de`/`en`: `code` (Codeblock, z. B. Pseudocode oder Konfiguration)
und `tb` (Tabelle: `{h:['Spalte',…], r:[['Wert',…],…]}`).

## Generatoren

Ein Generator in `GEN` ist eine Funktion `(L) => ({t:'in', s, q, f:[{l, v, tol, u}], e, n, code?, tb?})`,
die bei jedem Aufruf neue Zufallswerte liefert. Texte über `tx(L, de, en)`, Zahlen über
`fmt(n, dezimalen, L)` bzw. `eur(n, L)`. Die Erklärung `e` rechnet den Lösungsweg mit
den konkreten Zahlen vor. `scripts/check.js` ruft jeden Generator 300-mal pro Sprache auf,
`test/catalog.test.js` prüft zusätzlich, dass jede Aufgabe ihre eigene Lösung als richtig bewertet.

## Qualitätsregeln

1. **Handlungsorientiert:** Jede Frage beginnt mit einer betrieblichen Situation
   (Kunde, Abteilung, konkretes Problem) – keine reine Definitionsabfrage.
2. **IHK-Niveau:** Formulierungen und Schwierigkeit wie in AP 1/AP 2 für FISI.
3. **Plausible Distraktoren:** Falsche Optionen sind typische Denkfehler, keine Scherzantworten.
   Das Feld `n` erklärt den verlockendsten davon.
4. **Fachlich korrekt und aktuell:** Stand der Technik und Rechtslage (DSGVO, BGB/HGB, ITIL 4,
   BSI-Standards). Bei Rechenaufgaben Rundung und Einheit in der Aufgabe festlegen.
5. **Keine Positionshinweise:** Formulierungen wie „alle genannten“ oder „A und B“ vermeiden –
   Optionen werden gemischt.
6. **Beide Sprachen:** Englisch ist eine fachlich saubere Übersetzung, deutsche Fachbegriffe
   ohne Entsprechung (Lastenheft, Werkvertrag) werden in Klammern mitgeführt.
