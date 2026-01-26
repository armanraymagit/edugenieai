
import React, { useState } from 'react';
import { generateQuiz, enhanceQuizWithImage } from '../services/ai';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  onQuizComplete?: (score: number, total: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ onQuizComplete }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);

  const handleStart = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const quiz = await generateQuiz(topic, content, questionCount, includeImages);
      setQuestions(quiz);
      setCurrentIdx(0);
      setScore(0);
      setQuizFinished(false);
      setShowResult(false);

      // Lazily load images for first 3 questions if not included
      if (!includeImages) {
        quiz.forEach(async (q, idx) => {
          if (idx < 3) {
            const enhanced = await enhanceQuizWithImage(q);
            setQuestions(prev => prev.map(item => item.id === q.id ? enhanced : item));
          }
        });
      }
    } catch (error) {
      alert("Error generating quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
    setShowResult(true);
    if (option === questions[currentIdx].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
      if (onQuizComplete) onQuizComplete(score, questions.length);
    }
  };

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12">
          <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🏆</div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Quiz Completed!</h2>
          <div className="my-8 py-6 px-8 bg-slate-50 rounded-2xl flex justify-between items-center">
            <span className="text-slate-600 font-medium">Final Score</span>
            <span className="text-3xl font-bold text-indigo-600">{score} / {questions.length}</span>
          </div>
          <button onClick={() => setQuestions([])} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            Back to Quiz Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-display font-bold text-slate-800">Quiz Master</h2>
        <p className="text-slate-500">Test your knowledge with real-time feedback.</p>
      </header>

      {questions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-600 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Generate a New Quiz</h3>
            <div className="text-left space-y-4">
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic..." className="w-full px-4 py-3 rounded-xl border outline-none font-medium" />
              <div className="flex items-center space-x-4 bg-slate-50 px-4 py-3 rounded-xl border">
                <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Number of Questions:</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.min(100, Math.max(5, parseInt(e.target.value) || 5)))}
                  className="w-full bg-transparent outline-none font-medium text-slate-800"
                />
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Notes (optional)..." className="w-full h-32 px-4 py-3 rounded-xl border resize-none" />

              <div className="flex items-center justify-between bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500 rounded-lg text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">Include AI Images</p>
                    <p className="text-xs text-amber-600">Powered by Stable Diffusion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIncludeImages(!includeImages)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${includeImages ? 'bg-amber-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${includeImages ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <button onClick={handleStart} disabled={isLoading || !topic.trim()} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all disabled:opacity-50">
              {isLoading ? 'Generating...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">Question {currentIdx + 1} of {questions.length}</span>
            <div className="text-sm font-bold text-slate-700">Score: {score}</div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-stretch">

            <div className={`flex flex-col md:flex-row gap-8 ${questions[currentIdx].imageUrl ? 'items-start' : 'items-center'}`}>

              {/* Question Content */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest">Question</span>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">{questions[currentIdx].question}</h3>
                </div>

                <div className="space-y-3">
                  {questions[currentIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      disabled={showResult}
                      className={`w-full p-5 rounded-2xl border-2 text-left font-semibold transition-all shadow-sm ${showResult
                        ? (opt === questions[currentIdx].correctAnswer
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-50'
                          : (selectedAnswer === opt ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-rose-50' : 'opacity-40 border-slate-50 font-normal'))
                        : 'hover:bg-amber-50 hover:border-amber-200 border-slate-100 text-slate-700 active:scale-[0.98]'
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-sm ${showResult && opt === questions[currentIdx].correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Side Image (If available) */}
              {questions[currentIdx].imageUrl && (
                <div className="w-full md:w-80 h-80 bg-slate-50 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center animate-fadeIn border border-slate-50">
                  <img src={questions[currentIdx].imageUrl} alt="Visual Hint" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {showResult && (
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl animate-slideUp border border-slate-100">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${selectedAnswer === questions[currentIdx].correctAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {selectedAnswer === questions[currentIdx].correctAnswer ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">{selectedAnswer === questions[currentIdx].correctAnswer ? 'Splendid!' : 'Not quite right'}</p>
                    <p className="text-slate-600 leading-relaxed">{questions[currentIdx].explanation}</p>
                  </div>
                </div>
                <button onClick={nextQuestion} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                  {currentIdx + 1 === questions.length ? 'Finish & See Summary' : 'Move to Next Question'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
