"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import NotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/NotificationCard"
import NotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/NotificationRow"
import ReviewNotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/ReviewNotificationCard"
import ReviewNotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/ReviewNotificationRow"
import PaymentReceiptCard from "../../../Components/AdminComponents/NotificacionesComponents/PaymentReceiptCard"
import PaymentReceiptRow from "../../../Components/AdminComponents/NotificacionesComponents/PaymentReceiptRow"
import CitasNotificationCard from "../../../Components/AdminComponents/NotificacionesComponents/CitasNotificationCard"
import CitasNotificationRow from "../../../Components/AdminComponents/NotificacionesComponents/CitasNotificationRow"
import notificacionesService from "../../../Services/ConsumoAdmin/NotificacionesService.js"
import reviewsService from "../../../Services/ConsumoAdmin/ReviewsService.js"

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("cards") // "cards" o "list"
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const [selectedNotificationId, setSelectedNotificationId] = useState(null)

  useEffect(() => {
    // Verificar si hay un ID de notificación seleccionado en localStorage
    const storedNotificationId = localStorage.getItem("selectedNotificationId")
    if (storedNotificationId) {
      setSelectedNotificationId(Number.parseInt(storedNotificationId, 10))
      // Limpiar el localStorage después de obtener el ID
      localStorage.removeItem("selectedNotificationId")
    }

    fetchNotificaciones()
  }, [])

  useEffect(() => {
    filtrarNotificaciones()
  }, [notificaciones, tipoFiltro, estadoFiltro])

  // Efecto para resaltar la notificación seleccionada
  useEffect(() => {
    if (selectedNotificationId) {
      // Esperar a que se carguen las notificaciones y se renderice el DOM
      setTimeout(() => {
        const notificationElement = document.getElementById(`notification-${selectedNotificationId}`)
        if (notificationElement) {
          // Desplazarse a la notificación seleccionada
          notificationElement.scrollIntoView({ behavior: "smooth", block: "center" })

          // Agregar una clase para resaltar la notificación
          notificationElement.classList.add("highlighted-notification")

          // Agregar un borde más visible
          notificationElement.style.boxShadow = "0 0 0 3px rgba(13, 110, 253, 0.5)"
          notificationElement.style.zIndex = "1"

          // Quitar la clase después de unos segundos
          setTimeout(() => {
            notificationElement.classList.remove("highlighted-notification")
            notificationElement.style.boxShadow = ""
            // Mantener el zIndex para que siga siendo visible
            setTimeout(() => {
              notificationElement.style.zIndex = ""
            }, 500)
          }, 3000)
        }
      }, 500)
    }
  }, [selectedNotificationId, filteredNotificaciones])

  // Efecto para actualizar el contador al cargar el componente
  useEffect(() => {
    if (!loading && notificaciones.length > 0) {
      actualizarContadorNotificaciones()
    }
  }, [loading, notificaciones])

  const fetchNotificaciones = async () => {
    setLoading(true)
    try {
      const data = await notificacionesService.getNotificaciones()

      // Procesar las fechas antes de actualizar el estado
      const notificacionesProcesadas = data.map((notificacion) => {
        // Crear una copia para no modificar el objeto original
        const notificacionProcesada = { ...notificacion }

        // Procesar fechaCita si existe y es una cadena
        if (notificacionProcesada.fechaCita && typeof notificacionProcesada.fechaCita === "string") {
          try {
            // Intentar convertir a objeto Date
            const fechaObj = new Date(notificacionProcesada.fechaCita)
            if (!isNaN(fechaObj.getTime())) {
              notificacionProcesada.fechaCita = fechaObj
            }
          } catch (error) {
            console.error("Error al procesar fechaCita:", error)
          }
        }

        // Procesar FechaCreacion si existe y es una cadena
        if (notificacionProcesada.FechaCreacion && typeof notificacionProcesada.FechaCreacion === "string") {
          try {
            const fechaObj = new Date(notificacionProcesada.FechaCreacion)
            if (!isNaN(fechaObj.getTime())) {
              notificacionProcesada.FechaCreacion = fechaObj
            }
          } catch (error) {
            console.error("Error al procesar FechaCreacion:", error)
          }
        }

        return notificacionProcesada
      })

      setNotificaciones(notificacionesProcesadas)
      
      // Actualizar el contador de notificaciones pendientes
      const pendientes = notificacionesProcesadas.filter(n => n.Estado === "Pendiente").length
      localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
      
      // Disparar evento para actualizar otros componentes
      const evento = new CustomEvent("actualizarContadorNotificaciones", {
        detail: { pendientes }
      })
      window.dispatchEvent(evento)
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron cargar las notificaciones</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    } finally {
      setLoading(false)
    }
  }

  const filtrarNotificaciones = () => {
    let filtered = [...notificaciones]

    if (tipoFiltro !== "todos") {
      filtered = filtered.filter((n) => n.TipoNotificacion === tipoFiltro)
    }

    if (estadoFiltro !== "todos") {
      filtered = filtered.filter((n) => n.Estado === estadoFiltro)
    }

    // Si hay una notificación seleccionada, asegurarse de que esté incluida en las filtradas
    if (selectedNotificationId) {
      const selectedNotification = notificaciones.find((n) => n.IdNotificacion === selectedNotificationId)
      if (selectedNotification && !filtered.some((n) => n.IdNotificacion === selectedNotificationId)) {
        // Si la notificación seleccionada no está en las filtradas, resetear los filtros
        setTipoFiltro("todos")
        setEstadoFiltro("todos")
        filtered = [...notificaciones]
      }
    }

    setFilteredNotificaciones(filtered)
  }

  // Función para actualizar el contador global de notificaciones
  const actualizarContadorNotificaciones = () => {
    // Contar las notificaciones pendientes después de la actualización
    const pendientes = notificaciones.filter(n => n.Estado === "Pendiente").length
    
    // Actualizar el contador global usando localStorage
    localStorage.setItem("contadorNotificacionesPendientes", pendientes.toString())
    
    // Disparar un evento para que otros componentes puedan reaccionar
    const evento = new CustomEvent("actualizarContadorNotificaciones", {
      detail: { pendientes }
    })
    window.dispatchEvent(evento)
  }

  const cambiarEstadoNotificacion = async (id, nuevoEstado, notasAdicionales = "") => {
    try {
      // Validar el nuevo estado
      const estadosValidos = ["Pendiente", "Vista", "Resuelta", "Aprobado", "Rechazado"]
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado no válido: ${nuevoEstado}`)
      }

      // Validar que la notificación existe
      const notificacion = notificaciones.find((n) => n.IdNotificacion === id)
      if (!notificacion) {
        throw new Error(`Notificación no encontrada: ${id}`)
      }

      // Validar transiciones de estado permitidas
      if (nuevoEstado === "Aprobado" || nuevoEstado === "Rechazado") {
        if (notificacion.TipoNotificacion !== "Comprobante") {
          throw new Error(`El estado ${nuevoEstado} solo es válido para comprobantes`)
        }
      }

      // Si es rechazo, validar que hay notas adicionales
      if (nuevoEstado === "Rechazado" && !notasAdicionales.trim()) {
        throw new Error("Se requiere un motivo para rechazar el comprobante")
      }

      // Realizar la llamada a la API según el tipo de acción
      if (nuevoEstado === "Vista") {
        await notificacionesService.markAsRead(id)
      } else if (nuevoEstado === "Resuelta") {
        await notificacionesService.markAsResolved(id)
      } else {
        // Para otros estados (Aprobado, Rechazado), usar la actualización general
        await notificacionesService.updateNotificacion(id, {
          Estado: nuevoEstado,
          ...(notasAdicionales ? { notasAdicionales } : {}),
        })
      }

      // Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.IdNotificacion === id) {
          return {
            ...notif,
            Estado: nuevoEstado,
            ...(notasAdicionales ? { notasAdicionales } : {}),
            ...(nuevoEstado === "Vista" ? { FechaVista: new Date() } : {}),
            ...(nuevoEstado === "Resuelta" ? { FechaResuelta: new Date() } : {}),
          }
        }
        return notif
      })

      setNotificaciones(updatedNotificaciones)
      
      // Actualizar el contador global de notificaciones
      actualizarContadorNotificaciones()

      // Mostrar notificación de éxito
      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>
            Notificación {id} actualizada a <strong>{nuevoEstado}</strong>
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>{error.message || "No se pudo actualizar el estado de la notificación"}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      await notificacionesService.markAllAsRead()

      // Actualizar el estado local
      const updatedNotificaciones = notificaciones.map((notif) => {
        if (notif.Estado === "Pendiente") {
          return {
            ...notif,
            Estado: "Vista",
            FechaVista: new Date(),
          }
        }
        return notif
      })

      setNotificaciones(updatedNotificaciones)
      
      // Actualizar el contador global
      actualizarContadorNotificaciones()

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Todas las notificaciones han sido marcadas como leídas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron marcar todas las notificaciones como leídas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const eliminarNotificacionesAntiguas = async (dias = 30) => {
    try {
      await notificacionesService.deleteOldNotifications(dias)

      // Recargar las notificaciones después de eliminar
      fetchNotificaciones()

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Se han eliminado las notificaciones con más de {dias} días de antigüedad</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al eliminar notificaciones antiguas:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron eliminar las notificaciones antiguas</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const crearNotificacion = async (notificacionData) => {
    try {
      const nuevaNotificacion = await notificacionesService.createNotificacion(notificacionData)

      // Actualizar el estado local añadiendo la nueva notificación
      setNotificaciones([nuevaNotificacion, ...notificaciones])
      
      // Actualizar el contador global
      actualizarContadorNotificaciones()

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>Se ha creado una nueva notificación</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )

      return nuevaNotificacion
    } catch (error) {
      console.error("Error al crear notificación:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo crear la notificación</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
      throw error
    }
  }

  const eliminarResenaProducto = async (id) => {
    try {
      await reviewsService.deleteProductReview(id)

      // Actualizar el estado local
      // Buscar la notificación relacionada con esta reseña
      const notificacionesActualizadas = notificaciones.filter((notif) => {
        if (notif.TipoNotificacion === "ReseñaProducto" && notif.IdReferencia === id) {
          return false // Eliminar esta notificación
        }
        return true
      })

      setNotificaciones(notificacionesActualizadas)
      
      // Actualizar el contador global
      actualizarContadorNotificaciones()

      toast.success(
        <div>
          <strong>Éxito</strong>
          <p>La reseña ha sido eliminada</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        },
      )
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo eliminar la reseña</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
        },
      )
    }
  }

  const renderNotificationComponent = (notificacion) => {
    // Agregar ID para poder identificar y resaltar la notificación seleccionada
    const isSelected = notificacion.IdNotificacion === selectedNotificationId

    // Asegurarse de que las fechas estén en formato correcto
    if (notificacion.TipoNotificacion === "Cita" && notificacion.fechaCita) {
      // Asegurarse de que fechaCita sea un objeto Date válido
      if (typeof notificacion.fechaCita === "string") {
        try {
          // Intentar convertir la cadena a fecha si no es ya un objeto Date
          const fechaObj = new Date(notificacion.fechaCita)
          if (!isNaN(fechaObj.getTime())) {
            notificacion.fechaCita = fechaObj
          }
        } catch (error) {
          console.error("Error al convertir fecha:", error)
        }
      }
    }

    // Extraer la key y crear un objeto con el resto de props
    const { IdNotificacion } = notificacion
    const commonProps = {
      notificacion: notificacion,
      onChangeStatus: cambiarEstadoNotificacion,
      id: `notification-${notificacion.IdNotificacion}`,
      className: isSelected ? "highlighted-notification" : "",
    }

    switch (notificacion.TipoNotificacion) {
      case "StockBajo":
        return <NotificationCard key={IdNotificacion} {...commonProps} />
      case "Vencimiento":
        return <NotificationCard key={IdNotificacion} {...commonProps} />
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return (
          <ReviewNotificationCard
            key={IdNotificacion}
            {...commonProps}
            onDeleteReview={
              notificacion.TipoNotificacion === "ReseñaProducto"
                ? () => eliminarResenaProducto(notificacion.IdReferencia)
                : undefined
            }
          />
        )
      case "Comprobante":
        return <PaymentReceiptCard key={IdNotificacion} {...commonProps} />
      case "Cita":
        return <CitasNotificationCard key={IdNotificacion} {...commonProps} />
      default:
        return <NotificationCard key={IdNotificacion} {...commonProps} />
    }
  }

  // Aplicar la misma corrección para renderNotificationRowComponent
  const renderNotificationRowComponent = (notificacion) => {
    // Agregar ID para poder identificar y resaltar la notificación seleccionada
    const isSelected = notificacion.IdNotificacion === selectedNotificationId

    // Asegurarse de que las fechas estén en formato correcto
    if (notificacion.TipoNotificacion === "Cita" && notificacion.fechaCita) {
      // Asegurarse de que fechaCita sea un objeto Date válido
      if (typeof notificacion.fechaCita === "string") {
        try {
          // Intentar convertir la cadena a fecha si no es ya un objeto Date
          const fechaObj = new Date(notificacion.fechaCita)
          if (!isNaN(fechaObj.getTime())) {
            notificacion.fechaCita = fechaObj
          }
        } catch (error) {
          console.error("Error al convertir fecha:", error)
        }
      }
    }

    // Extraer la key y crear un objeto con el resto de props
    const { IdNotificacion } = notificacion
    const commonProps = {
      notificacion: notificacion,
      onChangeStatus: cambiarEstadoNotificacion,
      id: `notification-${notificacion.IdNotificacion}`,
      className: isSelected ? "highlighted-notification" : "",
    }

    switch (notificacion.TipoNotificacion) {
      case "StockBajo":
        return <NotificationRow key={IdNotificacion} {...commonProps} />
      case "Vencimiento":
        return <NotificationRow key={IdNotificacion} {...commonProps} />
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return (
          <ReviewNotificationRow
            key={IdNotificacion}
            {...commonProps}
            onDeleteReview={
              notificacion.TipoNotificacion === "ReseñaProducto"
                ? () => eliminarResenaProducto(notificacion.IdReferencia)
                : undefined
            }
          />
        )
      case "Comprobante":
        return <PaymentReceiptRow key={IdNotificacion} {...commonProps} />
      case "Cita":
        return <CitasNotificationRow key={IdNotificacion} {...commonProps} />
      default:
        return <NotificationRow key={IdNotificacion} {...commonProps} />
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3 mb-3">Notificaciones</h1>
        </div>
        <div className="col-md-6 d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
          <select className="form-select" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="StockBajo">Stock Bajo</option>
            <option value="Vencimiento">Vencimiento</option>
            <option value="Comprobante">Comprobante</option>
            <option value="ReseñaProducto">Reseña Producto</option>
            <option value="ReseñaServicio">Reseña Servicio</option>
            <option value="ReseñaGeneral">Reseña General</option>
            <option value="Cita">Cita</option>
          </select>
          <select className="form-select" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vista">Vista</option>
            <option value="Resuelta">Resuelta</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={fetchNotificaciones} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge bg-secondary">Total: {filteredNotificaciones.length}</span>
        {tipoFiltro !== "todos" && <span className="badge bg-info">Tipo: {tipoFiltro}</span>}
        {estadoFiltro !== "todos" && <span className="badge bg-info">Estado: {estadoFiltro}</span>}

        <div className="ms-auto">
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-sm btn-outline-primary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Acciones
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <button className="dropdown-item" onClick={marcarTodasComoLeidas}>
                  <i className="bi bi-check-all me-2"></i>
                  Marcar todas como leídas
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => eliminarNotificacionesAntiguas(30)}>
                  <i className="bi bi-trash me-2"></i>
                  Eliminar notificaciones antiguas (30 días)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")}>
            Vista de Tarjetas
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
            Vista de Lista
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="fs-5">Cargando notificaciones...</span>
        </div>
      ) : filteredNotificaciones.length === 0 ? (
        <div className="text-center py-5 text-muted">
          No hay notificaciones que coincidan con los filtros seleccionados.
        </div>
      ) : viewMode === "cards" ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredNotificaciones.map((notificacion) => (
            <div className="col" key={`card-${notificacion.IdNotificacion}`}>
              {renderNotificationComponent(notificacion)}
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredNotificaciones.map((notificacion) => (
            <div key={`row-${notificacion.IdNotificacion}`}>{renderNotificationRowComponent(notificacion)}</div>
          ))}
        </div>
      )}

      {/* Estilos para resaltar la notificación seleccionada */}
      <style jsx="true">{`
        .highlighted-notification {
          animation: highlight 3s ease-in-out;
          position: relative;
          transition: all 0.3s ease;
        }

        @keyframes highlight {
          0% { 
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.5);
            transform: scale(1);
          }
          10% { 
            transform: scale(1.02);
          }
          20% { 
            transform: scale(1);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </div>
  )
}

export default Notificaciones