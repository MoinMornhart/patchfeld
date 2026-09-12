# Änderungsprotokoll

🇩🇪 Deutsch · [🇬🇧 English](CHANGELOG.en.md)

Neueste Einträge oben. Versionsschema: siehe [README.md](README.md).

<!-- EINTRÄGE -->

## [Patchfeld 0.2.4] – 2026-09-12
- Windows-Icon (build/icon.ico) wird von npm run graphics mit allen Größen erzeugt – der Installer-Build braucht keine eigene Umwandlung mehr
- Erste veröffentlichte Windows-Version mit KI-Mentor, fünf Kursen und Prüfungstrainer (enthält alle Änderungen aus 0.2.3)

## [Patchfeld 0.2.3] – 2026-09-12
- Patchfeld ist jetzt eine Windows-App (Electron) mit Installer – aufgebaut wie Codewerk
- KI-Mentor über dein Claude-Konto: fünf Kurse (1. Lehrjahr, 2. Lehrjahr · AP 1, 3. Lehrjahr · AP 2, Projekt & Fachgespräch, WiSo) mit Level 0–10, Tages-Sessions und Lernprofil
- Erklären und Machen: Der Mentor lädt echte IHK-Aufgaben aus dem Katalog oder eigene Fallstudien in den Arbeitsbereich, die App prüft Antworten sofort
- Prüfungstrainer mit allen 360 Aufgaben, Karteikasten, Fehlerbuch, Glossar und Prüfungssimulationen bleibt vollständig erhalten
- Automatische Updates über GitHub Releases, Skripte bump und release, Tests und Selbsttest, GitHub Actions
- Neues README mit Banner, Screenshots und Diagrammen auf Deutsch und Englisch, Changelog im Codewerk-Format

## [Patchfeld 0.2.2] – 2026-09-12
- Autoupdate für die lokale Datei: Hinweisleiste mit „Neue Version herunterladen“ direkt von GitHub
- Neue Startskripte start.cmd (Windows) und start.sh holen vor jedem Start per git pull die neueste Version
- Jedes Release wird automatisch nach GitHub gepusht (release.js --push)

## [Patchfeld 0.2.1] – 2026-09-12
- Veröffentlichung auf GitHub Pages: https://moinmornhart.github.io/patchfeld/
- Update-Prüfung nutzt standardmäßig die GitHub-Pages-Version – auch die lokale Datei meldet neue Versionen

## [Patchfeld 0.2.0] – 2026-09-11
- Linux-Administration auf 20 Fragen erweitert
- Neue Themen: Umleitungen in crontab, Sticky Bit, sudoers, /etc/fstab mit UUID, usermod -aG, SSH-Härtung, /etc/passwd und /etc/shadow, journalctl, Shell-Werkzeuge, cron-Ausdrücke, apt-Updates im Wartungsfenster, eigener systemd-Dienst, Fehlersuche nach Update
- Neue Rechenaufgaben mit Zufallswerten: umask zu Rechten, symbolisches chmod zu Oktalwert

## [Patchfeld 0.1.9] – 2026-09-11
- Active Directory & Rechte auf 20 Fragen erweitert
- Neue Themen: Kopieren vs. Verschieben und NTFS-Rechte, Loopback-Verarbeitung, DNS beim Domänenbeitritt, Gruppenbereiche, explizites Zulassen vs. geerbtes Verweigern, GPO-Fehlersuche, Fine-Grained Password Policies, Entra Connect, AD-Struktur, FSMO-Rollen, erster Domänencontroller, GPO-Rollout, Delegierung
- Neue Rechenaufgaben mit Zufallswerten: Kontosperrung aus Anmeldeprotokoll, Gruppen und Mitgliedschaften nach AGDLP

