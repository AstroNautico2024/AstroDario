import { format } from "date-fns"
import { es } from "date-fns/locale"

const CitasNotificationRow = ({ Mensaje, fechaCita }) => {
  /**
   * Función para formatear fechas con hora
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada con hora
   */
  const formatDateTime = (date) => {
    if (!date) return ""

    try {
      // Intentar diferentes formatos de fecha
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

      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return "Fecha inválida"
      }

      return format(dateObj, "EEEE, d 'de' MMMM 'a las' h:mm a", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  // Función para extraer fecha del mensaje si no hay fechaCita
  const extractFechaFromMensaje = (mensaje) => {
    if (!mensaje) return null

    // Buscar patrones de fecha en el mensaje
    const datePattern1 = /(\d{2}\/\d{2}\/\d{4})/ // DD/MM/YYYY
    const datePattern2 = /(\d{4}-\d{2}-\d{2})/ // YYYY-MM-DD
    const datePattern3 = /(\d{2}-\d{2}-\d{4})/ // DD-MM-YYYY

    const match = mensaje.match(datePattern1) || mensaje.match(datePattern2) || mensaje.match(datePattern3)

    if (match && match[1]) {
      return match[1]
    }

    return null
  }

  // Determinar la fecha a mostrar
  const getFechaToDisplay = () => {
    // Si hay fechaCita, usarla
    if (fechaCita) {
      return formatDateTime(fechaCita)
    }

    // Si no hay fechaCita pero hay un mensaje con fecha, extraerla
    if (Mensaje) {
      const extractedDate = extractFechaFromMensaje(Mensaje)
      if (extractedDate) {
        return formatDateTime(extractedDate)
      }
    }

    // Si no hay fecha disponible
    return "Fecha no especificada"
  }

  return (
    <div>
      <p>{Mensaje}</p>
      <p>Fecha: {getFechaToDisplay()}</p>
    </div>
  )
}

export default CitasNotificationRow
