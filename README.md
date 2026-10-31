# LangChain Project

A Python FastAPI application leveraging LangChain and Google Cloud's Vertex AI for building AI-powered agents and RAG (Retrieval-Augmented Generation) applications.

## Features

- **FastAPI Backend** — Modern Python web framework for building APIs
- **LangChain Integration** — Framework for building LLM applications
- **LangGraph** — Orchestrate complex agent workflows
- **Google Cloud Vertex AI** — Access to advanced language models
- **RAG Support** — Retrieval-augmented generation for enhanced context
- **PDF Processing** — Extract and process PDF documents
- **Cloud Storage** — Integration with Google Cloud Storage
- **Structured Logging** — Using structlog for comprehensive logging
- **Type Safety** — Pydantic models for data validation



## Prerequisites

- Python 3.12 or higher
- uv package manager
- Google Cloud credentials (for Vertex AI and Cloud Storage access)

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd langchain-project
```

2. **Install dependencies using uv:**

```bash
uv sync
```

Or install with dev dependencies:

```bash
uv sync --extra dev
```

3. **Set up environment variables:**

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

## Running the Application

Start the FastAPI server:

```bash
uvicorn langchain_project:app --reload
```

The API will be available at `http://localhost:8000`

## Project Structure

```
src/
├── langchain_project/     # Main application package
├── agents/                # AI agent implementations
├── api/                   # API endpoints and routes
├── config/                # Configuration management
├── logger/                # Logging setup
├── rag/                   # RAG pipeline components
└── tests/                 # Test suite
```

## Development

### Running Tests

```bash
pytest
```

### Code Quality

Install dev dependencies and run tests:

```bash
uv sync --extra dev
pytest
```

## Environment Variables

Key environment variables to configure:

- `GOOGLE_PROJECT_ID` — Your Google Cloud project ID
- `GOOGLE_CLOUD_LOCATION` — Region for Vertex AI (e.g., `us-central1`)
- Database and API keys as needed

See `.env.example` for all available configuration options.



## Dependencies

### Core

- **fastapi** — Web framework
- **uvicorn** — ASGI server
- **pydantic** — Data validation
- **langchain** — LLM framework
- **langgraph** — Agent orchestration
- **google-cloud-aiplatform** — Vertex AI integration
- **google-cloud-storage** — Cloud Storage integration

### Development

- **pytest** — Testing framework
- **httpx** — HTTP client for testing

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
