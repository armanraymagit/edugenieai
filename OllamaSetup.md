# AI Providers Setup Guide

EduGenie AI now supports a **Hybrid AI Architecture**, allowing you to choose between running models locally (via Ollama) or using Google's cloud API (Gemini).

## 1️⃣ Option A: Ollama (Local & Private) - **Recommended**

Run powerful AI models locally on your machine. Best for privacy and offline use.

### Prerequisites
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: ~4GB for models
- **GPU**: NVIDIA recommended for speed (optional)

### Setup Steps

1.  **Install Ollama**:
    Download from [ollama.com](https://ollama.com).

2.  **Pull Required Models**:
    Open your terminal:
    ```bash
    ollama pull llama3.2    # For chat, flashcards, quizzes
    ollama pull llava       # For image summarization
    ```

3.  **Start Ollama**:
    Ensure it's running in the background:
    ```bash
    ollama serve
    ```

4.  **Verify**:
    The app connects to `http://localhost:11434` by default. No API key needed!

---

## 2️⃣ Option B: Google Gemini (Cloud & Speed)

Use Google's powerful models via API. Best for speed on lower-end devices.

### Setup Steps

1.  **Get API Key**:
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
    - Create a new API key.

2.  **Configure Environment**:
    - Create a `.env.local` file in the project root.
    - Add your key:
      ```env
      GEMINI_API_KEY=your_api_key_here
      ```

3.  **Restart App**:
    - Restart the development server (`npm run dev`) to load the new env var.

---

## 🔄 Switching Providers

You can switch between Ollama and Gemini instantly within the application:

1.  Open the **Sidebar** menu.
2.  Look for the **AI Model** toggle at the bottom.
3.  Click **"Gemini"** or **"Ollama"**.
    - Your choice is saved automatically.

## 📊 Feature Comparison

| Feature | Ollama | Gemini |
|---------|--------|--------|
| **Cost** | Free Forever | Free Tier (limits apply) |
| **Privacy** | 100% Local | Cloud Processed |
| **Offline?** | Yes | No (Requires Internet) |
| **Speed** | Hardware Dependent | Fast (Cloud) |
| **Setup** | Install Software | Get API Key |
| **Vision** | Good (Llava) | Excellent (Gemini Vision) |

## ⚡ Performance & Limits

### Ollama (Local)
*   **Rate Limits**: None. You are limited only by your computer's speed.
*   **Token Limits (Context Window)**: 
    *   **llama3.2**: ~128,000 tokens.
    *   **llava**: ~4,096 tokens (vision context).
*   **Speed**: Depends on your GPU/RAM. If generation is slow, try closing other memory-intensive apps.

### Google Gemini
*   **Rate Limits**: 
    *   **Gemini 2.0 Flash (Free)**: 15 Requests Per Minute (RPM), 1 Million Tokens Per Minute (TPM).
*   **Token Limits**: Up to 1 Million tokens per request.

