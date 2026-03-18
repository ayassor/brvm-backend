#!/bin/bash
# ============================================================
# Script d'installation et démarrage du backend BRVM
# Usage: bash scripts/setup.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== BRVM Backend Setup ===${NC}"

# 1. Vérifier Docker et Docker Compose
if ! command -v docker &>/dev/null; then
  echo -e "${RED}Docker n'est pas installé. Installez-le d'abord.${NC}"
  exit 1
fi

if ! command -v docker compose &>/dev/null; then
  echo -e "${RED}Docker Compose v2 n'est pas disponible.${NC}"
  exit 1
fi

# 2. Initialiser les bases de données MariaDB
echo -e "${YELLOW}Initialisation des bases de données MariaDB...${NC}"
if command -v mysql &>/dev/null; then
  mysql -u root -p < database/init.sql && \
    echo -e "${GREEN}Bases de données créées avec succès.${NC}" || \
    echo -e "${YELLOW}Avertissement: Vérifiez la connexion MariaDB.${NC}"
else
  echo -e "${YELLOW}mysql CLI non trouvé. Exécutez manuellement:${NC}"
  echo "  mysql -u root -p < database/init.sql"
fi

# 3. Construire et démarrer les services
echo -e "${YELLOW}Construction des images Docker...${NC}"
docker compose build --parallel

echo -e "${YELLOW}Démarrage des services...${NC}"
docker compose up -d

# 4. Vérifier le statut
echo -e "${YELLOW}Vérification du statut...${NC}"
sleep 5
docker compose ps

echo ""
echo -e "${GREEN}=== Backend BRVM démarré ===${NC}"
echo -e "API Gateway: ${GREEN}http://localhost:5000${NC}"
echo -e "Health check: ${GREEN}http://localhost:5000/health${NC}"
echo ""
echo "Commandes utiles:"
echo "  docker compose logs -f          # Suivre les logs"
echo "  docker compose logs -f api-gateway  # Logs gateway uniquement"
echo "  docker compose down             # Arrêter tous les services"
echo "  docker compose restart <svc>    # Redémarrer un service"
