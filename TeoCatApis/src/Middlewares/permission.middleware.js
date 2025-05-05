import { rolesModel } from "../Models/AuthService/auth.model.js"
import permissionCache from "../Utils/PermissionCache.js"

// Middleware para verificar permisos
export const validatePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({ message: "No autorizado" })
      }

      // Verificar si es Super Administrador (rol ID 1)
      if (req.user.role === 1) {
        // El Super Administrador tiene todos los permisos
        return next();
      }

      // Obtener permisos del usuario
      let permisos = permissionCache.getPermissions(req.user.id);
      
      // Si no están en caché, obtenerlos de la base de datos
      if (!permisos) {
        permisos = await rolesModel.getPermisos(req.user.role);
        
        // Guardar en caché para futuras solicitudes
        permissionCache.setPermissions(req.user.id, permisos);
      }
      
      console.log(`Middleware: Usuario ID ${req.user.id}, Rol ID ${req.user.role}, Permisos encontrados: ${permisos.length}`);
      
      // Verificar si el usuario tiene el permiso requerido
      const hasPermission = permisos.some((p) => p.NombrePermiso === permissionName);

      if (!hasPermission) {
        console.log(`Acceso denegado para usuario ID ${req.user.id}, rol ${req.user.role}. Permiso requerido: ${permissionName}`);
        return res.status(403).json({
          message: "Acceso denegado. No tienes permiso para realizar esta acción",
          requiredPermission: permissionName,
        });
      }

      next();
    } catch (error) {
      console.error("Error en el middleware de permisos:", error);
      res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
  };
};

export default validatePermission;