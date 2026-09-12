# Changelog

[🇩🇪 Deutsch](CHANGELOG.md) · 🇬🇧 English

Newest entries first. Versioning scheme: see [README.en.md](README.en.md).

<!-- ENTRIES -->

## [Patchfeld 0.2.3] – 2026-09-12
- Patchfeld is now a Windows app (Electron) with an installer – built like Codewerk
- AI mentor through your Claude account: five courses (year 1, year 2 · AP 1, year 3 · AP 2, project & interview, WiSo) with levels 0–10, daily sessions and a learning profile
- Explaining and doing: the mentor loads real IHK tasks from the catalog or its own case studies into the work area, the app checks answers instantly
- The exam trainer with all 360 tasks, Leitner box, mistake log, glossary and exam simulations is fully kept
- Automatic updates through GitHub Releases, bump and release scripts, tests and self-test, GitHub Actions
- New README with banner, screenshots and diagrams in German and English, changelog in Codewerk format

## [Patchfeld 0.2.2] – 2026-09-12
- Autoupdate for the local file: banner with "Download new version" straight from GitHub
- New launchers start.cmd (Windows) and start.sh fetch the latest version via git pull before every start
- Every release is pushed to GitHub automatically (release.js --push)

## [Patchfeld 0.2.1] – 2026-09-12
- Published on GitHub Pages: https://moinmornhart.github.io/patchfeld/
- Update check uses the GitHub Pages version by default – the local file also reports new versions

## [Patchfeld 0.2.0] – 2026-09-11
- Linux administration extended to 20 questions
- New topics: redirection in crontab, sticky bit, sudoers, /etc/fstab with UUID, usermod -aG, SSH hardening, /etc/passwd and /etc/shadow, journalctl, shell tools, cron expressions, apt updates in a maintenance window, custom systemd service, troubleshooting after an update
- New random calculations: umask to permissions, symbolic chmod to octal

## [Patchfeld 0.1.9] – 2026-09-11
- Active Directory & permissions extended to 20 questions
- New topics: copying vs moving and NTFS permissions, loopback processing, DNS for domain join, group scopes, explicit allow vs inherited deny, GPO troubleshooting, fine-grained password policies, Entra Connect, AD structure, FSMO roles, first domain controller, GPO rollout, delegation
- New random calculations: account lockout from a logon log, groups and memberships per AGDLP

## [Patchfeld 0.1.8] – 2026-09-11
- Cloud & hybrid operation extended to 20 questions
- New topics: shared responsibility after a compromise, NIST characteristics, deployment models, Entra Cloud Sync, autoscaling across availability zones, combining CALs, reserved/spot/on-demand, archive storage, hybrid authentication options, BYOL, exit strategy, CLOUD Act
- New random calculations: monthly cloud bill, per-core licensing

## [Patchfeld 0.1.7] – 2026-09-11
- Scripting & SQL extended to 20 questions
- New topics: UPDATE without WHERE, normalisation and anomalies, data types, logical evaluation order, cron, CSV user import with PowerShell, COUNT and NULL, script variables and exit codes, DELETE in transactions, subqueries, LIKE, foreign keys and ON DELETE, robust cleanup scripts
- New random calculations: count result rows of a query, trace a WHILE loop

## [Patchfeld 0.1.6] – 2026-09-11
- Glossary extended to 118 terms
- New incl.: 802.1X, APIPA, BIA, CAB, CMDB, DIN 66399, DPIA, GFS, IPv6, LACP, MTBF/MTTR, OLA, OSPF, PoE, project application, WBS, RADIUS, Scrum, Kanban, SNMP, syslog, thin provisioning, TLS, umask, VRRP, WPA3

## [Patchfeld 0.1.5] – 2026-09-11
- Presentation & expert interview extended to 20 questions
- 9 new examiner questions with model answers: halved budget, IPsec tunnel in detail, own contribution, data protection and works council, schedule deviation, unknown questions, economic viability, nerves, ransomware scenario
- New topics: approvable project topics, running out of time, overloaded slides, content of the project application, assessment in the interview, structure of the project documentation

## [Patchfeld 0.1.4] – 2026-09-11
- System integration & rollout extended to 20 questions
- New topics: parallel operation, Windows Autopilot/Intune, test types, secure erasure of NVMe SSDs, ring-based software distribution, handover to operations, WSUS update rings, documentation types, decommissioning per DIN 66399, licences when replacing PCs, user communication, commissioning checklist, big bang vs phased switchover
- New random calculation: rollout effort and duration

## [Patchfeld 0.1.3] – 2026-09-11
- Project management & economics extended to 20 questions
- New topics: project characteristics, magic triangle, stakeholder analysis, Kanban vs Scrum, risk assessment, steps of a weighted scoring model, TCO, cost comparison, planning tools, plan vs actual with completion rate, project closure, total vs free float, risk analysis of a migration
- New random calculations: payback period, network plan with latest start, total and free float

## [Patchfeld 0.1.2] – 2026-09-11
- Business basics extended to 20 questions
- New topics: late acceptance, dunning procedure, supplementary performance, warranty vs guarantee and burden of proof, legal forms, training contract under BBiG, late delivery and cover purchase, payment and delivery terms, leasing, qualitative comparison of offers, procurement process, contract for work vs service contract
- New random calculations: sales price calculation up to list price, cash discount vs overdraft; default interest

