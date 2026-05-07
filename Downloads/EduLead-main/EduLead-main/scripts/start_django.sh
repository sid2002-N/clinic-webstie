#!/bin/bash
set -e

cd edulead_backend

echo "Running Django migrations..."
python manage.py migrate 2>&1 || echo "WARNING: Migrations failed — check database connection"

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>&1 || true

PORT=${PORT:-8000}
echo "Starting Daphne ASGI server on port ${PORT}..."
exec daphne -b 0.0.0.0 -p ${PORT} config.routing:application
