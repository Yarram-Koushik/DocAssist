# DocAssist Platform Complete

DocAssist is a full-stack, AI-powered healthcare assistant platform built to provide evidence-backed medical information and safe, scalable patient experiences.

## 🌟 Modules Built

### 1. Frontend (React / Vite / Tailwind)
- Completely custom UI built with Shadcn-like accessible elements (`src/components/ui/*`).
- Specialized medical theme (blue-600/700) with Dark Mode support.
- Fully operational pages: `Dashboard`, `Chat`, `Upload Report`, `Medicine Search`, `Admin Analytics`.
- Responsive navigation with `Sidebar` and `Header` layout wrappers.
- State managed through React Context (`AuthContext`, `ThemeContext`).

### 2. Backend API (Flask / SQLAlchemy)
- Organized utilizing Application Factory pattern and Blueprints.
- 10 Data models fully interconnected (`User`, `Conversation`, `ChatHistory`, `Report`, `Medicine`, etc.).
- Robust JWT auth (`flask-jwt-extended`) with Route guards.
- Service Layer abstraction (`auth_service`, `chat_service`, etc.) keeping routes clean.

### 3. AI & RAG Layer (LangChain / FAISS / Gemini)
- Document ingestion pipeline processing `.txt` and `.pdf` files.
- High-performance `FAISS` local vector store.
- Custom Medical safety wrappers filtering out diagnostic language and prescribing behaviors.
- Embedded system prompts strictly ensuring source citations and conversational boundaries.

### 4. Report Analyzer (PyMuPDF / Tesseract)
- Dynamic pipeline for parsing PDFs (text tables) and Images (OCR).
- Regex-powered entity extraction parsing values like `Hemoglobin`, `WBC`, `TSH`, etc.
- Automatic range comparison matching against internal reference ranges.

### 5. Emergency Detection
- Lightweight, pattern-matching interception layer triggering BEFORE the AI is processed.
- Classifies critical threats (cardiac, respiratory, mental health).
- Immediately returns standard emergency responses over normal chat flows.

### 6. Additional Capabilities
- **openFDA Integration**: Medicine lookups automatically cleaned of HTML markup.
- **Doctor Summaries**: Automatic generation of exportable conversation timelines.
- **Admin Dashboard**: Recharts-powered analytics for tracking overall user trends.

## 🚀 Running the Project

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker
To spin up the entire system (Frontend, Backend, and PostgreSQL) via Docker:
```bash
docker-compose up --build
```
