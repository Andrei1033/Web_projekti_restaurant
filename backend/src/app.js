import cors from 'cors';
import api from './api/index.js';
import express from 'express';

const app = express(); // FIRST create app

app.use(cors()); //  THEN use it

app.use(express.json());
app.use(express.urlencoded());
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', api);

app.get('/', (req, res) => {
  res.send('🔥 NightWolf API running on port!');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json({ok: true, data: req.body});
});

export default app;
