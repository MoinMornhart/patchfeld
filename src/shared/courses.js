'use strict';

// The five courses ("mini apps"). Single source of truth for main process and renderer.
// `areas` are the catalog topics the mentor draws exam tasks from (src/renderer/catalog.js),
// `notes` tell the mentor what the course covers and how it relates to the IHK exams.
const COURSES = [
  {
    id: 'lj1',
    name: { de: '1. Lehrjahr', en: 'Year 1' },
    exam: 'AP 1',
    color: '#ec7a1c',
    ink: '#111111',
    areas: ['hw', 'bs', 'net', 'kfm', 'ergo'],
    notes: {
      de: 'Lernfelder 1–5 (Rahmenlehrplan 2020): LF 1 Unternehmen und eigene Rolle, LF 2 Arbeitsplätze nach Kundenwunsch ausstatten, LF 3 Clients in Netzwerke einbinden, LF 4 Schutzbedarfsanalyse im eigenen Arbeitsbereich, LF 5 Software zur Verwaltung von Daten anpassen. Schwerpunkte: Aufbau von IT-Systemen und Hardware, Betriebssysteme installieren und konfigurieren (Windows, Linux), Netzwerkgrundlagen (OSI/TCP-IP, IPv4/IPv6, Subnetting, Verkabelung und Normen, Switching), kaufmännische Grundlagen (Verträge, Angebotsvergleich, Kalkulation, Mängelrüge), Arbeitsschutz, ESD, Ergonomie, Kundenkommunikation im Support. Prüfungsrelevant für AP 1. Katalogbereiche: hw, bs, net, kfm, ergo.',
      en: 'Learning fields 1–5 (2020 framework curriculum): LF 1 the company and your role, LF 2 equipping workstations to customer requirements, LF 3 integrating clients into networks, LF 4 protection needs analysis, LF 5 adapting software for managing data. Focus: IT systems and hardware, installing and configuring operating systems (Windows, Linux), network fundamentals (OSI/TCP-IP, IPv4/IPv6, subnetting, cabling and standards, switching), business basics (contracts, comparing offers, costing, notice of defects), occupational safety, ESD, ergonomics, customer communication in support. Relevant for AP 1. Catalog topics: hw, bs, net, kfm, ergo.',
    },
  },
  {
    id: 'ap1',
    name: { de: '2. Lehrjahr · AP 1', en: 'Year 2 · AP 1' },
    exam: 'AP 1',
    color: '#2e9a4d',
    ink: '#ffffff',
    areas: ['dienste', 'ad', 'linux', 'speicher', 'sec', 'ds', 'sql'],
    notes: {
      de: 'Lernfelder 6–9: LF 6 Serviceanfragen bearbeiten, LF 7 Cyber-physische Systeme ergänzen, LF 8 Daten systemübergreifend bereitstellen, LF 9 Netzwerke und Dienste bereitstellen. Schwerpunkte: Clients und Server einbinden, DHCP, DNS, VLAN, Routing, NAT, Active Directory, Benutzer- und Rechteverwaltung, Gruppenrichtlinien, NTFS- und Freigaberechte, Linux-Administration, RAID, NAS/SAN, Virtualisierung, IT-Sicherheit (Schutzziele, Firewall, DMZ, Verschlüsselung, PKI, Backup, Ransomware), Datenschutz (DSGVO, Betroffenenrechte, Meldepflichten, AVV), Skripting und SQL. Schwerpunkt der Abschlussprüfung Teil 1 („Einrichten eines IT-gestützten Arbeitsplatzes“, 90 Minuten, 20 % der Gesamtnote). Katalogbereiche: dienste, ad, linux, speicher, sec, ds, sql.',
      en: 'Learning fields 6–9: LF 6 handling service requests, LF 7 extending cyber-physical systems, LF 8 providing data across systems, LF 9 providing networks and services. Focus: integrating clients and servers, DHCP, DNS, VLAN, routing, NAT, Active Directory, user and permission management, group policies, NTFS and share permissions, Linux administration, RAID, NAS/SAN, virtualisation, IT security (security goals, firewall, DMZ, encryption, PKI, backup, ransomware), data protection (GDPR, data subject rights, breach notification, DPA), scripting and SQL. Main focus of final exam part 1 ("Setting up an IT-supported workstation", 90 minutes, 20 % of the final grade). Catalog topics: dienste, ad, linux, speicher, sec, ds, sql.',
    },
  },
  {
    id: 'ap2',
    name: { de: '3. Lehrjahr · AP 2', en: 'Year 3 · AP 2' },
    exam: 'AP 2',
    color: '#2d62c6',
    ink: '#ffffff',
    areas: ['itsm', 'integ', 'cloud', 'ha', 'dienste', 'sec', 'net'],
    notes: {
      de: 'Lernfelder 10b–12b für Systemintegration: LF 10b Serverdienste bereitstellen und Administrationsaufgaben automatisieren, LF 11b Betrieb und Sicherheit vernetzter Systeme gewährleisten, LF 12b Kundenspezifische Systemintegration durchführen. Schwerpunkte: Servicekonzepte, ITIL, SLA, Ticketsysteme, Eskalation, Monitoring, Migration, Rollout, Inbetriebnahme, Dokumentation, Cloud- und Hybridbetrieb (IaaS/PaaS/SaaS, Lizenzmodelle, Betriebskosten), Netzwerkdesign und Ausfallsicherheit, USV, Redundanz, Notfallkonzept, RTO/RPO. Prüfungsteile der AP 2: „Konzeption und Administration von IT-Systemen“ und „Analyse und Entwicklung von Netzwerken“ (je 90 Minuten, je 10 %). Katalogbereiche: itsm, integ, cloud, ha sowie dienste, sec, net zur Vertiefung.',
      en: 'Learning fields 10b–12b for system integration: LF 10b providing server services and automating administration, LF 11b ensuring operation and security of networked systems, LF 12b carrying out customer-specific system integration. Focus: service concepts, ITIL, SLA, ticket systems, escalation, monitoring, migration, rollout, commissioning, documentation, cloud and hybrid operation (IaaS/PaaS/SaaS, licensing models, operating costs), network design and resilience, UPS, redundancy, contingency planning, RTO/RPO. AP 2 exam parts: "Design and administration of IT systems" and "Analysis and development of networks" (90 minutes and 10 % each). Catalog topics: itsm, integ, cloud, ha plus dienste, sec, net for deepening.',
    },
  },
  {
    id: 'projekt',
    name: { de: 'Projekt & Fachgespräch', en: 'Project & interview' },
    exam: 'AP 2',
    color: '#b0703f',
    ink: '#ffffff',
    areas: ['pm', 'fg', 'integ'],
    notes: {
      de: 'Betriebliche Projektarbeit der AP 2 (50 % der Gesamtnote): Projektantrag, 40 Stunden Projektzeit, Projektdokumentation (ca. 15 Seiten plus Anlagen), 15 Minuten Präsentation, 15 Minuten Fachgespräch. Schwerpunkte: Projektmanagement (Lasten- und Pflichtenheft, Projektstrukturplan, Netzplan, kritischer Pfad, Meilensteine, agiles Vorgehen), Wirtschaftlichkeit (Nutzwertanalyse, Kostenvergleich, Amortisation, TCO), Qualitätssicherung und Tests, Präsentationstechnik und typische Prüferfragen. Wenn der Lernende ein eigenes Projekt hat, arbeite mit genau diesem Projekt. Katalogbereiche: pm, fg, integ.',
      en: 'Company project of AP 2 (50 % of the final grade): project application, 40 hours of project time, documentation (about 15 pages plus appendices), 15-minute presentation, 15-minute expert interview. Focus: project management (requirements and functional specification, work breakdown structure, network plan, critical path, milestones, agile methods), economic analysis (weighted scoring, cost comparison, payback, TCO), quality assurance and testing, presentation technique and typical examiner questions. If the learner has their own project, work with exactly that project. Catalog topics: pm, fg, integ.',
    },
  },
  {
    id: 'wiso',
    name: { de: 'WiSo', en: 'Economics & social studies' },
    exam: 'AP 2',
    color: '#c9ccd1',
    ink: '#111111',
    areas: ['kfm', 'ds', 'ergo', 'pm'],
    notes: {
      de: 'Wirtschafts- und Sozialkunde (Teil der AP 2, 60 Minuten, 10 %): Berufsausbildung (BBiG, Ausbildungsvertrag, Rechte und Pflichten, Probezeit, Kündigung), Arbeitsrecht (Arbeitsvertrag, Arbeitszeitgesetz, Jugendarbeitsschutz, Kündigungsschutz, Zeugnis), Sozialversicherung (fünf Säulen, Beitragsverteilung), Tarifrecht und Mitbestimmung (Tarifvertrag, Betriebsrat, JAV, Betriebsvereinbarung), Rechtsformen und Unternehmensorganisation, Wirtschaftskreislauf, Markt und Preisbildung, Vertragsrecht, Arbeitssicherheit und Umweltschutz, Datenschutz im Betrieb. Der Katalog deckt nur einen Teil ab – für die übrigen Themen schreibst du eigene Aufgaben mit set_exercise. Katalogbereiche: kfm, ds, ergo, pm.',
      en: 'Economics and social studies (part of AP 2, 60 minutes, 10 %): vocational training (BBiG, training contract, rights and duties, probation, termination), labour law (employment contract, working hours act, youth protection, dismissal protection, reference letter), social insurance (five pillars, contribution split), collective bargaining and co-determination (collective agreement, works council, youth representation, works agreement), legal forms and company organisation, economic cycle, markets and pricing, contract law, safety and environmental protection, data protection in the company. The catalog covers only part of this – write your own tasks with set_exercise for the rest. Catalog topics: kfm, ds, ergo, pm.',
    },
  },
];

function courseById(id) {
  return COURSES.find((course) => course.id === id) || null;
}

function courseName(course, lang) {
  return course.name[lang === 'en' ? 'en' : 'de'];
}

module.exports = { COURSES, courseById, courseName };
