#!/bin/sh
# wait-for-postgres.sh

until nc -z -v -w30 $DB_HOST 3306
do
  echo "Waiting for database connection..."
  # wait for before check again
  sleep 1
done

echo Starting Backend now
node index.js