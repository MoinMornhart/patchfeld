# Changelog

Alle Änderungen an Patchfeld. Versionsschema: jede Stelle läuft von 0 bis 9 –
`0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`. Einträge werden von `tools/release.js`
automatisch ergänzt (Deutsch und Englisch).

All changes to Patchfeld. Version scheme: every digit runs from 0 to 9 –
`0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`. Entries are added automatically by
`tools/release.js` (German and English).

<!-- releases -->

## 0.2.2 – 2026-09-12

- Autoupdate für die lokale Datei: Hinweisleiste mit „Neue Version herunterladen“ direkt von GitHub
- Neue Startskripte start.cmd (Windows) und start.sh holen vor jedem Start per git pull die neueste Version
- Jedes Release wird automatisch nach GitHub gepusht (release.js --push)

**English**

- Autoupdate for the local file: banner with "Download new version" straight from GitHub
- New launchers start.cmd (Windows) and start.sh fetch the latest version via git pull before every start
- Every release is pushed to GitHub automatically (release.js --push)

## 0.2.1 – 2026-09-12

- Veröffentlichung auf GitHub Pages: https://moinmornhart.github.io/patchfeld/
- Update-Prüfung nutzt standardmäßig die GitHub-Pages-Version – auch die lokale Datei meldet neue Versionen

**English**

- Published on GitHub Pages: https://moinmornhart.github.io/patchfeld/
- Update check uses the GitHub Pages version by default – the local file also reports new versions

## 0.2.0 – 2026-09-11

- Linux-Administration auf 20 Fragen erweitert
- Neue Themen: Umleitungen in crontab, Sticky Bit, sudoers, /etc/fstab mit UUID, usermod -aG, SSH-Härtung, /etc/passwd und /etc/shadow, journalctl, Shell-Werkzeuge, cron-Ausdrücke, apt-Updates im Wartungsfenster, eigener systemd-Dienst, Fehlersuche nach Update
- Neue Rechenaufgaben mit Zufallswerten: umask zu Rechten, symbolisches chmod zu Oktalwert

**English**

- Linux administration extended to 20 questions
- New topics: redirection in crontab, sticky bit, sudoers, /etc/fstab with UUID, usermod -aG, SSH hardening, /etc/passwd and /etc/shadow, journalctl, shell tools, cron expressions, apt updates in a maintenance window, custom systemd service, troubleshooting after an update
- New random calculations: umask to permissions, symbolic chmod to octal

## 0.1.9 – 2026-09-11

- Active Directory & Rechte auf 20 Fragen erweitert
- Neue Themen: Kopieren vs. Verschieben und NTFS-Rechte, Loopback-Verarbeitung, DNS beim Domänenbeitritt, Gruppenbereiche, explizites Zulassen vs. geerbtes Verweigern, GPO-Fehlersuche, Fine-Grained Password Policies, Entra Connect, AD-Struktur, FSMO-Rollen, erster Domänencontroller, GPO-Rollout, Delegierung
- Neue Rechenaufgaben mit Zufallswerten: Kontosperrung aus Anmeldeprotokoll, Gruppen und Mitgliedschaften nach AGDLP

**English**

- Active Directory & permissions extended to 20 questions
- New topics: copying vs moving and NTFS permissions, loopback processing, DNS for domain join, group scopes, explicit allow vs inherited deny, GPO troubleshooting, fine-grained password policies, Entra Connect, AD structure, FSMO roles, first domain controller, GPO rollout, delegation
- New random calculations: account lockout from a logon log, groups and memberships per AGDLP

## 0.1.8 – 2026-09-11

- Cloud & Hybridbetrieb auf 20 Fragen erweitert
- Neue Themen: Shared Responsibility nach Kompromittierung, NIST-Merkmale, Bereitstellungsmodelle, Entra Cloud Sync, Autoscaling über Verfügbarkeitszonen, CAL-Kombination, Reserved/Spot/On-Demand, Archiv-Speicher, Authentifizierungsvarianten im Hybridbetrieb, BYOL, Exit-Strategie, CLOUD Act
- Neue Rechenaufgaben mit Zufallswerten: monatliche Cloud-Rechnung, Lizenzierung pro Kern

**English**

- Cloud & hybrid operation extended to 20 questions
- New topics: shared responsibility after a compromise, NIST characteristics, deployment models, Entra Cloud Sync, autoscaling across availability zones, combining CALs, reserved/spot/on-demand, archive storage, hybrid authentication options, BYOL, exit strategy, CLOUD Act
- New random calculations: monthly cloud bill, per-core licensing

