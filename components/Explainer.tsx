
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface ExplainerProps {
  onInteraction?: () => void;
}

const SUGGESTIONS = [
  "Explain Photosynthesis with an analogy",
  "How do Black Holes work?",
  "What are React Hooks?",
  "Simple guide to the French Revolution",
  "Explain the Pythagorean Theorem"
];

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const Explainer: React.FC<ExplainerProps> = ({ onInteraction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm EduGenie, your AI Study Buddy. I can explain any concept, simplify your notes, or help you brainstorm ideas. What are we learning today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input.trim();
    if (!textToSend || isTyping) return;

    setInput('');
    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push(userMessage);
    setIsTyping(true);
    if (onInteraction) onInteraction();

    try {
      const context = conversationHistoryRef.current
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `${context}\n\nUser: ${textToSend}\n\nAssistant:`;

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: true,
          system: "You are a friendly, world-class academic tutor. Use the Feynman Technique. Encourage follow-up questions.",
          options: { temperature: 0.8 },
        }),
      });

      if (!response.ok) throw new Error('Ollama API error');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: fullResponse };
                  return updated;
                });
              }
            } catch (e) { }
          }
        }
      }
      conversationHistoryRef.current.push({ role: 'assistant', content: fullResponse });
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Ollama isn't responding. Is it running?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear this conversation history?")) {
      conversationHistoryRef.current = [];
      setMessages([{ role: 'assistant', content: "Fresh start! What concept should we tackle now?" }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col space-y-4">
      <header className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Study Chatbot</h2>
        </div>
        <button onClick={clearChat} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </header>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                <div className="prose prose-sm max-w-none leading-relaxed">
                  {msg.content ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    isTyping && idx === messages.length - 1 ? "..." : ""
                  )}
                </div>
              </div>
            </div>
          ))}
          {messages.length < 3 && !isTyping && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium border border-indigo-100">{s}</button>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white pt-10">
          <div className="relative max-w-3xl mx-auto">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask follow-up..." className="w-full pl-6 pr-14 py-4 rounded-2xl border focus:border-indigo-500 shadow-xl outline-none text-slate-700 bg-white" />
            <button onClick={() => handleSend()} disabled={isTyping || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl disabled:bg-slate-200">
              {isTyping ? "..." : ">"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explainer;
