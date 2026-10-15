# Veristate – AI-Powered Digital Fraud Risk Analyzer
<img width="1799" height="924" alt="Screenshot from 2026-09-25 12-32-05" src="https://github.com/user-attachments/assets/a4c248e0-58b0-4ef6-9c00-fe38ab913e0a" />


## Local AI service (development branch)

The trained AI inference service is in `AI-SERVICE/`. It is separate from the Next.js frontend and Spring Boot backend.

### 1. Train the models

Use Python 3.11 or newer on a machine with internet access and enough RAM for text vectorization:

```bash
cd AI-SERVICE
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts/prepare_datasets.py
python scripts/train_models.py
```

This downloads public starter datasets, prepares normalized CSVs, trains the URL and message classifiers, and writes evaluation metrics to `AI-SERVICE/reports/`. The model artifacts are local and intentionally not committed to Git. Read `AI-SERVICE/README.md` for dataset scope and limitations.

### 2. Run the AI service

In the same activated environment:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Check `http://127.0.0.1:8001/health` and `http://127.0.0.1:8001/docs`. The health endpoint must report `modelsLoaded: true` before predictions will work.

### 3. Run Spring Boot

In another terminal, set the required environment variables before starting the backend. Copy `BACKEND/.env.example` to a private `BACKEND/.env`, fill in your own values, then load them in that terminal:

```bash
cd BACKEND
set -a
source .env
set +a
./mvnw spring-boot:run
```

If this project folder does not contain the Maven wrapper, use `mvn spring-boot:run` instead. Do not commit the real `.env` file.

### 4. Run the frontend

In a third terminal:

```bash
cd FRONTEND
npm install
npm run dev
```

Open the local Next.js URL shown in the terminal. URL, message, and QR analysis calls pass through Spring Boot to the Python service; Spring Boot saves completed results to MongoDB.

**Important:** this is a research baseline, not a production-grade fraud detector. The SMS training labels are spam/ham, not confirmed fraud/non-fraud. Review the generated metrics and validate on independently collected, time-separated data before claiming reliable detection.
