import api from "../../Services/ConsumoAdmin/axios.js"
import { sincronizarUsuarioACliente } from "../ConsumoAdmin/sincronizador.js"

const usuariosService = {
  getAll: async () => {
    const response = await api.get("/auth/usuarios")
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/auth/usuarios/${id}`)
    return response.data
  },

  create: async (userData) => {
    const response = await api.post("/auth/usuarios", userData)
    // Si es cliente, sincroniza
    if ((userData.IdRol === 2 || userData.IdRol === "2") && response.data?.IdUsuario) {
      try {
        await sincronizarUsuarioACliente(response.data, "crear")
      } catch (syncError) {
        console.error("Error en la sincronización al crear usuario:", syncError)
      }
    }
    return response.data
  },

  update: async (id, userData) => {
    const response = await api.put(`/auth/usuarios/${id}`, userData)
    // Si es cliente, sincroniza
    if ((userData.IdRol === 2 || userData.IdRol === "2")) {
      try {
        await sincronizarUsuarioACliente({ ...userData, IdUsuario: id }, "actualizar")
      } catch (syncError) {
        console.error("Error en la sincronización al actualizar usuario:", syncError)
      }
    }
    return response.data
  },

  delete: async (id) => {
    // Obtener el usuario para saber si es cliente
    const usuario = await usuariosService.getById(id)
    if (usuario && (usuario.Rol?.IdRol === 2 || usuario.IdRol === 2 || usuario.IdRol === "2")) {
      try {
        await sincronizarUsuarioACliente(usuario, "eliminar")
      } catch (syncError) {
        console.error("Error en la sincronización al eliminar usuario:", syncError)
      }
    }
    // // Elimina el usuario
    // const response = await api.delete(`/auth/usuarios/${id}`)
    // return response.data
  },

  /**
   * Cambia la contraseña de un usuario
   * @param {number} id - ID del usuario
   * @param {Object} passwordData - Datos de contraseña (actual y nueva)
   * @returns {Promise} Promesa con la respuesta
   */
  changePassword: async (id, passwordData) => {
    try {
      const response = await api.patch(`/auth/usuarios/${id}/password`, passwordData)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar contraseña del usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un usuario (activo/inactivo)
   * @param {number} id - ID del usuario
   * @param {boolean} estado - Nuevo estado (true para activo, false para inactivo)
   * @returns {Promise} Promesa con la respuesta
   */
  changeStatus: async (id, estado) => {
    try {
      console.log(`Cambiando estado del usuario ${id} a ${estado ? "Activo" : "Inactivo"}`)

      // Asegurarse de que el estado tenga el formato correcto para el backend
      const estadoData = { Estado: estado }

      const response = await api.patch(`/auth/usuarios/${id}/status`, estadoData)

      // Sincronizar con cliente si es necesario
      try {
        // Obtener el usuario para verificar si es un cliente
        const usuario = await usuariosService.getById(id)

        if (usuario) {
          // Añadir el estado al objeto usuario para la sincronización
          usuario.Estado = estado
          await sincronizarUsuarioACliente(usuario, "cambiarEstado")
        }
      } catch (syncError) {
        console.error("Error en la sincronización al cambiar estado del usuario:", syncError)
      }

      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Verifica si un documento ya está registrado
   * @param {string} documento - Documento a verificar
   * @param {number} excludeUserId - ID de usuario a excluir de la verificación (opcional)
   * @returns {Promise<boolean>} - True si el documento existe, false en caso contrario
   */
  checkDocumentoExists: async (documento, excludeUserId = null) => {
    try {
      console.log(`Verificando si el documento ${documento} existe (excluyendo usuario ID: ${excludeUserId})`)

      // Verificar localmente si el documento existe en los usuarios ya cargados
      // Esta es una solución temporal hasta que se implemente el endpoint en el backend
      const allUsers = await usuariosService.getAll()

      const exists = allUsers.some(
        (user) => user.Documento === documento && (!excludeUserId || user.IdUsuario !== excludeUserId),
      )

      console.log(`Resultado de verificación de documento ${documento}: ${exists ? "Existe" : "No existe"}`)
      return exists
    } catch (error) {
      console.error(`Error al verificar documento ${documento}:`, error)
      // En caso de error, asumimos que no existe para evitar bloquear al usuario
      return false
    }
  },

  /**
   * Busca usuarios por término
   * @param {string} term - Término de búsqueda
   * @returns {Promise} Promesa con la respuesta
   */
  search: async (term) => {
    try {
      const response = await api.get(`/auth/usuarios/search?term=${term}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar usuarios con término "${term}":`, error)
      throw error
    }
  },

  /**
   * Obtiene usuarios por rol
   * @param {number} idRol - ID del rol
   * @returns {Promise} Promesa con la respuesta
   */
  getByRol: async (idRol) => {
    try {
      const response = await api.get(`/auth/roles/${idRol}/usuarios`)

      // Asegurar que cada usuario tenga la estructura correcta
      const processedUsers = response.data.map((user) => {
        // Crear un objeto de usuario con la estructura correcta
        return {
          IdUsuario: user.IdUsuario,
          Nombre: user.Nombre || "",
          Apellido: user.Apellido || "",
          Correo: user.Correo || "",
          Telefono: user.Telefono || "",
          Direccion: user.Direccion || "",
          FechaCreacion: user.FechaCreacion,
          Estado: user.Estado,
          Foto: user.Foto || null,
          // Asegurar que el documento esté presente
          Documento: user.Documento || "",
          // Asegurar que el rol esté correctamente formateado
          Rol: {
            IdRol: user.Rol?.IdRol || user.IdRol || 0,
            NombreRol: user.Rol?.NombreRol || user.NombreRol || "Sin rol",
          },
        }
      })

      console.log("Usuarios por rol procesados:", processedUsers)
      return processedUsers
    } catch (error) {
      console.error(`Error al obtener usuarios con rol ${idRol}:`, error)
      return []
    }
  },
}

export default usuariosService
