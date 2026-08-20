# 🩺 DocAssist — Next-Gen AI Clinical Assistant & Health Literacy Platform

<div align="center">

[![Build & Test Status](https://img.shields.io/badge/Pytest-62%20Passing-brightgreen.svg?style=for-the-badge&logo=pytest&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Security](https://img.shields.io/badge/Security-Bcrypt--12%20%7C%20Rate%20Limited-blueviolet.svg?style=for-the-badge&logo=auth0&logoColor=white)](#)
[![OpenFDA](https://img.shields.io/badge/OpenFDA-Integrated-005EA2.svg?style=for-the-badge&logo=fda&logoColor=white)](https://open.fda.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>An intelligent, privacy-first healthcare AI platform designed for clinical symptom assessment, smart medical report analysis, openFDA drug monographs, drug-drug interaction screening, and physician visit summaries.</strong>
</p>

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Clinical Modules](#-clinical-modules) • [Quick Start](#-quick-start) • [API Documentation](#-api-endpoints) • [Security & Compliance](#-security--safety-guardrails)

</div>

---

## 🌟 Key Features

### 1. 🤖 Intelligent Medical Consultations
- **Dynamic Consultation Titling**: Automatically derives meaningful, clinical session names from your first symptom prompt (e.g. *"Severe Headache & Fever"*).
- **RAG-Powered Clinical Guidance**: Queries vector-embedded medical literature (WHO, CDC, MedlinePlus) with citation tracking and confidence scoring.
- **Natural Clinical Inquiries**: AI conducts nuanced symptom follow-ups directly within the dialog flow.

### 2. 🧪 Smart Lab Report Analyzer
- **Multimodal OCR Extraction**: Upload blood tests, CBC panels, thyroid profiles, lipid screens, and metabolic panels (PDF, PNG, JPG) using Tesseract OCR and regular expressions.
- **Automated Biomarker Range Evaluation**: Identifies Normal, Low, and High biomarkers with clinical reference bounds and automated unit-scale normalization.
- **Plain-Language AI Interpretation**: Translates complex lab values into clear patient explanations.

### 3. 💊 Medicine & Drug-Drug Interaction (DDI) Checker
- **OpenFDA Clinical Monographs**: Search 30+ core medications for official indications, adverse reactions, boxed warnings, and contraindications with automatic synonym mapping (*Paracetamol $\rightarrow$ Acetaminophen*).
- **Pairwise Interaction Analysis**: Evaluates multi-medication combinations for synergistic toxicity, enzyme inhibition (CYP3A4, CYP2C19), bleeding risks, and hyperkalemia alerts (e.g. *Lisinopril + Spironolactone*).

### 4. 📋 Doctor Visit Clinical Summary Note
- **One-Click Summary Generation**: Condenses consultations and attached lab reports into a structured clinical note with patient concerns, symptom timelines, and questions for the physician.
- **Multi-Format Export & Sharing**: Download formatted **PDF** and **TXT** clinical notes or generate secure, tokenized physician share links.

### 5. 🛡️ Enterprise Security & Hardening
- **Bcrypt-12 Password Protection**: Resistant against rainbow-table attacks with constant-time verification and auto-migration.
- **Server-Side Pydantic Validation**: Strict schema verification, HTML/script tag sanitization, and generic failure logging.
- **Brute-Force Rate Limiting**: Max 10 login requests/min per IP with progressive backoff delays and a 15-minute lockout after 5 consecutive failures.

### 6. 📊 Patient Health ID & Dashboard
- **Daily Vitals Quick Logger**: Track Blood Pressure, Resting Heart Rate, Blood Glucose, and SpO2 levels.
- **Interactive Health Profile**: Dynamic BMI calculator, allergies list, current medications, and Emergency ICE (In Case of Emergency) medical ID card.

---

## 🏗️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                 React 18 + Vite SPA                               |
|              (Dark/Light Clinical UI, Glassmorphism, Tailwind CSS, Lucide)        |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST / JWT Bearer
                                           v
+-----------------------------------------------------------------------------------+
|                              Flask Application Backend                            |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  Auth & Rate Limit |  |  Report & OCR Engine |  |  DDI Interaction Engine   |  |
|  | (Bcrypt-12 / Pydantic)|  | (Tesseract / Regex)  |  |  (OpenFDA + 20+ Rules)   |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                          |                                        |
|                                          v                                        |
|  +-----------------------------------------------------------------------------+  |
|  |                       RAG Retrieval & LLM Orchestrator                      |  |
|  |         (FAISS Vector Store + LangChain + Groq / Llama-3.3-70B / Gemini)    |  |
|  +-----------------------------------------------------------------------------+  |
+---------------------+-------------------------------------+-----------------------+
                      |                                     |
                      v                                     v
+-----------------------------------+     +-------------------------------------+
|        PostgreSQL / SQLite        |     |             AI Providers            |
|   (Users, Chats, Reports, Logs)   |     |    (Groq Llama-3.3 / Google Gemini) |
+-----------------------------------+     +-------------------------------------+
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18.3, Vite 6.4, Tailwind CSS, Lucide Icons, Axios, React Router v6, React Hot Toast |
| **Backend** | Python 3.11/3.12, Flask 3.0, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Pydantic v2 |
| **Security & Auth** | Bcrypt (12 rounds), Bleach sanitization, In-memory Sliding Window Rate Limiter |
| **AI / NLP & RAG** | LangChain, FAISS Vector Store, HuggingFace / Gemini Embeddings, Groq (Llama-3.3-70B) |
| **Document Processing** | Tesseract OCR, PyPDF2, pdfplumber, ReportLab (PDF generation), Pillow |
| **Database** | SQLite (Development) / PostgreSQL 16 (Production) |
| **DevOps** | Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python**: `3.11` or `3.12`
- **Node.js**: `v18.x` or `v20.x` (with `npm`)
- **Tesseract OCR** (for image lab report extraction):
  - **Windows**: Download installer from [UB-Mannheim Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
  - **macOS**: `brew install tesseract`
  - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`

---

### 2. Installation & Setup

#### Clone the Repository
```bash
git clone https://github.com/Yarram-Koushik/DocAssist.git
cd DocAssist
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations / database setup (Optional)
python scripts/migrate_passwords.py

# Launch Flask backend server
flask run --host=127.0.0.1 --port=5000 --debug
```

#### Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🐳 Docker Deployment

Run the complete frontend, backend, and database stack in isolated containers:

```bash
# Build and run containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Shutdown containers
docker-compose down
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## ⚙️ Configuration (`.env`)

Create a `.env` file in the root or `backend/` directory based on `.env.example`:

```env
# Flask Core
FLASK_ENV=development
SECRET_KEY=your-secure-random-secret-key
JWT_SECRET_KEY=your-secure-jwt-secret-key

# Database
DATABASE_URL=sqlite:///docassist.db

# LLM Providers (Groq / Gemini / OpenAI)
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# CORS & Network
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 📡 API Endpoints

### 🔐 Authentication & Security
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with Pydantic validation & Bcrypt | No |
| `POST` | `/api/auth/login` | Authenticate user with rate limiting & lockout | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `POST` | `/api/auth/password/change` | Update password with old password verification | Yes (Bearer) |

### 💬 Clinical Consultations
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/chat/conversations` | Retrieve paginated user consultations | Yes (Bearer) |
| `POST` | `/api/chat/conversations` | Initialize a new consultation | Yes (Bearer) |
| `POST` | `/api/chat/conversations/:id/messages` | Send message and receive RAG AI response | Yes (Bearer) |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation session | Yes (Bearer) |

### 🧪 Medical Lab Reports
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/reports/upload` | Upload & parse lab report (PDF / Image OCR) | Yes (Bearer) |
| `GET` | `/api/reports/` | List all historical user lab reports | Yes (Bearer) |
| `GET` | `/api/reports/:id` | Get detailed extracted biomarkers & AI explanation | Yes (Bearer) |

### 💊 Medicine & Drug Interactions
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/medicine/search` | Search OpenFDA monograph and clinical indications | Yes (Bearer) |
| `POST` | `/api/medicine/interactions` | Pairwise multi-drug interaction safety checker | Yes (Bearer) |
| `GET` | `/api/medicine/history` | Retrieve user medication search history | Yes (Bearer) |

### 📋 Doctor Notes & Summaries
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/summary/generate` | Generate clinical summary from chat & lab reports | Yes (Bearer) |
| `GET` | `/api/summary/:id/export?format=pdf` | Export clinical summary to formatted PDF | Yes (Bearer) |
| `GET` | `/api/summary/:id/export?format=txt` | Export clinical summary to plain text | Yes (Bearer) |
| `POST` | `/api/summary/:id/share` | Generate tokenized physician sharing link | Yes (Bearer) |

---

## 🛡️ Security & Safety Guardrails

- 🔒 **Zero Hardcoded Secrets**: All keys, JWT tokens, and credentials are exclusively accessed via environment variables.
- 🛡️ **Bcrypt Hashing (12 Rounds)**: Passwords are salted and hashed using industry-standard bcrypt.
- ⏱️ **Rate Limiter & Account Lockout**:
  - Max 10 login requests per minute per IP.
  - Accounts automatically lock for 15 minutes after 5 consecutive failed attempts.
- 💉 **Strict Emergency Escalation**: Algorithmic red-flag triage detects acute emergencies (chest pain, stroke signs, severe trauma) and triggers emergency warnings.

---

## ⚖️ Medical Disclaimer

> [!IMPORTANT]
> **NOT MEDICAL ADVICE / EMERGENCY NOTICE**:
> DocAssist is an AI-powered informational platform designed for health literacy and medical record organization. It is **not** a licensed medical diagnostic device and does **not** replace professional clinical judgment, diagnosis, or prescription from a certified healthcare provider.
>
> If you are experiencing a life-threatening emergency, acute chest pressure, difficulty breathing, or severe trauma, call your local emergency services (**911**, **112**, or local equivalent) or visit the nearest emergency department immediately.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
