
/**
 * Hugging Face AI Service
 * Using Inference API for both Text and Image generation.
 */

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const TEXT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
const IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

/**
 * Generic text generation helper
 */
const generateText = async (prompt: string, systemPrompt?: string): Promise<string> => {
    if (!HF_API_KEY) throw new Error("Hugging Face API key not found.");

    const response = await fetch(
        `https://api-inference.huggingface.co/models/${TEXT_MODEL}`,
        {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] ${systemPrompt ? systemPrompt + "\n\n" : ""}${prompt} [/INST]`,
                parameters: { max_new_tokens: 1000, temperature: 0.7 }
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`HF API Error: ${response.status} ${JSON.stringify(err)}`);
    }

    const result = await response.json();
    // HF returns an array or single object depending on model
    const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;

    // Strip the instruction part if present (standard for Mistral/Llama instruct)
    return generatedText.split('[/INST]').pop().trim();
};

/**
 * Generates an image based on a text prompt.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
    if (!HF_API_KEY) {
        console.warn("HuggingFace API key not found. Images will not be generated.");
        return null;
    }

    // Enhance prompt for educational visual aid
    const enhancedPrompt = `educational illustration of ${prompt}, high quality, clean background, 4k resolution`;

    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${IMAGE_MODEL}`,
            {
                headers: { Authorization: `Bearer ${HF_API_KEY}` },
                method: "POST",
                body: JSON.stringify({ inputs: enhancedPrompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.warn(`Image generation failed (${response.status}):`, errorText.substring(0, 200));
            return null;
        }

        // Check if response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.warn("Image generation returned non-image response:", errorText.substring(0, 200));
            return null;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};

/**
 * Batch generate images for flashcards or quiz questions
 */
export const batchGenerateImages = async (prompts: string[]): Promise<(string | null)[]> => {
    // To avoid hitting HF rate limits too hard, we could do them in small chunks 
    // but for now we'll just use Promise.all and see how it goes.
    const tasks = prompts.map(p => generateImage(p));
    return Promise.all(tasks);
};

/**
 * Generate flashcards using Hugging Face
 */
export const generateFlashcards = async (topic: string, content: string, count: number = 8, includeImages: boolean = false): Promise<any[]> => {
    const systemPrompt = "You are a teacher. Create educational flashcards. Return ONLY a JSON array of objects with 'front' and 'back' properties.";
    const prompt = `Generate ${count} flashcards about: Topic: ${topic}. Context: ${content}. 
  Return exactly ${count} flashcards in this format: [{"front": "...", "back": "..."}]`;

    const text = await generateText(prompt, systemPrompt);
    try {
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']') + 1;

        if (startIndex === -1 || endIndex <= startIndex) {
            console.error("No JSON array found in HF response:", text);
            throw new Error("AI returned invalid format (no array found).");
        }

        const jsonStr = text.substring(startIndex, endIndex);
        let cards = JSON.parse(jsonStr);

        if (!Array.isArray(cards)) {
            throw new Error("AI response parsed but is not an array.");
        }

        cards = cards.map((c: any, i: number) => ({ ...c, id: `hf-card-${Date.now()}-${i}` }));

        if (includeImages) {
            const imagePrompts = cards.map((c: any) => c.front);
            const images = await batchGenerateImages(imagePrompts);
            return cards.map((c: any, i: number) => ({ ...c, imageUrl: images[i] || undefined }));
        }

        return cards;
    } catch (e: any) {
        console.error("Failed to parse HF flashcards JSON:", text, e);
        throw new Error(`Could not parse AI response: ${e.message}`);
    }
};

/**
 * Generate quiz using Hugging Face
 */
export const generateQuiz = async (topic: string, content: string, count: number = 5, includeImages: boolean = false): Promise<any[]> => {
    const systemPrompt = "You are a quiz master. Create multiple choice questions. Return ONLY a JSON array of objects.";
    const prompt = `Generate a ${count}-question quiz about: Topic: ${topic}. Content: ${content}.
  Return exactly ${count} questions in this format: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "...", "explanation": "..."}]`;

    const text = await generateText(prompt, systemPrompt);
    try {
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']') + 1;

        if (startIndex === -1 || endIndex <= startIndex) {
            console.error("No JSON array found in HF response:", text);
            throw new Error("AI returned invalid format (no array found).");
        }

        const jsonStr = text.substring(startIndex, endIndex);
        let quiz = JSON.parse(jsonStr);

        if (!Array.isArray(quiz)) {
            throw new Error("AI response parsed but is not an array.");
        }

        quiz = quiz.map((q: any, i: number) => ({ ...q, id: `hf-quiz-${Date.now()}-${i}` }));

        if (includeImages) {
            const imagePrompts = quiz.map((q: any) => q.question);
            const images = await batchGenerateImages(imagePrompts);
            return quiz.map((q: any, i: number) => ({ ...q, imageUrl: images[i] || undefined }));
        }

        return quiz;
    } catch (e: any) {
        console.error("Failed to parse HF quiz JSON:", text, e);
        throw new Error(`Could not parse AI response: ${e.message}`);
    }
};
