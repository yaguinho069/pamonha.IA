import express from 'express';

import fetch from 'node-fetch';

import cors from 'cors';

import path from 'path';

import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const app = express();

app.use(cors());

app.use(express.json());


// Serve static frontend (se você quiser servir o /public via este server)

app.use(express.static(path.join(__dirname, '..', 'public')));


// Rota proxy segura

app.post('/api/generate', async (req, res) => {

  try {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).send('GEMINI_API_KEY não configurada no servidor.');


    const { prompt, model = 'gemini-1.5-flash' } = req.body;

    if (!prompt) return res.status(400).send('prompt é obrigatório.');


    // Exemplo de endpoint REST: generativelanguage.googleapis.com v1beta

    // Usamos o método "generateContent" do modelo.

    // OBS: dependendo da versão do SDK/endpoint, o nome pode variar (chat/completions vs generateContent).

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;


    const body = {

      // estrutura simples: contents com um papel 'user' e text

      "contents": [

        { "role": "user", "parts": [{ "text": prompt }] }

      ],

      "temperature": 0.2,

      "maxOutputTokens": 800

    };


    const r = await fetch(endpoint, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body)

    });


    if (!r.ok) {

      const txt = await r.text();

      return res.status(r.status).send(txt);

    }


    const json = await r.json();


    // Extrai texto de resposta dependendo do formato (candidates / output ou choices)

    let text = '';


    // Tenta extrair comumente usado em generateContent

    if (json.candidates && json.candidates.length) {

      text = json.candidates.map(c => {

        if (c.content && c.content.parts) return c.content.parts.map(p => p.text).join('');

        if (c.output && c.output[0] && c.output[0].content) return c.output[0].content;

        return JSON.stringify(c);

      }).join('\n\n');

    } else if (json.output && json.output[0] && json.output[0].content) {

      text = json.output[0].content;

    } else if (json.choices && json.choices[0]) {

      // caso chat/completions-style

      const ch = json.choices[0];

      text = ch.message?.content || ch.text || JSON.stringify(ch);

    } else {

      text = JSON.stringify(json, null, 2);

    }


    res.json({ text });

  } catch (err) {

    console.error(err);

    res.status(500).send('Erro no servidor: ' + err.message);

  }

});


// fallback to index.html for SPA

app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));