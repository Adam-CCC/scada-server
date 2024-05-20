const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let feeder1Value = 0;

// Маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Server is running');
});

// WebSocket соединение для отправки данных в реальном времени
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Отправка данных клиенту каждые 2 секунды
  setInterval(() => {
    feeder1Value = Math.random() < 0.5 ? 0 : 1;
    ws.send(JSON.stringify({ feeder1: feeder1Value }));
  }, 100); // Интервал отправки данных в миллисекундах
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
