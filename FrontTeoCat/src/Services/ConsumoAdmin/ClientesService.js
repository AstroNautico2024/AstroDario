import axiosInstance from "../ConsumoAdmin/axios.js"
import { sincronizarClienteAUsuario } from "../ConsumoAdmin/sincronizador.js"

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
      // Asegurarse de que todos los campos estén definidos con valores por defecto
      const clienteFormateado = {
        Documento: clienteData.Documento || "",
        Correo: clienteData.Correo,
        Nombre: clienteData.Nombre,
        Apellido: clienteData.Apellido,
        Direccion: clienteData.Direccion || "",
        Telefono: clienteData.Telefono || "",
        Estado: clienteData.Estado === "Activo" ? 1 : 0,
        IdUsuario: clienteData.IdUsuario || null,
      }

      console.log("Datos enviados al crear cliente:", clienteFormateado)

      // Agregar un timeout para depurar posibles problemas de red
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos de timeout

      try {
        const response = await axiosInstance.post("/customers/clientes", clienteFormateado, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        console.log("Respuesta completa del servidor:", response)

        // Verificar si la respuesta contiene datos
        if (!response.data) {
          throw new Error("La respuesta del servidor no contiene datos")
        }

        // Normalizar la respuesta para asegurar que tenga IdCliente
        const clienteRespuesta = response.data

        // Si la respuesta tiene 'id' pero no 'IdCliente', usar 'id' como 'IdCliente'
        if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
          clienteRespuesta.IdCliente = clienteRespuesta.id
          console.log("ID normalizado: id → IdCliente:", clienteRespuesta.IdCliente)
        }

        // Convertir el estado numérico a texto en la respuesta
        if (typeof clienteRespuesta.Estado === "number") {
          clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
        }

        // Sincronizar con usuario
        try {
          await sincronizarClienteAUsuario(clienteRespuesta, "crear")
        } catch (syncError) {
          console.error("Error en la sincronización al crear cliente:", syncError)
        }

        return clienteRespuesta
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === "AbortError") {
          throw new Error("La solicitud ha excedido el tiempo de espera")
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Error detallado al crear cliente:", error)

      // Agregar más detalles sobre el error para depuración
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
        console.error("Estado HTTP:", error.response.status)
        console.error("Cabeceras:", error.response.headers)
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request)
      } else {
        console.error("Error de configuración:", error.message)
      }

      // Manejar errores específicos del backend
      if (error.response && error.response.data) {
        const { message } = error.response.data

        if (message && message.includes("correo electrónico ya está registrado")) {
          const customError = new Error("El correo electrónico ya está registrado")
          customError.isEmailDuplicate = true
          throw customError
        }

        if (message && message.includes("documento ya está registrado")) {
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

      // Primero obtener el cliente actual para mantener el IdUsuario
      let clienteActual;
      try {
        clienteActual = await clientesService.getById(idNumerico);
        console.log("Cliente actual obtenido para actualización:", clienteActual);
      } catch (getError) {
        console.error(`Error al obtener cliente actual con ID ${idNumerico}:`, getError);
        // Si no podemos obtener el cliente, continuamos con un objeto vacío
        clienteActual = {};
      }

      // Preparar los datos en el formato que espera la API
      // Asegurarse de que todos los campos estén definidos con valores por defecto
      const clienteFormateado = {
        Documento: clienteData.Documento || "",
        Correo: clienteData.Correo,
        Nombre: clienteData.Nombre,
        Apellido: clienteData.Apellido,
        Direccion: clienteData.Direccion || "",
        Telefono: clienteData.Telefono || "",
        Estado: typeof clienteData.Estado === "string" ? (clienteData.Estado === "Activo" ? 1 : 0) : clienteData.Estado,
        // Usar el IdUsuario existente o un valor por defecto (1 para evitar null)
        IdUsuario: clienteActual.IdUsuario || 1,
      }

      console.log(`Actualizando cliente ID ${idNumerico} con datos:`, clienteFormateado)

      // Agregar un timeout para depurar posibles problemas de red
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos de timeout

      try {
        const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteFormateado, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        console.log("Respuesta completa del servidor (actualización):", response)

        // Verificar si la respuesta contiene datos
        if (!response.data) {
          throw new Error("La respuesta del servidor no contiene datos")
        }

        // Normalizar la respuesta para asegurar que tenga IdCliente
        const clienteRespuesta = response.data

        // Si la respuesta tiene 'id' pero no 'IdCliente', usar 'id' como 'IdCliente'
        if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
          clienteRespuesta.IdCliente = clienteRespuesta.id
          console.log("ID normalizado en actualización: id → IdCliente:", clienteRespuesta.IdCliente)
        }

        // Convertir el estado numérico a texto en la respuesta
        if (typeof clienteRespuesta.Estado === "number") {
          clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
        }

        // Asegurarse de que el cliente tenga un ID
        if (!clienteRespuesta.IdCliente) {
          console.warn("El cliente actualizado no tiene ID:", clienteRespuesta)
          // Asignar el ID que conocemos
          clienteRespuesta.IdCliente = idNumerico
        }

        // Asegurarse de que el cliente tenga todos los campos necesarios para la sincronización
        const clienteCompleto = {
          ...clienteRespuesta,
          Documento: clienteFormateado.Documento,
          Correo: clienteFormateado.Correo,
          Nombre: clienteFormateado.Nombre,
          Apellido: clienteFormateado.Apellido,
          Direccion: clienteFormateado.Direccion,
          Telefono: clienteFormateado.Telefono,
          Estado: clienteRespuesta.Estado,
          IdUsuario: clienteFormateado.IdUsuario,
        }

        // Sincronizar con usuario
        try {
          console.log("Iniciando sincronización después de actualizar cliente:", clienteCompleto)
          const resultado = await sincronizarClienteAUsuario(clienteCompleto, "actualizar")
          console.log("Resultado de sincronización después de actualizar cliente:", resultado)
        } catch (syncError) {
          console.error("Error en la sincronización al actualizar cliente:", syncError)
        }

        return clienteRespuesta
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === "AbortError") {
          throw new Error("La solicitud ha excedido el tiempo de espera")
        }
        throw fetchError
      }
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error)

      // Mostrar detalles del error para depuración
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
        console.error("Cabeceras:", error.response.headers)
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request)
      } else {
        console.error("Error de configuración:", error.message)
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

      // Obtener el cliente para sincronización
      let cliente = null
      try {
        cliente = await clientesService.getById(idNumerico)
      } catch (getError) {
        console.error(`Error al obtener cliente con ID ${idNumerico} para sincronización:`, getError)
      }

      // Sincronizar con usuario antes de eliminar el cliente
      if (cliente) {
        try {
          await sincronizarClienteAUsuario(cliente, "eliminar")
        } catch (syncError) {
          console.error("Error en la sincronización al eliminar cliente:", syncError)
        }
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
          IdUsuario: clienteActual.IdUsuario || 1, // Usar el IdUsuario existente o un valor por defecto
        }

        console.log(`Actualizando cliente con datos:`, clienteActualizado)

        // Usar la ruta PUT para actualizar el cliente completo
        const response = await axiosInstance.put(`/customers/clientes/${idNumerico}`, clienteActualizado)

        console.log(`Cliente actualizado exitosamente:`, response.data)

        // Normalizar la respuesta para asegurar que tenga IdCliente
        const clienteRespuesta = response.data

        // Si la respuesta tiene 'id' pero no 'IdCliente', usar 'id' como 'IdCliente'
        if (clienteRespuesta.id && !clienteRespuesta.IdCliente) {
          clienteRespuesta.IdCliente = clienteRespuesta.id
          console.log("ID normalizado en updateStatus: id → IdCliente:", clienteRespuesta.IdCliente)
        }

        // Convertir el estado numérico a texto en la respuesta
        if (typeof clienteRespuesta.Estado === "number") {
          clienteRespuesta.Estado = clienteRespuesta.Estado === 1 ? "Activo" : "Inactivo"
        }

        // Sincronizar con usuario
        try {
          await sincronizarClienteAUsuario(clienteRespuesta, "cambiarEstado")
        } catch (syncError) {
          console.error("Error en la sincronización al cambiar estado del cliente:", syncError)
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

  /**
   * Sincroniza todos los clientes con la tabla de usuarios
   * @returns {Promise<{exito: number, error: number}>} - Resultado de la sincronización
   */
  sincronizarTodosClientesUsuarios: async () => {
    try {
      // Importar dinámicamente para evitar problemas de dependencia circular
      const { sincronizarTodosClientesUsuarios } = await import("../ConsumoAdmin/sincronizador.js")
      return await sincronizarTodosClientesUsuarios()
    } catch (error) {
      console.error("Error al sincronizar todos los clientes con usuarios:", error)
      return { exito: 0, error: 0 }
    }
  },

  /**
   * Ejecuta una sincronización bidireccional completa entre usuarios y clientes
   * @returns {Promise<{usuariosAClientes: {exito: number, error: number}, clientesAUsuarios: {exito: number, error: number}}>}
   */
  sincronizacionCompleta: async () => {
    try {
      // Importar dinámicamente para evitar problemas de dependencia circular
      const { sincronizacionCompleta } = await import("../ConsumoAdmin/sincronizador.js")
      return await sincronizacionCompleta()
    } catch (error) {
      console.error("Error al ejecutar sincronización completa:", error)
      return {
        usuariosAClientes: { exito: 0, error: 0 },
        clientesAUsuarios: { exito: 0, error: 0 },
      }
    }
  },
}

export default clientesService