const visionService = require('../services/visionService');
const geminiService = require('../services/geminiService');
const supabase = require('../config/supabase');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.processAll = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Aucun fichier fourni." });
        }

        const tempOcrData = {};

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const lowerName = (file.originalname || '').toLowerCase();
            if (lowerName.endsWith('.pdf')) {
                return res.status(400).json({ error: 'PDF handling is disabled for now. Please upload image files (jpg, png, ...).' });
            }

            // OCR local (images only)
            const textBrut = await visionService.detectText(file.path);

            // Insertion dans Supabase
            const { data: transcription, error } = await supabase
                .from('transcriptions')
                .insert([{ 
                    nom_fichier: file.originalname, 
                    contenu_brut: textBrut,
                    statut: 'transcrit'
                }])
                .select()
                .single();

            if (error) throw error;

            tempOcrData[`copie_${i + 1}`] = {
                db_id: transcription.id,
                contenu: textBrut
            };
        }

        console.log("Lancement de la correction par Gemini 3 Pro...");
        await sleep(1000); 

        const correctionFinale = await geminiService.correctCopies(tempOcrData);

        // Mise à jour des résultats dans Supabase
        for (const [key, data] of Object.entries(correctionFinale.resultat)) {
            const tId = tempOcrData[key]?.db_id;

            if (tId) {
                await supabase.from('resultats').insert([{
                    transcription_id: tId,
                    note_totale: data.note_totale,
                    details_json: data
                }]);

                await supabase.from('transcriptions')
                    .update({ statut: 'termine' })
                    .eq('id', tId);
            }
        }

        res.status(200).json(correctionFinale);

    } catch (error) {
        console.error("Erreur Processus:", error);
        res.status(500).json({ error: "Échec du traitement final." });
    }
};
exports.getResults = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resultats')
            .select(`
                id,
                note_totale,
                details_json,
                transcriptions (
                    nom_fichier,
                    contenu_brut,
                    created_at
                )
            `)
            .order('id', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Erreur Fetch:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des notes." });
    }
};