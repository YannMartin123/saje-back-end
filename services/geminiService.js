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
                    Réponds UNIQUEMENT avec un JSON valide, le numero de la copie etant le le numero specifie de la copie met XXXX si il y'en a pas, en suivant le template suivant :
                    {"resultat": {"copie_numerocopie": {"note_totale": total_des_points, "questions": [{"num": numero_de_la_question, "point": nombre_de_points, "commentaire": "commentaire sur la question"}]}}}`
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