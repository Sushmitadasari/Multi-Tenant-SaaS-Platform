#!/bin/sh

echo "Waiting for database on host '$DB_HOST' port '$DB_PORT'..."

# Loop until we can connect to the database port
# nc (netcat) is built into Alpine
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
  echo "Database not ready yet..."
done

echo "Database is ready!"

echo "Running Migrations..."
npm run migrate

echo "Running Seeds..."
npm run seed

echo "Starting Server..."
npm start