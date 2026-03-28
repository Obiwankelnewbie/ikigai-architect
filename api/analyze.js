// /api/analyze.js — Proxy Vercel sécurisé pour l'API Anthropic
//
// 📁 Structure GitHub attendue :
//   /index.html          ← le frontend
//   /api/analyze.js      ← ce fichier (proxy)
//   /.gitignore          ← doit contenir .env
//   /vercel.json         ← optionnel, routing automatique avec Vercel
//
// 🔑 Sur Vercel → Settings → Environment Variables :
//   Nom   : ANTHROPIC_API_KEY
//   Valeur: sk-ant-xxxxxxxxxxxxxxxx
//   (jamais dans le code, jamais sur GitHub)
//
// ✅ Ce fichier est safe à mettre en public sur GitHub.
//    La clé n'apparaît nulle part ici.

export default async function handler(req, res) {

  // Sécurité : méthode POST uniquement
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Sécurité : vérifie que la clé est bien définie côté serveur
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Clé API manquante. Configure ANTHROPIC_API_KEY dans les variables Vercel.'
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // ← clé sécurisée, côté serveur uniquement
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(response.status).json({ error: 'Erreur API Anthropic', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Erreur interne du proxy', details: err.message });
  }
}