## [Patchfeld 0.1.8] – 2026-09-11
- Cloud & Hybridbetrieb auf 20 Fragen erweitert
- Neue Themen: Shared Responsibility nach Kompromittierung, NIST-Merkmale, Bereitstellungsmodelle, Entra Cloud Sync, Autoscaling über Verfügbarkeitszonen, CAL-Kombination, Reserved/Spot/On-Demand, Archiv-Speicher, Authentifizierungsvarianten im Hybridbetrieb, BYOL, Exit-Strategie, CLOUD Act
- Neue Rechenaufgaben mit Zufallswerten: monatliche Cloud-Rechnung, Lizenzierung pro Kern

## [Patchfeld 0.1.7] – 2026-09-11
- Skripting & SQL auf 20 Fragen erweitert
- Neue Themen: UPDATE ohne WHERE, Normalisierung und Anomalien, Datentypen, logische Auswertungsreihenfolge, cron, CSV-Benutzerimport per PowerShell, COUNT und NULL, Skriptvariablen und Exit-Codes, DELETE in Transaktionen, Unterabfragen, LIKE, Fremdschlüssel und ON DELETE, robuste Aufräumskripte
- Neue Rechenaufgaben mit Zufallswerten: Ergebniszeilen einer Abfrage zählen, WHILE-Schleife nachvollziehen

## [Patchfeld 0.1.6] – 2026-09-11
- Glossar auf 118 Fachbegriffe erweitert
- Neu u. a.: 802.1X, APIPA, BIA, CAB, CMDB, DIN 66399, DSFA, GFS, IPv6, LACP, MTBF/MTTR, OLA, OSPF, PoE, Projektantrag, PSP, RADIUS, Scrum, Kanban, SNMP, Syslog, Thin Provisioning, TLS, umask, VRRP, WPA3

## [Patchfeld 0.1.5] – 2026-09-11
- Präsentation & Fachgespräch auf 20 Fragen erweitert
- 9 neue Prüferfragen mit Musterlösung: halbiertes Budget, IPsec-Tunnel im Detail, Eigenleistung, Datenschutz und Betriebsrat, Zeitabweichung, unbekannte Fragen, Wirtschaftlichkeit, Nervosität, Ransomware-Szenario
- Neue Themen: genehmigungsfähige Projektthemen, Zeitnot in der Präsentation, überladene Folien, Inhalt des Projektantrags, Bewertung im Fachgespräch, Gliederung der Projektdokumentation

## [Patchfeld 0.1.4] – 2026-09-11
- Systemintegration & Rollout auf 20 Fragen erweitert
- Neue Themen: Parallelbetrieb, Windows Autopilot/Intune, Testarten, sichere Löschung von NVMe-SSDs, Softwareverteilung in Ringen, Übergabe an den Betrieb, WSUS-Update-Ringe, Dokumentationsarten, Außerbetriebnahme nach DIN 66399, Lizenzen beim PC-Tausch, Anwenderkommunikation, Inbetriebnahme-Checkliste, Big Bang vs. stufenweise Umstellung
- Neue Rechenaufgabe mit Zufallswerten: Rollout-Aufwand und -Dauer

## [Patchfeld 0.1.3] – 2026-09-11
- Projektmanagement & Wirtschaftlichkeit auf 20 Fragen erweitert
- Neue Themen: Projektmerkmale, magisches Dreieck, Stakeholder-Analyse, Kanban vs. Scrum, Risikobewertung, Ablauf der Nutzwertanalyse, TCO, Kostenvergleichsrechnung, Planungswerkzeuge, Soll-Ist-Vergleich mit Fertigstellungsgrad, Projektabschluss, Gesamt- vs. freier Puffer, Risikoanalyse einer Migration
- Neue Rechenaufgaben mit Zufallswerten: Amortisationsdauer, Netzplan mit SAZ, Gesamtpuffer und freiem Puffer

