# 🚀 Guide de déploiement VPS OVH - Booking Advisor

## 📋 Prérequis

### Serveur VPS OVH
- **OS** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : Minimum 2GB (recommandé 4GB)
- **CPU** : 2 vCPU minimum
- **Stockage** : 20GB minimum
- **Accès** : SSH avec clés ou mot de passe

### Domaine (optionnel mais recommandé)
- Un nom de domaine pointant vers votre VPS
- Exemple : `booking-advisor.cloud`

## 🔧 Installation sur le serveur VPS

### 1. Connexion au serveur
```bash
ssh debian@162.19.74.200
# ou
ssh utilisateur@votre-ip-vps
```

### 2. Mise à jour du système
```bash
apt update && apt upgrade -y
```

### 3. Installation de Docker
```bash
# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation de Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Vérification
docker --version
docker-compose --version
```

### 4. Installation de Nginx (reverse proxy)
```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

### 5. Installation de Git
```bash
apt install git -y
```

## 📁 Déploiement de l'application

### 1. Cloner le projet
```bash
cd /opt
git clone https://github.com/votre-username/booking-advisor.git
cd booking-advisor
```

### 2. Configuration des variables d'environnement
```bash
# Copier le fichier d'environnement
cp docker.env .env

# Éditer les variables si nécessaire
nano .env
```

### 3. Configuration pour la production
```bash
# Créer le fichier docker-compose.prod.yml
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ./hotel-advisor
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=https://votre-domaine.com/api
    restart: unless-stopped
    networks:
      - booking-advisor

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SCRAPER_PATH=/scraper
    restart: unless-stopped
    networks:
      - booking-advisor

  scraper:
    build:
      context: ./booking-reviews-scraper
      dockerfile: Dockerfile
    restart: unless-stopped
    networks:
      - booking-advisor

networks:
  booking-advisor:
    driver: bridge
EOF
```

## 🌐 Configuration du reverse proxy Nginx

### 1. Configuration Nginx
```bash
cat > /etc/nginx/sites-available/booking-advisor << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Configuration SSL (sera configuré avec Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend React
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 2. Activer le site
```bash
ln -s /etc/nginx/sites-available/booking-advisor /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 Configuration SSL avec Let's Encrypt

### 1. Installation de Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 2. Obtenir le certificat SSL
```bash
# Remplacer votre-domaine.com par votre vrai domaine
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 🚀 Démarrage de l'application

### 1. Démarrer les services
```bash
cd /opt/booking-advisor
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Vérifier le statut
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 3. Voir les logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Scripts de maintenance

### Script de redémarrage
```bash
cat > /opt/booking-advisor/restart.sh << 'EOF'
#!/bin/bash
cd /opt/booking-advisor
echo "🔄 Redémarrage de Booking Advisor..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
echo "✅ Redémarrage terminé"
EOF

chmod +x /opt/booking-advisor/restart.sh
```

### Script de mise à jour
```bash
cat > /opt/booking-advisor/update.sh << 'EOF'
#!/bin/bash
cd /opt/booking-advisor
echo "📥 Mise à jour du code..."
git pull origin main
echo "🔄 Redémarrage des services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
echo "✅ Mise à jour terminée"
EOF

chmod +x /opt/booking-advisor/update.sh
```

## 📊 Monitoring

### 1. Vérification des services
```bash
# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Utilisation des ressources
docker stats

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Monitoring système
```bash
# Installation de htop pour le monitoring
apt install htop -y

# Vérification de l'espace disque
df -h

# Vérification de la mémoire
free -h
```

## 🔄 Sauvegarde

### Script de sauvegarde
```bash
cat > /opt/booking-advisor/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/booking-advisor"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde des données
tar -czf $BACKUP_DIR/booking-advisor_$DATE.tar.gz /opt/booking-advisor

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "booking-advisor_*.tar.gz" -mtime +7 -delete

echo "✅ Sauvegarde créée: $BACKUP_DIR/booking-advisor_$DATE.tar.gz"
EOF

chmod +x /opt/booking-advisor/backup.sh
```

## 🎯 Accès à l'application

Une fois déployé, votre application sera accessible à :
- **HTTPS** : `https://votre-domaine.com`
- **HTTP** : `http://votre-ip-vps` (redirigé vers HTTPS)

## 🐛 Dépannage

### Problèmes courants

1. **L'application ne démarre pas**
   ```bash
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
   netstat -tulpn | grep :80
   netstat -tulpn | grep :443
   ```

## 📝 Notes importantes

- Remplacez `votre-domaine.com` par votre vrai domaine
- Remplacez `votre-ip-vps` par l'IP de votre serveur
- Ajustez les ressources selon votre VPS
- Configurez un firewall si nécessaire
- Planifiez des sauvegardes régulières

## 🎉 Félicitations !

Votre application Booking Advisor est maintenant déployée sur votre serveur VPS OVH !
