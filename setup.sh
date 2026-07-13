#!/usr/bin/env bash
set -e

echo "---------------------------------------------------------------------------"
echo "Writing .env from .env.example..."
cp -f .env.example .env
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Installing PHP dependencies..."
composer install
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Generating app key..."
php artisan key:generate
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Running migrations and seeding database..."
php artisan migrate --seed
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Installing NPM dependencies for frontend..."
cd frontend && npm install && cd ..
echo "---------------------------------------------------------------------------"

echo "---------------------------------------------------------------------------"
echo "Setup complete!"
echo ""
echo "To start the project:"
echo "  Terminal 1: php artisan serve"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "  Login: test@example.com / password"
echo "---------------------------------------------------------------------------"