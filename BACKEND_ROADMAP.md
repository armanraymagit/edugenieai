# Backend & Authentication Roadmap

This document outlines the next steps for integrating a **FastAPI** backend, implementing **OAuth login**, and creating **Signup/Login** pages for EduGenie-AI.

## 1. FastAPI Backend Setup

To move logic from the frontend to a secure server, we will implement a FastAPI backend.

### Architecture

- **API Framework:** FastAPI (high performance, async support).
- **Model Serving:** Create endpoints that wrap existing AI logic (Ollama, HuggingFace).
- **Database:** Use **PostgreSQL with SQLAlchemy/SQLModel** or **MongoDB** to store user profiles, history, and session data.

### Next Steps:

1. Initialize a `backend/` directory.
2. Setup a virtual environment and `requirements.txt`.
3. Create `main.py` with basic health check and model endpoints.

---

## 2. Authentication & OAuth

We will use **OAuth 2.0** (Google/GitHub) and **JWT (JSON Web Tokens)** for session management.

### Key Components:

- **FastAPI Users / Authlib:** Libraries to handle OAuth flows.
- **JWT:** Tokens for secure communication between frontend and backend.
- **Provider Setup:** Register the application on Google Cloud Console or GitHub Developer settings to get `CLIENT_ID` and `CLIENT_SECRET`.

### Next Steps:

1. Implement the `/auth/login` and `/auth/callback` endpoints.
2. Setup a middleware to verify JWT on protected routes (like model inference).

---

## 3. Frontend: Sign Up & Login Pages

Create a dedicated authentication flow in the React app.

### Components:

- **Login Page:** Email/Password form and "Login with Google" button.
- **Signup Page:** Registration form.
- **Auth Context:** A React Context to manage user state (logged in/out) across the app.

### Next Steps:

1. Install `react-router-dom` if not already present.
2. Create `src/components/auth/` for shared UI elements.
3. Integrate with the backend Auth endpoints.

---

## 4. Proposed File Structure

```text
EduGenie-AI/
├── backend/
│   ├── main.py
│   ├── api/
│   │   ├── models.py      # AI endpoints
│   │   └── auth.py        # Login/OAuth endpoints
│   ├── core/
│   │   ├── config.py      # Env variables (DB_URL, SECRET_KEY)
│   │   └── security.py    # JWT & Password hashing
│   └── database.py        # DB Connection
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   └── context/
│       └── AuthContext.tsx
└── .env                   # Add backend secrets here
```

---

## Roadmap Summary Checklist

- [ ] Initialize FastAPI project
- [ ] Migrate `ollama.ts` and `huggingface.ts` logic to backend endpoints
- [ ] Configure Google OAuth Provider
- [ ] Build Login/Signup UI with Tailwind CSS
- [ ] Implement Refresh Token logic for long-running sessions
