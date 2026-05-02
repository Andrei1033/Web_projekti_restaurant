import cors from 'cors';
import api from './api/index.js';
import express from 'express';

const app = express(); // FIRST create app

app.use(
  cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Salli frontendin origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Salli OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Salli nämä headerit
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded());
app.use('/uploads', express.static('uploads'));

app.use('/api/', api);

app.get('/', (req, res) => {
  res.send('🔥 NightWolf API running on port!');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json({ok: true, data: req.body});
});

export default app;