## [Patchfeld 0.1.2] – 2026-09-11
- Kaufmännische Grundlagen auf 20 Fragen erweitert
- Neue Themen: verspätete Annahme, Mahnverfahren, Nacherfüllung, Gewährleistung vs. Garantie und Beweislast, Rechtsformen, Ausbildungsvertrag nach BBiG, Lieferverzug und Deckungskauf, Zahlungs- und Lieferbedingungen, Leasing, qualitativer Angebotsvergleich, Beschaffungsprozess, Werk- vs. Dienstvertrag
- Neue Rechenaufgaben mit Zufallswerten: Angebotskalkulation bis zum Listenverkaufspreis, Skonto vs. Kontokorrentkredit; Verzugszinsen

## [Patchfeld 0.1.1] – 2026-09-11
- Datenschutz auf 20 Fragen erweitert
- Neue Themen: Rechtsgrundlagen nach Art. 6, Datenschutzbeauftragter (§ 38 BDSG), besondere Kategorien, Pseudonymisierung vs. Anonymisierung, Auskunftsersuchen, DSFA, Videoüberwachung, Data Privacy Framework, Verarbeitungsverzeichnis, Privacy by Default, Rollen nach DSGVO, Bußgeldrahmen, Löschkonzept, Datenschutz vs. Datensicherheit

## [Patchfeld 0.1.0] – 2026-09-11
- IT-Sicherheit auf 20 Fragen erweitert
- Neue Themen: Maximumprinzip (BSI 200-2), TLS-Zertifikat mit CSR, Patchmanagement nach CERT-Warnung, Firewall-Typen und Regelreihenfolge, Angriffsarten, Passwortspeicherung mit Salt, WPA3-Enterprise mit 802.1X, echte Zwei-Faktor-Verfahren, BSI-Passwortregeln, digitale Signatur, VPN-Varianten, Zertifikatsvertrauen
- Neue Rechenaufgaben mit Zufallswerten: Brute-Force-Dauer aus dem Schlüsselraum, Wochen-Backupvolumen mit Restore-Anzahl
- Zahleneingabe erkennt Tausendertrennzeichen jetzt je nach Sprache (1.234,5 bzw. 1,234.5)

## [Patchfeld 0.0.9] – 2026-09-11
- Ausfallsicherheit & Notfall auf 20 Fragen erweitert
- Neue Themen: LACP statt STP-Blockade, VRRP/HSRP, BSI-200-4-Begriffe, unveränderliche Backups, Aktiv/Aktiv-Kapazität, Backupfenster, Klima und Brandschutz, GFS, USV-Shutdown-Reihenfolge, Georedundanz, Wiederherstellungstests, BCMS-Aufbau, Single Points of Failure
- Neue Rechenaufgaben mit Zufallswerten: Verfügbarkeit serieller und paralleler Komponenten, Wochen-Backupvolumen inkrementell/differenziell

## [Patchfeld 0.0.8] – 2026-09-11
- Speicher & Virtualisierung auf 20 Fragen erweitert
- Neue Themen: RAID-5-Rebuild-Risiko, iSCSI (Initiator, Target, LUN), DAS/NFS/SMB/FC, Thin Provisioning, Datastore-Dimensionierung, Memory Ballooning, Container vs. VM, Deduplizierung und Tiering, Templates und Live-Migration, Snapshot-Konsolidierung, Hot-Spare-Rebuild
- Neue Rechenaufgaben mit Zufallswerten: Schreib-IOPS mit RAID-Write-Penalty, Thin-Überbuchung

## [Patchfeld 0.0.7] – 2026-09-11
- Netzwerkdienste & Routing auf 20 Fragen erweitert
- Neue Themen: DHCP-Relay und APIPA, DHCP-Bereich mit Ausschlüssen, DNS-TTL, Voice-VLAN, DHCP-Snooping, falsches Gateway, DNS-Einträge für Mailserver, Portweiterleitung, Routenarten, DNS-Auflösung, Fehlersuche von unten nach oben, 802.1Q-Trunk
- Neue Rechenaufgaben mit Zufallswerten: Longest Prefix Match in der Routingtabelle, VLSM-Aufteilung

