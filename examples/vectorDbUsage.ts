/**
 * Example: Using Vector Database in EduGenie AI
 * 
 * This file demonstrates how to integrate the vector database
 * for semantic search and study material storage.
 */

import { initializeVectorDb, getVectorDbService } from './services/vectorDb';

// ============================================
// Example 1: Initialize Vector Database
// ============================================

async function setupVectorDb() {
    try {
        const vectorDb = await initializeVectorDb();
        console.log('Vector database initialized!');
        return vectorDb;
    } catch (error) {
        console.error('Failed to initialize vector database:', error);
        // Gracefully handle - app can still work without vector DB
        return null;
    }
}

// ============================================
// Example 2: Store Study Materials
// ============================================

async function storeStudyMaterials() {
    const vectorDb = getVectorDbService();

    const materials = [
        {
            id: 'react-hooks-1',
            content: 'useState is a Hook that lets you add state to functional components. Call useState at the top level of your component to declare a state variable.',
            metadata: {
                topic: 'React',
                subtopic: 'Hooks',
                difficulty: 'beginner',
                type: 'concept'
            }
        },
        {
            id: 'react-hooks-2',
            content: 'useEffect lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
            metadata: {
                topic: 'React',
                subtopic: 'Hooks',
                difficulty: 'intermediate',
                type: 'concept'
            }
        },
        {
            id: 'js-async-1',
            content: 'async/await is syntactic sugar for Promises. An async function always returns a Promise, and await pauses execution until the Promise resolves.',
            metadata: {
                topic: 'JavaScript',
                subtopic: 'Async',
                difficulty: 'intermediate',
                type: 'concept'
            }
        }
    ];

    await vectorDb.addDocuments(materials);
    console.log(`Stored ${materials.length} study materials`);
}

// ============================================
// Example 3: Search for Relevant Content
// ============================================

async function searchStudyMaterials(query: string) {
    const vectorDb = getVectorDbService();

    // Get top 5 most relevant results
    const results = await vectorDb.similaritySearch(query, 5);

    console.log(`Found ${results.length} results for: "${query}"`);
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.metadata.topic} - ${result.metadata.subtopic}`);
        console.log(`   Similarity: ${(1 - result.distance).toFixed(2)}`);
        console.log(`   Content: ${result.content.substring(0, 100)}...`);
    });

    return results;
}

// ============================================
// Example 4: Search with Quality Threshold
// ============================================

async function searchWithQualityFilter(query: string) {
    const vectorDb = getVectorDbService();

    // Only return results with distance < 0.3 (very similar)
    const results = await vectorDb.similaritySearchWithThreshold(query, 5, 0.3);

    if (results.length === 0) {
        console.log('No highly relevant results found. Try a different query.');
        return [];
    }

    return results;
}

// ============================================
// Example 5: Integration with React Component
// ============================================

/**
 * Example React hook for vector search
 */
export function useVectorSearch() {
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const search = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const vectorDb = getVectorDbService();
            const searchResults = await vectorDb.similaritySearch(query, 5);
            setResults(searchResults);
        } catch (err) {
            setError(err.message);
            console.error('Vector search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return { results, loading, error, search };
}

// ============================================
// Example 6: Smart Study Assistant
// ============================================

/**
 * Combines vector search with AI generation
 */
async function smartStudyAssistant(userQuestion: string) {
    const vectorDb = getVectorDbService();

    // 1. Find relevant study materials
    const relevantMaterials = await vectorDb.similaritySearchWithThreshold(
        userQuestion,
        3,
        0.4
    );

    if (relevantMaterials.length === 0) {
        return {
            answer: 'I don\'t have specific study materials on this topic yet.',
            sources: []
        };
    }

    // 2. Combine context from relevant materials
    const context = relevantMaterials
        .map(m => m.content)
        .join('\n\n');

    // 3. Use context to generate a better answer with Gemini
    // (This would integrate with your existing AI service)
    const prompt = `Based on these study materials:\n\n${context}\n\nAnswer this question: ${userQuestion}`;

    return {
        answer: 'Generated answer would go here',
        sources: relevantMaterials.map(m => ({
            topic: m.metadata.topic,
            content: m.content.substring(0, 100) + '...'
        }))
    };
}

// ============================================
// Example 7: Batch Import from Flashcards
// ============================================

async function importFlashcardsToVectorDb(flashcards: any[]) {
    const vectorDb = getVectorDbService();

    const documents = flashcards.map((card, index) => ({
        id: `flashcard-${index}-${Date.now()}`,
        content: `Question: ${card.question}\nAnswer: ${card.answer}`,
        metadata: {
            type: 'flashcard',
            topic: card.topic || 'general',
            difficulty: card.difficulty || 'medium',
            createdAt: new Date().toISOString()
        }
    }));

    await vectorDb.addDocuments(documents);
    console.log(`Imported ${documents.length} flashcards to vector database`);
}

// ============================================
// Example 8: Get Database Statistics
// ============================================

async function getDatabaseStats() {
    const vectorDb = getVectorDbService();
    const stats = await vectorDb.getStats();

    console.log('Vector Database Statistics:');
    console.log(`- Total documents: ${stats.count}`);

    return stats;
}

// ============================================
// Example 9: Clear Old Data
// ============================================

async function clearOldStudyMaterials() {
    const vectorDb = getVectorDbService();

    // Warning: This clears ALL data!
    const confirmed = confirm('Are you sure you want to clear all study materials?');

    if (confirmed) {
        await vectorDb.clearCollection();
        console.log('All study materials cleared');
    }
}

// ============================================
// Example 10: App Initialization
// ============================================

/**
 * Initialize vector database when app starts
 */
export async function initializeApp() {
    console.log('Initializing EduGenie AI...');

    // Try to initialize vector database
    const vectorDb = await setupVectorDb();

    if (vectorDb) {
        // Check if we have any data
        const stats = await vectorDb.getStats();

        if (stats.count === 0) {
            console.log('Vector database is empty. Consider importing study materials.');
        } else {
            console.log(`Vector database ready with ${stats.count} documents`);
        }
    } else {
        console.log('Running without vector database features');
    }

    return { vectorDb };
}

// ============================================
// Usage in Your App
// ============================================

/*
// In your main App.tsx or index.tsx:

import { initializeApp } from './examples/vectorDbUsage';

// On app mount
useEffect(() => {
  initializeApp().then(({ vectorDb }) => {
    if (vectorDb) {
      console.log('App ready with vector search!');
    }
  });
}, []);

// In a search component:
const { results, loading, search } = useVectorSearch();

<input 
  onChange={(e) => search(e.target.value)}
  placeholder="Search study materials..."
/>

{loading && <p>Searching...</p>}
{results.map(result => (
  <div key={result.id}>
    <h3>{result.metadata.topic}</h3>
    <p>{result.content}</p>
  </div>
))}
*/
