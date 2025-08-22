#!/bin/bash

# Script de despliegue para Jackdaws Backend
# Autor: GitHub Copilot
# Fecha: 22 Agosto 2025

set -e

echo "🚀 Iniciando despliegue de Jackdaws Backend..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto"
  exit 1
fi

# Verificar que tenemos Node.js y npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
  echo "❌ Error: Node.js y npm son requeridos para el despliegue"
  exit 1
fi

# Verificar la versión de Node.js (necesitamos 16+)
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo "❌ Error: Se requiere Node.js v16 o superior (tienes v$NODE_VERSION)"
  exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
  echo "⚠️  No se encontró archivo .env, creando uno basado en .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor, edítalo con tus configuraciones"
    echo "⚠️  Presiona Enter para continuar después de editar .env, o Ctrl+C para cancelar"
    read
  else
    echo "❌ Error: No se encontró .env.example para crear .env"
    exit 1
  fi
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Prueba de conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
node -e "
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || process.env.HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PASSWORD || 'password',
  database: process.env.DB_NAME || process.env.DATABASE || 'jackdaws_db'
};

const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.error('Verifica tus credenciales de base de datos en el archivo .env');
    process.exit(1);
  } else {
    console.log('✅ Conexión a base de datos exitosa!');
    pool.end();
  }
});" || { echo "❌ Error conectando a la base de datos"; exit 1; }

# Construir la aplicación (si es necesario)
if [ -f "tsconfig.json" ]; then
  echo "🔨 Compilando TypeScript..."
  npm run build
fi

# Iniciar PM2 (si está instalado)
if command -v pm2 &> /dev/null; then
  echo "🚀 Iniciando aplicación con PM2..."
  pm2 startOrRestart ecosystem.config.js
else
  echo "⚠️  PM2 no está instalado. Puedes instalar PM2 globalmente con: npm install -g pm2"
  echo "🚀 Iniciando aplicación con Node.js..."
  npm start
fi

echo "✅ Despliegue completado correctamente!"
echo "🌐 La API debería estar disponible en: http://localhost:${PORT:-3000}/api"
echo "📝 Para verificar el estado: http://localhost:${PORT:-3000}/health"
