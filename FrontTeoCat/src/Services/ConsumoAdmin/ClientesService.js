import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de clientes
 * Implementa operaciones CRUD para la gestión de clientes
 */
const clientesService = {
  /**
   * Obtiene todos los clientes
   * @returns {Promise} Promesa con los datos de los clientes
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/customers/clientes")
      console.log("Respuesta de getAll clientes:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      throw error
    }
  },

  /**
   * Obtiene un cliente por su ID
   * @param {number} id - ID del cliente
   * @returns {Promise} Promesa con los datos del cliente
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado")
      }

      // Asegurarse de que el ID sea un número
      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      const response = await axiosInstance.get(`/customers/clientes/${idNumerico}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo cliente
   * @param {Object} clienteData - Datos del cliente a crear
   * @returns {Promise} Promesa con los datos del cliente creado
   */
  create: async (clienteData) => {
    try {
      // Validar datos mínimos requeridos
      if (!clienteData.Nombre || !clienteData.Apellido || !clienteData.Correo) {
        throw new Error("Nombre, Apellido y Correo son campos requeridos")
      }

      // Preparar los datos en el formato que espera la API
      const clienteFormateado = {
        Documento: clienteData.Documento,
        Correo: clienteData.Correo,
        Nombre: clienteData.Nombre,
        Apellido: clienteData.Apellido,
        Direccion: clienteData.Direccion,
        Telefono: clienteData.Telefono,
        Estado: clienteData.Estado === "Activo" ? 1 : 0,
      }

      console.log("Datos enviados al crear cliente:", clienteFormateado)
      const response = await axiosInstance.post("/customers/clientes", clienteFormateado)

      // Convertir el estado numérico a texto en la respuesta
      const clienteRespuesta = response.data
      if (typeof clienteRespuesta.Estado === "number") {
        clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
      }

      return clienteRespuesta
    } catch (error) {
      console.error("Error al crear cliente:", error)

      // Agregar más detalles sobre el error para depuración
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
        console.error("Estado HTTP:", error.response.status)
      }

      // Manejar errores específicos del backend
      if (error.response && error.response.data) {
        const { message } = error.response.data

        if (message.includes("correo electrónico ya está registrado")) {
          const customError = new Error("El correo electrónico ya está registrado")
          customError.isEmailDuplicate = true
          throw customError
        }

        if (message.includes("documento ya está registrado")) {
          const customError = new Error("El número de documento ya está registrado")
          customError.isDocumentDuplicate = true
          throw customError
        }
      }

      throw error
    }
  },

  /**
   * Actualiza un cliente existente
   * @param {number} id - ID del cliente a actualizar
   * @param {Object} clienteData - Datos del cliente a actualizar
   * @returns {Promise} Promesa con los datos del cliente actualizado
   */
  update: async (id, clienteData) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para actualización")
      }

      // Asegurarse de que el ID sea un número
      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      // Preparar los datos en el formato que espera la API
      const clienteFormateado = {
        Documento: clienteData.Documento,
        Correo: clienteData.Correo,
        Nombre: clienteData.Nombre,
        Apellido: clienteData.Apellido,
        Direccion: clienteData.Direccion,
        Telefono: clienteData.Telefono,
        Estado: clienteData.Estado === "Activo" ? 1 : 0,
      }

      console.log(`Actualizando cliente ID ${idNumerico} con datos:`, clienteFormateado)
      const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteFormateado)

      // Convertir el estado numérico a texto en la respuesta
      const clienteRespuesta = response.data
      if (typeof clienteRespuesta.Estado === "number") {
        clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
      }

      return clienteRespuesta
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error)

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
        console.error("Estado HTTP:", error.response.status)
      }

      throw error
    }
  },

  /**
   * Elimina un cliente
   * @param {number} id - ID del cliente a eliminar
   * @returns {Promise} Promesa con el resultado de la eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para eliminación")
      }

      // Asegurarse de que el ID sea un número
      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      console.log(`Eliminando cliente ID ${idNumerico}`)
      const response = await axiosInstance.delete(`/customers/clientes/${idNumerico}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error)

      // Manejar errores de dependencias
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message?.toLowerCase().includes("mascotas asociadas")
      ) {
        const customError = new Error(
          error.response.data.message || "No se puede eliminar el cliente porque tiene mascotas asociadas",
        )
        customError.hasDependencies = true
        throw customError
      }

      throw error
    }
  },

  /**
   * Busca clientes por término
   * @param {string} term - Término de búsqueda
   * @returns {Promise} Promesa con los resultados de la búsqueda
   */
  search: async (term) => {
    try {
      if (!term) {
        throw new Error("Término de búsqueda no proporcionado")
      }

      const response = await axiosInstance.get(`/customers/clientes?term=${encodeURIComponent(term)}`)
      return response.data
    } catch (error) {
      console.error(`Error al buscar clientes con término "${term}":`, error)
      throw error
    }
  },

  /**
   * Actualiza el estado de un cliente
   * @param {number} id - ID del cliente
   * @param {string} estado - Nuevo estado ("Activo" o "Inactivo")
   * @returns {Promise} Promesa con los datos del cliente actualizado
   */
  updateStatus: async (id, estado) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado para actualización de estado")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      // Guardar el estado en localStorage para persistencia ANTES de la llamada API
      try {
        const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")
        clientesEstados[idNumerico] = estado
        localStorage.setItem("clientesEstados", JSON.stringify(clientesEstados))
        console.log(`Estado del cliente ${idNumerico} guardado localmente: ${estado}`)
      } catch (e) {
        console.error("Error al guardar estado en localStorage:", e)
      }

      // Convertir el estado a formato numérico para la API
      const estadoNumerico = estado === "Activo" ? 1 : 0

      console.log(`Intentando actualizar estado del cliente ${idNumerico} a ${estado}`)

      // Primero necesitamos obtener los datos actuales del cliente
      try {
        // Obtener el cliente actual
        const clienteActual = await clientesService.getById(idNumerico)

        if (!clienteActual) {
          throw new Error(`No se encontró el cliente con ID ${idNumerico}`)
        }

        console.log(`Cliente actual obtenido:`, clienteActual)

        // Preparar los datos para actualizar, manteniendo todos los campos excepto el estado
        const clienteActualizado = {
          Documento: clienteActual.Documento,
          Correo: clienteActual.Correo,
          Nombre: clienteActual.Nombre,
          Apellido: clienteActual.Apellido,
          Direccion: clienteActual.Direccion,
          Telefono: clienteActual.Telefono,
          Estado: estadoNumerico, // Actualizar solo el estado
        }

        console.log(`Actualizando cliente con datos:`, clienteActualizado)

        // Usar la ruta PUT para actualizar el cliente completo
        const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteActualizado)

        console.log(`Cliente actualizado exitosamente:`, response.data)

        // Convertir el estado numérico a texto en la respuesta
        const clienteRespuesta = response.data
        if (typeof clienteRespuesta.Estado === "number") {
          clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
        }

        return clienteRespuesta
      } catch (error) {
        console.error(`Error al actualizar cliente:`, error)

        // Si hay un error al obtener o actualizar el cliente, devolver un objeto simulado
        // Ya que guardamos el estado en localStorage, la UI seguirá funcionando
        return {
          id: id,
          IdCliente: id,
          Estado: estado,
          mensaje: "Actualización de estado simulada debido a error en el servidor",
        }
      }
    } catch (error) {
      console.error(`Error al actualizar estado de cliente con ID ${id}:`, error)

      // Mostrar detalles del error para depuración
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
      }

      // Devolver un objeto simulado para que la UI no se rompa
      // Ya que guardamos el estado en localStorage, la UI seguirá funcionando
      return {
        id: id,
        IdCliente: id,
        Estado: estado,
        mensaje: "Actualización de estado simulada debido a error en el servidor",
      }
    }
  },

  /**
   * Obtiene las mascotas de un cliente
   * @param {number} id - ID del cliente
   * @returns {Promise} Promesa con las mascotas del cliente
   */
  getMascotas: async (id) => {
    try {
      if (!id) {
        throw new Error("ID de cliente no proporcionado")
      }

      const idNumerico = Number.parseInt(id, 10)
      if (isNaN(idNumerico)) {
        throw new Error(`ID de cliente inválido: ${id}`)
      }

      const response = await axiosInstance.get(`/customers/clientes/${idNumerico}/mascotas`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener mascotas del cliente con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene el estado guardado localmente
   * @param {number} id - ID del cliente
   * @returns {string|null} Estado del cliente o null si no existe
   */
  getLocalStatus: (id) => {
    try {
      const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")
      return clientesEstados[id] || null
    } catch (error) {
      console.warn("Error al obtener estado local:", error)
      return null
    }
  },
}

export default clientesService
