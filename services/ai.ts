
import * as Ollama from './ollama';
import * as HuggingFace from './huggingface';
import { Flashcard, QuizQuestion } from '../types';

/**
 * Coordinator Service
 * Now uses Hugging Face for Flashcards and Quizzes primarily.
 * Keeps Ollama for local-only fallbacks or simpler summaries.
 * GEMINI COMPLETELY REMOVED.
 */

export const explainConcept = async (topic: string, context: string = ''): Promise<string> => {
    // Stick with Ollama for chat to keep it local if possible, 
    // or we could use HF here too. Given user asked for "locally or whatever is best",
    // HF Inference API is often "best" in quality, Ollama is best for "local".
    // I'll keep Ollama as default for the Chatbot (Explainer) since it's already working well.
    return Ollama.explainConcept(topic, context);
};

export const summarizeNotes = async (notes: string): Promise<string> => {
    return Ollama.summarizeNotes(notes);
};

export const summarizeImage = async (base64Data: string, mimeType: string): Promise<string> => {
    return Ollama.summarizeImage(base64Data, mimeType);
};

/**
 * Flashcard Generation - Now uses Hugging Face
 */
export const generateFlashcards = async (topic: string, content: string, count: number = 5, includeImages: boolean = false): Promise<Flashcard[]> => {
    return HuggingFace.generateFlashcards(topic, content, count, includeImages);
};

/**
 * Quiz Generation - Now uses Hugging Face
 */
export const generateQuiz = async (topic: string, content: string, count: number = 5, includeImages: boolean = false): Promise<QuizQuestion[]> => {
    return HuggingFace.generateQuiz(topic, content, count, includeImages);
};

/**
 * Lazy Image Enhancement (Call this for individual cards/questions to avoid blocking)
 */
export const enhanceFlashcardWithImage = async (card: Flashcard): Promise<Flashcard> => {
    const imageUrl = await HuggingFace.generateImage(card.front);
    return { ...card, imageUrl: imageUrl || undefined };
};

export const enhanceQuizWithImage = async (question: QuizQuestion): Promise<QuizQuestion> => {
    const imageUrl = await HuggingFace.generateImage(question.question);
    return { ...question, imageUrl: imageUrl || undefined };
};

export const summarizeLecture = async (content: string, type: 'text' | 'media' = 'text', _mimeType?: string): Promise<string> => {
    if (type === 'media') {
        return "Media summarization currently requires Gemini. Since Gemini was removed, please paste the transcript text instead to use Ollama/HuggingFace.";
    }
    return Ollama.summarizeNotes(content);
};

export const generateImage = HuggingFace.generateImage;
