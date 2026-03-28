// /api/analyze.js — Proxy Vercel sécurisé pour l'API Anthropic
//
// 📁 Structure GitHub :
//   /index.html       ← frontend
//   /api/analyze.js   ← ce fichier
//   /.gitignore
//
// 🔑 Sur Vercel → Settings → Environment Variables :
//   ANTHROPIC_API_KEY = sk-ant-xxxxxxx
//   ⚠️ Après ajout : cliquer "Redeploy" pour que la variable soit active
//
// ✅ Aucune clé dans ce fichier — safe à mettre sur GitHub public.

export default async function handler(req, res) {

  // CORS — autorise les appels depuis le navigateur
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST uniquement
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifie que la clé est configurée sur Vercel
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Clé API manquante',
      fix: 'Ajouter ANTHROPIC_API_KEY dans Vercel → Settings → Environment Variables, puis Redeploy'
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: req.body.system,
        messages: req.body.messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Anthropic:', data);
      return res.status(response.status).json({ error: 'Erreur Anthropic', details: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Erreur proxy:', err.message);
    return res.status(500).json({ error: 'Erreur interne proxy', details: err.message });
  }
}
