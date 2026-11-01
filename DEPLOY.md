# Deployment Guide

This document describes how to deploy the LangChain project to various environments.

## Local Development

### Prerequisites

- Python 3.12+
- uv package manager
- Google API key for Gemini access

### Setup

1. **Install dependencies:**
```bash
uv sync
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

3. **Run the application:**
```bash
uvicorn backend.api:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Google Cloud Deployment (Cloud Run)

### Prerequisites

- Google Cloud Project with Cloud Run enabled
- Cloud Build for CI/CD
- Service account with appropriate permissions

### Environment Variables for Cloud

Set these in Google Cloud Secret Manager:
- `GOOGLE_API_KEY` - Gemini API key
- `APP_MODE=cloud` - Switch to cloud mode
- `GCP_PROJECT_ID` - Your GCP project ID
- `GCS_BUCKET_NAME` - Cloud Storage bucket for documents
- `VECTOR_SEARCH_INDEX_ID` - Vertex AI Vector Search index ID
- `VECTOR_SEARCH_INDEX_ENDPOINT_ID` - Vector Search endpoint

### Deployment Steps

1. **Build and push the container:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/langchain-project
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy langchain-project \
  --image gcr.io/PROJECT_ID/langchain-project \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --set-env-vars APP_MODE=cloud
```

3. **Update secret references** in Cloud Run environment variables

## Testing

### Run tests locally:
```bash
pytest
```

### Run with coverage:
```bash
pytest --cov=backend tests/
```

## Monitoring

Monitor your deployment at:
- **Cloud Run Dashboard:** https://console.cloud.google.com/run
- **Cloud Logs:** Check application logs for errors and performance
- **Vertex AI Monitoring:** Track model usage and costs

## Troubleshooting

### Connection Issues
- Verify GOOGLE_API_KEY is set correctly
- Check internet connectivity
- Review Cloud Run logs for detailed errors

### Performance Issues
- Increase Cloud Run memory allocation
- Check Vertex AI quota usage
- Review retrieval performance with vector search

### Cost Management
- Monitor API call volumes
- Use caching where possible
- Optimize vector search queries
