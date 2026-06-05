const Anthropic = require('@anthropic-ai/sdk');
const { isAiConfigured } = require('./ai.service');

const FALLBACK_RESPONSES = [
  'Bonjour ! Je suis votre assistant sinistre AssurMe. Quel type de sinistre souhaitez-vous déclarer ? (auto, habitation, santé…)',
  'Merci pour ces informations. Pouvez-vous préciser la date du sinistre et les circonstances ?',
  'Avez-vous déjà contacté votre assureur ? Si oui, quel est le numéro de dossier ?',
  'Merci. Je prépare un récapitulatif de votre déclaration. Configurez ANTHROPIC_API_KEY pour activer l\'assistant IA complet.',
];

const getClient = () => {
  if (!isAiConfigured()) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

const chat = async (history, userMessage) => {
  const client = getClient();

  if (!client) {
    const step = Math.min(history.filter((m) => m.role === 'user').length, FALLBACK_RESPONSES.length - 1);
    return FALLBACK_RESPONSES[step];
  }

  const systemPrompt = `Tu es l'assistant sinistre d'AssurMe.
Tu guides l'utilisateur étape par étape pour déclarer son sinistre.
Tu demandes : type de sinistre, date, circonstances, dommages, contrat concerné.
Tu génères ensuite un courrier de déclaration prêt à envoyer.
Réponds toujours en français, avec empathie et clarté.`;

  const messages = [...history, { role: 'user', content: userMessage }];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  });

  return response.content[0].text;
};

module.exports = { chat };
