#!/bin/bash

# 🧪 Script de Pruebas Automatizadas - Jackdaws Backend
# Este script ejecuta pruebas básicas usando curl para verificar el funcionamiento

echo "🚀 Iniciando pruebas del backend Jackdaws..."
echo "================================================"

# Configuración
BASE_URL="http://localhost:3000"
SUPERADMIN_EMAIL="superadmin@jackdaws.local"
SUPERADMIN_PASSWORD="SuperAdmin123!"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar resultados
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
    fi
}

# Función para mostrar información
show_info() {
    echo -e "${YELLOW}ℹ️  INFO${NC} - $1"
}

echo ""
echo "1️⃣  VERIFICANDO SERVIDOR..."
echo "--------------------------------"

# Test 1: Health Check
show_info "Verificando health check..."
curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/health" | grep -q "200"
show_result $? "Health Check"

# Test 2: Root endpoint
show_info "Verificando endpoint raíz..."
curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/" | grep -q "200"
show_result $? "Root Endpoint"

echo ""
echo "2️⃣  PRUEBAS DE AUTENTICACIÓN..."
echo "--------------------------------"

# Test 3: Login Superadmin
show_info "Login con Superadmin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPERADMIN_EMAIL\",\"password\":\"$SUPERADMIN_PASSWORD\"}")

# Extraer token (asumiendo respuesta JSON con campo token)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ ! -z "$TOKEN" ]; then
    show_result 0 "Login Superadmin"
    show_info "Token obtenido: ${TOKEN:0:20}..."
else
    show_result 1 "Login Superadmin"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 4: Get Profile
show_info "Obteniendo perfil de usuario..."
PROFILE_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo $PROFILE_RESPONSE | grep -q "200"
show_result $? "Get Profile"

# Test 5: Login con credenciales incorrectas
show_info "Probando credenciales incorrectas..."
curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrongpassword"}' \
  -o /dev/null | grep -q "400"
show_result $? "Login Credenciales Incorrectas"

echo ""
echo "3️⃣  PRUEBAS DE GESTIÓN DE USUARIOS..."
echo "--------------------------------"

# Test 6: Listar usuarios
show_info "Listando usuarios..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null | grep -q "200"
show_result $? "List Users"

# Test 7: Invitar usuario
show_info "Invitando nuevo usuario..."
INVITE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/invite" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@jackdaws.local","role":"operator"}')

echo $INVITE_RESPONSE | grep -q "201"
show_result $? "Invite User"

# Test 8: Obtener logs de auditoría
show_info "Obteniendo logs de auditoría..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users/audit-logs" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null | grep -q "200"
show_result $? "Get Audit Logs"

# Test 9: Obtener estadísticas del sistema
show_info "Obteniendo estadísticas del sistema..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users/system/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null | grep -q "200"
show_result $? "Get System Stats"

echo ""
echo "4️⃣  PRUEBAS DE SEGURIDAD..."
echo "--------------------------------"

# Test 10: Acceso sin autorización
show_info "Probando acceso sin autorización..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/users" \
  -o /dev/null | grep -q "401"
show_result $? "Unauthorized Access"

# Test 11: Token inválido
show_info "Probando token inválido..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer invalid-token-123" \
  -o /dev/null | grep -q "401"
show_result $? "Invalid Token"

# Test 12: Endpoint no encontrado
show_info "Probando endpoint inexistente..."
curl -s -w "%{http_code}" -X GET "$BASE_URL/api/nonexistent" \
  -o /dev/null | grep -q "404"
show_result $? "Not Found Endpoint"

echo ""
echo "5️⃣  LIMPIEZA..."
echo "--------------------------------"

# Test 13: Logout
show_info "Cerrando sesión..."
curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null | grep -q "200"
show_result $? "Logout"

echo ""
echo "================================================"
echo "🎉 PRUEBAS COMPLETADAS"
echo ""
echo "💡 Notas:"
echo "   • Las pruebas cubren funcionalidades básicas"
echo "   • Para pruebas completas usar Thunder Client"
echo "   • Revisar logs del servidor si hay fallos"
echo ""
echo "📊 Para estadísticas detalladas:"
echo "   curl -H \"Authorization: Bearer $TOKEN\" $BASE_URL/api/users/system/stats"
echo ""
