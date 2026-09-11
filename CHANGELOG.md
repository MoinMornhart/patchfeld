# Changelog

Alle Änderungen an Patchfeld. Versionsschema: jede Stelle läuft von 0 bis 9 –
`0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`. Einträge werden von `tools/release.js`
automatisch ergänzt (Deutsch und Englisch).

All changes to Patchfeld. Version scheme: every digit runs from 0 to 9 –
`0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0`. Entries are added automatically by
`tools/release.js` (German and English).

<!-- releases -->

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

