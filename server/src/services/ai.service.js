const Anthropic = require('@anthropic-ai/sdk');
const { AppError } = require('../utils/errors');

const isAiConfigured = () =>
  process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_key_here';

const getClient = () => {
  if (!isAiConfigured()) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

const parseJsonResponse = (raw) => {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};

const extractContractData = async (pdfBase64) => {
  const client = getClient();
  if (!client) {
    return {
      insurer: null,
      type: 'OTHER',
      policyNumber: null,
      startDate: null,
      endDate: null,
      renewalDate: null,
      premium: null,
      coverages: [],
    };
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
            },
            {
              type: 'text',
              text: `Analyse ce contrat d'assurance et retourne UNIQUEMENT un objet JSON valide
(sans markdown, sans texte avant ou après) avec la structure suivante :
{
  "insurer": "nom de la compagnie",
  "type": "AUTO | HOME | HEALTH | LIFE | PHONE | OTHER",
  "policyNumber": "numéro de police ou null",
  "startDate": "YYYY-MM-DD ou null",
  "endDate": "YYYY-MM-DD ou null",
  "renewalDate": "YYYY-MM-DD ou null",
  "premium": nombre en euros par an ou null,
  "coverages": [
    { "name": "nom garantie", "details": "description", "limit": montant ou null, "deductible": franchise ou null }
  ]
}`,
            },
          ],
        },
      ],
    });

    return parseJsonResponse(response.content[0].text);
  } catch (err) {
    throw new AppError(`Erreur lors de l'extraction IA : ${err.message}`, 502);
  }
};

module.exports = { extractContractData, isAiConfigured };
