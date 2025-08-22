# 🧪 CONFIGURACIÓN DE PRUEBAS - JACKDAWS BACKEND

## 📋 CHECKLIST PRE-PRUEBAS

### ✅ 1. Servidor Backend
- [ ] Servidor ejecutándose en http://localhost:3000
- [ ] Base de datos PostgreSQL conectada
- [ ] Variables de entorno configuradas
- [ ] Superadmin creado automáticamente

### ✅ 2. Thunder Client
- [ ] Extension Thunder Client instalada en VS Code
- [ ] Colección importada desde `thunderclient_collection.json`
- [ ] Environment "Development" seleccionado

### ✅ 3. Datos de Prueba
- [ ] Email Superadmin: `superadmin@jackdaws.local`
- [ ] Password Superadmin: `SuperAdmin123!`
- [ ] Base URL: `http://localhost:3000`

## 🔧 COMANDOS ÚTILES

### Iniciar Servidor
```bash
cd backend
npm run dev
```

### Verificar Salud del Sistema
```bash
curl http://localhost:3000/health
```

### Login Manual (obtener token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@jackdaws.local","password":"SuperAdmin123!"}'
```

### Ejecutar Script de Pruebas Básicas
```bash
chmod +x test_api.sh
./test_api.sh
```

## 📊 EXPECTATIVAS DE RESULTADOS

### Códigos de Estado Esperados
- `200` - Operaciones exitosas (GET, PATCH, DELETE exitosos)
- `201` - Recursos creados (POST de invitaciones)
- `400` - Errores de validación o datos incorrectos
- `401` - No autenticado (sin token o token inválido)
- `403` - Sin permisos (rol insuficiente)
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

### Flujo de Variables
1. `Login Superadmin` → guarda `superadmin_token` y `superadmin_id`
2. `Invite Users` → guarda `admin_user_id`, `operator_user_id`, `support_user_id`
3. Otros tests usan estas variables automáticamente

### Validaciones Automáticas
- ✅ Estructuras JSON correctas
- ✅ Tipos de datos apropiados
- ✅ Campos requeridos presentes
- ✅ Códigos de estado correctos
- ✅ Mensajes de error apropiados

## 🚨 RESOLUCIÓN DE PROBLEMAS COMUNES

### Error: "ECONNREFUSED"
**Causa**: Servidor no está ejecutándose
**Solución**:
```bash
npm run dev
# Verificar que muestra: "🚀 Servidor Jackdaws escuchando en http://localhost:3000"
```

### Error: 401 en todas las requests
**Causa**: Token de autenticación no válido o expirado
**Solución**:
1. Re-ejecutar "🔑 Login Superadmin (DEFAULT)"
2. Verificar que el token se guarde en variables de entorno

### Error: 500 Internal Server Error
**Causa**: Error en el servidor backend
**Solución**:
1. Verificar logs del terminal del servidor
2. Verificar conexión a base de datos
3. Verificar variables de entorno (.env)

### Error: Tests fallan después del primer run
**Causa**: Datos ya existen en la base de datos
**Solución**:
1. Cambiar emails en los tests de invitación
2. O limpiar la base de datos
3. O usar diferentes datos de prueba

## 📈 MÉTRICAS DE COBERTURA

La suite de pruebas cubre:

### ✅ Funcionalidades Core (100%)
- Autenticación (login/logout)
- Gestión de usuarios (CRUD)
- Sistema de roles (RBAC)
- Auditoría completa

### ✅ Casos de Error (100%)
- Credenciales inválidas
- Acceso no autorizado
- Tokens inválidos
- Endpoints inexistentes
- Validaciones de entrada

### ✅ Seguridad (100%)
- Verificación de roles
- Protección de endpoints
- Validación de tokens
- Prevención de escalación

## 📝 REPORTES DE PRUEBAS

### Ejecutar y Generar Reporte
1. Thunder Client → Run Collection
2. Exportar resultados como JSON/HTML
3. Revisar estadísticas de éxito/fallo

### Métricas Importantes
- **Total Tests**: 23
- **Success Rate**: Objetivo 100%
- **Average Response Time**: < 500ms
- **Failed Tests**: Objetivo 0

---

## 🎯 SIGUIENTE PASOS

1. ✅ Ejecutar todas las pruebas Thunder Client
2. ✅ Verificar que todas pasan correctamente
3. ✅ Revisar logs de auditoría generados
4. ✅ Confirmar funcionamiento del RBAC
5. ✅ Validar seguridad de endpoints

---

**🚀 ¡Listo para probar el backend completo de Jackdaws!**
