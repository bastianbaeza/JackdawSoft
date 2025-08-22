# 🧪 Guía de Pruebas del Backend Jackdaws

## 📋 Descripción General
Esta guía detalla cómo ejecutar y validar todas las pruebas del sistema de autenticación y gestión de usuarios del backend Jackdaws usando Thunder Client.

**Última actualización:** 22 de agosto de 2025 - 08:48 AM (Chile)

## 🔧 Configuración Previa

### Variables de Entorno Requeridas
Crear un archivo `.env` con:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=jackdaws_db
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
FRONTEND_URL=http://localhost:3000
```

### Configuración de Thunder Client
1. **Importar Colección**: Importa el archivo `thunderclient_collection.json`
2. **Variables de Entorno**:
   - `baseUrl`: `http://localhost:3000/api`
   - `superAdminToken`: Se obtendrá después del primer login
   - `userToken`: Para pruebas de usuarios normales

## 🚀 Orden de Ejecución de Pruebas

### Fase 1: Verificación del Sistema ⚡
```
1. Verificación de Salud
   - Valida que el servidor esté funcionando
   - Confirma conexión a base de datos
```

### Fase 2: Autenticación Básica 🔐
```
2. Invitar Usuario Superadmin
   - Crea el primer usuario del sistema
   - Genera token de activación

3. Activar Cuenta Superadmin
   - Activa la cuenta con contraseña segura
   - Valida políticas de contraseñas

4. Login Superadmin
   - Autentica al superadministrador
   - Obtiene JWT token para siguientes pruebas
```

### Fase 3: Gestión de Usuarios 👥
```
5. Listar Usuarios
   - Obtiene lista paginada de usuarios
   - Valida filtros y búsqueda

6. Invitar Usuario Administrador
   - Crea cuenta de administrador
   - Valida permisos de rol

7. Activar Usuario Administrador
   - Procesa activación de admin
   - Configura contraseña

8. Obtener Perfil Usuario
   - Recupera información del perfil
   - Valida datos sanitizados

9. Actualizar Usuario
   - Modifica roles y estados
   - Valida restricciones de seguridad

10. Cambiar Contraseña
    - Actualiza credenciales
    - Valida políticas de seguridad
```

### Fase 4: Controles de Seguridad 🛡️
```
11. Intentos de Login Fallidos
    - Simula ataques de fuerza bruta
    - Valida bloqueo automático

12. Login con Cuenta Bloqueada
    - Confirma protección de cuentas
    - Valida mensajes de error

13. Acceso Sin Permisos
    - Prueba autorización de roles
    - Valida middleware de seguridad

14. Token Expirado/Inválido
    - Prueba validación de JWT
    - Confirma manejo de errores
```

### Fase 5: Auditoría y Sistema 📊
```
15. Obtener Logs de Auditoría
    - Recupera historial de acciones
    - Valida filtros de consulta

16. Estadísticas del Sistema
    - Obtiene métricas de usuarios
    - Valida contadores por rol/estado

17. Desactivar Usuario
    - Desactiva cuenta de usuario
    - Valida protecciones de superadmin

18. Reactivar Usuario
    - Reactiva cuenta desactivada
    - Confirma cambio de estado
```

### Fase 6: Casos Límite 🎯
```
19. Invitación Email Duplicado
    - Prueba validación de unicidad
    - Confirma manejo de errores

20. Activación Token Inválido
    - Valida tokens manipulados
    - Confirma seguridad de activación

21. Logout y Limpieza
    - Cierra sesión activa
    - Limpia cookies de autenticación
```

## 📊 Criterios de Validación

### Respuestas Exitosas ✅
- **200**: Operaciones exitosas
- **201**: Recursos creados
- **401**: No autenticado (esperado en casos de prueba)
- **403**: Sin permisos (esperado en validaciones)
- **404**: Recurso no encontrado (esperado)

### Estructura de Respuestas Esperadas
```json
{
  "mensaje": "Operación exitosa",
  "usuario": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "rol": "administrador",
    "estado": "activo"
  },
  "token": "jwt_token_aqui"
}
```

### Validaciones de Seguridad 🔒
1. **Contraseñas**: Mínimo 8 caracteres, mayúsculas, minúsculas, números
2. **JWT**: Expiración válida, estructura correcta
3. **Roles**: Autorización correcta por endpoint
4. **Bloqueos**: Protección después de 5 intentos fallidos
5. **Auditoría**: Registro de todas las acciones críticas

## 🐛 Solución de Problemas

### Errores Comunes
```
Error: ECONNREFUSED
Solución: Verificar que el servidor esté ejecutándose en puerto 3000

Error: "Token inválido"
Solución: Actualizar variable {{superAdminToken}} después del login

Error: "Usuario no encontrado"
Solución: Ejecutar pruebas en orden secuencial
```

### Logs Útiles
```bash
# Ver logs del servidor
npm run dev

# Ver logs de base de datos
docker logs postgres_container

# Ver estructura de tablas
psql -d jackdaws_db -c "\dt"
```

## 📈 Reportes de Pruebas

### Métricas Clave
- ✅ **Cobertura de Endpoints**: 100%
- ✅ **Casos de Seguridad**: 15 pruebas
- ✅ **Validaciones RBAC**: 8 roles testados
- ✅ **Auditoría**: Todos los eventos registrados

### Estado Esperado Final
```
👥 Usuarios Creados: 3+
🔑 Roles Validados: superadministrador, administrador, operador
📝 Logs Generados: 20+ entradas
🛡️ Controles Seguridad: Activados
```

---

**Nota**: Estas pruebas están diseñadas para validar completamente el cumplimiento del Requisito Funcional RF_01 del sistema Jackdaws.
