# SAJE Back-end — Documentation

✅ Backend Node.js pour la transcription (OCR local) et la correction automatique (LLM). Expose une API REST sous `/api`.

---

## 🚀 Démarrage rapide

Prérequis: Node.js (>=16), clés Supabase et Mistral (variables d'environnement).

Installation:

```bash
git clone <repo>
cd saje-back-end
npm install
# Démarrer
node server.js
# (Optionnel) ajouter dans package.json:
# "start": "node server.js",
# "dev": "nodemon server.js"
```

Le serveur écoute sur `PORT` (défaut 3000) et expose les routes sous `/api`.

---

## ⚙️ Variables d'environnement

Créez un fichier `.env` contenant au minimum :

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
MISTRAL_API_KEY=<your-mistral-key>
PORT=3000
```

⚠️ Ne commitez jamais ces clés.

---

## 📁 Structure du projet

- `server.js` — configuration Express et middlewares
- `routes/apiRoutes.js` — endpoints
- `controllers/` — logique d'API (`ocrController`, `correctionController`, `mainController`)
- `services/` — `visionService` (tesseract) et `geminiService` (Mistral)
- `config/supabase.js` — client Supabase
- `utils/pdfHandler.js` — multer pour uploads
- `uploads/` — fichiers uploadés
- `fra.traineddata` — modèle Tesseract français

---

## 🔌 Endpoints
Base: `http://localhost:PORT/api`

### POST /api/ocr
- Reçoit: multipart/form-data `files` (array)
- Retourne: JSON `{ eval: { copie_1: { db_id, nom_fichier, contenu_brut } } }`
- Erreurs: 400 si pas de fichiers ou si PDF envoyé (PDF non supporté pour l'instant)

### POST /api/correct
- Reçoit: JSON `{ evalData: {...} }` (structure issue de l'OCR)
- Lance la correction via Mistral et sauvegarde dans `resultats`

### POST /api/full
- Pipeline complet: upload images → OCR → correction → sauvegarde

### GET /api/results
- Récupère les entrées de `resultats` avec la transcription associée

---

## 🗄️ Schéma de données recommandé (Postgres/Supabase)

```sql
CREATE TABLE transcriptions (
  id serial PRIMARY KEY,
  nom_fichier text,
  contenu_brut text,
  statut text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE resultats (
  id serial PRIMARY KEY,
  transcription_id integer REFERENCES transcriptions(id),
  note_totale numeric,
  details_json jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

## 🔧 Remarques techniques
- `visionService.detectText` utilise `tesseract.js` (langue `fra`) et refuse les PDFs.
- `geminiService.correctCopies` utilise `@mistralai/mistralai`. La sortie est parsée en JSON.
- Les fichiers uploadés sont stockés dans `uploads/` (dossier créé automatiquement).

---

## 🔐 Sécurité & bonnes pratiques
- Protéger les clés (Supabase / Mistral) via un gestionnaire de secrets.
- Ajouter authentification (JWT / API keys) avant exposition publique.
- Limiter la taille/type des uploads (multer). Ajouter rate-limiting pour l'API LLM.

---

## ✅ Améliorations suggérées
- Support PDF (rasterisation avant OCR)
- Tests (Jest / Supertest)
- Scripts npm (`start`, `dev`), `Dockerfile`
- Validation d'entrée (Joi/Zod), gestion d'erreurs LLM (retry/backoff)
- Pagination pour `GET /api/results`

---

## ✉️ Prochaines étapes proposées
- Je peux committer et pousser ce `README.md` pour toi, ajouter une collection Postman ou créer des scripts `start/dev` et un `Dockerfile`. Dis-moi ce que tu veux que je fasse ensuite.

---

Fichier créé: `README.md`