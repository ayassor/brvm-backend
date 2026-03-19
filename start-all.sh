#!/bin/bash
# ============================================================
# BRVM Backend - Start All Services (native mode)
# ⚠️  MOT DE PASSE MariaDB : brvm_dev_2024
# ============================================================

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load env
set -a
source "$BACKEND_DIR/.env"
set +a

echo "🚀 Starting BRVM Backend Services..."

# Kill any existing services
pkill -f "node dist/index.js" 2>/dev/null
sleep 1

# Start microservices
declare -A SERVICES=(
  ["user-service"]="3001:brvm_users"
  ["company-service"]="3002:brvm_companies"
  ["market-data-service"]="3003:brvm_companies"
  ["portfolio-service"]="3004:brvm_portfolios"
  ["education-service"]="3005:brvm_education"
  ["subscription-service"]="3006:brvm_subscriptions"
  ["credit-service"]="3007:brvm_credits"
  ["ai-service"]="3008:"
  ["report-service"]="3009:brvm_reports"
)

for svc in "${!SERVICES[@]}"; do
  IFS=':' read -r port dbname <<< "${SERVICES[$svc]}"
  svc_dir="$BACKEND_DIR/services/$svc"
  if [ -d "$svc_dir" ]; then
    cd "$svc_dir"
    PORT=$port DB_NAME=$dbname node dist/index.js > /tmp/brvm-$svc.log 2>&1 &
    echo "  ✅ $svc → port $port (PID $!)"
  fi
done

# Start API Gateway
cd "$BACKEND_DIR/api-gateway"
PORT=5000 node dist/index.js > /tmp/brvm-api-gateway.log 2>&1 &
echo "  ✅ api-gateway → port 5000 (PID $!)"

sleep 3

echo ""
echo "🔍 Health checks:"
for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009 5000; do
  resp=$(curl -s --max-time 2 http://localhost:$port/health 2>&1)
  if [ $? -eq 0 ]; then
    echo "  ✅ Port $port: OK"
  else
    echo "  ❌ Port $port: FAILED"
  fi
done
