import { AppDataSource } from "../config/configDb.js";
import { User, Roles, AccountStatus } from "../entity/User.js";
import bcrypt from "bcryptjs";

const userRepo = () => AppDataSource.getRepository(User);

// Función para verificar el estado de los usuarios
export const checkSystemUsers = async () => {
  try {
    console.log('🔍 Verificando usuarios del sistema...\n');
    
    const allUsers = await userRepo().find();
    
    if (allUsers.length === 0) {
      console.log('ℹ️  No hay usuarios en el sistema');
      return;
    }
    
    console.log(`📊 Total de usuarios: ${allUsers.length}\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Estado: ${user.status}`);
      console.log(`   Creado: ${user.createdAt}`);
      console.log(`   Último login: ${user.lastLogin || 'Nunca'}`);
      console.log('   ---');
    });
    
    // Contar por roles
    const roleStats = {
      superadministrador: 0,
      administrador: 0,
      operador: 0,
      soporte: 0
    };
    
    const statusStats = {
      activo: 0,
      pendiente: 0,
      bloqueado: 0,
      desactivado: 0
    };
    
    allUsers.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
      statusStats[user.status] = (statusStats[user.status] || 0) + 1;
    });
    
    console.log('\n📈 Estadísticas por rol:');
    Object.entries(roleStats).forEach(([role, count]) => {
      if (count > 0) console.log(`   ${role}: ${count}`);
    });
    
    console.log('\n📈 Estadísticas por estado:');
    Object.entries(statusStats).forEach(([status, count]) => {
      if (count > 0) console.log(`   ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  }
};

// Función para resetear o crear el superadmin
export const resetSuperAdmin = async (email = 'superadmin@jackdaws.local', password = 'SuperAdmin123!') => {
  try {
    console.log(`🔄 Reseteando superadministrador con email: ${email}`);
    
    // Buscar usuario existente
    const existingUser = await userRepo().findOne({ where: { email } });
    
    if (existingUser) {
      console.log('👤 Usuario existente encontrado, actualizando...');
      
      // Actualizar usuario existente
      existingUser.role = Roles.SUPERADMIN;
      existingUser.status = AccountStatus.ACTIVE;
      existingUser.password = await bcrypt.hash(password, 12);
      existingUser.activationToken = null;
      existingUser.activationExpires = null;
      existingUser.loginAttempts = 0;
      existingUser.blockedUntil = null;
      
      await userRepo().save(existingUser);
      console.log('✅ Usuario actualizado como Superadministrador');
    } else {
      console.log('➕ Creando nuevo superadministrador...');
      
      // Crear nuevo usuario
      const superAdmin = userRepo().create({
        email,
        password: await bcrypt.hash(password, 12),
        role: Roles.SUPERADMIN,
        status: AccountStatus.ACTIVE,
        activationToken: null,
        activationExpires: null,
        invitedBy: null,
      });
      
      await userRepo().save(superAdmin);
      console.log('✅ Nuevo Superadministrador creado');
    }
    
    console.log('\n📧 Credenciales del Superadministrador:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');
    
  } catch (error) {
    console.error('❌ Error reseteando superadministrador:', error);
    throw error;
  }
};

// Función para eliminar todos los usuarios (CUIDADO!)
export const clearAllUsers = async () => {
  try {
    console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODOS los usuarios del sistema');
    console.log('🗑️  Eliminando todos los usuarios...');
    
    const result = await userRepo().delete({});
    console.log(`✅ ${result.affected} usuarios eliminados`);
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios:', error);
    throw error;
  }
};

// Script principal cuando se ejecuta directamente
if (process.argv[1].endsWith('db-utils.js')) {
  const command = process.argv[2];
  
  // Inicializar conexión a base de datos
  import('../config/configDb.js').then(async (module) => {
    const { connectDB } = module;
    
    try {
      await connectDB();
      
      switch (command) {
        case 'check':
          await checkSystemUsers();
          break;
        case 'reset-superadmin':
          const email = process.argv[3] || 'superadmin@jackdaws.local';
          const password = process.argv[4] || 'SuperAdmin123!';
          await resetSuperAdmin(email, password);
          break;
        case 'clear-all':
          await clearAllUsers();
          break;
        default:
          console.log('Comandos disponibles:');
          console.log('  node src/helpers/db-utils.js check');
          console.log('  node src/helpers/db-utils.js reset-superadmin [email] [password]');
          console.log('  node src/helpers/db-utils.js clear-all');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });
}
