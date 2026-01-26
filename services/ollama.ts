import { Flashcard, QuizQuestion } from "../types";

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// Default to llama3.2 (widely available), but llama3.1 is better for JSON if available
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
  format?: 'json' | object; // Can be 'json' string or JSON schema object
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
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Ollama API error:', response.status, errorText);
      
      if (response.status === 404) {
        throw new Error(`Model "${request.model}" not found. Please install it with: ollama pull ${request.model}`);
      }
      
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}. ${errorText.substring(0, 200)}`);
    }

    const data: OllamaResponse = await response.json();
    
    if (!data.response) {
      throw new Error('Ollama returned empty response');
    }
    
    return data.response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error; // Re-throw model not found errors
    }
    console.error('Ollama API call failed:', error);
    throw new Error(`Failed to connect to Ollama. Make sure Ollama is running at ${OLLAMA_BASE_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * Note: includeImages parameter is accepted for compatibility but Ollama doesn't generate images
 */
export const generateFlashcards = async (topic: string, content: string, count: number = 8, includeImages: boolean = false): Promise<Flashcard[]> => {
  const prompt = `Generate exactly ${count} flashcards based on the following topic and content.

Topic: ${topic}
Content: ${content || 'No additional content provided.'}

IMPORTANT: Return ONLY a JSON array. Do not include any explanation, markdown, or text outside the JSON array.
Each flashcard must have exactly two fields: "front" and "back".`;

  // Use JSON schema for better reliability
  const jsonSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        front: { type: 'string' },
        back: { type: 'string' }
      },
      required: ['front', 'back'],
      additionalProperties: false
    }
  };

  const response = await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    format: jsonSchema, // Use JSON schema for structured output
    options: {
      temperature: 0.7,
    },
    system: "You are an expert at creating educational flashcards. You must respond with a valid JSON array only, no other text."
  });

  try {
    // Parse the response
    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON array from response
      const startIndex = response.indexOf('[');
      const endIndex = response.lastIndexOf(']') + 1;
      
      if (startIndex === -1 || endIndex <= startIndex) {
        console.error('No JSON array found in Ollama response:', response.substring(0, 200));
        throw new Error('AI returned invalid format (no array found).');
      }
      
      const jsonStr = response.substring(startIndex, endIndex);
      parsed = JSON.parse(jsonStr);
    }
    
    // Handle various Ollama response formats
    let rawJson: any[] = [];
    
    if (Array.isArray(parsed)) {
      // Direct array format (most common with JSON schema)
      rawJson = parsed;
    } else if (parsed && parsed.type === 'array') {
      // Ollama structured format: { type: "array", data: [...] } or { type: "array", items: [...] }
      if (Array.isArray(parsed.items)) {
        rawJson = parsed.items;
      } else if (Array.isArray(parsed.data)) {
        rawJson = parsed.data;
      } else {
        throw new Error('AI response has type "array" but no data/items field found.');
      }
    } else {
      throw new Error('AI response parsed but is not an array.');
    }
    
    // Filter and extract actual card data
    const cards = rawJson
      .filter((item: any) => {
        // Skip schema definitions
        if (item && item.properties) return false;
        // Keep items that have 'front' and 'back' fields
        return item && typeof item === 'object' && (item.front !== undefined || item.back !== undefined);
      })
      .map((item: any) => {
        // Handle nested data structures
        if (item && item.type === 'object' && item.data) {
          return item.data;
        }
        return item;
      });
    
    if (cards.length === 0) {
      throw new Error('No valid flashcards found in response.');
    }
    
    return cards.map((item: any, index: number) => ({
      front: String(item.front || ''),
      back: String(item.back || ''),
      id: `card-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Failed to parse flashcards JSON:', error, 'Response:', response.substring(0, 500));
    throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate a quiz from topic and content
 * Enforces JSON output mode for reliability
 * Note: includeImages parameter is accepted for compatibility but Ollama doesn't generate images
 */
export const generateQuiz = async (topic: string, content: string, count: number = 5, includeImages: boolean = false): Promise<QuizQuestion[]> => {
  const prompt = `Generate exactly ${count} multiple choice quiz questions based on the following topic and content.

Topic: ${topic}
Content: ${content || 'No additional content provided.'}

IMPORTANT: Return ONLY a JSON array. Do not include any explanation, markdown, or text outside the JSON array.
Each question must have: "question", "options" (array of 4 strings), "correctAnswer" (must match one option exactly), and "explanation".`;

  // Use JSON schema for better reliability
  const jsonSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        options: {
          type: 'array',
          items: { type: 'string' },
          minItems: 4,
          maxItems: 4
        },
        correctAnswer: { type: 'string' },
        explanation: { type: 'string' }
      },
      required: ['question', 'options', 'correctAnswer', 'explanation'],
      additionalProperties: false
    }
  };

  const response = await callOllama({
    model: OLLAMA_MODEL,
    prompt,
    format: jsonSchema, // Use JSON schema for structured output
    options: {
      temperature: 0.7,
    },
    system: "You are an expert at creating educational quizzes. You must respond with a valid JSON array only, no other text. The correctAnswer must exactly match one of the options."
  });

  try {
    // Parse the response
    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON array from response
      const startIndex = response.indexOf('[');
      const endIndex = response.lastIndexOf(']') + 1;
      
      if (startIndex === -1 || endIndex <= startIndex) {
        console.error('No JSON array found in Ollama response:', response.substring(0, 200));
        throw new Error('AI returned invalid format (no array found).');
      }
      
      const jsonStr = response.substring(startIndex, endIndex);
      parsed = JSON.parse(jsonStr);
    }
    
    // Handle various Ollama response formats
    let rawJson: any[] = [];
    
    if (Array.isArray(parsed)) {
      // Direct array format (most common with JSON schema)
      rawJson = parsed;
    } else if (parsed && parsed.type === 'array') {
      // Ollama structured format: { type: "array", data: [...] } or { type: "array", items: [...] }
      if (Array.isArray(parsed.items)) {
        rawJson = parsed.items;
      } else if (Array.isArray(parsed.data)) {
        rawJson = parsed.data;
      } else {
        throw new Error('AI response has type "array" but no data/items field found.');
      }
    } else {
      throw new Error('AI response parsed but is not an array.');
    }
    
    // Filter and extract actual question data
    const questions = rawJson
      .filter((item: any) => {
        // Skip schema definitions
        if (item && item.properties) return false;
        // Keep items that have 'question' field
        return item && typeof item === 'object' && item.question !== undefined;
      })
      .map((item: any) => {
        // Handle nested data structures
        if (item && item.type === 'object' && item.data) {
          return item.data;
        }
        return item;
      });
    
    if (questions.length === 0) {
      throw new Error('No valid quiz questions found in response.');
    }
    
    return questions.map((item: any, index: number) => ({
      question: String(item.question || ''),
      options: Array.isArray(item.options) ? item.options.map((opt: any) => String(opt)) : [],
      correctAnswer: String(item.correctAnswer || ''),
      explanation: String(item.explanation || ''),
      id: `quiz-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error, 'Response:', response.substring(0, 500));
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