## 0.1.7 – 2026-09-11

- Skripting & SQL auf 20 Fragen erweitert
- Neue Themen: UPDATE ohne WHERE, Normalisierung und Anomalien, Datentypen, logische Auswertungsreihenfolge, cron, CSV-Benutzerimport per PowerShell, COUNT und NULL, Skriptvariablen und Exit-Codes, DELETE in Transaktionen, Unterabfragen, LIKE, Fremdschlüssel und ON DELETE, robuste Aufräumskripte
- Neue Rechenaufgaben mit Zufallswerten: Ergebniszeilen einer Abfrage zählen, WHILE-Schleife nachvollziehen

**English**

- Scripting & SQL extended to 20 questions
- New topics: UPDATE without WHERE, normalisation and anomalies, data types, logical evaluation order, cron, CSV user import with PowerShell, COUNT and NULL, script variables and exit codes, DELETE in transactions, subqueries, LIKE, foreign keys and ON DELETE, robust cleanup scripts
- New random calculations: count result rows of a query, trace a WHILE loop

## 0.1.6 – 2026-09-11

- Glossar auf 118 Fachbegriffe erweitert
- Neu u. a.: 802.1X, APIPA, BIA, CAB, CMDB, DIN 66399, DSFA, GFS, IPv6, LACP, MTBF/MTTR, OLA, OSPF, PoE, Projektantrag, PSP, RADIUS, Scrum, Kanban, SNMP, Syslog, Thin Provisioning, TLS, umask, VRRP, WPA3

**English**

- Glossary extended to 118 terms
- New incl.: 802.1X, APIPA, BIA, CAB, CMDB, DIN 66399, DPIA, GFS, IPv6, LACP, MTBF/MTTR, OLA, OSPF, PoE, project application, WBS, RADIUS, Scrum, Kanban, SNMP, syslog, thin provisioning, TLS, umask, VRRP, WPA3

## 0.1.5 – 2026-09-11

- Präsentation & Fachgespräch auf 20 Fragen erweitert
- 9 neue Prüferfragen mit Musterlösung: halbiertes Budget, IPsec-Tunnel im Detail, Eigenleistung, Datenschutz und Betriebsrat, Zeitabweichung, unbekannte Fragen, Wirtschaftlichkeit, Nervosität, Ransomware-Szenario
- Neue Themen: genehmigungsfähige Projektthemen, Zeitnot in der Präsentation, überladene Folien, Inhalt des Projektantrags, Bewertung im Fachgespräch, Gliederung der Projektdokumentation

**English**

- Presentation & expert interview extended to 20 questions
- 9 new examiner questions with model answers: halved budget, IPsec tunnel in detail, own contribution, data protection and works council, schedule deviation, unknown questions, economic viability, nerves, ransomware scenario
- New topics: approvable project topics, running out of time, overloaded slides, content of the project application, assessment in the interview, structure of the project documentation

## 0.1.4 – 2026-09-11

- Systemintegration & Rollout auf 20 Fragen erweitert
- Neue Themen: Parallelbetrieb, Windows Autopilot/Intune, Testarten, sichere Löschung von NVMe-SSDs, Softwareverteilung in Ringen, Übergabe an den Betrieb, WSUS-Update-Ringe, Dokumentationsarten, Außerbetriebnahme nach DIN 66399, Lizenzen beim PC-Tausch, Anwenderkommunikation, Inbetriebnahme-Checkliste, Big Bang vs. stufenweise Umstellung
- Neue Rechenaufgabe mit Zufallswerten: Rollout-Aufwand und -Dauer

**English**

- System integration & rollout extended to 20 questions
- New topics: parallel operation, Windows Autopilot/Intune, test types, secure erasure of NVMe SSDs, ring-based software distribution, handover to operations, WSUS update rings, documentation types, decommissioning per DIN 66399, licences when replacing PCs, user communication, commissioning checklist, big bang vs phased switchover
- New random calculation: rollout effort and duration

## 0.1.3 – 2026-09-11

- Projektmanagement & Wirtschaftlichkeit auf 20 Fragen erweitert
- Neue Themen: Projektmerkmale, magisches Dreieck, Stakeholder-Analyse, Kanban vs. Scrum, Risikobewertung, Ablauf der Nutzwertanalyse, TCO, Kostenvergleichsrechnung, Planungswerkzeuge, Soll-Ist-Vergleich mit Fertigstellungsgrad, Projektabschluss, Gesamt- vs. freier Puffer, Risikoanalyse einer Migration
- Neue Rechenaufgaben mit Zufallswerten: Amortisationsdauer, Netzplan mit SAZ, Gesamtpuffer und freiem Puffer

