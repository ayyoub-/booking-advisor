#!/bin/bash

# 🔒 Script de configuration SSL avec Let's Encrypt pour Booking Advisor
# Usage: ./setup-ssl.sh [DOMAIN] [EMAIL]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN=${1:-""}
EMAIL=${2:-""}
NGINX_SITE="booking-advisor"

# Fonction pour afficher les messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Vérification des prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier si on est root ou sudo
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root ou avec sudo"
    fi
    
    # Vérifier le domaine
    if [[ -z "$DOMAIN" ]]; then
        error "Veuillez fournir un domaine: ./setup-ssl.sh votre-domaine.com votre-email@example.com"
    fi
    
    # Vérifier l'email
    if [[ -z "$EMAIL" ]]; then
        error "Veuillez fournir un email: ./setup-ssl.sh votre-domaine.com votre-email@example.com"
    fi
    
    # Vérifier que Nginx est installé
    if ! command -v nginx &> /dev/null; then
        error "Nginx n'est pas installé. Installez-le d'abord."
    fi
    
    # Vérifier que le domaine pointe vers cette machine
    log "🔍 Vérification que le domaine $DOMAIN pointe vers cette machine..."
    CURRENT_IP=$(curl -s ifconfig.me)
    DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
    
    if [[ "$CURRENT_IP" != "$DOMAIN_IP" ]]; then
        warn "Le domaine $DOMAIN ne pointe pas vers cette machine ($CURRENT_IP)"
        warn "IP du domaine: $DOMAIN_IP"
        warn "IP de cette machine: $CURRENT_IP"
        read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Configuration SSL annulée"
        fi
    fi
    
    log "✅ Prérequis validés"
}

# Installation de Certbot
install_certbot() {
    log "📦 Installation de Certbot..."
    
    # Vérifier si Certbot est déjà installé
    if command -v certbot &> /dev/null; then
        log "Certbot est déjà installé"
        return
    fi
    
    # Installation selon la distribution
    if command -v apt &> /dev/null; then
        # Ubuntu/Debian
        apt update
        apt install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install -y certbot python3-certbot-nginx
    elif command -v dnf &> /dev/null; then
        # Fedora
        dnf install -y certbot python3-certbot-nginx
    else
        error "Distribution non supportée. Installez Certbot manuellement."
    fi
    
    log "✅ Certbot installé"
}

# Configuration temporaire de Nginx pour la validation
setup_nginx_temp() {
    log "🌐 Configuration temporaire de Nginx..."
    
    # Créer une configuration temporaire simple
    cat > /etc/nginx/sites-available/$NGINX_SITE << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        return 200 'Temporary configuration for SSL validation';
        add_header Content-Type text/plain;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF
    
    # Activer le site
    ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
    
    # Supprimer le site par défaut
    rm -f /etc/nginx/sites-enabled/default
    
    # Créer le répertoire pour les challenges
    mkdir -p /var/www/html/.well-known/acme-challenge
    
    # Tester et redémarrer Nginx
    nginx -t
    systemctl restart nginx
    
    log "✅ Configuration temporaire de Nginx créée"
}

# Obtenir le certificat SSL
obtain_ssl_certificate() {
    log "🔒 Obtention du certificat SSL..."
    
    # Obtenir le certificat avec validation webroot
    certbot certonly \
        --webroot \
        --webroot-path=/var/www/html \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN,www.$DOMAIN
    
    # Vérifier que le certificat a été créé
    if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
        error "Échec de la création du certificat SSL"
    fi
    
    log "✅ Certificat SSL obtenu"
}

# Configuration finale de Nginx avec SSL
setup_nginx_ssl() {
    log "🌐 Configuration finale de Nginx avec SSL..."
    
    # Créer la configuration finale avec SSL
    cat > /etc/nginx/sites-available/$NGINX_SITE << EOF
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirection permanente vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Configuration HTTPS principale
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Configuration SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuration SSL moderne et sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Configuration des logs
    access_log /var/log/nginx/booking-advisor-access.log;
    error_log /var/log/nginx/booking-advisor-error.log;
    
    # Limite de taille des uploads
    client_max_body_size 10M;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Frontend React (Vite dev server)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Tester la configuration
    nginx -t
    
    # Redémarrer Nginx
    systemctl restart nginx
    
    log "✅ Configuration SSL de Nginx terminée"
}

# Configuration du renouvellement automatique
setup_auto_renewal() {
    log "🔄 Configuration du renouvellement automatique..."
    
    # Tester le renouvellement
    certbot renew --dry-run
    
    # Ajouter une tâche cron pour le renouvellement automatique
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
    
    log "✅ Renouvellement automatique configuré"
}

# Vérification finale
verify_ssl() {
    log "🔍 Vérification de la configuration SSL..."
    
    # Vérifier que Nginx fonctionne
    if ! systemctl is-active --quiet nginx; then
        error "Nginx n'est pas actif"
    fi
    
    # Vérifier que le certificat est valide
    if ! openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep -q "Validity"; then
        error "Le certificat SSL n'est pas valide"
    fi
    
    # Tester la connexion HTTPS
    if curl -s https://$DOMAIN > /dev/null; then
        log "✅ HTTPS fonctionne correctement"
    else
        warn "⚠️  HTTPS ne répond pas encore (normal si l'application n'est pas démarrée)"
    fi
    
    log "✅ Configuration SSL vérifiée"
}

# Affichage des informations finales
show_final_info() {
    log "🎉 Configuration SSL terminée !"
    echo ""
    echo -e "${BLUE}🔒 Votre site est maintenant accessible en HTTPS :${NC}"
    echo -e "   🌐 https://$DOMAIN"
    echo -e "   🌐 https://www.$DOMAIN"
    echo ""
    echo -e "${BLUE}📋 Informations du certificat :${NC}"
    echo -e "   📁 Certificat: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo -e "   🔑 Clé privée: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo -e "   📅 Expiration: $(openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates | grep notAfter | cut -d= -f2)"
    echo ""
    echo -e "${BLUE}🔧 Commandes utiles :${NC}"
    echo -e "   🔄 Renouveler: certbot renew"
    echo -e "   📊 Statut: certbot certificates"
    echo -e "   🧪 Test: certbot renew --dry-run"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
    echo -e "   1. Le certificat sera renouvelé automatiquement"
    echo -e "   2. Vérifiez que votre application fonctionne sur les ports 3001 et 5173"
    echo -e "   3. Testez l'accès HTTPS avant de mettre en production"
    echo ""
}

# Fonction principale
main() {
    log "🔒 Début de la configuration SSL pour Booking Advisor"
    log "🌐 Domaine: $DOMAIN"
    log "📧 Email: $EMAIL"
    echo ""
    
    check_prerequisites
    install_certbot
    setup_nginx_temp
    obtain_ssl_certificate
    setup_nginx_ssl
    setup_auto_renewal
    verify_ssl
    show_final_info
}

# Exécution du script
main "$@"
