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

      // Si el rol es cliente (IdRol = 2), crear manualmente el cliente
      // No confiamos en los triggers de la BD ya que parecen no estar funcionando correctamente
      if (userData.IdRol === 2 || userData.IdRol === "2") {
        try {
          console.log("Usuario con rol cliente creado, creando cliente manualmente...")

          // Esperar un momento para asegurar que el usuario se haya creado completamente
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Verificar si ya existe un cliente con el mismo correo o documento
          const clienteCheckResponse = await api.get(`/customers/clientes?term=${encodeURIComponent(userData.Correo)}`)
          const clienteExistente =
            clienteCheckResponse.data && clienteCheckResponse.data.length > 0
              ? clienteCheckResponse.data.find(
                  (c) => c.Correo === userData.Correo || c.Documento === userData.Documento,
                )
              : null

          if (clienteExistente) {
            console.log("Cliente existente encontrado, actualizando con datos del usuario:", clienteExistente)

            // Actualizar el cliente existente con los datos del usuario y asociarlo
            const clienteUpdateData = {
              Documento: userData.Documento,
              Nombre: userData.Nombre,
              Apellido: userData.Apellido,
              Correo: userData.Correo,
              Telefono: userData.Telefono || "",
              Direccion: userData.Direccion || "",
              Estado: 1, // Activo
              IdUsuario: response.data.id || response.data.IdUsuario,
            }

            await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteUpdateData)
            console.log("Cliente existente actualizado y asociado al nuevo usuario")
          } else {
            // Crear un nuevo cliente
            const clienteData = {
              Documento: userData.Documento,
              Nombre: userData.Nombre,
              Apellido: userData.Apellido,
              Correo: userData.Correo,
              Telefono: userData.Telefono || "",
              Direccion: userData.Direccion || "",
              Estado: 1, // Activo
              IdUsuario: response.data.id || response.data.IdUsuario,
            }

            const clienteResponse = await api.post("/customers/clientes", clienteData)
            console.log("Cliente creado manualmente:", clienteResponse.data)
          }
        } catch (clienteError) {
          console.error("Error al crear cliente asociado:", clienteError)
          // Continuar con la creación del usuario aunque falle la creación del cliente
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
      }

      // Si hay contraseña, incluirla
      if (userData.Password) {
        formattedData.Password = userData.Password
      }

      console.log("Datos formateados para actualizar usuario:", formattedData)
      const response = await api.put(`/auth/usuarios/${id}`, formattedData)
      console.log("Respuesta del servidor al actualizar usuario:", response.data)

      // Si el rol es cliente (IdRol = 2), actualizar o crear manualmente el cliente
      if (userData.IdRol === 2 || userData.IdRol === "2") {
        try {
          console.log("Usuario con rol cliente actualizado, actualizando cliente manualmente...")

          // Verificar si ya existe un cliente con el mismo correo o documento
          const clienteCheckResponse = await api.get(`/customers/clientes?term=${encodeURIComponent(userData.Correo)}`)
          const clienteExistente =
            clienteCheckResponse.data && clienteCheckResponse.data.length > 0
              ? clienteCheckResponse.data.find(
                  (c) => c.Correo === userData.Correo || c.Documento === userData.Documento,
                )
              : null

          if (clienteExistente) {
            console.log("Cliente existente encontrado, actualizando con datos del usuario:", clienteExistente)

            // Actualizar el cliente existente con los datos del usuario
            const clienteUpdateData = {
              Documento: userData.Documento,
              Nombre: userData.Nombre,
              Apellido: userData.Apellido,
              Correo: userData.Correo,
              Telefono: userData.Telefono || "",
              Direccion: userData.Direccion || "",
              Estado: userData.Estado === true || userData.Estado === 1 || userData.Estado === "Activo" ? 1 : 0,
              IdUsuario: id,
            }

            await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteUpdateData)
            console.log("Cliente existente actualizado")
          } else {
            // Crear un nuevo cliente
            const clienteData = {
              Documento: userData.Documento,
              Nombre: userData.Nombre,
              Apellido: userData.Apellido,
              Correo: userData.Correo,
              Telefono: userData.Telefono || "",
              Direccion: userData.Direccion || "",
              Estado: userData.Estado === true || userData.Estado === 1 || userData.Estado === "Activo" ? 1 : 0,
              IdUsuario: id,
            }

            const clienteResponse = await api.post("/customers/clientes", clienteData)
            console.log("Cliente creado manualmente:", clienteResponse.data)
          }
        } catch (clienteError) {
          console.error("Error al actualizar/crear cliente asociado:", clienteError)
          // Continuar con la actualización del usuario aunque falle la actualización del cliente
        }
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

      if (usuario && (usuario.IdRol === 2 || usuario.Rol?.IdRol === 2)) {
        // Buscar el cliente asociado
        try {
          const clienteCheckResponse = await api.get(`/customers/clientes?term=${encodeURIComponent(usuario.Correo)}`)
          const clienteAsociado =
            clienteCheckResponse.data && clienteCheckResponse.data.length > 0
              ? clienteCheckResponse.data.find((c) => c.Correo === usuario.Correo || c.Documento === usuario.Documento)
              : null

          if (clienteAsociado) {
            console.log("Cliente asociado encontrado, eliminando cliente primero:", clienteAsociado)
            await api.delete(`/customers/clientes/${clienteAsociado.IdCliente}`)
            console.log("Cliente asociado eliminado")
          }
        } catch (clienteError) {
          console.error("Error al eliminar cliente asociado:", clienteError)
          // Continuar con la eliminación del usuario aunque falle la eliminación del cliente
        }
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
      const response = await api.patch(`/auth/usuarios/${id}/status`, { Estado: estado })

      // Verificar si el usuario tiene un cliente asociado que necesita actualizar su estado
      try {
        // Obtener el usuario para verificar si es un cliente
        const usuario = await usuariosService.getById(id)

        if (usuario && (usuario.IdRol === 2 || usuario.Rol?.IdRol === 2)) {
          console.log("Usuario es cliente, actualizando estado del cliente...")

          // Buscar el cliente asociado al usuario
          const clienteCheckResponse = await api.get(`/customers/clientes?term=${encodeURIComponent(usuario.Correo)}`)
          const clienteAsociado =
            clienteCheckResponse.data && clienteCheckResponse.data.length > 0
              ? clienteCheckResponse.data.find((c) => c.Correo === usuario.Correo || c.Documento === usuario.Documento)
              : null

          if (clienteAsociado) {
            console.log("Cliente asociado encontrado:", clienteAsociado)

            // Actualizar el estado del cliente
            await api.put(`/customers/clientes/${clienteAsociado.IdCliente}`, {
              ...clienteAsociado,
              Estado: estado ? 1 : 0,
            })

            console.log("Estado del cliente actualizado correctamente")
          } else {
            console.log("No se encontró cliente asociado, creando uno nuevo...")

            // Crear un nuevo cliente
            const clienteData = {
              Documento: usuario.Documento,
              Nombre: usuario.Nombre,
              Apellido: usuario.Apellido,
              Correo: usuario.Correo,
              Telefono: usuario.Telefono || "",
              Direccion: usuario.Direccion || "",
              Estado: estado ? 1 : 0,
              IdUsuario: id,
            }

            const clienteResponse = await api.post("/customers/clientes", clienteData)
            console.log("Cliente creado manualmente:", clienteResponse.data)
          }
        }
      } catch (clienteError) {
        console.error("Error al actualizar estado del cliente asociado:", clienteError)
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
}

export default usuariosService
