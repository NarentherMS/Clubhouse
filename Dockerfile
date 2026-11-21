FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CLUBHOUSE_HOST=0.0.0.0 \
    CLUBHOUSE_PORT=4173 \
    CLUBHOUSE_DB_PATH=/data/clubhouse.sqlite3

WORKDIR /app
COPY --chown=10001:10001 app.js styles.css index.html server.py backup.py sync_workspace.py workspace-data.sqlite3 ./
RUN mkdir -p /data && chown 10001:10001 /data
USER 10001:10001

EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "from urllib.request import urlopen; urlopen('http://127.0.0.1:4173/healthz', timeout=2)"
CMD ["python", "server.py"]
