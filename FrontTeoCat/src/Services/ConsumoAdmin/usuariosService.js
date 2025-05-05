import api from "../../Services/ConsumoAdmin/axios.js"

const usuariosService = {
  /**
   * Obtiene todos los usuarios
   * @returns {Promise} Promesa con la respuesta
   */
  getAll: async () => {
    try {
      const response = await api.get("/auth/usuarios")

      // Verificar la estructura de la respuesta
      console.log("Respuesta original de la API:", response.data)

      // Asegurarse de que cada usuario tenga la estructura correcta
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

      console.log("Usuarios procesados:", processedUsers)
      return processedUsers
    } catch (error) {
      console.error("Error al obtener usuarios:", error)
      throw error
    }
  },

  /**
   * Obtiene un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise} Promesa con la respuesta
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/auth/usuarios/${id}`)

      // Asegurar que el documento esté presente
      const user = response.data
      if (user) {
        user.Documento = user.Documento || ""
        user.Rol = user.Rol || {
          IdRol: user.IdRol || 0,
          NombreRol: user.NombreRol || "Sin rol",
        }
      }

      return user
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise} Promesa con la respuesta
   */
  create: async (userData) => {
    try {
      // Asegurarse de que los datos estén en el formato esperado por la API
      const formattedData = {
        Nombre: userData.Nombre,
        Apellido: userData.Apellido,
        Correo: userData.Correo,
        Documento: userData.Documento,
        Telefono: userData.Telefono,
        Direccion: userData.Direccion,
        Foto: userData.Foto,
        IdRol: userData.IdRol,
        Password: userData.Password,
      }

      console.log("Datos enviados para crear usuario:", formattedData)
      const response = await api.post("/auth/usuarios", formattedData)
      return response.data
    } catch (error) {
      console.error("Error al crear usuario:", error)
      throw error
    }
  },

  /**
   * Actualiza un usuario existente
   * @param {number} id - ID del usuario a actualizar
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} Promesa con la respuesta
   */
  update: async (id, userData) => {
    try {
      // Asegurarse de que los datos estén en el formato esperado por la API
      const formattedData = {
        Nombre: userData.Nombre,
        Apellido: userData.Apellido,
        Correo: userData.Correo,
        Documento: userData.Documento,
        Telefono: userData.Telefono,
        Direccion: userData.Direccion,
        Foto: userData.Foto,
        IdRol: userData.IdRol,
      }

      // Si hay contraseña, incluirla
      if (userData.Password) {
        formattedData.Password = userData.Password
      }

      console.log("Datos enviados para actualizar usuario:", formattedData)
      const response = await api.put(`/auth/usuarios/${id}`, formattedData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un usuario
   * @param {number} id - ID del usuario a eliminar
   * @returns {Promise} Promesa con la respuesta
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/auth/usuarios/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error)
      throw error
    }
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
      const response = await api.patch(`/auth/usuarios/${id}/status`, { Estado: estado })
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del usuario con ID ${id}:`, error)
      throw error
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
}

export default usuariosService
