---
name: Face Registration - Phase 1: Backend Setup
description: FastAPI backend setup with DeepFace, SQLAlchemy, PostgreSQL for face registration feature
type: project
originSessionId: 99efe156-1be0-4143-b491-aae0e9c23d72
---
## Phase 1 — Backend Setup

**Status:** NOT STARTED

### Goal
Set up the Python FastAPI backend with DeepFace face recognition, SQLAlchemy ORM, and PostgreSQL (`faceauth` DB).

### File: `backend/requirements.txt`
Add these dependencies:
```
fastapi
uvicorn
deepface
sqlalchemy
psycopg2-binary
python-multipart
pillow
numpy
tf-keras
```

### File: `backend/main.py`
Implement:
1. SQLAlchemy connection to PostgreSQL `faceauth` database
2. `User` model/table with columns: `id`, `name`, `email` (unique), `phone`, `face_embedding` (Text, JSON-serialized float array), `created_at`
3. CORS middleware allowing `http://localhost:3000`
4. `POST /api/capture-face` — accepts base64 image, runs `DeepFace.represent()` with ArcFace model, returns embedding array or error
5. `POST /api/register` — accepts `{name, email, phone, face_embedding}`, inserts into `users` table, returns success/error

### Database
- DB name: `faceauth`
- Table: `users`
- PostgreSQL MCP is available to create the table directly
- SQLAlchemy manages reads/writes from Python side

**Why:** DeepFace handles face embedding extraction; SQLAlchemy abstracts DB operations cleanly with FastAPI's dependency injection pattern.

**How to apply:** Complete this phase before touching any frontend code. Backend must be running on port 8000.
