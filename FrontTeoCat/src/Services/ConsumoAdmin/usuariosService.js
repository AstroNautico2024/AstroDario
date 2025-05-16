import api from "../../Services/ConsumoAdmin/axios.js"
import { sincronizarUsuarioACliente } from "../ConsumoAdmin/sincronizador.js"

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
      console.log("Datos recibidos para crear usuario:", userData)

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
        Estado: userData.Estado !== undefined ? userData.Estado : true, // Asegurar que el estado esté definido
      }

      // Solo incluir la contraseña si se proporciona
      if (userData.Password) {
        formattedData.Password = userData.Password
      } else if (!userData.IdUsuario) {
        // Si no se proporciona contraseña y es un nuevo usuario, generar una temporal
        formattedData.Password = Math.random().toString(36).slice(-8) + "A1!"
        console.log("Contraseña temporal generada:", formattedData.Password)
      }

      console.log("Datos formateados para crear usuario:", formattedData)
      const response = await api.post("/auth/usuarios", formattedData)
      console.log("Respuesta del servidor al crear usuario:", response.data)

      // Sincronizar con cliente si es necesario
      if (userData.IdRol === 2 || userData.IdRol === "2") {
        try {
          await sincronizarUsuarioACliente(response.data, "crear")
        } catch (syncError) {
          console.error("Error en la sincronización al crear usuario:", syncError)
        }
      }

      return response.data
    } catch (error) {
      console.error("Error al crear usuario:", error)
      console.error("Mensaje de error:", error.message)
      console.error("Respuesta del servidor:", error.response?.data)
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
      console.log("Datos recibidos para actualizar usuario:", userData)

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
        Estado: userData.Estado !== undefined ? userData.Estado : true, // Asegurar que el estado esté definido
      }

      // Si hay contraseña, incluirla
      if (userData.Password) {
        formattedData.Password = userData.Password
      }

      console.log("Datos formateados para actualizar usuario:", formattedData)
      const response = await api.put(`/auth/usuarios/${id}`, formattedData)
      console.log("Respuesta del servidor al actualizar usuario:", response.data)

      // Asegurarse de que el objeto tenga el ID del usuario para la sincronización
      const usuarioCompleto = {
        ...response.data,
        IdUsuario: id,
        // Asegurar que estos campos estén presentes para la sincronización
        Nombre: formattedData.Nombre,
        Apellido: formattedData.Apellido,
        Correo: formattedData.Correo,
        Documento: formattedData.Documento,
        Telefono: formattedData.Telefono,
        Direccion: formattedData.Direccion,
        IdRol: formattedData.IdRol,
        Estado: formattedData.Estado,
      }

      // Sincronizar con cliente
      try {
        console.log("Iniciando sincronización después de actualizar usuario:", usuarioCompleto)
        const resultado = await sincronizarUsuarioACliente(usuarioCompleto, "actualizar")
        console.log("Resultado de sincronización después de actualizar usuario:", resultado)
      } catch (syncError) {
        console.error("Error en la sincronización al actualizar usuario:", syncError)
      }

      return response.data
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
      console.error("Mensaje de error:", error.message)
      console.error("Respuesta del servidor:", error.response?.data)
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
      // Primero verificamos si el usuario tiene rol de cliente
      const usuario = await usuariosService.getById(id)

      // Sincronizar con cliente antes de eliminar el usuario
      try {
        if (usuario) {
          await sincronizarUsuarioACliente(usuario, "eliminar")
        }
      } catch (syncError) {
        console.error("Error en la sincronización al eliminar usuario:", syncError)
      }

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

  /**
   * Sincroniza todos los usuarios con rol de cliente con la tabla de clientes
   * @returns {Promise<{exito: number, error: number}>} - Resultado de la sincronización
   */
  sincronizarTodosUsuariosClientes: async () => {
    try {
      // Importar dinámicamente para evitar problemas de dependencia circular
      const { sincronizarTodosUsuariosClientes } = await import("../ConsumoAdmin/sincronizador.js")
      return await sincronizarTodosUsuariosClientes()
    } catch (error) {
      console.error("Error al sincronizar todos los usuarios con clientes:", error)
      return { exito: 0, error: 0 }
    }
  },
}

export default usuariosService
