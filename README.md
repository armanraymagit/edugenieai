# 🎓 EduGenie AI - Your Intelligent Study Companion

<div align="center">

![EduGenie AI](https://img.shields.io/badge/EduGenie-AI%20Powered-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite)

**A modern, AI-powered study assistant that helps students learn smarter, not harder.**

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Usage](#-usage-guide) • [🛠️ Tech Stack](#️-tech-stack)

</div>

---

## 🌟 Overview

EduGenie AI is your personal study companion that leverages the power of local AI to help you master any subject. With interactive flashcards, timed quizzes, concept explanations, intelligent note summarization, and automatic study tracking - learning has never been this engaging!

**Why EduGenie AI?**
- 🔒 **100% Private** - All AI processing happens locally on your machine
- 💰 **Completely Free** - No API costs, no subscriptions
- 🚀 **Lightning Fast** - Local AI means instant responses
- 📊 **Track Progress** - Automatic study time and performance tracking
- 🎨 **Beautiful UI** - Modern, clean interface built with React & Tailwind

---

## ✨ Features

### 🃏 **Flashcard Master**
Generate AI-powered flashcards from any topic with stunning animations and an intuitive interface.

- 🎯 Create 5-50 flashcards instantly
- 🔄 Interactive flip animations
- 📝 Add custom notes for context
- 💡 Smart AI-generated content
- 🎨 Clean, distraction-free design

### 📝 **Quiz Master**
Test your knowledge with AI-generated multiple-choice quizzes featuring built-in timers.

- ⏱️ **Built-in Timer** - 1 minute per question for focused learning
- 🎯 5-30 customizable questions
- ✅ Real-time scoring and feedback
- 💡 Detailed explanations for each answer
- 📈 Automatic performance tracking

### 💬 **AI Explainer**
Your personal tutor that explains complex concepts in simple, understandable terms.

- 🤖 Interactive chat interface
- 📚 Context-aware responses
- 💡 Break down difficult topics
- ✨ **Markdown support** - Get beautifully formatted explanations
- 🔄 Follow-up questions encouraged

### 📄 **Note Summarizer**
Transform long, dense notes into concise, actionable key takeaways.

- ⚡ Extract important concepts instantly
- 📋 Structured summaries
- 🖼️ Support for text and image-based notes
- 💾 Save summaries for later review

### 📊 **Study Dashboard**
Visualize your learning journey with comprehensive analytics.

- 📈 Weekly activity charts
- ⏰ Automatic time tracking
- 🎯 Quiz performance metrics
- 📊 Study statistics at a glance
- 🔄 Reset functionality for fresh starts

### 🎯 **Lecture Buddy**
Process and summarize lecture content to capture key information efficiently.

- 📝 Extract essential points
- 🎓 Summarize lecture transcripts
- 💡 Identify core concepts
- 📚 Better lecture comprehension

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm** - [Download here](https://nodejs.org/)
- **Ollama** - Local AI runtime - [Download here](https://ollama.com)

### Installation

Follow these simple steps to get EduGenie AI running:

**1. Clone the repository**
```bash
git clone https://github.com/armanraymagit/edugenieai.git
cd edugenieai
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
# Ollama Configuration (Required)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_VISION_MODEL=llava

# Hugging Face API Key (Optional - for image generation)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**4. Install Ollama models**
```bash
# Install the default model for best performance
ollama pull llama3.2

# Optional: For better structured output
ollama pull llama3.1

# Optional: For image summarization
ollama pull llava
```

**5. Start Ollama server**
```bash
ollama serve
```

**6. Run the development server**
```bash
npm run dev
```

**7. Open your browser**

Navigate to **http://localhost:3000** and start learning! 🎉

---

## 🔧 Configuration

### Ollama Setup

EduGenie AI uses **Ollama** for all AI-powered features, ensuring:

- ✅ **100% Local & Private** - Your data stays on your machine
- ✅ **No API Costs** - Completely free to use
- ✅ **Offline Capable** - Works without internet (after initial setup)
- ✅ **Fast Responses** - No network latency

**Recommended Models:**

| Model | Use Case | Performance |
|-------|----------|-------------|
| `llama3.2` | Default - Best overall | ⭐⭐⭐⭐⭐ |
| `llama3.1` | Better JSON generation | ⭐⭐⭐⭐ |
| `mistral` | Alternative option | ⭐⭐⭐⭐ |

**Test your setup:**
```bash
node test-ollama-flashcards.mjs
```

This script will test flashcard generation and suggest the best model for your system.

### Hugging Face (Optional)

For AI-generated images in flashcards/quizzes:

1. Get your API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add it to your `.env` file
3. Images are disabled by default - enable in the UI settings

---

## 📖 Usage Guide

### Creating Flashcards

1. Navigate to **Flashcard Master** from the sidebar
2. Enter your topic (e.g., "Python Programming", "World War II")
3. Optionally add notes or context to guide the AI
4. Select the number of cards (5-50) using the slider or preset buttons
5. Click **Generate Flashcards**
6. Click on cards to flip and review - study at your own pace!

### Taking Quizzes

1. Navigate to **Quiz Master** from the sidebar
2. Enter your topic (e.g., "Machine Learning", "Chemistry")
3. Select the number of questions (5-30)
4. Click **Start Quiz**
5. **Timer starts automatically** - 1 minute per question ⏱️
6. Answer questions and get instant feedback
7. Review explanations to understand concepts better
8. Your time is automatically added to study hours 📊

### Chatting with AI Explainer

1. Navigate to **AI Explainer**
2. Ask any question or choose a suggestion
3. Get detailed, markdown-formatted explanations
4. Ask follow-up questions for deeper understanding
5. Clear chat history anytime for a fresh start

### Tracking Your Progress

Study time is automatically tracked for all activities:

| Activity | Time Tracked |
|----------|--------------|
| **Quizzes** | Actual time spent (timer-based) |
| **Flashcards** | 15 minutes per session |
| **Explainer** | 5 minutes per interaction |
| **Summarizer** | 10 minutes per summary |
| **Lecture Buddy** | 20 minutes per lecture |

View your progress anytime on the **Dashboard** with beautiful charts! 📊

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 19** - Latest React with modern features
- 📘 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS** - Utility-first styling
- ⚡ **Vite** - Lightning-fast build tool

### AI Services
- 🤖 **Ollama** - Local AI for flashcards, quizzes, and explanations
- 🖼️ **Hugging Face** - Optional image generation
- 📝 **React Markdown** - Beautiful markdown rendering

### Libraries & Tools
- 📊 **Recharts** - Interactive charts and visualizations
- 🔄 **React Hooks** - Modern state management
- 💾 **LocalStorage** - Persistent data storage

---

## 📁 Project Structure

```
edugenieai/
├── components/              # React components
│   ├── Dashboard.tsx       # Main dashboard with stats
│   ├── Explainer.tsx       # AI chat interface
│   ├── FlashcardsView.tsx  # Flashcard generator
│   ├── QuizView.tsx        # Quiz interface
│   ├── Summarizer.tsx      # Note summarizer
│   ├── LectureBuddy.tsx    # Lecture processor
│   └── Sidebar.tsx         # Navigation sidebar
├── services/               # AI service integrations
│   ├── ai.ts              # Main AI coordinator
│   ├── ollama.ts          # Ollama API integration
│   └── huggingface.ts     # Hugging Face API
├── types.ts               # TypeScript definitions
├── App.tsx                # Main app component
├── index.css              # Global styles
└── package.json           # Dependencies
```

---

## 🎯 Recent Updates

### ✨ Latest Release - v2.1

- ✅ **Fixed Markdown Rendering** - Chat messages now display properly formatted text
- ✅ **Added React Markdown** - Beautiful formatting in explanations
- ✅ **Improved Test Coverage** - Comprehensive component testing
- ✅ **Enhanced UI/UX** - Smoother animations and interactions

### 🔥 v2.0 - Ollama Integration

- ✅ Switched to Ollama for 100% local AI
- ✅ Improved JSON parsing for reliable generation
- ✅ Added quiz timer (1 min per question)
- ✅ Automatic study time tracking
- ✅ Enhanced UI with sliders and presets
- ✅ Better error handling

---

## 🐛 Troubleshooting

### Flashcards/Quizzes Not Generating

**1. Check if Ollama is running:**
```bash
ollama serve
```

**2. Verify the model is installed:**
```bash
ollama list
```

**3. Test your setup:**
```bash
node test-ollama-flashcards.mjs
```

**4. Check your `.env` file** - Ensure `OLLAMA_BASE_URL` and `OLLAMA_MODEL` are correct

### Timer Not Working

- Ensure you're using the latest version
- Timer starts automatically when quiz begins
- Time is tracked even if you finish early
- Check browser console for errors

### Markdown Not Rendering

- This should be fixed in v2.1
- Clear browser cache and reload
- Ensure `react-markdown` is installed

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. ✨ Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

---

## 📜 License

This project is open source and available under the **MIT License**.

---

## 🙏 Acknowledgments

- 🤖 Built with [Ollama](https://ollama.com) for local AI
- 🎨 UI inspired by modern educational platforms
- 💪 Powered by open-source AI models
- ❤️ Made for students everywhere

---

<div align="center">

### ⭐ Star this repo if EduGenie AI helps you learn better!

**Made with ❤️ by Arman**

[Report Bug](https://github.com/armanraymagit/edugenieai/issues) • [Request Feature](https://github.com/armanraymagit/edugenieai/issues)

</div>
