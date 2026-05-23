# ⚡ SkillForge.ai — Dynamic AI Learning Roadmaps & Secure Credentials

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Django%205-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django 5" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---

## 🎨 Overview
**SkillForge.ai** is a premium, high-fidelity AI-powered learning platform designed for structured roadmap generation, dynamic progress tracking, and **security-hardened course certifications**. 

Featuring a striking, custom **Swiss Neobrutalist design system**—with sharp contrast lines, thick offsets, interactive micro-animations, and vibrant color-blocks—SkillForge.ai marries next-generation artificial intelligence with strict enterprise-grade credentialing.

---

## 📸 Interface Showcases

### 🏠 Swiss Neobrutalist Landing Page
![SkillForge.ai Landing Page](docs/images/homepage.png)

### 📊 Learner Dashboard
![Learner Dashboard](docs/images/dashboard.png)

### 🎓 Dynamic Credentials Hub
![Credentials Hub](docs/images/certificates.png)

---


## 🚀 Key Features

| Feature | Description | Design Highlight |
| :--- | :--- | :--- |
| 🎓 **Credentials Hub** | Dynamically links certificates to active roadmap progress. Features direct landscape PDF previews and 100%-completion-locked secure downloads. | High-contrast status badges & interactive animated lock overlays. |
| 🧠 **AI-Powered Roadmaps** | Multi-agent AI synthesizes structured learning curves, curating course syllabi and modular tracking indices based on custom user prompts. | Smooth retro card components with vibrant HSL borders. |
| 📝 **AI Study Companion** | Generates tailored chapter-by-chapter study notes, interactive mock practice problems, and context-aware explanations on the fly. | Interactive glassmorphic widgets with slide-in animations. |
| 🔒 **Neobrutalist Auth Suite** | High-contrast, state-of-the-art onboarding flows for logging in, registering, and customizing user profile contexts. | Sharp $4\text{px}$ solid black borders with offset shadows. |

---

## 🏗️ System Architecture

The project is structured as a **decoupled monorepo** with a Next.js frontend interacting with a Django REST Framework backend and an external LLM orchestrator.

```mermaid
graph TD
    %% Frontend Subsystem
    subgraph "Next.js Frontend (Port: 3000)"
        UI["Credentials Hub & Auth Dashboard"]
        ClientAPI["Axios API Client (src/lib/api.ts)"]
        UI --> ClientAPI
    end

    %% Backend Subsystem
    subgraph "Django Backend (Port: 8000)"
        DRF["DRF API Router"]
        CertMgr["Certificate Verification Engine"]
        ProgressEngine["Course Progress Tracker"]
        Database[("SQLite Database (db.sqlite3)")]
        
        ClientAPI -- "/api/certificates/" --> DRF
        ClientAPI -- "/api/progress/" --> DRF
        
        DRF --> CertMgr
        DRF --> ProgressEngine
        CertMgr --> Database
        ProgressEngine --> Database
    end

    %% AI Core Orchestrator
    subgraph "AI Services Engine"
        Orch["Roadmap Orchestrator (orchestrator.py)"]
        YT["YouTube Discovery Agent"]
        LLM["AI Notes & Syllabus Generator"]
        
        Orch --> YT
        Orch --> LLM
        DRF -- "Triggers Synthesis" --> Orch
    end
    
    classDef default fill:#fff,stroke:#000,stroke-width:2px;
    classDef db fill:#f5f5f5,stroke:#000,stroke-width:2px;
    class Database db;
```

---

## 🔒 Security Infrastructure: Certificate Completion Locks

SkillForge.ai implements a strict **Zero-Trust Certificate Download & Verification Policy** inside the Django security layer:

* **Completion-Validated Generation**: The backend lists active courses and dynamically computes user progress. Certificates are only generated once progress matches exactly `100.0%`.
* **Download Hardening**: Direct requests to download raw credential PDFs are blocked at the controller level:
  ```python
  # backend/apps/certificates/views.py
  if enrollment.progress_percent < 100.0:
      return HttpResponse("Forbidden: This certificate is locked.", status=403)
  ```
  If a malicious user attempts to scrape or hit the raw endpoint without completing a course, the server aborts the request immediately with an HTTP **`403 Forbidden`** status code.
* **Public Verification Checks**: Verification links query dynamic enrollment records directly, rendering signature authenticity checks invalid if the corresponding course syllabus is incomplete.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom HSL Design Tokens
- **Icons**: Lucide React
- **Build Tool**: Webpack & Turbopack

### Backend
- **Framework**: Django 5.0 + Django REST Framework (DRF)
- **Language**: Python 3.11
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **PDF Core**: ReportLab PDF Generator
- **AI Core**: Google Gemini API integration

---

## 🔌 Running Locally

Getting the full stack up and running takes less than 60 seconds using the bundled master launcher:

### Prerequisites
Make sure you have [Node.js v18+](https://nodejs.org) and [Python 3.10+](https://python.org) installed on your system.

### One-Click Launch (Windows)
Double-click the startup batch script in the root directory:
```cmd
.\run_all.bat
```
*This launches the Python virtual environment, boots the Django API server on `http://127.0.0.1:8000`, and starts the Next.js development server on `http://localhost:3000` simultaneously.*

### Manual Startup

#### 1. Setup Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On Unix/macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🎨 The Swiss Neobrutalist Design System

SkillForge.ai is designed from the ground up to break away from traditional "clean-and-boring" dashboards. It implements a premium **Swiss Neobrutalist** theme:
* **High Contrast Borders**: Hard-edged `4px` and `2px` black solid borders (`border-black`) on all interactive cards, inputs, and buttons.
* **Dynamic Offsets**: Bold drop-shadows that slide in on hover, mimicking high-impact retro graphic prints:
  ```css
  box-shadow: 4px 4px 0px 0px #000000;
  ```
* **Typography Hierarchy**: Utilizing heavy sans-serif typefaces (e.g., *Outfit*, *Inter*) for a bold, humanistic editorial feel.
* **Curated Vibrant Accents**: Harmonious HSL colors combined with elegant neutral canvas backgrounds (`#F4F4F0`) for an interface that feels responsive and alive.
