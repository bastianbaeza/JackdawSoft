import { AppDataSource } from "../config/configDb.js";
import { AuditLog, AuditActions } from "../entity/AuditLog.js";

const repo = () => AppDataSource.getRepository(AuditLog);

export const logAction = async (
  actorId, 
  action, 
  targetId, 
  details = null, 
  req = null, 
  targetEmail = null,
  actorEmail = null
) => {
  try {
    const logData = {
      actorId,
      action,
      targetId,
      details: details ? JSON.stringify(details) : null,
      targetEmail,
      actorEmail
    };

    // Capturar información de la request si está disponible
    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      logData.userAgent = req.get('User-Agent');
    }

    const log = repo().create(logData);
    await repo().save(log);
    
    console.log(`[AUDIT] ${action} - Actor: ${actorEmail || actorId} - Target: ${targetEmail || targetId}`);
  } catch (error) {
    console.error('Error logging audit action:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  const queryBuilder = repo().createQueryBuilder('audit');
  
  if (filters.actorId) {
    queryBuilder.andWhere('audit.actorId = :actorId', { actorId: filters.actorId });
  }
  
  if (filters.targetId) {
    queryBuilder.andWhere('audit.targetId = :targetId', { targetId: filters.targetId });
  }
  
  if (filters.action) {
    queryBuilder.andWhere('audit.action = :action', { action: filters.action });
  }
  
  if (filters.dateFrom) {
    queryBuilder.andWhere('audit.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
  }
  
  if (filters.dateTo) {
    queryBuilder.andWhere('audit.createdAt <= :dateTo', { dateTo: filters.dateTo });
  }
  
  const offset = (page - 1) * limit;
  queryBuilder.skip(offset).take(limit);
  queryBuilder.orderBy('audit.createdAt', 'DESC');
  
  const [logs, total] = await queryBuilder.getManyAndCount();
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};