# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY . .
WORKDIR /app

RUN python -m pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]
