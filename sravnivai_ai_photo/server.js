const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json({ limit: '12mb' }));
app.use(express.static(__dirname));

app.post('/api/analyze-image', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({
        error: 'ИИ ещё не настроен: добавь OPENAI_API_KEY в файл .env и перезапусти сервер.'
      });
    }

    const image = req.body && req.body.image;
    if (typeof image !== 'string' ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
      return res.status(400).json({ error: 'Загрузи корректное изображение JPG, PNG или WebP.' });
    }
    if (image.length > 11 * 1024 * 1024) {
      return res.status(413).json({ error: 'Изображение слишком большое. Максимум — 8 МБ.' });
    }

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Определи, что изображено на фото для сайта сравнения товаров. Отвечай по-русски.
Не выдумывай бренд, модель, цену или характеристики, если их нельзя надёжно увидеть. Если не уверен, прямо укажи это.
Верни только валидный JSON без Markdown с полями:
{"name":"короткое название предмета","category":"категория","brand":"бренд или Не удалось определить","description":"краткое описание","visual_details":"видимые особенности","search_queries":["3-5 поисковых запросов"]}`
            },
            { type: 'input_image', image_url: image, detail: 'high' }
          ]
        }]
      })
    });

    const data = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error('OpenAI API error:', data.error?.message || aiResponse.status);
      if (aiResponse.status === 401) {
        return res.status(502).json({ error: 'Ключ ИИ недействителен. Проверь OPENAI_API_KEY в .env.' });
      }
      if (aiResponse.status === 429) {
        return res.status(429).json({ error: 'Превышен лимит запросов или средств API. Проверь лимиты OpenAI.' });
      }
      return res.status(502).json({ error: 'Сервис ИИ временно недоступен. Попробуй позже.' });
    }

    const outputText = data.output
      ?.flatMap(item => item.content || [])
      .filter(item => item.type === 'output_text')
      .map(item => item.text)
      .join('\n');

    if (!outputText) {
      return res.status(502).json({ error: 'ИИ не вернул описание изображения. Попробуй другое фото.' });
    }

    let analysis;
    try {
      const cleaned = outputText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'Не удалось обработать ответ ИИ. Попробуй ещё раз.' });
    }

    return res.json({ analysis });
  } catch (error) {
    console.error('Image analysis failed:', error.message);
    return res.status(500).json({ error: 'Ошибка сервера при распознавании фото.' });
  }
});

app.listen(PORT, () => {
  console.log(`Сравнивай запущен: http://localhost:${PORT}`);
});