**English**

- Project management & economics extended to 20 questions
- New topics: project characteristics, magic triangle, stakeholder analysis, Kanban vs Scrum, risk assessment, steps of a weighted scoring model, TCO, cost comparison, planning tools, plan vs actual with completion rate, project closure, total vs free float, risk analysis of a migration
- New random calculations: payback period, network plan with latest start, total and free float

## 0.1.2 – 2026-09-11

- Kaufmännische Grundlagen auf 20 Fragen erweitert
- Neue Themen: verspätete Annahme, Mahnverfahren, Nacherfüllung, Gewährleistung vs. Garantie und Beweislast, Rechtsformen, Ausbildungsvertrag nach BBiG, Lieferverzug und Deckungskauf, Zahlungs- und Lieferbedingungen, Leasing, qualitativer Angebotsvergleich, Beschaffungsprozess, Werk- vs. Dienstvertrag
- Neue Rechenaufgaben mit Zufallswerten: Angebotskalkulation bis zum Listenverkaufspreis, Skonto vs. Kontokorrentkredit; Verzugszinsen

**English**

- Business basics extended to 20 questions
- New topics: late acceptance, dunning procedure, supplementary performance, warranty vs guarantee and burden of proof, legal forms, training contract under BBiG, late delivery and cover purchase, payment and delivery terms, leasing, qualitative comparison of offers, procurement process, contract for work vs service contract
- New random calculations: sales price calculation up to list price, cash discount vs overdraft; default interest

## 0.1.1 – 2026-09-11

- Datenschutz auf 20 Fragen erweitert
- Neue Themen: Rechtsgrundlagen nach Art. 6, Datenschutzbeauftragter (§ 38 BDSG), besondere Kategorien, Pseudonymisierung vs. Anonymisierung, Auskunftsersuchen, DSFA, Videoüberwachung, Data Privacy Framework, Verarbeitungsverzeichnis, Privacy by Default, Rollen nach DSGVO, Bußgeldrahmen, Löschkonzept, Datenschutz vs. Datensicherheit

**English**

- Data protection extended to 20 questions
- New topics: legal bases under Art. 6, data protection officer (§ 38 BDSG), special categories, pseudonymisation vs anonymisation, access requests, DPIA, video surveillance, Data Privacy Framework, record of processing, privacy by default, GDPR roles, fine ranges, deletion concept, data protection vs data security

## 0.1.0 – 2026-09-11

- IT-Sicherheit auf 20 Fragen erweitert
- Neue Themen: Maximumprinzip (BSI 200-2), TLS-Zertifikat mit CSR, Patchmanagement nach CERT-Warnung, Firewall-Typen und Regelreihenfolge, Angriffsarten, Passwortspeicherung mit Salt, WPA3-Enterprise mit 802.1X, echte Zwei-Faktor-Verfahren, BSI-Passwortregeln, digitale Signatur, VPN-Varianten, Zertifikatsvertrauen
- Neue Rechenaufgaben mit Zufallswerten: Brute-Force-Dauer aus dem Schlüsselraum, Wochen-Backupvolumen mit Restore-Anzahl
- Zahleneingabe erkennt Tausendertrennzeichen jetzt je nach Sprache (1.234,5 bzw. 1,234.5)

**English**

- IT security extended to 20 questions
- New topics: maximum principle (BSI 200-2), TLS certificate with CSR, patch management after a CERT warning, firewall types and rule order, attack types, password storage with salt, WPA3-Enterprise with 802.1X, genuine two-factor methods, BSI password rules, digital signature, VPN variants, certificate trust
- New random calculations: brute-force time from key space, weekly backup volume with restore count
- Number input now recognises thousands separators per language (1.234,5 or 1,234.5)

## 0.0.9 – 2026-09-11

- Ausfallsicherheit & Notfall auf 20 Fragen erweitert
- Neue Themen: LACP statt STP-Blockade, VRRP/HSRP, BSI-200-4-Begriffe, unveränderliche Backups, Aktiv/Aktiv-Kapazität, Backupfenster, Klima und Brandschutz, GFS, USV-Shutdown-Reihenfolge, Georedundanz, Wiederherstellungstests, BCMS-Aufbau, Single Points of Failure
- Neue Rechenaufgaben mit Zufallswerten: Verfügbarkeit serieller und paralleler Komponenten, Wochen-Backupvolumen inkrementell/differenziell

