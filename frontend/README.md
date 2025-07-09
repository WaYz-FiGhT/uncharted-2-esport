# Uncharted 2 Esport

Ce dépôt contient un backend Node.js/Express et un frontend React/Vite permettant de gérer un ladder d\'équipes e-sport. Les instructions ci‑dessous expliquent comment installer les dépendances, configurer l\'environnement et lancer l\'application en développement.

## Prérequis

- **Node.js** (version 18 ou supérieure recommandée)
- **npm**
- **MySQL** (base de données pour l\'application)

## Installation

1. Clonez ce dépôt puis installez les dépendances pour chaque partie :

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Créez ensuite les fichiers d\'environnement.

## Configuration

### Backend

Dans `backend/.env`, définissez les variables suivantes :

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=uncharted2
SESSION_SECRET=un-secret-securise
FRONTEND_URL=http://localhost:5173
```

`DB_*` correspond à vos informations MySQL. `SESSION_SECRET` sert à sécuriser les sessions. `FRONTEND_URL` indique l\'origine autorisée pour les requêtes du frontend.

Un fichier `backend/.env.production` est également présent pour un déploiement en production (mêmes clés mais avec des valeurs adaptées).

Un fichier `backend/.env.production` est également présent pour un déploiement en production (mêmes clés mais avec des valeurs adaptées). Lorsque `NODE_ENV=production`, le backend charge automatiquement ce fichier à la place de `.env`.Un fichier `backend/.env.production` est également présent pour un déploiement en production (mêmes clés mais avec des valeurs adaptées). Lorsque `NODE_ENV=production`, le backend charge automatiquement ce fichier à la place de `.env`.

### Frontend

Dans `frontend/.env`, indiquez l\'URL du backend :

```ini
VITE_API_URL=http://localhost:3000
```

Cette variable est utilisée par Axios pour appeler l\'API.

## Lancement

1. Assurez‑vous que votre base MySQL (nommée par défaut `uncharted2`) existe.
2. Démarrez le backend :

   ```bash
   cd backend
   npm start
   ```

   Le serveur écoute sur `http://localhost:3000`.

3. Dans un autre terminal, démarrez le frontend :

   ```bash
   cd frontend
   npm run dev
   ```

   L\'application React est alors accessible sur `http://localhost:5173`.

## Tests

Dans le dossier `backend`, vous pouvez lancer les tests unitaires :

```bash
npm test
```

## Conseils de sécurisation

- En production, activez le flag `cookie.secure` dans `backend/app.js` et
  servez l'application via HTTPS. Pour cela, placez éventuellement un proxy
  (Nginx, Apache) devant Node.js et utilisez `NODE_ENV=production`.
- Vérifiez régulièrement les droits d'accès à l'API (par exemple avec le
  middleware `isAdmin`) et surveillez les journaux pour détecter les erreurs.
