#!/usr/bin/env bash
# Render build script - runs on every deploy.
# Pattern: install deps, collectstatic, migrate.
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
