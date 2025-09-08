#!/bin/bash

# 📊 Script de monitoring et maintenance pour Booking Advisor
# Usage: ./monitor.sh [status|logs|restart|update|backup|health]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/opt/booking-advisor"
BACKUP_DIR="/opt/backups/booking-advisor"
LOG_FILE="/var/log/booking-advisor-monitor.log"

# Fonction pour afficher les messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

# Vérifier le statut des services
check_status() {
    log "📊 Vérification du statut des services..."
    
    cd "$APP_DIR"
    
    echo -e "${BLUE}🐳 Statut des conteneurs Docker:${NC}"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${BLUE}🌐 Statut de Nginx:${NC}"
    systemctl status nginx --no-pager -l
    
    echo ""
    echo -e "${BLUE}💾 Utilisation des ressources:${NC}"
    echo "Mémoire:"
    free -h
    echo ""
    echo "Disque:"
    df -h
    echo ""
    echo "CPU:"
    top -bn1 | grep "Cpu(s)"
    
    echo ""
    echo -e "${BLUE}🔗 Connexions réseau:${NC}"
    netstat -tulpn | grep -E ":(80|443|3001|5173)"
}

# Afficher les logs
show_logs() {
    log "📋 Affichage des logs..."
    
    cd "$APP_DIR"
    
    echo -e "${BLUE}📋 Logs des services (dernières 50 lignes):${NC}"
    echo ""
    echo -e "${YELLOW}=== BACKEND ===${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 backend
    
    echo ""
    echo -e "${YELLOW}=== FRONTEND ===${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 frontend
    
    echo ""
    echo -e "${YELLOW}=== SCRAPER ===${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 scraper
    
    echo ""
    echo -e "${YELLOW}=== NGINX ===${NC}"
    tail -50 /var/log/nginx/access.log
    echo ""
    tail -50 /var/log/nginx/error.log
}

# Redémarrer les services
restart_services() {
    log "🔄 Redémarrage des services..."
    
    cd "$APP_DIR"
    
    # Arrêter les services
    docker-compose -f docker-compose.prod.yml down
    
    # Attendre un peu
    sleep 5
    
    # Redémarrer les services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Attendre que les services soient prêts
    log "⏳ Attente du démarrage des services..."
    sleep 30
    
    # Vérifier le statut
    check_status
    
    log "✅ Services redémarrés"
}

# Mettre à jour l'application
update_app() {
    log "📥 Mise à jour de l'application..."
    
    cd "$APP_DIR"
    
    # Sauvegarde avant mise à jour
    backup_app
    
    # Mise à jour du code
    if [[ -d ".git" ]]; then
        git pull origin main
    else
        warn "Pas de repository Git détecté. Mise à jour manuelle nécessaire."
    fi
    
    # Reconstruire et redémarrer
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Attendre que les services soient prêts
    log "⏳ Attente du démarrage des services..."
    sleep 30
    
    # Vérifier le statut
    check_status
    
    log "✅ Application mise à jour"
}

# Sauvegarder l'application
backup_app() {
    log "💾 Sauvegarde de l'application..."
    
    # Créer le répertoire de sauvegarde
    mkdir -p "$BACKUP_DIR"
    
    # Date de la sauvegarde
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/booking-advisor_$DATE.tar.gz"
    
    # Sauvegarde des données
    tar -czf "$BACKUP_FILE" "$APP_DIR" --exclude="$APP_DIR/node_modules" --exclude="$APP_DIR/venv"
    
    # Garder seulement les 7 dernières sauvegardes
    find "$BACKUP_DIR" -name "booking-advisor_*.tar.gz" -mtime +7 -delete
    
    log "✅ Sauvegarde créée: $BACKUP_FILE"
}

# Vérifier la santé de l'application
check_health() {
    log "🏥 Vérification de la santé de l'application..."
    
    # Vérifier le backend
    if curl -s http://localhost:3001/api/health > /dev/null; then
        log "✅ Backend: OK"
    else
        error "❌ Backend: KO"
    fi
    
    # Vérifier le frontend
    if curl -s http://localhost:5173 > /dev/null; then
        log "✅ Frontend: OK"
    else
        error "❌ Frontend: KO"
    fi
    
    # Vérifier Nginx
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx: OK"
    else
        error "❌ Nginx: KO"
    fi
    
    # Vérifier les conteneurs Docker
    cd "$APP_DIR"
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "✅ Conteneurs Docker: OK"
    else
        error "❌ Conteneurs Docker: KO"
    fi
}

# Nettoyer les ressources
cleanup() {
    log "🧹 Nettoyage des ressources..."
    
    # Nettoyer les images Docker inutilisées
    docker image prune -f
    
    # Nettoyer les conteneurs arrêtés
    docker container prune -f
    
    # Nettoyer les volumes inutilisés
    docker volume prune -f
    
    # Nettoyer les réseaux inutilisés
    docker network prune -f
    
    log "✅ Nettoyage terminé"
}

# Afficher les statistiques détaillées
show_stats() {
    log "📈 Statistiques détaillées..."
    
    echo -e "${BLUE}🐳 Statistiques Docker:${NC}"
    docker stats --no-stream
    
    echo ""
    echo -e "${BLUE}💾 Utilisation du disque:${NC}"
    du -sh "$APP_DIR"
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "Aucune sauvegarde trouvée"
    
    echo ""
    echo -e "${BLUE}🌐 Connexions actives:${NC}"
    ss -tuln | grep -E ":(80|443|3001|5173)"
    
    echo ""
    echo -e "${BLUE}📊 Logs d'erreur récents:${NC}"
    tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Aucun log d'erreur Nginx"
}

# Afficher l'aide
show_help() {
    echo -e "${BLUE}📊 Script de monitoring Booking Advisor${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status    - Afficher le statut des services"
    echo "  logs      - Afficher les logs des services"
    echo "  restart   - Redémarrer tous les services"
    echo "  update    - Mettre à jour l'application"
    echo "  backup    - Créer une sauvegarde"
    echo "  health    - Vérifier la santé de l'application"
    echo "  cleanup   - Nettoyer les ressources Docker"
    echo "  stats     - Afficher les statistiques détaillées"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 status"
    echo "  $0 logs"
    echo "  $0 restart"
    echo "  $0 update"
}

# Fonction principale
main() {
    # Créer le fichier de log si nécessaire
    touch "$LOG_FILE"
    
    case "${1:-help}" in
        status)
            check_status
            ;;
        logs)
            show_logs
            ;;
        restart)
            restart_services
            ;;
        update)
            update_app
            ;;
        backup)
            backup_app
            ;;
        health)
            check_health
            ;;
        cleanup)
            cleanup
            ;;
        stats)
            show_stats
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécution du script
main "$@"
