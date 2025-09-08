# 🐳 Guide Docker pour Booking Advisor

## ✅ Déploiement Docker réussi !

Votre application Booking Advisor fonctionne maintenant en mode Docker. Voici comment l'utiliser :

## 🚀 Démarrage rapide

### 1. Démarrer tous les services
```bash
./start-docker.sh
```

### 2. Accéder à l'application
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001

### 3. Arrêter les services
```bash
./stop-docker.sh
```

## 📊 Statut des services

Vérifiez que tous les conteneurs fonctionnent :
```bash
docker-compose ps
```

Vous devriez voir :
```
Name                        Command              State              Ports
-----------------------------------------------------------------------------------------------
booking-advisor_backend_1   docker-entrypoint.sh npm r     Up      0.0.0.0:3001->3001/tcp
booking-advisor_frontend_1  docker-entrypoint.sh npm r     Up      0.0.0.0:5173->5173/tcp
booking-advisor_scraper_1   tail -f /dev/null              Up
```

## 🔧 Commandes utiles

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Accéder au shell d'un conteneur
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### Reconstruire les images
```bash
# Toutes les images
docker-compose build

# Image spécifique
docker-compose build backend
docker-compose build frontend
```

## 🧪 Test de l'API

### Test de santé
```bash
curl http://localhost:3001/api/health
```

### Test de scraping (exemple)
```bash
curl -X POST http://localhost:3001/api/scrape-reviews \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.booking.com/hotel/id/asri-villas.fr.html", "nReviews": 10}'
```

## 🎯 Utilisation de l'application

1. **Ouvrez** http://localhost:5173 dans votre navigateur
2. **Entrez** jusqu'à 3 URLs d'hôtels Booking.com
3. **Cliquez** sur "Analyze Hotels"
4. **Attendez** que l'application scrape et analyse les commentaires
5. **Consultez** les résultats avec les recommandations IA

## 🐛 Dépannage

### Le frontend ne se charge pas
```bash
# Vérifiez que le conteneur frontend fonctionne
docker-compose ps frontend

# Redémarrez si nécessaire
docker-compose restart frontend
```

### L'API ne répond pas
```bash
# Vérifiez les logs du backend
docker-compose logs backend

# Redémarrez si nécessaire
docker-compose restart backend
```

### Problème de scraping
```bash
# Vérifiez que le conteneur scraper fonctionne
docker-compose ps scraper

# Testez directement le scraper
docker-compose exec backend python3 /scraper/run.py --help
```

### Nettoyer complètement
```bash
# Arrêter et supprimer tous les conteneurs
docker-compose down

# Supprimer aussi les images et volumes
docker-compose down --rmi all --volumes
```

## 📁 Structure Docker

```
booking-advisor/
├── docker-compose.yml          # Configuration des services
├── start-docker.sh            # Script de démarrage
├── stop-docker.sh             # Script d'arrêt
├── backend/
│   └── Dockerfile             # Image backend (Node.js + Python)
├── hotel-advisor/
│   └── Dockerfile             # Image frontend (React)
└── booking-reviews-scraper/
    └── Dockerfile             # Image scraper (Python)
```

## 🎉 Avantages du mode Docker

- ✅ **Isolation** : Chaque service fonctionne dans son propre conteneur
- ✅ **Portabilité** : Fonctionne sur n'importe quelle machine avec Docker
- ✅ **Simplicité** : Un seul script pour tout démarrer
- ✅ **Consistance** : Environnement identique en développement et production
- ✅ **Scalabilité** : Facile d'ajouter de nouveaux services

## 🔄 Mise à jour

Pour mettre à jour l'application :
```bash
# Arrêter les services
./stop-docker.sh

# Reconstruire les images
docker-compose build

# Redémarrer
./start-docker.sh
```

---

**🎯 Votre application Booking Advisor est maintenant prête à être utilisée en mode Docker !**
