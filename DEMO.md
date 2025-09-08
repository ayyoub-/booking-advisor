# 🏨 Booking Advisor - Démonstration

## 🎯 Vue d'ensemble

Booking Advisor est une application React qui permet de comparer des hôtels en analysant leurs commentaires Booking.com en temps réel. L'application combine :

- **Frontend React** : Interface utilisateur moderne et responsive
- **Backend Express.js** : API qui fait le pont entre React et le scraper
- **Scraper Python** : Outil de scraping des commentaires Booking.com

## 🚀 Démarrage rapide

### 1. Démarrer tous les services

```bash
./start-dev.sh
```

Ou manuellement :

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd hotel-advisor
npm install
npm run dev

# Terminal 3 - Scraper (dépendances)
cd booking-reviews-scraper
pip3 install -r requirements.txt
```

### 2. Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001

## 📱 Utilisation

### Étape 1 : Entrer les URLs des hôtels
1. Ouvrez http://localhost:5173
2. Entrez jusqu'à 3 URLs d'hôtels Booking.com dans les champs
3. Exemple d'URL valide : `https://www.booking.com/hotel/fr/novotel-paris-centre-tour-eiffel.fr.html`

### Étape 2 : Lancer l'analyse
1. Cliquez sur "Analyze Hotels"
2. L'application va :
   - Scraper les commentaires de chaque hôtel
   - Afficher la progression en temps réel
   - Analyser les données avec IA
   - Générer des recommandations

### Étape 3 : Consulter les résultats
- **Recommandation IA** : Analyse globale basée sur les vrais commentaires
- **Cartes d'hôtels** : Détails de chaque hôtel avec :
  - Note moyenne calculée
  - Nombre de commentaires analysés
  - Sentiment (positif/neutre/négatif)
  - Insights clés
  - Statut de scraping

## 🔧 Fonctionnalités techniques

### Scraping en temps réel
- Respect des limites de taux de requêtes Booking.com
- Gestion d'erreurs robuste
- Indicateurs de progression par hôtel

### Analyse de sentiment
- Calcul de la note moyenne basée sur les scores réels
- Classification automatique du sentiment
- Extraction d'insights pertinents

### Interface utilisateur
- Design moderne avec Tailwind CSS
- Composants réutilisables (shadcn/ui)
- Responsive design
- Gestion d'état avec React hooks

## 🛠️ API Endpoints

### POST /api/scrape-reviews
Scraper les commentaires d'un hôtel

```json
{
  "url": "https://www.booking.com/hotel/fr/example.fr.html",
  "sortBy": "newest_first",
  "nReviews": 50
}
```

### GET /api/reviews/:hotelName
Récupérer les commentaires scrapés

### GET /api/health
Vérification de santé de l'API

## 📊 Exemple de données

### Réponse de scraping
```json
{
  "success": true,
  "hotelName": "novotel-paris-centre-tour-eiffel",
  "country": "fr",
  "reviewCount": 45,
  "message": "Successfully scraped 45 reviews"
}
```

### Données d'analyse
```json
{
  "hotels": [
    {
      "name": "Novotel Paris Centre Tour Eiffel",
      "rating": 4.2,
      "totalReviews": 45,
      "sentiment": "positive",
      "keyInsights": [
        "45 reviews analyzed",
        "Average score: 4.2/5",
        "Real-time data from Booking.com"
      ],
      "scrapingStatus": "completed"
    }
  ],
  "recommendation": "Based on 45 real reviews from Booking.com, Novotel Paris Centre Tour Eiffel offers the best overall value with a 4.2/5 rating.",
  "topChoice": 0
}
```

## 🐛 Dépannage

### Le scraping échoue
- Vérifiez que l'URL de l'hôtel est valide
- Vérifiez que Python3 est installé
- Vérifiez les logs du backend

### L'API ne répond pas
- Vérifiez que le port 3001 est libre
- Vérifiez que le backend est démarré
- Vérifiez les logs du serveur

### Le frontend ne se charge pas
- Vérifiez que le port 5173 est libre
- Vérifiez que les dépendances sont installées
- Vérifiez les logs du serveur de développement

## 📈 Améliorations possibles

- [ ] Cache des résultats de scraping
- [ ] Support de plus de sites (Expedia, Hotels.com)
- [ ] Analyse plus poussée avec NLP
- [ ] Export des résultats en PDF
- [ ] Authentification utilisateur
- [ ] Base de données pour persister les données

## 🎉 Conclusion

Booking Advisor démontre une intégration réussie entre :
- **React** pour l'interface utilisateur
- **Express.js** pour l'API backend
- **Python** pour le scraping de données

L'application permet une comparaison d'hôtels basée sur des données réelles et une analyse intelligente des commentaires clients.
