import { ChromaClient, Collection } from 'chromadb';

export interface VectorDbConfig {
    url?: string; // ChromaDB server URL, defaults to http://localhost:8000
    collectionName: string;
}

export interface Document {
    id: string;
    content: string;
    metadata?: Record<string, any>;
}

export class VectorDbService {
    private client: ChromaClient | null = null;
    private collection: Collection | null = null;
    private config: VectorDbConfig;

    constructor(config: VectorDbConfig) {
        this.config = {
            url: config.url || 'http://localhost:8000',
            collectionName: config.collectionName,
        };
    }

    /**
     * Initialize the ChromaDB client and collection
     */
    async initialize(): Promise<void> {
        try {
            this.client = new ChromaClient({
                path: this.config.url,
            });

            // Get or create collection
            this.collection = await this.client.getOrCreateCollection({
                name: this.config.collectionName,
            });

            console.log('Vector database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize vector database:', error);
            throw error;
        }
    }

    /**
     * Add documents to the vector store
     */
    async addDocuments(documents: Document[]): Promise<void> {
        if (!this.collection) {
            throw new Error('Collection not initialized. Call initialize() first.');
        }

        const ids = documents.map(doc => doc.id);
        const contents = documents.map(doc => doc.content);
        const metadatas = documents.map(doc => doc.metadata || {});

        await this.collection.add({
            ids,
            documents: contents,
            metadatas,
        });

        console.log(`Added ${documents.length} documents to vector store`);
    }

    /**
     * Search for similar documents
     */
    async similaritySearch(
        query: string,
        k: number = 5
    ): Promise<{ id: string; content: string; metadata: Record<string, any>; distance: number }[]> {
        if (!this.collection) {
            throw new Error('Collection not initialized. Call initialize() first.');
        }

        const results = await this.collection.query({
            queryTexts: [query],
            nResults: k,
        });

        // Transform results to a more usable format
        const documents: { id: string; content: string; metadata: Record<string, any>; distance: number }[] = [];

        if (results.ids && results.ids[0]) {
            for (let i = 0; i < results.ids[0].length; i++) {
                documents.push({
                    id: results.ids[0][i],
                    content: results.documents?.[0]?.[i] || '',
                    metadata: (results.metadatas?.[0]?.[i] as Record<string, any>) || {},
                    distance: results.distances?.[0]?.[i] || 0,
                });
            }
        }

        return documents;
    }

    /**
     * Search with distance threshold (lower distance = more similar)
     */
    async similaritySearchWithThreshold(
        query: string,
        k: number = 5,
        maxDistance: number = 0.5
    ): Promise<{ id: string; content: string; metadata: Record<string, any>; distance: number }[]> {
        const results = await this.similaritySearch(query, k);
        return results.filter(result => result.distance <= maxDistance);
    }

    /**
     * Delete documents by IDs
     */
    async deleteDocuments(ids: string[]): Promise<void> {
        if (!this.collection) {
            throw new Error('Collection not initialized. Call initialize() first.');
        }

        await this.collection.delete({
            ids,
        });

        console.log(`Deleted ${ids.length} documents from vector store`);
    }

    /**
     * Clear all documents from the collection
     */
    async clearCollection(): Promise<void> {
        if (!this.client) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        await this.client.deleteCollection({
            name: this.config.collectionName,
        });

        // Recreate the collection
        this.collection = await this.client.getOrCreateCollection({
            name: this.config.collectionName,
        });

        console.log('Vector store cleared');
    }

    /**
     * Get collection statistics
     */
    async getStats(): Promise<{ count: number }> {
        if (!this.collection) {
            throw new Error('Collection not initialized. Call initialize() first.');
        }

        const count = await this.collection.count();
        return { count };
    }
}

// Singleton instance
let vectorDbInstance: VectorDbService | null = null;

/**
 * Get or create the vector database service instance
 */
export function getVectorDbService(config?: VectorDbConfig): VectorDbService {
    if (!vectorDbInstance && config) {
        vectorDbInstance = new VectorDbService(config);
    }

    if (!vectorDbInstance) {
        throw new Error('Vector database service not initialized. Provide config on first call.');
    }

    return vectorDbInstance;
}

/**
 * Initialize the vector database with environment variables
 */
export async function initializeVectorDb(): Promise<VectorDbService> {
    const url = import.meta.env.VITE_CHROMA_URL || 'http://localhost:8000';
    const collectionName = import.meta.env.VITE_CHROMA_COLLECTION || 'edugenie-ai';

    const service = getVectorDbService({
        url,
        collectionName,
    });

    await service.initialize();
    return service;
}
