const express = require('express');
const router = express.Router();
const upload = require('../utils/pdfHandler');
const ocrController = require('../controllers/ocrController');
const correctionController = require('../controllers/correctionController');
const mainController = require('../controllers/mainController');
const mailController = require('../controllers/mailController');

// Route 1 : Uniquement OCR
router.post('/ocr', upload.array('files'), ocrController.processOCR);

// Route 2 : Uniquement Correction (reçoit du JSON)
router.post('/correct', correctionController.processCorrection);

// Route 3 : La Totale (reçoit des fichiers, renvoie la correction)
router.post('/full', upload.array('files'), mainController.processAll);

router.post('/mail/invite', mailController.sendInvitation);

router.get('/results', mainController.getResults);
module.exports = router;