**English**

- Resilience & contingency extended to 20 questions
- New topics: LACP instead of STP blocking, VRRP/HSRP, BSI 200-4 terms, immutable backups, active/active capacity, backup window, climate and fire protection, GFS, UPS shutdown order, georedundancy, restore tests, setting up a BCMS, single points of failure
- New random calculations: availability of serial and parallel components, weekly backup volume incremental/differential

## 0.0.8 – 2026-09-11

- Speicher & Virtualisierung auf 20 Fragen erweitert
- Neue Themen: RAID-5-Rebuild-Risiko, iSCSI (Initiator, Target, LUN), DAS/NFS/SMB/FC, Thin Provisioning, Datastore-Dimensionierung, Memory Ballooning, Container vs. VM, Deduplizierung und Tiering, Templates und Live-Migration, Snapshot-Konsolidierung, Hot-Spare-Rebuild
- Neue Rechenaufgaben mit Zufallswerten: Schreib-IOPS mit RAID-Write-Penalty, Thin-Überbuchung

**English**

- Storage & virtualisation extended to 20 questions
- New topics: RAID 5 rebuild risk, iSCSI (initiator, target, LUN), DAS/NFS/SMB/FC, thin provisioning, datastore sizing, memory ballooning, containers vs VMs, deduplication and tiering, templates and live migration, snapshot consolidation, hot spare rebuild
- New random calculations: write IOPS with RAID write penalty, thin overcommitment

## 0.0.7 – 2026-09-11

- Netzwerkdienste & Routing auf 20 Fragen erweitert
- Neue Themen: DHCP-Relay und APIPA, DHCP-Bereich mit Ausschlüssen, DNS-TTL, Voice-VLAN, DHCP-Snooping, falsches Gateway, DNS-Einträge für Mailserver, Portweiterleitung, Routenarten, DNS-Auflösung, Fehlersuche von unten nach oben, 802.1Q-Trunk
- Neue Rechenaufgaben mit Zufallswerten: Longest Prefix Match in der Routingtabelle, VLSM-Aufteilung

**English**

- Network services & routing extended to 20 questions
- New topics: DHCP relay and APIPA, DHCP scope with exclusions, DNS TTL, voice VLAN, DHCP snooping, wrong gateway, DNS records for a mail server, port forwarding, route types, DNS resolution, bottom-up troubleshooting, 802.1Q trunk
- New random calculations: longest prefix match in a routing table, VLSM allocation

## 0.0.6 – 2026-09-11

- Netzwerkgrundlagen auf 20 Fragen erweitert
- Neue Themen: Cat 6A und Leitungslängen, MAC-Tabelle, Broadcast- und Kollisionsdomänen, IPv6 Link-local und SLAAC, RFC-1918-Adressen, Schleifen und STP, Schirmungsarten, strukturierte Verkabelung nach EN 50173, T568B-Belegung, Kapselung
- Neue Rechenaufgaben mit Zufallswerten: benötigte Hosts zu Präfix und Maske, IPv6-Kurzschreibweise; PoE-Budget

**English**

- Network fundamentals extended to 20 questions
- New topics: Cat 6A and link lengths, MAC table, broadcast and collision domains, IPv6 link-local and SLAAC, RFC 1918 addresses, loops and STP, shielding types, structured cabling per EN 50173, T568B pin-out, encapsulation
- New random calculations: required hosts to prefix and mask, IPv6 short notation; PoE budget

## 0.0.5 – 2026-09-11

- IT-Service-Management auf 20 Fragen erweitert
- Neue Themen: Prioritätsmatrix, SLA/OLA/UC, Emergency Change mit ECAB, CMDB und CIs, Change- und Problem-Prozess, Eskalationsarten, Service Desk als SPOC, Syslog-Schweregrade, SNMP, Alarmmüdigkeit, Wissensdatenbank, Monitoring mit und ohne Agent
- Neue Rechenaufgabe mit Zufallswerten: MTTR/MTBF bzw. Erstlösungsquote und SLA-Erfüllung

**English**

- IT service management extended to 20 questions
- New topics: priority matrix, SLA/OLA/UC, emergency change with ECAB, CMDB and CIs, change and problem process, escalation types, service desk as SPOC, syslog severities, SNMP, alert fatigue, knowledge base, agent-based vs agentless monitoring
- New random calculation: MTTR/MTBF or first contact resolution and SLA compliance

