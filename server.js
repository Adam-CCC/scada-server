const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios'); // Добавляем axios для HTTP-запросов

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const series = [0.8, 0.87, 0.95, 1.2, 1.23, 1.3, 1.32, 1.5, 1.6, 1.7, 1.9, 2.2, 2.3, 2.1, 1.9, 1.7, 1.5, 1.3, 1.2, 1.1, 0.8, 0.6, 0.3];

let feeder1Value = 0;

app.get('/', (req, res) => {
  res.send('Server is running');
});

// WebSocket соединение для отправки данных в реальном времени
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Отправка данных клиенту каждые 2 секунды
  setInterval(() => {
    feeder1Value = Math.random() < 0.5 ? 0 : 1;
    ws.send(JSON.stringify({ feeder1: feeder1Value }));
  }, 2000); // Интервал отправки данных в миллисекундах
});

// Функция для отправки данных на сервер Flask и получения ответа
async function sendData() {
  try {
    const response = await axios.post('http://localhost:5000/predict', {
      series: series
    });

    console.log('Response from server:', response.data);
  } catch (error) {
    console.error('Error making prediction request:', error);
  }
}

// Вызов функции отправки данных
sendData();

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





