const fs = require('fs');
const path = require('path');
const axios = require('axios');

const detectText = async (filePath) => {
    try {
        const lower = filePath.toLowerCase();
        const isPdf = lower.endsWith('.pdf');
        const isImage = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.gif'].some(ext => lower.endsWith(ext));

        if (!isPdf && !isImage) {
            throw new Error('Unsupported file type. Please provide an image file or a PDF.');
        }

        console.log('OCR Mistral en cours sur :', filePath);

        // Lire le fichier et le convertir en base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');
        
        // Déterminer le type MIME
        let mimeType = 'image/jpeg';
        if (isPdf) {
            mimeType = 'application/pdf';
        } else if (lower.endsWith('.png')) {
            mimeType = 'image/png';
        }

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY is not defined in .env');
        }

        const payload = {
            model: "mistral-ocr-latest",
            document: {
                type: isPdf ? "document_url" : "image_url",
                [isPdf ? "document_url" : "image_url"]: `data:${mimeType};base64,${base64File}`
            },
            include_image_base64: false
        };

        const response = await axios.post('https://api.mistral.ai/v1/ocr', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        // Mistral OCR response structure: pages[].markdown or similar
        const pages = response.data.pages || [];
        const transcribedText = pages.map(page => page.markdown).join('\n\n');

        if (!transcribedText) {
            console.warn('Mistral OCR n\'a renvoyé aucun texte.');
        }

        return transcribedText || '';
    } catch (error) {
        console.error('Erreur OCR Mistral:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || error.message || 'Échec de la transcription Mistral OCR.');
    }
};

module.exports = { detectText };