## 0.0.4 – 2026-09-11

- Arbeitsschutz & Support auf 20 Fragen erweitert
- Neue Themen: fünf Sicherheitsregeln der Elektrotechnik, DGUV V3, Sicherheitszeichen, Brandklassen, Heben im Rack, ESD-Maßnahmen, ElektroG und Datenlöschung, Vier-Ohren-Modell, Beschwerdegespräch, aktives Zuhören, Erste Hilfe, Unterweisung nach § 12 ArbSchG
- Neue Rechenaufgabe mit Zufallswerten: Arbeitszeit und gesetzliche Pausen (ArbZG/JArbSchG)

**English**

- Safety & support extended to 20 questions
- New topics: five electrical safety rules, DGUV V3 testing, safety signs, fire classes, lifting in racks, ESD measures, ElektroG and data deletion, four-sides model, complaint handling, active listening, first aid, safety instruction per § 12 ArbSchG
- New random calculation: working time and statutory breaks (ArbZG/JArbSchG)

## 0.0.3 – 2026-09-11

- Betriebssysteme auf 20 Fragen erweitert
- Neue Themen: fTPM/PTT, Windows-11-Anforderungen, UAC und Admin-Konten, Lizenzarten, Dienst-Starttypen, LTS-Distributionen, Registry, Wiederherstellungsoptionen, Remote-Administration, Bootkette, Patchmanagement mit Update-Ringen, Dual Boot mit BitLocker
- Neue Rechenaufgabe mit Zufallswerten: Partitionsgrößen in GiB; MBR-Grenze bei 512- und 4K-Sektoren

**English**

- Operating systems extended to 20 questions
- New topics: fTPM/PTT, Windows 11 requirements, UAC and admin accounts, licence types, service startup types, LTS distributions, registry, recovery options, remote administration, boot chain, patch management with update rings, dual boot with BitLocker
- New random calculation: partition sizes in GiB; MBR limit with 512-byte and 4K sectors

## 0.0.2 – 2026-09-11

- IT-Systeme & Hardware auf 20 Fragen erweitert
- Neue Themen: Dual Channel, TPM 2.0, RAM-Bauformen, UEFI-Start, Monitore für Bildbearbeitung, TB vs. TiB, M.2/NVMe, Netzteildimensionierung, Drucktechniken, Bedarfsanalyse
- Neue Rechenaufgaben mit Zufallswerten: Stromkosten pro Jahr, Druckkosten pro Seite; Zahlensysteme binär/hex

**English**

- IT systems & hardware extended to 20 questions
- New topics: dual channel, TPM 2.0, RAM form factors, UEFI start-up, monitors for image editing, TB vs TiB, M.2/NVMe, PSU sizing, printing technologies, needs analysis
- New random calculations: annual power cost, cost per printed page; binary/hex number systems

## 0.0.1 – 2026-09-11

- Grundgerüst mit allen Lernmechaniken: Runden (10 Fragen, 3 Leben), Leitner-Karteikasten, Fehlerbuch, Karteikarten, Glossar, Prüfungssimulationen AP 1 (30 Fragen/90 min) und AP 2 (40 Fragen/120 min)
- XP, Level, Ränge vom Azubi bis zum Systemarchitekten, Tagesziel, Tagesserie, Kombo-Multiplikator und Abzeichen
- Lernpfad als Patchfeld mit Aderfarben nach T568B, Statistik, Prüfungscountdown mit Tagesempfehlung
- 5 Beispielfragen je Bereich (18 Bereiche), Rechenaufgaben mit Zufallswerten (Subnetting, RAID, Verfügbarkeit, Übertragung, AfA, Kalkulation, USV, Netzplan, Nutzwertanalyse)
- Deutsch und Englisch, Dunkelmodus, JSON-Export/-Import, automatische Update-Prüfung, optionaler Offline-Betrieb als PWA

**English**

- Base app with all learning mechanics: rounds (10 questions, 3 lives), Leitner box, mistake log, flashcards, glossary, exam simulations AP 1 (30 questions/90 min) and AP 2 (40 questions/120 min)
- XP, levels, ranks from apprentice to systems architect, daily goal, streak, combo multiplier and badges
- Learning path as a patch panel in T568B wire colours, statistics, exam countdown with daily recommendation
- 5 sample questions per topic (18 topics), calculation tasks with random values (subnetting, RAID, availability, transfer, depreciation, costing, UPS, network plan, weighted scoring)
- German and English, dark mode, JSON export/import, automatic update check, optional offline use as a PWA

