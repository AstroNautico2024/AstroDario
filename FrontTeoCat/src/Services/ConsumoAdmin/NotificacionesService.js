// Services/ConsumoAdmin/NotificacionesService.js
import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar las notificaciones
 */
export const notificacionesService = {
  /**
   * Obtiene todas las notificaciones y procesa las fechas
   * @returns {Promise<Array>} Lista de notificaciones con fechas procesadas
   */
  getNotificaciones: async () => {
    try {
      const response = await axiosInstance.get("/notifications/notificaciones")

      // Procesar las fechas antes de devolver los datos
      const notificacionesConFechasProcesadas = response.data.map((notificacion) => {
        // Crear una copia para no modificar el objeto original directamente
        const notificacionProcesada = { ...notificacion }

        // Procesar fechaCita si existe
        if (notificacionProcesada.fechaCita) {
          try {
            // Si es una cadena, convertirla a objeto Date
            if (typeof notificacionProcesada.fechaCita === "string") {
              // Manejar diferentes formatos de fecha
              let fechaObj

              // Formato ISO
              if (notificacionProcesada.fechaCita.includes("T")) {
                fechaObj = new Date(notificacionProcesada.fechaCita)
              }
              // Formato YYYY-MM-DD HH:MM:SS
              else if (notificacionProcesada.fechaCita.includes("-") && notificacionProcesada.fechaCita.includes(":")) {
                fechaObj = new Date(notificacionProcesada.fechaCita.replace(" ", "T"))
              }
              // Formato DD/MM/YYYY
              else if (notificacionProcesada.fechaCita.includes("/")) {
                const parts = notificacionProcesada.fechaCita.split(" ")
                const dateParts = parts[0].split("/")
                fechaObj = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || "00:00"}`)
              }
              // Otros formatos
              else {
                fechaObj = new Date(notificacionProcesada.fechaCita)
              }

              // Verificar que la fecha sea válida
              if (!isNaN(fechaObj.getTime())) {
                notificacionProcesada.fechaCita = fechaObj
              }
            }
          } catch (error) {
            console.error("Error al procesar fechaCita:", error)
          }
        }

        // Procesar FechaCreacion si existe
        if (notificacionProcesada.FechaCreacion) {
          try {
            if (typeof notificacionProcesada.FechaCreacion === "string") {
              const fechaObj = new Date(notificacionProcesada.FechaCreacion)
              if (!isNaN(fechaObj.getTime())) {
                notificacionProcesada.FechaCreacion = fechaObj
              }
            }
          } catch (error) {
            console.error("Error al procesar FechaCreacion:", error)
          }
        }

        // Procesar FechaVista si existe
        if (notificacionProcesada.FechaVista) {
          try {
            if (typeof notificacionProcesada.FechaVista === "string") {
              const fechaObj = new Date(notificacionProcesada.FechaVista)
              if (!isNaN(fechaObj.getTime())) {
                notificacionProcesada.FechaVista = fechaObj
              }
            }
          } catch (error) {
            console.error("Error al procesar FechaVista:", error)
          }
        }

        // Procesar FechaResuelta si existe
        if (notificacionProcesada.FechaResuelta) {
          try {
            if (typeof notificacionProcesada.FechaResuelta === "string") {
              const fechaObj = new Date(notificacionProcesada.FechaResuelta)
              if (!isNaN(fechaObj.getTime())) {
                notificacionProcesada.FechaResuelta = fechaObj
              }
            }
          } catch (error) {
            console.error("Error al procesar FechaResuelta:", error)
          }
        }

        // Extraer fecha del mensaje si no hay fechaCita
        if (
          !notificacionProcesada.fechaCita &&
          notificacionProcesada.TipoNotificacion === "Cita" &&
          notificacionProcesada.Mensaje
        ) {
          try {
            // Buscar patrones de fecha en el mensaje
            const datePattern1 = /(\d{2}\/\d{2}\/\d{4})/ // DD/MM/YYYY
            const datePattern2 = /(\d{4}-\d{2}-\d{2})/ // YYYY-MM-DD
            const datePattern3 = /(\d{2}-\d{2}-\d{4})/ // DD-MM-YYYY

            const match =
              notificacionProcesada.Mensaje.match(datePattern1) ||
              notificacionProcesada.Mensaje.match(datePattern2) ||
              notificacionProcesada.Mensaje.match(datePattern3)

            if (match && match[1]) {
              let fechaExtraida

              // Convertir según el formato encontrado
              if (match[1].includes("/")) {
                const parts = match[1].split("/")
                fechaExtraida = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
              } else if (match[1].includes("-")) {
                if (match[1].match(/^\d{4}-/)) {
                  // YYYY-MM-DD
                  fechaExtraida = new Date(match[1])
                } else {
                  // DD-MM-YYYY
                  const parts = match[1].split("-")
                  fechaExtraida = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
                }
              }

              if (fechaExtraida && !isNaN(fechaExtraida.getTime())) {
                notificacionProcesada.fechaCita = fechaExtraida
              }
            }
          } catch (error) {
            console.error("Error al extraer fecha del mensaje:", error)
          }
        }

        return notificacionProcesada
      })

      // Actualizar el contador de notificaciones pendientes
      const pendientes = notificacionesConFechasProcesadas.filter(n => n.Estado === "Pendiente").length
      localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
      
      // Disparar evento para actualizar otros componentes
      const evento = new CustomEvent("actualizarContadorNotificaciones", {
        detail: { pendientes }
      })
      window.dispatchEvent(evento)

      return notificacionesConFechasProcesadas
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      throw error
    }
  },

  /**
   * Crea una nueva notificación
   * @param {Object} notificacionData - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  createNotificacion: async (notificacionData) => {
    try {
      // Asegurarse de que las fechas estén en formato ISO para enviar al servidor
      const notificacionProcesada = { ...notificacionData }

      if (notificacionProcesada.fechaCita && notificacionProcesada.fechaCita instanceof Date) {
        notificacionProcesada.fechaCita = notificacionProcesada.fechaCita.toISOString()
      }

      const response = await axiosInstance.post("/notifications/notificaciones", notificacionProcesada)
      
      // Actualizar el contador de notificaciones pendientes
      try {
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
        
        // Disparar evento para actualizar otros componentes
        const evento = new CustomEvent("actualizarContadorNotificaciones", {
          detail: { pendientes }
        })
        window.dispatchEvent(evento)
      } catch (error) {
        console.error("Error al actualizar contador después de crear notificación:", error)
      }
      
      return response.data
    } catch (error) {
      console.error("Error al crear notificación:", error)
      throw error
    }
  },

  /**
   * Actualiza una notificación existente
   * @param {number|string} id - ID de la notificación
   * @param {Object} notificacionData - Datos actualizados
   * @returns {Promise<Object>} Notificación actualizada
   */
  updateNotificacion: async (id, notificacionData) => {
    try {
      // Asegurarse de que las fechas estén en formato ISO para enviar al servidor
      const notificacionProcesada = { ...notificacionData }

      if (notificacionProcesada.fechaCita && notificacionProcesada.fechaCita instanceof Date) {
        notificacionProcesada.fechaCita = notificacionProcesada.fechaCita.toISOString()
      }

      const response = await axiosInstance.put(`/notifications/notificaciones/${id}`, notificacionProcesada)
      
      // Actualizar el contador de notificaciones pendientes
      try {
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
        
        // Disparar evento para actualizar otros componentes
        const evento = new CustomEvent("actualizarContadorNotificaciones", {
          detail: { pendientes }
        })
        window.dispatchEvent(evento)
      } catch (error) {
        console.error("Error al actualizar contador después de actualizar notificación:", error)
      }
      
      return response.data
    } catch (error) {
      console.error("Error al actualizar notificación:", error)
      throw error
    }
  },

  /**
   * Marca una notificación como leída
   * @param {number|string} id - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAsRead: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/notificaciones/${id}/read`)
      
      // Actualizar el contador de notificaciones pendientes
      try {
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
        
        // Disparar evento para actualizar otros componentes
        const evento = new CustomEvent("actualizarContadorNotificaciones", {
          detail: { pendientes }
        })
        window.dispatchEvent(evento)
      } catch (error) {
        console.error("Error al actualizar contador después de marcar como leída:", error)
      }
      
      return response.data
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
      throw error
    }
  },

  /**
   * Marca una notificación como resuelta
   * @param {number|string} id - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAsResolved: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/notificaciones/${id}/resolve`)
      
      // Actualizar el contador de notificaciones pendientes
      try {
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
        
        // Disparar evento para actualizar otros componentes
        const evento = new CustomEvent("actualizarContadorNotificaciones", {
          detail: { pendientes }
        })
        window.dispatchEvent(evento)
      } catch (error) {
        console.error("Error al actualizar contador después de marcar como resuelta:", error)
      }
      
      return response.data
    } catch (error) {
      console.error("Error al marcar notificación como resuelta:", error)
      throw error
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   * @returns {Promise<Object>} Resultado de la operación
   */
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.post("/notifications/notificaciones/mark-all-read")
      
      // Actualizar el contador de notificaciones pendientes
      localStorage.setItem("contadorNotificacionesPendientes", "0")
      
      // Disparar evento para actualizar otros componentes
      const evento = new CustomEvent("actualizarContadorNotificaciones", {
        detail: { pendientes: 0 }
      })
      window.dispatchEvent(evento)
      
      return response.data
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      throw error
    }
  },

  /**
   * Elimina notificaciones antiguas
   * @param {number} days - Días de antigüedad para eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteOldNotifications: async (days = 30) => {
    try {
      const response = await axiosInstance.post("/notifications/notificaciones/delete-old", { days })
      
      // Actualizar el contador de notificaciones pendientes
      try {
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
        
        // Disparar evento para actualizar otros componentes
        const evento = new CustomEvent("actualizarContadorNotificaciones", {
          detail: { pendientes }
        })
        window.dispatchEvent(evento)
      } catch (error) {
        console.error("Error al actualizar contador después de eliminar notificaciones antiguas:", error)
      }
      
      return response.data
    } catch (error) {
      console.error("Error al eliminar notificaciones antiguas:", error)
      throw error
    }
  },

  /**
   * Función auxiliar para formatear fechas en formato legible
   * @param {Date|string} date - Fecha a formatear
   * @param {boolean} includeTime - Incluir hora en el formato
   * @returns {string} Fecha formateada
   */
  formatDate: (date, includeTime = false) => {
    if (!date) return "Fecha no especificada"

    try {
      let dateObj

      // Si es un objeto Date
      if (date instanceof Date) {
        dateObj = date
      }
      // Si es una cadena ISO
      else if (typeof date === "string" && date.includes("T")) {
        dateObj = new Date(date)
      }
      // Si es una cadena con formato YYYY-MM-DD HH:MM:SS
      else if (typeof date === "string" && date.includes("-") && date.includes(":")) {
        dateObj = new Date(date.replace(" ", "T"))
      }
      // Si es una cadena con formato DD/MM/YYYY
      else if (typeof date === "string" && date.includes("/")) {
        const parts = date.split(" ")
        const dateParts = parts[0].split("/")
        dateObj = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || "00:00"}`)
      }
      // Otros formatos
      else {
        dateObj = new Date(date)
      }

      if (isNaN(dateObj.getTime())) {
        return "Fecha inválida"
      }

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }

      return dateObj.toLocaleDateString("es-ES", options)
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Error en formato de fecha"
    }
  },

  /**
   * Obtiene el número de notificaciones pendientes
   * @returns {Promise<Object>} Objeto con el contador de pendientes
   */
  getNotificacionesPendientesCount: async () => {
    try {
      // Intentar usar el endpoint específico
      try {
        const response = await axiosInstance.get("/notifications/notificaciones/unread/count")
        return response.data
      } catch (endpointError) {
        console.error("Error con el endpoint específico, usando alternativa:", endpointError)
        
        // Si el endpoint específico falla, obtener todas las notificaciones y contar las pendientes
        const notificaciones = await notificacionesService.getNotificaciones()
        const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
        return { count: pendientes }
      }
    } catch (error) {
      console.error("Error al obtener contador de notificaciones pendientes:", error)
      // Devolver un objeto con count: 0 para evitar errores en el componente
      return { count: 0 }
    }
  },
}

export default notificacionesService