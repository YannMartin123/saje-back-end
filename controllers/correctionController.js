const geminiService = require('../services/geminiService');
const supabase = require('../config/supabase');

exports.processCorrection = async (req, res) => {
    try {
        const { evalData } = req.body; // Reçoit le JSON structuré par l'OCR

        if (!evalData) {
            return res.status(400).json({ error: "Données de transcription manquantes." });
        }

        // 1. Appel à Gemini pour la correction
        const correctionResponse = await geminiService.correctCopies(evalData);

        // 2. Sauvegarde des résultats dans Supabase
        // On boucle sur les clés du JSON retourné par Gemini (ex: copie1, copie2...)
        for (const [key, data] of Object.entries(correctionResponse.resultat)) {
            
            // On essaie de retrouver l'ID de transcription correspondant dans evalData
            // Note: Il est important que le client renvoie les db_id
            const transcriptionId = evalData[key]?.db_id;

            await supabase
                .from('resultats')
                .insert([{
                    transcription_id: transcriptionId,
                    note_totale: data.note_totale,
                    details_json: data
                }]);
            
            // Mettre à jour le statut de la transcription si l'ID est connu
            if (transcriptionId) {
                await supabase
                    .from('transcriptions')
                    .update({ statut: 'corrige' })
                    .eq('id', transcriptionId);
            }
        }

        res.status(200).json(correctionResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la correction par l'IA." });
    }
};