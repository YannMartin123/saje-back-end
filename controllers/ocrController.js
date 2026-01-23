const visionService = require('../services/visionService');
const supabase = require('../config/supabase');

exports.processOCR = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Aucun fichier envoyé." });
        }

        const evalResult = {};

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];

            // 1. OCR local (images only)
            const rawText = await visionService.detectText(file.path);
            
            // 2. Sauvegarde dans la table 'transcriptions'
            const { data: transcription, error } = await supabase
                .from('transcriptions')
                .insert([{ 
                    nom_fichier: file.originalname, 
                    contenu_brut: rawText,
                    statut: 'transcrit'
                }])
                .select()
                .single();

            if (error) throw error;

            // 3. Structuration de la réponse JSON demandée
            evalResult[`copie_${i + 1}`] = {
                db_id: transcription.id, // On garde l'ID pour la correction future
                nom_fichier: file.originalname,
                contenu_brut: rawText
            };
        }

        res.status(200).json({ eval: evalResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors du traitement OCR." });
    }
};