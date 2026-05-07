// app.js
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

/**
 * @api {get} / Tervehdysviesti
 * @apiName GetRoot
 * @apiGroup Yleinen
 *
 * @apiSuccess {String} message Tervehdysviesti
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     "🔥 NightWolf API running on port!"
 */
app.get('/', (req, res) => {
  res.send('🔥 NightWolf API running on port!');
});

/**
 * @api {post} / Testaa POST-pyyntö
 * @apiName PostRoot
 * @apiGroup Yleinen
 *
 * @apiBody {Object} data Lähetettävä data
 *
 * @apiSuccess {Boolean} ok Onnistumisen tila
 * @apiSuccess {Object} data Lähetetty data
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true,
 *       "data": { "example": "data" }
 *     }
 */
app.post('/', (req, res) => {
  console.log(req.body);
  res.json({ok: true, data: req.body});
});

export default app;
