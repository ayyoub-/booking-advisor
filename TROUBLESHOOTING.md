# 🔧 Guide de dépannage - Booking Advisor

## ❌ Erreur "Unexpected end of JSON input"

### 🎯 Cause
Cette erreur se produit quand le frontend reçoit une réponse vide ou malformée du backend.

### ✅ Solution appliquée
Le problème était que le proxy Vite pointait vers `localhost:3001` au lieu de `backend:3001` dans l'environnement Docker.

**Fichier modifié** : `hotel-advisor/vite.config.ts`
```typescript
proxy: {
  '/api': {
    target: 'http://backend:3001',  // ✅ Correct pour Docker
    changeOrigin: true,
    secure: false,
  },
},
```

### 🔍 Vérifications à faire

1. **Vérifier que les conteneurs fonctionnent** :
   ```bash
   docker-compose ps
   ```

2. **Tester l'API backend directement** :
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Tester le proxy frontend** :
   ```bash
   curl http://localhost:5173/api/health
   ```

4. **Vérifier les logs** :
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

## 🐛 Autres erreurs courantes

### ❌ "Failed to fetch"
**Cause** : Le backend n'est pas accessible
**Solution** : Vérifier que le conteneur backend fonctionne

### ❌ "CORS error"
**Cause** : Problème de configuration CORS
**Solution** : Vérifier la configuration CORS dans le backend

### ❌ "Connection refused"
**Cause** : Le port n'est pas ouvert ou le service ne fonctionne pas
**Solution** : Vérifier les ports dans docker-compose.yml

### ❌ "Module not found"
**Cause** : Dépendances manquantes
**Solution** : Reconstruire les images Docker

## 🔧 Commandes de dépannage

### Redémarrer tous les services
```bash
docker-compose restart
```

### Reconstruire les images
```bash
docker-compose build --no-cache
```

### Voir les logs en temps réel
```bash
docker-compose logs -f
```

### Accéder au shell d'un conteneur
```bash
docker-compose exec frontend sh
docker-compose exec backend sh
```

### Nettoyer complètement
```bash
docker-compose down --rmi all --volumes
```

## ✅ Test de fonctionnement

Après avoir appliqué les corrections, testez avec :
```bash
./test-docker.sh
```

Vous devriez voir :
```
🎉 Docker deployment test completed!
✅ Backend is healthy
✅ Frontend is accessible
✅ Scraping API is responding
```

## 📱 Utilisation

1. Ouvrez http://localhost:5173
2. Entrez une URL d'hôtel Booking.com
3. Cliquez sur "Analyze Hotels"
4. L'application devrait maintenant fonctionner sans erreur !

---

**🎯 Si vous rencontrez d'autres erreurs, vérifiez d'abord les logs avec `docker-compose logs -f`**
