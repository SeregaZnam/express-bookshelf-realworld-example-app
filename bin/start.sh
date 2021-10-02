#!/usr/bin/env sh

set -e

if [ "$NODE_ENV" = "production" ]; then
  npx knex --knexfile config/knexfile.js migrate:latest && node lib/server.js
else
  npx knex --knexfile config/knexfile.js migrate:latest
  npx nodemon lib/server.js | npx pino-pretty -c -t
fi  
