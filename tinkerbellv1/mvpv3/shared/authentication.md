# Authentication & Project Setup

Use the same Google Cloud project across Gemini and Vertex so quota, billing, and monitoring stay in one place.

## 1. Enable APIs
- **Gemini API (consumer)**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and enable the Gemini API for the selected project.
- **Vertex AI (enterprise)**: In the Google Cloud console, enable both **Vertex AI API** and **Service Usage API**.

## 2. Create Credentials
| Use case | Credential | How to create | Default environment variable |
| --- | --- | --- | --- |
| Gemini API from client or lightweight server | API key | AI Studio → *Create API key* | `GEMINI_API_KEY` |
| Vertex AI server-side workloads | Service account JSON key | IAM → *Service Accounts* → *Create key* | `GOOGLE_APPLICATION_CREDENTIALS` (file path) |
| Short-lived access from Cloud Run, GKE, Cloud Functions | Workload Identity | Bind service account to workload | not required |

## 3. Secure Storage
- Keep keys out of source control. Use a secrets manager (Google Secret Manager, Doppler, 1Password) or CI/CD variable store.
- In local development, create a `.env` file (exclude with `.gitignore`).

```dotenv
GEMINI_API_KEY="paste-key-here"
GOOGLE_APPLICATION_CREDENTIALS="C:/secrets/vertex-sa.json"
```

## 4. Runtime Configuration
- Load environment variables at process start (e.g., `dotenv` in Node, `python-dotenv` in Python).
- For containerized deployments, inject secrets via Kubernetes secrets or Cloud Run env vars.
- Rotate keys regularly; reissue from AI Studio or IAM, update secret store, redeploy.

## 5. Regional Availability
- Gemini API (consumer) is global and auto-selected.
- Vertex AI requires region selection (e.g., `us-central1`, `europe-west4`). Create resources and send requests in the same region to avoid latency and quota issues.

## 6. Quota & Monitoring
- Use Google Cloud console → **APIs & Services → Quotas** to request increases.
- Export Vertex AI logs to Cloud Logging and define alerts for elevated error rates or latency.

Refer back here whenever language-specific docs mention “set up authentication.”