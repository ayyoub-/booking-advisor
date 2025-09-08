# 🚀 Guide de déploiement VPS OVH - Booking Advisor

## 📋 Résumé

Ce guide vous permet de déployer votre application Booking Advisor sur un serveur VPS OVH de manière automatisée et sécurisée.

## 🎯 Options de déploiement

### Option 1: Déploiement rapide (recommandé)
```bash
# Sur votre serveur VPS
./quick-deploy.sh votre-domaine.com votre-email@example.com
```

### Option 2: Déploiement étape par étape
```bash
# 1. Déploiement de base
./deploy-vps.sh votre-domaine.com votre-email@example.com

# 2. Configuration SSL séparée
./setup-ssl.sh votre-domaine.com votre-email@example.com
```

### Option 3: Déploiement manuel
Suivez le guide détaillé dans `DEPLOY_VPS_GUIDE.md`

## 📁 Fichiers de déploiement

| Fichier | Description |
|---------|-------------|
| `quick-deploy.sh` | Script de déploiement rapide et automatisé |
| `deploy-vps.sh` | Script de déploiement complet |
| `setup-ssl.sh` | Script de configuration SSL uniquement |
| `monitor.sh` | Script de monitoring et maintenance |
| `docker-compose.prod.yml` | Configuration Docker pour la production |
| `nginx-booking-advisor.conf` | Configuration Nginx optimisée |
| `DEPLOY_VPS_GUIDE.md` | Guide détaillé de déploiement |

## 🔧 Prérequis

### Serveur VPS OVH
- **OS** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : Minimum 2GB (recommandé 4GB)
- **CPU** : 2 vCPU minimum
- **Stockage** : 20GB minimum
- **Accès** : SSH avec clés ou mot de passe

### Domaine
- Un nom de domaine pointant vers votre VPS
- Exemple : `booking-advisor.votre-domaine.com`

## 🚀 Déploiement rapide

### 1. Préparation
```bash
# Sur votre machine locale
# Copiez le projet sur votre serveur VPS
scp -r /chemin/vers/booking-advisor root@votre-ip-vps:/opt/
```

### 2. Exécution
```bash
# Sur votre serveur VPS
cd /opt/booking-advisor
./quick-deploy.sh votre-domaine.com votre-email@example.com
```

### 3. Vérification
```bash
# Vérifier que l'application fonctionne
curl https://votre-domaine.com/health
```

## 📊 Monitoring et maintenance

### Commandes de base
```bash
# Statut des services
./monitor.sh status

# Voir les logs
./monitor.sh logs

# Redémarrer l'application
./monitor.sh restart

# Mettre à jour l'application
./monitor.sh update

# Créer une sauvegarde
./monitor.sh backup

# Vérifier la santé
./monitor.sh health

# Nettoyer les ressources
./monitor.sh cleanup

# Statistiques détaillées
./monitor.sh stats
```

### Scripts de maintenance
```bash
# Redémarrage rapide
cd /opt/booking-advisor && ./restart.sh

# Mise à jour du code
cd /opt/booking-advisor && ./update.sh

# Sauvegarde
cd /opt/booking-advisor && ./backup.sh
```

## 🔒 Sécurité

### Configuration SSL
- Certificats Let's Encrypt automatiques
- Renouvellement automatique configuré
- Headers de sécurité modernes
- Redirection HTTP vers HTTPS

### Headers de sécurité configurés
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Content-Security-Policy`

## 🌐 Architecture de déploiement

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
┌─────────────────┐
│  Frontend React │ (Port 5173)
│  (Vite Dev)     │
└─────────────────┘
    ↓
┌─────────────────┐
│  Backend API    │ (Port 3001)
│  (Express.js)   │
└─────────────────┘
    ↓
┌─────────────────┐
│  Python Scraper │
│  (Booking.com)  │
└─────────────────┘
```

## 📈 Monitoring

### Logs
- **Nginx** : `/var/log/nginx/booking-advisor-*.log`
- **Application** : `docker-compose logs -f`
- **Système** : `/var/log/syslog`

### Métriques
- **Ressources** : `htop`, `docker stats`
- **Réseau** : `netstat -tulpn`
- **Disque** : `df -h`

## 🔄 Mise à jour

### Mise à jour du code
```bash
cd /opt/booking-advisor
git pull origin main
./update.sh
```

### Mise à jour des dépendances
```bash
cd /opt/booking-advisor
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🐛 Dépannage

### Problèmes courants

1. **L'application ne démarre pas**
   ```bash
   cd /opt/booking-advisor
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Nginx ne fonctionne pas**
   ```bash
   nginx -t
   systemctl status nginx
   ```

3. **Certificat SSL ne fonctionne pas**
   ```bash
   certbot certificates
   certbot renew --dry-run
   ```

4. **Ports occupés**
   ```bash
   netstat -tulpn | grep -E ":(80|443|3001|5173)"
   ```

### Logs utiles
```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs -f

# Logs de Nginx
tail -f /var/log/nginx/booking-advisor-error.log

# Logs du système
journalctl -u nginx -f
```

## 📞 Support

### Commandes de diagnostic
```bash
# Vérification complète
./monitor.sh health

# Statut détaillé
./monitor.sh status

# Statistiques
./monitor.sh stats
```

### Informations système
```bash
# Version de Docker
docker --version

# Version de Nginx
nginx -v

# Certificats SSL
certbot certificates

# Espace disque
df -h

# Mémoire
free -h
```

## 🎉 Félicitations !

Votre application Booking Advisor est maintenant déployée et accessible en HTTPS sur votre serveur VPS OVH !

### Prochaines étapes
1. ✅ Testez l'application
2. ✅ Configurez un firewall si nécessaire
3. ✅ Planifiez des sauvegardes régulières
4. ✅ Configurez un monitoring avancé (optionnel)

---

**📝 Note** : Ce guide est optimisé pour les serveurs VPS OVH mais fonctionne sur la plupart des serveurs Linux.
