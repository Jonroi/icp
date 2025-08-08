import express from 'express';
import cors from 'cors';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const app = express();
app.use(cors());

// Simple readability proxy: /read?url=https://example.com
app.get('/read', async (req, res) => {
  const url = req.query.url as string | undefined;
  if (!url) return res.status(400).json({ error: 'Missing url param' });
  try {
    const resp = await fetch(url);
    if (!resp.ok)
      return res.status(resp.status).json({ error: `HTTP ${resp.status}` });
    const html = await resp.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    res.json({
      title: article?.title ?? '',
      content: article?.textContent ?? '',
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
  console.log(`Readability server running on http://localhost:${port}`);
});
