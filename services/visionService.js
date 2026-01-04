const Tesseract = require('tesseract.js');
const pdf = require('pdf-poppler');
const fs = require('fs');
const path = require('path');

const detectText = async (filePath) => {
    try {
        let imageToProcess = filePath;
        const isPdf = filePath.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            console.log("Conversion PDF en Image (Poppler)...");
            
            let opts = {
                format: 'jpeg',
                out_dir: path.dirname(filePath),
                out_prefix: path.basename(filePath, path.extname(filePath)),
                page: 1
            };

            // Convertit la page 1 en image
            await pdf.convert(filePath, opts);
            
            // Le fichier créé par poppler s'appellera nom-1.jpg
            imageToProcess = path.join(opts.out_dir, `${opts.out_prefix}-1.jpg`);
        }

        console.log("OCR local en cours sur :", imageToProcess);
        const { data: { text } } = await Tesseract.recognize(
            imageToProcess,
            'fra',
            { logger: m => console.log(`${m.status} : ${Math.round(m.progress * 100)}%`) }
        );

        // Nettoyage de l'image temporaire si c'était un PDF
        if (isPdf && fs.existsSync(imageToProcess)) {
            fs.unlinkSync(imageToProcess);
        }

        return text;
    } catch (error) {
        console.error("Erreur OCR Local:", error);
        throw new Error("Échec de la transcription.");
    }
};

module.exports = { detectText };