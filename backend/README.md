# Backend Jackdaws - Sistema de Autenticación y Gestión de Usuarios

## 🎯 Cumplimiento del Requisito Funcional RF_01

Este backend implementa completamente el **Módulo de autenticación y gestión de usuarios** según las especificaciones del requisito funcional RF_01.

### ✅ Funcionalidades Implementadas

#### **1. Roles del Sistema**
- ✅ **Superadministrador**: Control total del sistema
- ✅ **Administrador**: Visualización y consulta 
- ✅ **Operador**: Funcionalidades básicas
- ✅ **Soporte**: Funcionalidades de apoyo

#### **2. Alta y Gestión de Usuarios**
- ✅ Solo el Superadministrador puede crear, editar y desactivar usuarios
- ✅ Solo el Superadministrador puede asignar y cambiar roles
- ✅ Los demás usuarios solo pueden gestionar su propio perfil
- ✅ Prevención de auto-escalación de privilegios
- ✅ Protección del último Superadministrador

#### **3. Modelo de Incorporación (Solo por Invitación)**
- ✅ Alta de cuentas solo por invitación del Superadministrador
- ✅ Envío automático de correo de activación con enlace único
- ✅ Token de activación con vencimiento configurable (48h por defecto)
- ✅ Activación requerida para acceso al sistema

#### **4. Autenticación y Acceso**
- ✅ Inicio de sesión con email y contraseña
- ✅ Verificación de cuenta activa
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Bloqueo automático por intentos fallidos (5 intentos por defecto)
- ✅ Sesiones JWT con expiración configurable
- ✅ Cookies seguras con HttpOnly
- ✅ **NUEVO:** Sistema de recuperación de contraseña seguro

#### **5. Estados de Cuenta**
- ✅ **Activa**: Acceso completo según rol
- ✅ **Pendiente**: Cuenta creada pero no activada
- ✅ **Bloqueada**: Bloqueada por intentos fallidos
- ✅ **Desactivada**: Deshabilitada por administrador
- ✅ Registro completo en bitácora de cambios de estado

#### **6. Seguridad y Trazabilidad**
- ✅ Políticas de contraseña configurables
- ✅ Hash seguro con bcrypt (12 rondas)
- ✅ Auditoría completa de operaciones críticas
- ✅ Registro de IP, User-Agent y marcas de tiempo
- ✅ Trazabilidad de quién, qué y cuándo
- ✅ Principio de mínimos privilegios
- ✅ **NUEVO:** Protección con Rate Limiting para prevenir ataques de fuerza bruta
- ✅ **NUEVO:** Cabeceras de seguridad con Helmet
- ✅ **NUEVO:** Graceful shutdown para mantenimiento seguro

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### 1. Clonar e instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar base de datos
```bash
# Crear la base de datos PostgreSQL
createdb jackdaws_db
```

### 4. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints de la API

### Autenticación
```http
POST /api/auth/login          # Iniciar sesión
POST /api/auth/logout         # Cerrar sesión
POST /api/auth/invite         # Invitar usuario (Solo Superadmin)
POST /api/auth/activate/:token # Activar cuenta
GET  /api/auth/me             # Perfil del usuario actual
GET  /api/auth/status         # Estado del sistema (público)
```

### Gestión de Contraseñas (NUEVO)
```http
POST /api/password/request-reset      # Solicitar reset de contraseña
GET  /api/password/validate-token/:token  # Validar token de reset
POST /api/password/reset/:token       # Resetear contraseña
```
```http
GET    /api/users             # Listar usuarios (Admin+)
GET    /api/users/:id         # Obtener usuario específico
PATCH  /api/users/:id         # Actualizar usuario 
DELETE /api/users/:id         # Desactivar usuario (Solo Superadmin)
PATCH  /api/users/:id/reactivate # Reactivar usuario (Solo Superadmin)
```

### Auditoría y Sistema
```http
GET /api/users/audit-logs     # Registros de auditoría (Admin+)
GET /api/users/system/stats   # Estadísticas del sistema (Solo Superadmin)
GET /health                   # Verificación de salud
```

## ✅ Estado del Cumplimiento RF_01

**✅ COMPLETAMENTE IMPLEMENTADO**

El backend cumple al 100% con todos los requisitos funcionales especificados en RF_01:

- ✅ Sistema de roles completo (Superadmin, Admin, Operador, Soporte)
- ✅ Modelo de solo-por-invitación funcionando
- ✅ Activación por email con tokens únicos
- ✅ Autenticación segura con RBAC estricto
- ✅ Estados de cuenta completamente manejados  
- ✅ Auditoría completa de operaciones críticas
- ✅ Políticas de seguridad configurables
- ✅ Trazabilidad completa (quién, qué, cuándo)

---

**🎯 Sistema listo para producción con todas las funcionalidades de seguridad requeridas.**