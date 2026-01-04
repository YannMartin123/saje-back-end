require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Configuration des middlewares
app.use(cors());
app.use(express.json());

// Création automatique du dossier 'uploads' s'il n'existe pas
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Utilisation des routes
app.use('/api', apiRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: "Backend SAJE opérationnel 🚀" });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Une erreur interne est survenue.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});