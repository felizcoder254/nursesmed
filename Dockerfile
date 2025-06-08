# ─── 1) Build stage ───────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

# Install build deps (if any native wheels are needed)
RUN apt-get update \
    && apt-get install --no-install-recommends -y build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ─── 2) Final stage ───────────────────────────────────────────────────────────
FROM python:3.11-slim

# Create a less-privileged user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy only the installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your app code
COPY . .

# Fix permissions and drop to non-root
RUN chown -R appuser:appuser /app
USER appuser

# Expose your chosen port
EXPOSE 10000

# Let Uvicorn pick up your Together.ai API key from the env
# (pass it in with -e TOGETHER_API_KEY=...)
ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
