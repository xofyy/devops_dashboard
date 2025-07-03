# Use official Python image
FROM python:3.11-slim-bullseye

# Set work directory
WORKDIR /app

# Sadece requirements'ı kopyala ve yükle (layer cache için)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Non-root user
# RUN useradd -m appuser
# USER appuser

# Expose port
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 