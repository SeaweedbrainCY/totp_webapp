#!/usr/bin/env bash
echo "🍺  All logs are in /var/log/api"
echo "🚀  Starting gunicorn"
./flask_migrate_wrapper.sh db check
if ./flask_migrate_wrapper.sh db check | grep "Target database is not up to date."; then 
  echo ""
  echo "🦺 The database schema is out of date."
  echo "🎒 A database migration is needed. BACKUP NOW YOUR DATABASE and follow the documentation at https://docs.zero-totp.com/Self-hosting/migrate/"
  echo "Waiting for your call ..."
  tail -f /dev/null & wait
else 
  gunicorn --bind 0.0.0.0:8080 app:app --error-logfile /var/log/api/gunicorn_error.log --access-logfile /var/log/api/gunicorn_access.log --capture-output --enable-stdio-inheritance -k uvicorn.workers.UvicornWorker
  echo "❌  If you see this, gunicorn has crashed. Check the logs (/var/log/api/gunicorn*.log)"
fi
