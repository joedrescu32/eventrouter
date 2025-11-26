#!/bin/bash

# Start Next.js dev server and localtunnel in parallel

echo "🚀 Starting Next.js dev server..."
npm run dev &
NEXT_PID=$!

# Wait for Next.js to start
sleep 5

echo "🌐 Starting localtunnel on port 3000..."
npx localtunnel --port 3000 --subdomain eventrouter 2>&1 | while read line; do
  if [[ $line == *"https://"* ]]; then
    echo ""
    echo "✅ Your app is now accessible at:"
    echo "   $line"
    echo ""
    echo "📋 Use this URL in Zapier:"
    echo "   $line/api/receive-parsed-orders"
    echo ""
  fi
  echo "$line"
done

# Cleanup on exit
trap "kill $NEXT_PID" EXIT

wait $NEXT_PID

