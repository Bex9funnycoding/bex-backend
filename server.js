require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/chat', async (req, res) => {
  const { messages, userTier = 'free' } = req.body;

  let model = 'grok-4-fast-reasoning';
  if (userTier === 'pro' || userTier === 'plus') {
    model = 'grok-4';
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are BEX-AI. Respond fast, human-like, confident and natural. Speak English and Spanish automatically based on the user's language. Never mention model names or external companies."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Limpieza extra por si acaso
    content = content
      .replace(/\b(Grok|xAI|Elon|Musk|Twitter|X)\b/gi, 'BEX')
      .replace(/soy Grok/gi, 'soy BEX-AI')
      .trim();

    res.json({ response: content });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error interno. Intenta de nuevo.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'BEX-AI Backend activo ' });
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});