const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const detectText = async (filePath) => {
    try {
        const lower = filePath.toLowerCase();
        const isPdf = lower.endsWith('.pdf');
        const isImage = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.gif'].some(ext => lower.endsWith(ext));

        if (isPdf) {
            // PDFs are not handled for now — caller should provide an image
            throw new Error('PDF handling is disabled for now. Please provide an image file (jpg, png, etc.).');
        }

        if (!isImage) {
            throw new Error('Unsupported file type. Please provide an image file (jpg, png, etc.).');
        }

        console.log('OCR local en cours sur :', filePath);
        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'fra',
            { logger: m => console.log(`${m.status} : ${Math.round(m.progress * 100)}%`) }
        );

        return text;
    } catch (error) {
        console.error('Erreur OCR Local:', error);
        // Propagate original message for clearer client feedback
        throw new Error(error.message || 'Échec de la transcription.');
    }
};

module.exports = { detectText };