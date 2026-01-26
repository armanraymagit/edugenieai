import { Flashcard, QuizQuestion } from "../types";

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
  system?: string;
  images?: string[];
}

/**
 * Generic function to call Ollama API with error handling
 */
const callOllama = async (request: OllamaGenerateRequest): Promise<string> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: false, // We always want the complete response here
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama API call failed:', error);
    throw new Error(`Failed to connect to Ollama. Make sure Ollama is running at ${OLLAMA_BASE_URL}`);
  }
};

/**
 * Explain a concept to a student
 */
export const explainConcept = async (topic: string, context: string = ''): Promise<string> => {
  const prompt = `Explain the following concept to a student: "${topic}". 
  ${context ? `Use this context: ${context}.` : ''} 
  Provide a simple, clear explanation with examples. Use Markdown formatting for headings and lists.`;

  return await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    options: {
      temperature: 0.7,
    },
    system: "You are a world-class tutor who excels at simplifying complex topics using analogies and clear language."
  });
};

/**
 * Summarize study notes
 */
export const summarizeNotes = async (notes: string): Promise<string> => {
  const prompt = `Summarize these study notes into clear bullet points and highlight the most important concepts:\n\n${notes}`;

  return await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    options: {
      temperature: 0.3,
    },
    system: "You are a professional note-taker. Extract the core essence of the provided text while maintaining factual accuracy."
  });
};

/**
 * Summarize text from an image (OCR + summarization)
 * Uses the configured vision model (default: llava)
 */
export const summarizeImage = async (base64Data: string, _mimeType: string): Promise<string> => {
  try {
    const visionModel = process.env.OLLAMA_VISION_MODEL || 'llava';

    // Ensure we send raw base64 without data URL prefix if present
    const base64Clean = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

    return await callOllama({
      model: visionModel,
      prompt: "Extract the text from this image of notes and summarize it into clear bullet points. Highlight key terms and main takeaways.",
      images: [base64Clean],
      options: {
        temperature: 0.3,
      },
    });
  } catch (error) {
    console.error('Image processing failed:', error);
    return "Failed to process the image. Make sure you have a vision model like 'llava' installed in Ollama.";
  }
};

/**
 * Generate flashcards from topic and content
 * Enforces JSON output mode for reliability
 */
export const generateFlashcards = async (topic: string, content: string, count: number = 8): Promise<Flashcard[]> => {
  const prompt = `Generate ${count} flashcards based on the following:
Topic: ${topic}
Content: ${content}

Return a valid JSON array with this exact structure:
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]`;

  const response = await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    format: 'json', // Enforce JSON mode
    options: {
      temperature: 0.7,
    },
    system: "You are an expert at creating educational flashcards. Always respond with valid JSON only."
  });

  try {
    const rawJson = JSON.parse(response);
    return rawJson.map((item: any, index: number) => ({
      ...item,
      id: `card-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Failed to parse flashcards JSON:', error);
    return [];
  }
};

/**
 * Generate a quiz from topic and content
 * Enforces JSON output mode for reliability
 */
export const generateQuiz = async (topic: string, content: string, count: number = 5): Promise<QuizQuestion[]> => {
  const prompt = `Generate a ${count}-question multiple choice quiz about:
Topic: ${topic}
Content: ${content}

Return a valid JSON array with this exact structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this answer is correct"
  }
]

Important: The correctAnswer must match EXACTLY one of the options.`;

  const response = await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    format: 'json', // Enforce JSON mode
    options: {
      temperature: 0.7,
    },
    system: "You are an expert at creating educational quizzes. Always respond with valid JSON only."
  });

  try {
    const rawJson = JSON.parse(response);
    return rawJson.map((item: any, index: number) => ({
      ...item,
      id: `quiz-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error);
    return [];
  }
};
