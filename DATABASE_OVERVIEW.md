# EduGenie AI: Database Overview (ChromaDB)

## 🚀 Overview

EduGenie AI uses **ChromaDB** as its primary vector database. This database is responsible for storing document embeddings, which enables the "Knowledge Hub" feature—allowing the AI to search and retrieve relevant context from your uploaded files (PDFs, Excel, CSVs, and Images).

## 🛠 How it Works

1.  **Initialization**: The database is initialized via the `VectorDbService` in `services/vectorDb.ts`.
2.  **Chunking**: Large documents are automatically broken down into smaller, searchable "chunks" (default ~1000 characters) to ensure the AI can find precise information.
3.  **Embeddings**: Each chunk is transformed into a vector (a list of numbers) that represents its semantic meaning.
4.  **Similarity Search**: When you ask a question or need an explanation, the system performs a "similarity search" to find the chunks most related to your query.

## 📊 Current Status

- **Is it working?** Yes. Verified via `heartbeat` check and component integration.
- **Environment**: Now running inside a **Docker container** (`edugenie-chromadb`).
- **Data Storage**: Data is stored persistently in the `chroma-data` Docker volume.
- **Persistence**: Enabled. Data remains saved even if the container is restarted.

## ⚙️ Configuration

The connection settings are managed through environment variables in your `.env` file:

- `VITE_CHROMA_URL`: The URL of your ChromaDB instance (default: `http://localhost:8000`).
- `VITE_CHROMA_COLLECTION`: The name of the collection for storing your data (default: `edugenie-ai`).

## 📁 Key Files

- `services/vectorDb.ts`: Core service logic for ChromaDB integration.
- `components/DocumentUpload.tsx`: Handles file uploads and indexing.
- `stubs/chromadb-default-embed.ts`: Compatibility stub for browser-side builds.
