
import React, { useState } from 'react';
import { generateFlashcards, enhanceFlashcardWithImage } from '../services/ai';
import { Flashcard } from '../types';

interface FlashcardsViewProps {
  onSessionComplete?: () => void;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onSessionComplete }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [cardCount, setCardCount] = useState(8);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const generated = await generateFlashcards(topic, content, cardCount, includeImages);
      setCards(generated);
      setCurrentIndex(0);
      setIsFlipped(false);

      // If images weren't included in the main call, lazily load them for first 5
      if (!includeImages) {
        generated.forEach(async (card, idx) => {
          if (idx < 5) {
            const enhanced = await enhanceFlashcardWithImage(card);
            setCards(prev => prev.map(c => c.id === card.id ? enhanced : c));
          }
        });
      }

      if (onSessionComplete) onSessionComplete();
    } catch (error) {
      alert("Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-display font-bold text-slate-800">Flashcard Master</h2>
        <p className="text-slate-500">Memorize smarter with AI-generated flashcards.</p>
      </header>

      {cards.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <h3 className="text-xl font-bold text-slate-800">Start Your Session</h3>
            <div className="text-left space-y-4">
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic..." className="w-full px-4 py-3 rounded-xl border outline-none font-medium" />
              <div className="flex items-center space-x-4 bg-slate-50 px-4 py-3 rounded-xl border">
                <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Number of Cards:</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={cardCount}
                  onChange={(e) => setCardCount(Math.min(100, Math.max(5, parseInt(e.target.value) || 5)))}
                  className="w-full bg-transparent outline-none font-medium text-slate-800"
                />
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Notes..." className="w-full h-32 px-4 py-3 rounded-xl border outline-none resize-none" />

              <div className="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900">Include AI Images</p>
                    <p className="text-xs text-indigo-600">Powered by Stable Diffusion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIncludeImages(!includeImages)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${includeImages ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${includeImages ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !topic.trim()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
              {isLoading ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCards([])} className="text-slate-400 hover:text-slate-600 flex items-center space-x-1">
              <span>Back</span>
            </button>
            <span className="font-bold text-slate-800">{topic}</span>
          </div>

          <div className="w-full max-w-2xl aspect-[16/10] relative perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>

              {/* Front Face: Image + Text */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-center gap-8">
                {cards[currentIndex].imageUrl ? (
                  <div className="w-full md:w-1/2 h-48 md:h-full flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden animate-fadeIn">
                    <img src={cards[currentIndex].imageUrl} alt="Visual Aid" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-slate-50 rounded-2xl text-slate-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                  </div>
                )}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Question</p>
                  <p className="text-2xl font-bold text-slate-800 leading-tight">{cards[currentIndex].front}</p>
                </div>
              </div>

              {/* Back Face: Just text (Definition) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl shadow-xl p-12 flex flex-col items-center justify-center text-center text-white">
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Answer</p>
                <p className="text-2xl font-medium leading-relaxed">{cards[currentIndex].back}</p>
              </div>

            </div>
          </div>

          <div className="flex items-center space-x-8">
            <button onClick={prevCard} className="p-4 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-slate-500 font-bold px-6 py-2 bg-white rounded-full border shadow-sm">
              <span>{currentIndex + 1}</span> / {cards.length}
            </div>
            <button onClick={nextCard} className="p-4 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
      <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};

export default FlashcardsView;
