import { EntitySchema } from "typeorm";

export const Roles = {
  SUPERADMIN: "superadministrador",
  ADMIN: "administrador", 
  OPERATOR: "operador",
  SUPPORT: "soporte",
};

export const AccountStatus = {
  PENDING: "pendiente",
  ACTIVE: "activo",
  BLOCKED: "bloqueado",
  DEACTIVATED: "desactivado",
};

export const User = new EntitySchema({
  name: "User",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    role: {
      type: "varchar",
      default: Roles.OPERATOR,
    },
    status: {
      type: "varchar",
      default: AccountStatus.PENDING,
    },
    activationToken: {
      type: "varchar",
      nullable: true,
    },
    activationExpires: {
      type: "timestamptz",
      nullable: true,
    },
    resetPasswordToken: {
      type: "varchar",
      nullable: true,
    },
    resetPasswordExpires: {
      type: "timestamptz",
      nullable: true,
    },
    lastLogin: {
      type: "timestamptz",
      nullable: true,
    },
    loginAttempts: {
      type: "int",
      default: 0,
    },
    blockedUntil: {
      type: "timestamptz",
      nullable: true,
    },
    passwordResetToken: {
      type: "varchar",
      nullable: true,
    },
    passwordResetExpires: {
      type: "timestamptz",
      nullable: true,
    },
    invitedBy: {
      type: "uuid",
      nullable: true,
      comment: "ID del usuario que envió la invitación",
    },
    createdAt: {
      type: "timestamptz",
      createDate: true,
    },
    updatedAt: {
      type: "timestamptz",
      updateDate: true,
    },
  },
});