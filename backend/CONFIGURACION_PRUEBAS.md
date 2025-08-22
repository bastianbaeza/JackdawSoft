# ⚙️ Configuración de Pruebas - Backend Jackdaws

## 🎯 Objetivo
Este documento describe la configuración paso a paso para ejecutar las pruebas completas del sistema de autenticación y gestión de usuarios.

**Última actualización:** 22 de agosto de 2025 - 08:48 AM (Chile)

## 📋 Prerrequisitos

### Software Requerido
- Node.js 18+ o 22+
- PostgreSQL 13+
- Thunder Client (extensión de VS Code)
- Git

### Servicios Externos
- Cuenta de Gmail con contraseña de aplicación (para envío de emails)
- Puerto 3000 disponible para el servidor
- Puerto 5432 disponible para PostgreSQL

## 🔧 Configuración del Entorno

### 1. Clonar y Configurar Repositorio
```bash
cd C:\Users\corex\Desktop\Software\Jackdaws\backend
npm install
```

### 2. Configurar Base de Datos
```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE jackdaws_db;
CREATE USER jackdaws_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE jackdaws_db TO jackdaws_user;
```

### 3. Crear Archivo de Variables de Entorno
```bash
# Crear archivo .env en el directorio raíz
cat > .env << 'EOL'
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=jackdaws_user
DB_PASSWORD=tu_password_seguro
DB_NAME=jackdaws_db

# Configuración JWT
JWT_SECRET=clave_jwt_super_secreta_minimo_32_caracteres_2025

# Configuración SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion

# URLs y Entorno
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
EOL
```

### 4. Configurar Gmail para Envío de Emails

#### Pasos para Obtener Contraseña de Aplicación:
1. Ir a [myaccount.google.com](https://myaccount.google.com)
2. Navegar a **Seguridad** > **Verificación en 2 pasos**
3. Activar verificación en 2 pasos si no está activa
4. Ir a **Contraseñas de aplicaciones**
5. Generar nueva contraseña para "Thunder Client Tests"
6. Usar la contraseña generada en `SMTP_PASS`

## 🚀 Inicialización del Sistema

### 1. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor ejecutándose en puerto 3000
✅ Conexión a base de datos establecida
📊 Tablas de base de datos sincronizadas
```

### 2. Verificar Conectividad
```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "estado": "saludable",
  "marcaTiempo": "2025-08-22T...",
  "baseDatos": "conectada",
  "version": "1.0.0"
}
```

## ⚡ Configuración de Thunder Client

### 1. Instalar Extensión
```
1. Abrir VS Code
2. Ir a Extensions (Ctrl+Shift+X)
3. Buscar "Thunder Client"
4. Instalar por Rangav
```

### 2. Importar Colección de Pruebas
```
1. Abrir Thunder Client en VS Code
2. Click en "Collections"
3. Click en "Import"
4. Seleccionar "thunderclient_collection.json"
5. Confirmar importación
```

### 3. Configurar Variables de Entorno
```
Thunder Client > Environment > New Environment > "Jackdaws Backend"

Variables:
{
  "baseUrl": "http://localhost:3000/api",
  "superAdminToken": "",
  "userToken": "",
  "testEmail": "admin@jackdaws.test",
  "testPassword": "Password123!",
  "adminEmail": "user@jackdaws.test"
}
```

### 4. Configurar Orden de Ejecución
Thunder Client ejecutará automáticamente en orden de `sortNum`:
1. Sistema (5000-9999)
2. Autenticación (10000-19999)
3. Gestión de Usuarios (20000-29999)
4. Auditoría (30000-39999)

## 🔍 Validación de Configuración

### Checklist Pre-Pruebas ✅
- [ ] PostgreSQL ejecutándose en puerto 5432
- [ ] Base de datos `jackdaws_db` creada
- [ ] Archivo `.env` configurado correctamente
- [ ] Servidor backend corriendo en puerto 3000
- [ ] Thunder Client instalado y configurado
- [ ] Colección importada exitosamente
- [ ] Variables de entorno configuradas

### Script de Verificación Rápida
```bash
# Crear archivo check_setup.sh
#!/bin/bash

echo "🔍 Verificando configuración..."

# Verificar Node.js
node --version && echo "✅ Node.js OK" || echo "❌ Node.js no encontrado"

# Verificar PostgreSQL
pg_isready -h localhost -p 5432 && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL no disponible"

# Verificar archivo .env
[ -f .env ] && echo "✅ Archivo .env existe" || echo "❌ Archivo .env faltante"

# Verificar servidor backend
curl -s http://localhost:3000/api/health > /dev/null && echo "✅ Servidor OK" || echo "❌ Servidor no responde"

echo "🎯 Configuración completada. Listo para pruebas."
```

## 🛠️ Solución de Problemas Comunes

### Error: Cannot connect to database
```bash
# Verificar estado de PostgreSQL
systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
# Windows: Verificar en Services.msc

# Verificar credenciales
psql -h localhost -U jackdaws_user -d jackdaws_db
```

### Error: SMTP Authentication failed
```bash
# Verificar configuración Gmail
# 1. Verificación 2 pasos activada
# 2. Contraseña de aplicación generada
# 3. Variables SMTP correctas en .env
```

### Error: Port 3000 is already in use
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Terminar proceso
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Error: Thunder Client no encuentra colección
```
1. Verificar que el archivo .json esté en el directorio correcto
2. Restart VS Code
3. Reimportar colección manualmente
4. Verificar formato JSON válido
```

## 📊 Métricas de Rendimiento Esperadas

### Tiempos de Respuesta Objetivo
- Verificación de Salud: < 50ms
- Autenticación: < 200ms
- Operaciones CRUD: < 300ms
- Consultas de Auditoría: < 500ms

### Uso de Recursos
- RAM: ~100MB para Node.js
- CPU: < 5% en reposo
- Conexiones DB: 2-5 concurrentes
- Espacio en Disco: ~50MB logs

---

**¡Configuración completada!** 🎉 Ahora puedes ejecutar las pruebas siguiendo la [Guía de Pruebas](GUIA_PRUEBAS.md).
