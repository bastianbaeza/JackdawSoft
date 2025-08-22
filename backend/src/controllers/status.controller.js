import { AppDataSource } from "../config/configDb.js";

/**
 * Controlador para verificar el estado del sistema
 */
export const checkStatus = async (req, res) => {
  try {
    const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage();
    
    // Formatear uso de memoria a MB
    const formatMemory = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    return res.status(200).json({
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      memory: {
        rss: formatMemory(memoryUsage.rss) + ' MB',
        heapTotal: formatMemory(memoryUsage.heapTotal) + ' MB',
        heapUsed: formatMemory(memoryUsage.heapUsed) + ' MB',
        external: formatMemory(memoryUsage.external) + ' MB'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Error checking system status',
      timestamp: new Date().toISOString()
    });
  }
};
