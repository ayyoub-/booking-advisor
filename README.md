# Booking Advisor

Une application React qui permet de comparer des hôtels en analysant leurs commentaires Booking.com en temps réel.

## 🏗️ Architecture

L'application se compose de trois parties principales :

1. **Frontend React** (`hotel-advisor/`) - Interface utilisateur moderne
2. **Backend API** (`backend/`) - Serveur Express.js qui fait le pont entre React et le scraper
3. **Scraper Python** (`booking-reviews-scraper/`) - Outil de scraping des commentaires Booking.com

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    Python    ┌─────────────────┐
│                 │ ──────────────▶│                 │ ────────────▶│                 │
│  React Frontend │                │  Express.js     │              │  Python Scraper │
│  (Port 5173)    │◀────────────── │  Backend        │◀──────────── │  (Booking.com)  │
│                 │    JSON Data   │  (Port 3001)    │   Reviews    │                 │
└─────────────────┘                └─────────────────┘              └─────────────────┘
        │                                   │
        │                                   │
        ▼                                   ▼
┌─────────────────┐                ┌─────────────────┐
│  User Interface │                │  API Endpoints  │
│  - Hotel URLs   │                │  - /scrape      │
│  - Analysis     │                │  - /reviews     │
│  - Results      │                │  - /health      │
└─────────────────┘                └─────────────────┘
```

## 🚀 Démarrage rapide

### Option 1: Docker (recommandé pour la production)

```bash
./start-docker.sh
```

Ce script va :
- Construire les images Docker
- Démarrer tous les services en mode conteneurisé
- Vérifier que les services fonctionnent

### Option 2: Script automatique (développement)

```bash
./start-dev.sh
```

Ce script va :
- Installer toutes les dépendances nécessaires
- Démarrer le serveur backend sur le port 3001
- Démarrer le serveur frontend sur le port 5173

### Option 3: Démarrage manuel

#### 1. Backend API
```bash
cd backend
npm install
npm run dev
```

#### 2. Frontend React
```bash
cd hotel-advisor
npm install
npm run dev
```

#### 3. Scraper Python (dépendances)
```bash
cd booking-reviews-scraper
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 📱 Utilisation

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Entrez jusqu'à 3 URLs d'hôtels Booking.com
3. Cliquez sur "Analyze Hotels"
4. L'application va :
   - Scraper les commentaires de chaque hôtel
   - Analyser les données en temps réel
   - Générer des recommandations basées sur les vrais commentaires

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3001
SCRAPER_PATH=../booking-reviews-scraper
```

### Configuration du scraper

Modifiez `booking-reviews-scraper/config.yml` pour ajuster :
- `REQUESTS_PER_SECOND`: Nombre de requêtes par seconde (défaut: 10)
- `MAX_RETRIES`: Nombre de tentatives en cas d'échec (défaut: 3)

## 📊 Fonctionnalités

- ✅ Scraping en temps réel des commentaires Booking.com
- ✅ Analyse de sentiment basée sur les scores réels
- ✅ Comparaison de jusqu'à 3 hôtels simultanément
- ✅ Interface utilisateur moderne et responsive
- ✅ Gestion d'erreurs robuste
- ✅ Indicateurs de progression en temps réel

## 🐳 Docker

### Démarrage avec Docker

```bash
# Démarrer tous les services
./start-docker.sh

# Arrêter tous les services
./stop-docker.sh

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend
```

### Services Docker

- **frontend** : Interface React (port 5173)
- **backend** : API Express.js (port 3001)
- **scraper** : Scraper Python (service de support)

### Commandes Docker utiles

```bash
# Voir le statut des conteneurs
docker-compose ps

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh

# Reconstruire les images
docker-compose build --no-cache

# Nettoyer complètement
docker-compose down --rmi all --volumes
```

## 🛠️ Développement

### Structure du projet

```
booking-advisor/
├── hotel-advisor/          # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   └── pages/         # Pages de l'application
├── backend/               # API Express.js
│   ├── server.js         # Serveur principal
│   └── package.json      # Dépendances Node.js
├── booking-reviews-scraper/ # Scraper Python
│   ├── core/             # Code principal du scraper
│   ├── run.py           # Point d'entrée
│   └── requirements.txt # Dépendances Python
└── start-dev.sh         # Script de démarrage
```

### API Endpoints

- `POST /api/scrape-reviews` - Scraper les commentaires d'un hôtel
- `GET /api/reviews/:hotelName` - Récupérer les commentaires scrapés
- `GET /api/health` - Vérification de santé de l'API

## 🐛 Dépannage

### Le scraper ne fonctionne pas
- Vérifiez que Python est installé
- Vérifiez que les dépendances Python sont installées
- Vérifiez que l'URL de l'hôtel est valide

### L'API ne répond pas
- Vérifiez que le port 3001 est libre
- Vérifiez les logs du serveur backend

### Le frontend ne se charge pas
- Vérifiez que le port 5173 est libre
- Vérifiez que les dépendances Node.js sont installées

## 📝 Notes importantes

- Le scraper respecte les limites de taux de requêtes de Booking.com
- Les données sont temporairement stockées localement
- L'application est conçue pour un usage personnel et éducatif
- Respectez les conditions d'utilisation de Booking.com

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
