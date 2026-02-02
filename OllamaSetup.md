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
    ollama pull llama3.1    # Recommended: Best for JSON generation (flashcards, quizzes)
    # OR
    ollama pull llama3.2    # Alternative option
    # OR
    ollama pull mistral     # Another good option for structured output
    
    ollama pull llava       # For image summarization
    ```
    
    **Note**: `llama3.1` is recommended for better JSON/structured output generation. If you get errors, try `mistral` or `qwen2.5`.

3.  **Start Ollama**:
    Ensure it's running in the background:
    ```bash
    ollama serve
    ```

4.  **Verify**:
    The app connects to `http://localhost:11434` by default. No API key needed!
    
    **Test your setup**:
    ```bash
    node test-ollama-flashcards.mjs
    ```
    This will test flashcard generation and suggest the best model if your current one isn't working.

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

## 3️⃣ Option C: Public Demo via Tunneling (Advanced)

This method allows you to run a public demo of your app (e.g., on Vercel) while using the Ollama instance on your local computer. It works by creating a secure "tunnel" from the internet to your machine.

> **⚠️ Warning:** This exposes a service on your personal computer to the public internet. It is intended for **temporary demos only**. Your PC must remain on, and performance will be limited by your home internet's upload speed.

### Setup Steps

1.  **Install a Tunneling Tool (ngrok)**:
    - Download `ngrok` from ngrok.com.
    - Authenticate it using the token from your ngrok dashboard.

2.  **Expose Ollama Port**:
    Make sure Ollama is running. Then, open a terminal and start the tunnel:
    ```bash
    ngrok http 11434
    ```

3.  **Get Public URL**:
    `ngrok` will provide a public `https` URL (e.g., `https://random-string.ngrok-free.app`). Copy this URL. **Keep this terminal open.**

4.  **Configure App Code**:
    Ensure your application's Ollama service file (`services/ollama.ts`) does not hardcode `localhost`. It should use an environment variable:
    ```typescript
    const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
    ```

5.  **Set Vercel Environment Variable**:
    - In your Vercel project settings, go to **Environment Variables**.
    - Add a new variable:
      - **Key**: `NEXT_PUBLIC_OLLAMA_URL`
      - **Value**: The `https` URL you copied from ngrok.
    - Save and **redeploy** your application.

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
