const { Mistral } = require('@mistralai/mistralai');
require('dotenv').config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const correctCopies = async (transcribedData) => {
    try {
        const response = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [
                {
                    role: 'user',
                    content: `Tu es un correcteur d'examen. Voici les textes extraits : ${JSON.stringify(transcribedData)}. 
                    Réponds UNIQUEMENT avec un JSON valide :
                    {"resultat": {"copie_1": {"note_totale": 15, "questions": [{"num": 1, "point": 5, "commentaire": "Bien"}]}}}`
                }
            ],
            responseFormat: { type: 'json_object' } // Force le format JSON
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error('❌ Erreur Mistral:', err);
        throw new Error('Erreur lors de la correction.');
    }
};

module.exports = { correctCopies };