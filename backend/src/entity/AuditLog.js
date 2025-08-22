import { EntitySchema } from "typeorm";

export const AuditActions = {
  USER_CREATED: "usuario_creado",
  USER_INVITED: "usuario_invitado",
  USER_ACTIVATED: "usuario_activado",
  USER_DEACTIVATED: "usuario_desactivado",
  USER_BLOCKED: "usuario_bloqueado",
  USER_UPDATED: "usuario_actualizado",
  ROLE_CHANGED: "rol_cambiado",
  PASSWORD_CHANGED: "contraseña_cambiada",
  PASSWORD_RESET_REQUESTED: "solicitud_reset_contraseña",
  LOGIN_SUCCESSFUL: "inicio_sesion_exitoso",
  LOGIN_FAILED: "inicio_sesion_fallido",
};

export const AuditLog = new EntitySchema({
  name: "AuditLog",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    actorId: {
      type: "uuid",
      nullable: true,
      comment: "ID del usuario que ejecutó la acción",
    },
    actorEmail: {
      type: "varchar",
      nullable: true,
      comment: "Email del usuario que ejecutó la acción",
    },
    action: {
      type: "varchar",
      comment: "Acción realizada",
    },
    targetId: {
      type: "uuid",
      nullable: true,
      comment: "ID del recurso afectado",
    },
    targetEmail: {
      type: "varchar",
      nullable: true,
      comment: "Email del usuario afectado (si aplica)",
    },
    details: {
      type: "jsonb",
      nullable: true,
      comment: "Detalles adicionales de la operación",
    },
    ipAddress: {
      type: "varchar",
      nullable: true,
      comment: "Dirección IP del actor",
    },
    userAgent: {
      type: "text",
      nullable: true,
      comment: "User agent del navegador",
    },
    createdAt: {
      type: "timestamptz",
      createDate: true,
    },
  },
});