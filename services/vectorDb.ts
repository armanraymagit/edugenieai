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
   * Add documents to the vector store with automatic chunking
   */
  async addDocuments(documents: Document[], chunk: boolean = true): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized. Call initialize() first.');
    }

    const allIds: string[] = [];
    const allContents: string[] = [];
    const allMetadatas: Record<string, any>[] = [];

    for (const doc of documents) {
      if (chunk) {
        const chunks = this.chunkText(doc.content);
        chunks.forEach((chunkText, index) => {
          allIds.push(`${doc.id}_chunk_${index}`);
          allContents.push(chunkText);
          allMetadatas.push({
            ...doc.metadata,
            originalId: doc.id,
            chunkIndex: index,
            totalChunks: chunks.length,
          });
        });
      } else {
        allIds.push(doc.id);
        allContents.push(doc.content);
        allMetadatas.push(doc.metadata || {});
      }
    }

    // Split into batches of 100 to avoid large payload errors
    const batchSize = 100;
    for (let i = 0; i < allIds.length; i += batchSize) {
      await this.collection.add({
        ids: allIds.slice(i, i + batchSize),
        documents: allContents.slice(i, i + batchSize),
        metadatas: allMetadatas.slice(i, i + batchSize),
      });
    }

    console.log(`Added ${allIds.length} chunks from ${documents.length} documents to vector store`);
  }

  /**
   * Helper to chunk text into smaller segments
   */
  private chunkText(text: string, size: number = 1000, overlap: number = 200): string[] {
    if (!text) return [];

    const chunks: string[] = [];
    let curPos = 0;

    while (curPos < text.length) {
      let endPos = curPos + size;

      // Try to find a natural break point (newline or period)
      if (endPos < text.length) {
        const searchRange = text.substring(endPos - 100, endPos + 100);
        const lastNewline = searchRange.lastIndexOf('\n');
        const lastPeriod = searchRange.lastIndexOf('.');

        const breakPoint = Math.max(lastNewline, lastPeriod);
        if (breakPoint !== -1) {
          endPos = endPos - 100 + breakPoint + 1;
        }
      }

      chunks.push(text.substring(curPos, endPos).trim());
      curPos = endPos - overlap;

      // Avoid infinite loop if overlap is too large or size too small
      if (curPos + overlap >= endPos) {
        curPos = endPos;
      }
    }

    return chunks.filter((c) => c.length > 10); // Ignore very small chunks
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
    const documents: {
      id: string;
      content: string;
      metadata: Record<string, any>;
      distance: number;
    }[] = [];

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
    return results.filter((result) => result.distance <= maxDistance);
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
