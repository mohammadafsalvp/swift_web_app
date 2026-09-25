# IDC Swift · AI Agents Architecture & Technical Guide

This document defines the AI Agent architecture, operational pipelines, characteristics, and intelligence features for the **IDC Swift** Marine & Offshore Engineering Document Portal.

---

## 1. Project Overview & Role of AI Agents

**IDC Swift** is a marine and offshore engineering platform managing critical vessel blueprints, engine overhaul logs (e.g. Wärtsilä, MAN B&W, Caterpillar, Rolls-Royce Bergen), class survey certificates (DNV, Lloyd's Register), and OEM technical bulletins.

AI Agents in IDC Swift serve as specialized autonomous systems that process incoming engineering documents, extract technical metadata, generate structured summaries from uploaded PDFs, assess operational compliance, and route documents through review and approval workflows.

---

## 2. Document Processing & PDF Summary Pipeline

When technical documents (PDFs, CAD drawings, inspection logs) are uploaded via the Admin Dashboard or Employee Portal, the AI Agent pipeline executes the following workflow:

```
[Uploaded PDF / Document]
         │
         ▼
┌─────────────────────────┐
│ 1. Document Ingestion   │ ──► MIME validation, text/OCR stream extraction
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 2. Technical Parser     │ ──► Extracts Vessel IMO, Engine Series, Serial Nos, Date & Flag
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 3. Engineering Analysis │ ──► Diagnostic anomaly detection, maintenance history check
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4. Executive Summary    │ ──► Multi-tier summary (High-level, Tech Specs, Action Items)
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 5. Workflow Dispatch    │ ──► Status tagging (Under Review, Approved, Verified & Classed)
└─────────────────────────┘
```

### PDF Technical Summary Output Schema
For every uploaded PDF, the agents generate structured intelligence:
- **Executive Overview**: High-level scope of the overhaul, repair, or inspection.
- **Equipment & Asset Identifiers**:
  - Vessel Name & Class (e.g., *Stena DrillMAX*, *Maersk Mc-Kinney*)
  - Engine Model & Specifications (e.g., *Wärtsilä 50DF*, *MAN B&W 6S70ME-C8.2*)
  - Asset Sector (*Marine Vessel*, *Offshore Rig*, *Onshore Unit*)
- **Component Health & Wear Status**: Piston wear, turbocharger pressure differentials, bearing clearances, lube oil test results.
- **Classification & Compliance**: Verification against maritime class regulations (DNV / ABS / BV).
- **Key Action Items & Risk Warnings**: Critical recommendations with recommended completion timelines.

---

## 3. Specialized AI Agents & Responsibilities

IDC Swift implements dedicated domain-specific agents:

| Agent | Domain / Scope | Key Responsibilities |
|---|---|---|
| **Document Ingestion Agent** | File Parsing & OCR | Extracts text, metadata, tables, and schematics from PDFs, scans, and technical drawings. |
| **Marine Diagnostic Agent** | Engine & Machinery Analysis | Evaluates engine overhaul logs, vibration analysis, temperature readings, and fuel consumption trends. |
| **Classification Compliance Agent** | Maritime Regulations | Cross-references reports against DNV, ClassNK, and IMO safety compliance requirements. |
| **Summarization & Insights Agent** | Engineering Summaries | Synthesizes multi-page technical reports into concise, actionable summaries for engineers and managers. |
| **Workflow & Quality Agent** | Status & Quality Gate | Recommends triage status (`review`, `approved`, `verified`) and verifies document completeness. |

---

## 4. Key Characteristics of IDC Swift AI Agents

1. **Deterministic Precision & Low Hallucination**
   - Engineering-grade accuracy: Agent reasoning relies on grounded data extracted from the document source.
   - Ambiguous values are explicitly flagged for human engineer verification.

2. **Maritime & Mechanical Domain Awareness**
   - Built-in understanding of marine propulsion systems, two-stroke and four-stroke diesel/dual-fuel engines, turbochargers, auxiliaries, and offshore drilling machinery.

3. **Multi-Modal Document Understanding**
   - Processes textual narratives, tabulated technical logs, engineering stamps, serial numbers, and blueprint schematics.

4. **Human-in-the-Loop Workflow Integration**
   - Works collaboratively with marine engineers (`Edgar Humbert`, `Craig Howard`, `Marcus Vance`).
   - Empowers engineers to inspect source pages, override recommendations, and download validated reports.

5. **Context Retention & Vault Indexing**
   - Indexes documents by vessel, IMO, engine model, sector, and timestamp for rapid semantic retrieval.

---

## 5. Technology Stack & Integration Points

- **Frontend**: Next.js (App Router, Turbopack), React 19, Tailwind CSS v4.
- **Design Language**: IDC Swift Dark/Navy Maritime Theme (`#0d1117`, `#00838f`, `#f0f3f5`).
- **Core Interfaces**:
  - Admin Dashboard (`/`): Processing rate metrics, sector vault breakdown, document review queue.
  - User / Employee Portal (`/user`): Personal uploads, filtered category views, live document previews.
  - Modals (`UploadModal`, `DocumentPreviewModal`): Ingestion entry points and inspection interfaces.


