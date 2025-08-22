# 🧪 Guía de Pruebas Thunder Client - Jackdaws Backend

## 📥 Importar la Colección

1. **Abrir Thunder Client** en VS Code
2. **Click en "Collections"** (icono de carpeta)
3. **Menu (tres puntos)** → "Import"
4. **Seleccionar** `thunderclient_collection.json`
5. ✅ La colección "Jackdaws Backend API Tests" aparecerá con 4 carpetas

## 🌐 Configurar Entorno

Las variables de entorno se configuran automáticamente durante las pruebas, pero puedes verificar:

```json
{
  "baseUrl": "http://localhost:3000",
  "superadmin_token": "",
  "superadmin_id": "",
  "admin_user_id": "",
  "operator_user_id": "",
  "support_user_id": ""
}
```

## 📋 Estructura de Pruebas

### 🔐 **1. Authentication (8 tests)**
- ✅ Login Superadmin (guarda token automáticamente)
- ❌ Login con credenciales inválidas
- 👤 Obtener perfil del usuario actual
- 📧 Invitar usuarios con diferentes roles
- ❌ Invitar email duplicado
- ❌ Activar token inválido
- 🚪 Logout

### 👥 **2. User Management (7 tests)**
- 📋 Listar todos los usuarios
- 📋 Listar usuarios con filtros
- 👤 Obtener usuario específico
- ✏️ Actualizar rol de usuario
- ✏️ Actualizar estado de usuario
- 🚫 Desactivar usuario
- ✅ Reactivar usuario

### 📊 **3. Audit & System (3 tests)**
- 📊 Obtener logs de auditoría
- 📊 Obtener logs filtrados
- 📈 Obtener estadísticas del sistema

### ⚡ **4. System Health (4 tests)**
- ⚡ Health check del sistema
- 🏠 Endpoint raíz de la API
- ❌ Acceso sin autorización
- ❌ Token inválido
- ❌ Endpoint inexistente

## 🚀 Ejecutar las Pruebas

### **Opción 1: Ejecutar Colección Completa**
1. Click derecho en "Jackdaws Backend API Tests"
2. Seleccionar "Run All"
3. Ver resultados en tiempo real

### **Opción 2: Ejecutar por Carpetas**
1. Expandir carpetas (🔐 Authentication, 👥 User Management, etc.)
2. Click derecho en la carpeta deseada
3. Seleccionar "Run All"

### **Opción 3: Ejecutar Tests Individuales**
1. Click en un test específico
2. Click en "Send"
3. Ver respuesta y validaciones

## 📝 Secuencia Recomendada de Pruebas

### **PASO 1: Sistema y Salud**
```
1. Health Check                    ✅ Verificar que el servidor funciona
2. Root API Endpoint              ✅ Verificar endpoint principal
```

### **PASO 2: Autenticación Básica**
```
3. Login Superadmin (DEFAULT)     ✅ Obtener token de autenticación
4. Get My Profile                 ✅ Verificar autenticación
```

### **PASO 3: Gestión de Usuarios**
```
5. Invite Admin User              ✅ Crear usuario Admin
6. Invite Operator User           ✅ Crear usuario Operator
7. Invite Support User            ✅ Crear usuario Support
8. List All Users                 ✅ Ver usuarios creados
```

### **PASO 4: Operaciones CRUD**
```
9. Get Specific User              ✅ Obtener usuario específico
10. Update User Role              ✅ Cambiar rol de usuario
11. Update User Status            ✅ Cambiar estado de usuario
12. Deactivate User               ✅ Desactivar usuario
13. Reactivate User               ✅ Reactivar usuario
```

### **PASO 5: Auditoría y Estadísticas**
```
14. Get Audit Logs                ✅ Ver logs de auditoría
15. Get Filtered Audit Logs       ✅ Ver logs filtrados
16. Get System Statistics         ✅ Ver estadísticas del sistema
```

### **PASO 6: Casos de Error**
```
17. Login Invalid Credentials     ❌ Credenciales incorrectas
18. Invite Duplicate Email        ❌ Email duplicado
19. Activate Invalid Token        ❌ Token de activación inválido
20. Unauthorized Access           ❌ Acceso sin token
21. Invalid Token                 ❌ Token malformado
22. Not Found Endpoint            ❌ Endpoint inexistente
```

### **PASO 7: Limpieza**
```
23. Logout                        🚪 Cerrar sesión
```

## ✅ Validaciones Automáticas

Cada test incluye validaciones automáticas:

- **Códigos de Estado HTTP**: 200, 201, 400, 401, 403, 404
- **Estructura de Respuesta**: JSON válido, campos requeridos
- **Contenido**: Valores específicos, tipos de datos
- **Variables de Entorno**: Guardado automático de tokens e IDs

## 📊 Interpretación de Resultados

### ✅ **Test Exitoso**
- ✅ Marca verde
- Código de estado correcto
- Validaciones pasadas
- Variables guardadas automáticamente

### ❌ **Test Fallido**
- ❌ Marca roja
- Detalles del error en la respuesta
- Revisar logs del servidor para más información

### ⚠️ **Test con Advertencias**
- ⚠️ Marca amarilla
- Funciona pero con advertencias menores

## 🔧 Resolución de Problemas

### **Error: ECONNREFUSED**
```bash
# Verificar que el servidor está ejecutándose
npm run dev
```

### **Error: 401 Unauthorized**
```bash
# Re-ejecutar el login para obtener nuevo token
1. Run "Login Superadmin (DEFAULT)"
2. Verify token is saved in environment
```

### **Error: 404 Not Found**
```bash
# Verificar URL base en environment
baseUrl: "http://localhost:3000"
```

### **Error: 500 Internal Server Error**
```bash
# Verificar logs del servidor y base de datos
1. Check server terminal for errors
2. Verify database connection
3. Check .env file configuration
```

## 📈 Métricas de Cobertura

La colección cubre:

- ✅ **100% de endpoints** implementados
- ✅ **Casos positivos** (happy path)
- ✅ **Casos negativos** (errores esperados)
- ✅ **Validaciones de seguridad** (RBAC)
- ✅ **Gestión de tokens** y autenticación
- ✅ **Auditoría** completa de operaciones
- ✅ **Estados de usuario** (pending, active, blocked, deactivated)
- ✅ **Roles** (superadmin, admin, operator, support)

## 🎯 Próximos Tests (Roadmap)

- [ ] Tests de rendimiento (carga)
- [ ] Tests de concurrencia
- [ ] Tests de activación de cuentas (requiere email)
- [ ] Tests de cambio de contraseña
- [ ] Tests de 2FA (cuando se implemente)
- [ ] Tests de rate limiting

---

## 📞 Soporte

Si encuentras problemas con las pruebas:

1. **Verificar** que el servidor backend está ejecutándose
2. **Revisar** la configuración de variables de entorno
3. **Ejecutar** los tests en el orden recomendado
4. **Consultar** logs del servidor para errores específicos

---

**🚀 ¡Happy Testing! Las pruebas están listas para validar completamente el cumplimiento del Requisito Funcional RF_01**