## [Patchfeld 0.0.6] – 2026-09-11
- Netzwerkgrundlagen auf 20 Fragen erweitert
- Neue Themen: Cat 6A und Leitungslängen, MAC-Tabelle, Broadcast- und Kollisionsdomänen, IPv6 Link-local und SLAAC, RFC-1918-Adressen, Schleifen und STP, Schirmungsarten, strukturierte Verkabelung nach EN 50173, T568B-Belegung, Kapselung
- Neue Rechenaufgaben mit Zufallswerten: benötigte Hosts zu Präfix und Maske, IPv6-Kurzschreibweise; PoE-Budget

## [Patchfeld 0.0.5] – 2026-09-11
- IT-Service-Management auf 20 Fragen erweitert
- Neue Themen: Prioritätsmatrix, SLA/OLA/UC, Emergency Change mit ECAB, CMDB und CIs, Change- und Problem-Prozess, Eskalationsarten, Service Desk als SPOC, Syslog-Schweregrade, SNMP, Alarmmüdigkeit, Wissensdatenbank, Monitoring mit und ohne Agent
- Neue Rechenaufgabe mit Zufallswerten: MTTR/MTBF bzw. Erstlösungsquote und SLA-Erfüllung

## [Patchfeld 0.0.4] – 2026-09-11
- Arbeitsschutz & Support auf 20 Fragen erweitert
- Neue Themen: fünf Sicherheitsregeln der Elektrotechnik, DGUV V3, Sicherheitszeichen, Brandklassen, Heben im Rack, ESD-Maßnahmen, ElektroG und Datenlöschung, Vier-Ohren-Modell, Beschwerdegespräch, aktives Zuhören, Erste Hilfe, Unterweisung nach § 12 ArbSchG
- Neue Rechenaufgabe mit Zufallswerten: Arbeitszeit und gesetzliche Pausen (ArbZG/JArbSchG)

## [Patchfeld 0.0.3] – 2026-09-11
- Betriebssysteme auf 20 Fragen erweitert
- Neue Themen: fTPM/PTT, Windows-11-Anforderungen, UAC und Admin-Konten, Lizenzarten, Dienst-Starttypen, LTS-Distributionen, Registry, Wiederherstellungsoptionen, Remote-Administration, Bootkette, Patchmanagement mit Update-Ringen, Dual Boot mit BitLocker
- Neue Rechenaufgabe mit Zufallswerten: Partitionsgrößen in GiB; MBR-Grenze bei 512- und 4K-Sektoren

## [Patchfeld 0.0.2] – 2026-09-11
- IT-Systeme & Hardware auf 20 Fragen erweitert
- Neue Themen: Dual Channel, TPM 2.0, RAM-Bauformen, UEFI-Start, Monitore für Bildbearbeitung, TB vs. TiB, M.2/NVMe, Netzteildimensionierung, Drucktechniken, Bedarfsanalyse
- Neue Rechenaufgaben mit Zufallswerten: Stromkosten pro Jahr, Druckkosten pro Seite; Zahlensysteme binär/hex

## [Patchfeld 0.0.1] – 2026-09-11
- Grundgerüst mit allen Lernmechaniken: Runden (10 Fragen, 3 Leben), Leitner-Karteikasten, Fehlerbuch, Karteikarten, Glossar, Prüfungssimulationen AP 1 (30 Fragen/90 min) und AP 2 (40 Fragen/120 min)
- XP, Level, Ränge vom Azubi bis zum Systemarchitekten, Tagesziel, Tagesserie, Kombo-Multiplikator und Abzeichen
- Lernpfad als Patchfeld mit Aderfarben nach T568B, Statistik, Prüfungscountdown mit Tagesempfehlung
- 5 Beispielfragen je Bereich (18 Bereiche), Rechenaufgaben mit Zufallswerten (Subnetting, RAID, Verfügbarkeit, Übertragung, AfA, Kalkulation, USV, Netzplan, Nutzwertanalyse)
- Deutsch und Englisch, Dunkelmodus, JSON-Export/-Import, automatische Update-Prüfung, optionaler Offline-Betrieb als PWA
