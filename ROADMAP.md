# DIForM (Do It For Me) – Product Vision & Architektur

## Mission

**Arbeit erledigen, nicht nur unterstützen.** DIForM versteht Kontext, entscheidet über den nächsten sinnvollen Schritt und führt ihn **proaktiv** aus – sicher, nachvollziehbar, auditierbar.

## Kern-Erlebnisse

* **Outlook (E-Mail):**

  * Threads **zusammenfassen**, **Antwort vorschlagen**, Ton & Länge anpassen.
  * **Auto-Follow-Ups**: erinnert, entwirft, plant Termine, legt To-Dos an.
* **Word/PowerPoint (Dokumente):**

  * Briefing → **erste Fassung** mit Quellen; **Umschreiben**, **verkürzen/verlängern**, **Executive Summary**.
  * **Deck-Generierung** aus Dokumenten oder Stichpunkten; einheitliches Corporate Design.
* **Excel (Datenarbeit):**

  * „Erkläre mir die Abweichungen Q3“ → **Analyse**, **Pivot**, **Diagramm**, **Empfehlungen**.
  * **What-If** und **Formelvorschläge** in natürlicher Sprache.
* **Teams (Meetings & Chat):**

  * Live & danach: **Kernaussagen, Entscheidungen, Aufgaben**; **Recap** mit Transkript & Links.
  * **Kontext-Chat** über Dateien, E-Mails, Kalender, Personen.
* **Automationen („Do it“):**

  * „Verschiebe alle offenen Kundentermine um 1 Woche, informiere alle, aktualisiere das Projektboard und triggere die Rechnungsanpassung.“ → DIForM führt aus, zeigt **Diff & Freigabe**.

## Architektur (vereinfacht)

* **Foundation LLMs** + **Orchestrator**

  * Routing je Task: Verstehen → Planen → Ausführen → Verifizieren.
* **Microsoft Graph Grounding**

  * Sicherer Zugriff auf **Mail, Dateien, Kalender, Teams**, People, Sites.
* **Action Connectors**

  * Outlook, SharePoint, Planner, Power Automate, Jira, ServiceNow, GitHub, SAP u. a.
* **Reasoning Cache & Memory**

  * Kurzzeit-Kontext pro Vorgang; **unternehmensweit steuerbar**.
* **Guardrails**

  * **Policy-Einhaltung**, DLP, Sensitivity Labels, E5-Compliance, **Least Privilege**.
  * **Human-in-the-Loop** für risikoreiche Aktionen (Genehmigungs-Pane).

## Sicherheit & Compliance (by design)

* **Daten bleiben im Tenant-Boundary.**
* **Ablage & Protokollierung**: Jede Aktion ist **auditierbar** (wer/was/wann/warum).
* **Rechtliche/Risikofilter**: PII/Vertraulich, Exportkontrollen, Jurisdiktionen.
* **Rollenzugriff**: Admin konfiguriert **Capabilities**, Datenbereiche, Konnektoren.

## Admin & Governance

* **DIForM Control Center:** Policies, Konnektoren, Prompt-Bibliothek, Kostengrenzen.
* **Observability:** Nutzungsmetriken, Erfolgsraten, Halluzinations-Flags, **Rollback**.
* **Change Management:** In-Product-Guides, Adoption Score, Schulungs-Prompts.

## Erweiterbarkeit (DIForM Studio)

* **Skills/Agents** als wiederverwendbare Bausteine (z. B. „Rechnung prüfen“, „Kundenakte anlegen“).
* **Power Platform-Integration**: Flows, Low-Code-Formulare, Genehmigungen.
* **Plug-in-Model** mit sicheren Manifests & Scopes.

## Typische „Do-It-For-Me“-Prompts

* „Fasse die letzten 48 h Kundenmails zu Projekt X zusammen, formuliere Antworten, plane 2 Termine nächste Woche und update das Steering-Deck.“
* „Erstelle aus dieser Excel die QBR-Slides mit Risiken, Chancen und 3 Maßnahmen – max. 10 Folien.“
* „Bereite die Onboarding-Checkliste vor, weise Tasks in Planner zu und lade alle in das Kick-off ein.“

## Transparenz & Kontrolle

* **Preview-Pane** mit **Begründung** („Warum diese Aktion?“), betroffenen Objekten und **Ein-Klick-Undo**.
* **Moduswahl:** Vorschlagen → Halb-automatisch (Genehmigung) → Voll-automatisch (Policy-basiert).

## Erfolgsmetriken (North Stars)

* **Gesparte Zeit pro Rolle**, **erstellt-statt-begonnen-Docs** (Fertigstellungsquote), **Response-SLA** in Outlook, **Automations-Durchläufe ohne Korrektur**.

## Rollout

* **Phase 1:** Copilot-Äquivalenz + „Review & Approve“.
* **Phase 2:** **Do-It** für definierte Low-Risk-Workflows.
* **Phase 3:** Domänenspezifische Agents (Finanzen/Vertrieb/ITSM), Self-Serve Studio.

---

**Kurz:**
DIForM liest, plant, **führt aus** – sicher, erklärbar, im Microsoft-Graph-Kontext. Statt „Assistent“ ist es **Ausführender** mit Bremse und Gaspedal.
