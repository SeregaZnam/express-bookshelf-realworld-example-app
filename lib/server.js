#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const http = require('http');
const pino = require('pino')();
const app = require('./app');
const config = require('../config');

// Get port from environment and store in Express.
const port = config.get('port');
app.set('port', port);

// Create HTTP server.
let server;

// Listen on provided port, on all network interfaces.
const sock = path.resolve(__dirname, '..', 'tmp', 'pids', 'server.sock');

// Listen on provided port, on all network interfaces.
fs.stat(sock, function (err) {
  if (!err) {
    fs.unlinkSync(sock);
  }

  server = http.createServer(app);
  server.listen(sock);
  server.on('error', onError);
  server.on('listening', onListening);
});

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = '';

  if (typeof port === 'string') {
    bind = `Pipe ${port}`;
  }

  if (typeof port === 'number') {
    bind = `Port ${port}`;
  }

  // Handle specific listen errors with friendly messages.
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  fs.chmodSync(sock, '777');
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  pino.info(`Listening on ${bind}`);
}