## [Patchfeld 0.1.1] – 2026-09-11
- Data protection extended to 20 questions
- New topics: legal bases under Art. 6, data protection officer (§ 38 BDSG), special categories, pseudonymisation vs anonymisation, access requests, DPIA, video surveillance, Data Privacy Framework, record of processing, privacy by default, GDPR roles, fine ranges, deletion concept, data protection vs data security

## [Patchfeld 0.1.0] – 2026-09-11
- IT security extended to 20 questions
- New topics: maximum principle (BSI 200-2), TLS certificate with CSR, patch management after a CERT warning, firewall types and rule order, attack types, password storage with salt, WPA3-Enterprise with 802.1X, genuine two-factor methods, BSI password rules, digital signature, VPN variants, certificate trust
- New random calculations: brute-force time from key space, weekly backup volume with restore count
- Number input now recognises thousands separators per language (1.234,5 or 1,234.5)

## [Patchfeld 0.0.9] – 2026-09-11
- Resilience & contingency extended to 20 questions
- New topics: LACP instead of STP blocking, VRRP/HSRP, BSI 200-4 terms, immutable backups, active/active capacity, backup window, climate and fire protection, GFS, UPS shutdown order, georedundancy, restore tests, setting up a BCMS, single points of failure
- New random calculations: availability of serial and parallel components, weekly backup volume incremental/differential

## [Patchfeld 0.0.8] – 2026-09-11
- Storage & virtualisation extended to 20 questions
- New topics: RAID 5 rebuild risk, iSCSI (initiator, target, LUN), DAS/NFS/SMB/FC, thin provisioning, datastore sizing, memory ballooning, containers vs VMs, deduplication and tiering, templates and live migration, snapshot consolidation, hot spare rebuild
- New random calculations: write IOPS with RAID write penalty, thin overcommitment

## [Patchfeld 0.0.7] – 2026-09-11
- Network services & routing extended to 20 questions
- New topics: DHCP relay and APIPA, DHCP scope with exclusions, DNS TTL, voice VLAN, DHCP snooping, wrong gateway, DNS records for a mail server, port forwarding, route types, DNS resolution, bottom-up troubleshooting, 802.1Q trunk
- New random calculations: longest prefix match in a routing table, VLSM allocation

## [Patchfeld 0.0.6] – 2026-09-11
- Network fundamentals extended to 20 questions
- New topics: Cat 6A and link lengths, MAC table, broadcast and collision domains, IPv6 link-local and SLAAC, RFC 1918 addresses, loops and STP, shielding types, structured cabling per EN 50173, T568B pin-out, encapsulation
- New random calculations: required hosts to prefix and mask, IPv6 short notation; PoE budget

## [Patchfeld 0.0.5] – 2026-09-11
- IT service management extended to 20 questions
- New topics: priority matrix, SLA/OLA/UC, emergency change with ECAB, CMDB and CIs, change and problem process, escalation types, service desk as SPOC, syslog severities, SNMP, alert fatigue, knowledge base, agent-based vs agentless monitoring
- New random calculation: MTTR/MTBF or first contact resolution and SLA compliance

## [Patchfeld 0.0.4] – 2026-09-11
- Safety & support extended to 20 questions
- New topics: five electrical safety rules, DGUV V3 testing, safety signs, fire classes, lifting in racks, ESD measures, ElektroG and data deletion, four-sides model, complaint handling, active listening, first aid, safety instruction per § 12 ArbSchG
- New random calculation: working time and statutory breaks (ArbZG/JArbSchG)

## [Patchfeld 0.0.3] – 2026-09-11
- Operating systems extended to 20 questions
- New topics: fTPM/PTT, Windows 11 requirements, UAC and admin accounts, licence types, service startup types, LTS distributions, registry, recovery options, remote administration, boot chain, patch management with update rings, dual boot with BitLocker
- New random calculation: partition sizes in GiB; MBR limit with 512-byte and 4K sectors

## [Patchfeld 0.0.2] – 2026-09-11
- IT systems & hardware extended to 20 questions
- New topics: dual channel, TPM 2.0, RAM form factors, UEFI start-up, monitors for image editing, TB vs TiB, M.2/NVMe, PSU sizing, printing technologies, needs analysis
- New random calculations: annual power cost, cost per printed page; binary/hex number systems

## [Patchfeld 0.0.1] – 2026-09-11
- Base app with all learning mechanics: rounds (10 questions, 3 lives), Leitner box, mistake log, flashcards, glossary, exam simulations AP 1 (30 questions/90 min) and AP 2 (40 questions/120 min)
- XP, levels, ranks from apprentice to systems architect, daily goal, streak, combo multiplier and badges
- Learning path as a patch panel in T568B wire colours, statistics, exam countdown with daily recommendation
- 5 sample questions per topic (18 topics), calculation tasks with random values (subnetting, RAID, availability, transfer, depreciation, costing, UPS, network plan, weighted scoring)
- German and English, dark mode, JSON export/import, automatic update check, optional offline use as a PWA
