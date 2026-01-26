<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 EduGenie AI - Your Intelligent Study Companion

EduGenie AI is a modern, AI-powered study assistant that helps students learn more effectively through interactive flashcards, quizzes, concept explanations, note summarization, and study time tracking.

## ✨ Features

### 🃏 **Flashcard Master**
- Generate AI-powered flashcards from any topic
- Interactive flip cards with smooth animations
- Customizable number of cards (5-50)
- Clean, distraction-free interface

### 📝 **Quiz Master**
- Create multiple-choice quizzes on any subject
- **Built-in Timer**: 1 minute per question (5 questions = 5 minutes)
- Real-time scoring and feedback
- Detailed explanations for each answer
- Automatic time tracking added to study hours

### 💬 **AI Explainer**
- Get simple, clear explanations of complex concepts
- Interactive chat interface
- Context-aware responses

### 📄 **Note Summarizer**
- Summarize long notes into key takeaways
- Extract important concepts
- Support for text and image-based notes

### 📊 **Study Dashboard**
- Track your study time automatically
- Weekly activity charts
- Quiz performance metrics
- Study statistics and progress tracking

### 🎯 **Lecture Buddy**
- Process and summarize lecture content
- Extract key information from transcripts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Ollama (for local AI) - [Download here](https://ollama.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EduGenie-AI.git
   cd EduGenie-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Ollama Configuration (Required for flashcards and quizzes)
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   OLLAMA_VISION_MODEL=llava

   # Hugging Face API Key (Optional - for image generation)
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

4. **Install Ollama models**
   ```bash
   # Install the recommended model for best JSON generation
   ollama pull llama3.2
   
   # Or use llama3.1 for better structured output
   ollama pull llama3.1
   
   # For image summarization (optional)
   ollama pull llava
   ```

5. **Start Ollama server**
   ```bash
   ollama serve
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Ollama Setup

EduGenie AI uses **Ollama** for generating flashcards and quizzes. This ensures:
- ✅ **100% Local & Private** - Your data never leaves your machine
- ✅ **No API Costs** - Completely free to use
- ✅ **Offline Capable** - Works without internet after setup

**Recommended Models:**
- `llama3.2` - Default, widely available, good performance
- `llama3.1` - Better JSON generation (if available)
- `mistral` - Alternative option for structured output

**Test your setup:**
```bash
node test-ollama-flashcards.mjs
```

This will test flashcard generation and suggest the best model for your system.

### Hugging Face (Optional)

For AI-generated images in flashcards/quizzes, you can optionally set up Hugging Face:
1. Get your API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add it to your `.env` file
3. Note: Images are currently disabled in the UI by default

## 📖 Usage Guide

### Creating Flashcards

1. Navigate to **Flashcard Master** from the sidebar
2. Enter your topic (e.g., "Machine Learning")
3. Optionally add notes or context
4. Select the number of cards (5-50) using the slider or preset buttons
5. Click **Generate Flashcards**
6. Click cards to flip and review

### Taking Quizzes

1. Navigate to **Quiz Master** from the sidebar
2. Enter your topic
3. Select number of questions (5-30)
4. Click **Start Quiz**
5. **Timer starts automatically**: 1 minute per question
6. Answer questions and get instant feedback
7. Your time is automatically added to study hours

### Tracking Study Time

- Study time is automatically tracked for all activities:
  - **Quizzes**: Actual time spent (based on timer)
  - **Flashcards**: 15 minutes per session
  - **Explainer**: 5 minutes per interaction
  - **Summarizer**: 10 minutes per summary
  - **Lecture Buddy**: 20 minutes per lecture

View your progress on the **Dashboard**.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI Services**: 
  - Ollama (Local AI for flashcards, quizzes, explanations)
  - Hugging Face (Optional image generation)
- **Charts**: Recharts
- **State Management**: React Hooks + LocalStorage

## 📁 Project Structure

```
EduGenie-AI/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard with stats
│   ├── FlashcardsView.tsx
│   ├── QuizView.tsx
│   ├── Explainer.tsx
│   ├── Summarizer.tsx
│   └── ...
├── services/           # AI service integrations
│   ├── ollama.ts       # Ollama API integration
│   ├── huggingface.ts  # Hugging Face API
│   └── ai.ts           # Main AI coordinator
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
└── package.json
```

## 🎯 Recent Updates

### v2.0 - Ollama Integration
- ✅ Switched flashcards and quizzes to use Ollama (local AI)
- ✅ Improved JSON parsing for reliable generation
- ✅ Added timer feature for quizzes (1 min per question)
- ✅ Automatic study time tracking
- ✅ Enhanced UI with sliders and preset buttons
- ✅ Better error handling and user feedback

## 🐛 Troubleshooting

### Flashcards/Quizzes Not Generating

1. **Check Ollama is running:**
   ```bash
   ollama serve
   ```

2. **Verify model is installed:**
   ```bash
   ollama list
   ```

3. **Test your setup:**
   ```bash
   node test-ollama-flashcards.mjs
   ```

4. **Check your `.env` file** has correct `OLLAMA_BASE_URL` and `OLLAMA_MODEL`

### Timer Not Working

- Ensure you're using the latest version
- Timer starts automatically when quiz begins
- Time is tracked even if you finish early

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Ollama](https://ollama.com) for local AI
- UI inspired by modern educational platforms
- Powered by open-source AI models

---

<div align="center">
Made with ❤️ for students everywhere
</div>
