import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { connectDB } from "./config/configDb.js";
import indexRoutes from "./routes/index.routes.js";
import passport from "passport";
import "./config/passport.config.js";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { initializeSystem } from "./helpers/init.helper.js";
import { generalLimiter } from "./middlewares/rate-limiter.middleware.js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Implementar cabeceras de seguridad con Helmet
app.use(helmet());

// Middlewares de seguridad y CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Configurar para producción
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Trust proxy para obtener IP real detrás de proxies
app.set('trust proxy', 1);

// Aplicar rate limiter general a todas las rutas
app.use(generalLimiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// Servir archivos estáticos
app.use("/SubirImagenes", express.static("public/SubirImagenes"));

// Conectar a la base de datos e inicializar sistema
try {
  await connectDB();
  console.log('✅ Base de datos conectada exitosamente');
  
  // Inicializar sistema (crear superadmin por defecto si no existe)
  try {
    await initializeSystem();
  } catch (initError) {
    console.error('❌ Error inicializando el sistema:', initError.message);
    console.log('⚠️  El servidor continuará funcionando, pero revisa la configuración inicial');
  }
} catch (dbError) {
  console.error('❌ Error conectando a la base de datos:', dbError.message);
  process.exit(1);
}

// Ruta base de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "API Backend de JackdawSoft",
    version: "1.0.0",
    estado: "funcionando",
    marcaTiempo: new Date().toISOString()
  });
});

// Ruta de verificación de salud del sistema
app.get("/health", (req, res) => {
  res.json({ 
    estado: "saludable",
    baseDatos: "conectada",
    marcaTiempo: new Date().toISOString(),
    tiempoActividad: process.uptime()
  });
});

// Rutas principales de la API
app.use("/api", indexRoutes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo global de errores
app.use(errorHandler);

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor Jackdaws escuchando en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔍 Verificación de salud en http://localhost:${PORT}/health`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

export default app;