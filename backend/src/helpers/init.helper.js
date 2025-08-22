import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import { User, Roles, AccountStatus } from "../entity/User.js";
import { logAction } from "../services/audit.service.js";
import { AuditActions } from "../entity/AuditLog.js";

const userRepo = () => AppDataSource.getRepository(User);

export const createDefaultSuperAdmin = async () => {
  try {
    // Verificar si ya existe un usuario con el email por defecto
    const defaultEmail = process.env.DEFAULT_SUPERADMIN_EMAIL || 'superadmin@jackdaws.local';
    const existingUser = await userRepo().findOne({ 
      where: { email: defaultEmail } 
    });
    
    if (existingUser) {
      console.log(`✓ Ya existe un usuario con email ${defaultEmail} en el sistema`);
      // Verificar si tiene el rol de superadmin
      if (existingUser.role === Roles.SUPERADMIN) {
        console.log('✓ El usuario ya tiene rol de Superadministrador');
      } else {
        console.log(`⚠️ El usuario tiene rol '${existingUser.role}' pero no es Superadministrador`);
      }
      return;
    }
    
    // Datos del superadmin por defecto
    const defaultSuperAdmin = {
      email: defaultEmail,
      password: process.env.DEFAULT_SUPERADMIN_PASSWORD || 'SuperAdmin123!',
    };
    
    // Crear el superadmin
    const hashedPassword = await bcrypt.hash(defaultSuperAdmin.password, 12);
    
    const superAdmin = userRepo().create({
      email: defaultSuperAdmin.email,
      password: hashedPassword,
      role: Roles.SUPERADMIN,
      status: AccountStatus.ACTIVE,
      activationToken: null,
      activationExpires: null,
      invitedBy: null,
    });
    
    await userRepo().save(superAdmin);
    
    // Log de creación
    await logAction(
      superAdmin.id,
      AuditActions.USER_CREATED,
      superAdmin.id,
      { 
        email: superAdmin.email,
        role: Roles.SUPERADMIN,
        reason: 'Inicialización del sistema'
      },
      null,
      superAdmin.email,
      'SYSTEM'
    );
    
    console.log('✓ Superadministrador creado exitosamente');
    console.log('  Email:', defaultSuperAdmin.email);
    console.log('  Password:', defaultSuperAdmin.password);
    console.log('  ⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
  } catch (error) {
    console.error('❌ Error creando el Superadministrador:', error);
    throw error;
  }
};

export const initializeSystem = async () => {
  try {
    console.log('🚀 Inicializando sistema Jackdaws...');
    
    // Verificar conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      console.log('⚠️  La base de datos no está inicializada');
      return;
    }
    
    await createDefaultSuperAdmin();
    
    console.log('✅ Sistema inicializado correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando el sistema:', error);
    throw error;
  }
};
