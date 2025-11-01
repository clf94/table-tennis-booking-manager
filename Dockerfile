# ---------- Frontend build stage ----------
FROM node:18-alpine AS frontend-build
WORKDIR /app

# Install and build frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build


# ---------- Backend stage ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy built frontend files into backend's dist directory
COPY --from=frontend-build /app/dist ./dist

# Environment & ports
EXPOSE 5008
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Start Flask
CMD ["python", "app.py"]
