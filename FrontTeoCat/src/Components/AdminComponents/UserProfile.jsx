"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiUser, FiLogOut, FiChevronDown, FiBell, FiCheck } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import "./UserProfile.scss"
import authService from "../../Services/ConsumoAdmin/authService.js"
import notificacionesService from "../../Services/ConsumoAdmin/notificacionesService.js"

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [userData, setUserData] = useState({ name: "Usuario", email: "usuario@ejemplo.com", role: "Invitado" })
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(false)

  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const backdropRef = useRef(null)
  const navigate = useNavigate()

  // Cargar datos del usuario y notificaciones al montar el componente
  useEffect(() => {
    fetchUserData()
    fetchNotificaciones()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".dropdown")) {
        setIsOpen(false)
      }
      if (isNotificationsOpen && !event.target.closest(".notification-dropdown")) {
        setIsNotificationsOpen(false)
      }
    }

    // Close dropdown when navigating
    const handleRouteChange = () => {
      setIsOpen(false)
      setIsNotificationsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("popstate", handleRouteChange)

      // Reset body styles if needed
      document.body.style.overflow = ""
    }
  }, [isOpen, isNotificationsOpen])

  // Obtener datos del usuario
  const fetchUserData = () => {
    const storedUserData = authService.getUserData()
    if (storedUserData) {
      setUserData({
        name: `${storedUserData.nombre || ""} ${storedUserData.apellido || ""}`.trim() || "Usuario",
        email: storedUserData.correo || "usuario@ejemplo.com",
        role: storedUserData.rol?.nombre || "Invitado",
        id: storedUserData.id,
      })
    }
  }

  // Obtener notificaciones
  const fetchNotificaciones = async () => {
    setLoading(true)
    try {
      const data = await notificacionesService.getNotificaciones()
      setNotificaciones(data || [])
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      setNotificaciones([])
    } finally {
      setLoading(false)
    }
  }

  // Marcar notificación como leída
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await notificacionesService.markAsRead(id)
      setNotificaciones(
        notificaciones.map((notif) => {
          if (notif.IdNotificacion === id) {
            return { ...notif, Estado: "Vista", FechaVista: new Date() }
          }
          return notif
        }),
      )
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificacionesService.markAllAsRead()
      setNotificaciones(
        notificaciones.map((notif) => {
          if (notif.Estado === "Pendiente") {
            return { ...notif, Estado: "Vista", FechaVista: new Date() }
          }
          return notif
        }),
      )
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (isNotificationsOpen) setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    if (isOpen) setIsOpen(false)
  }

  const handleLogout = () => {
    // Primero navegamos a la página principal
    navigate("/")

    // Luego, con un pequeño retraso, eliminamos las credenciales
    setTimeout(() => {
      // Usar el servicio de autenticación para cerrar sesión
      authService.logout()
    }, 100)
  }

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date

    // Convertir a minutos, horas, días
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
    } else {
      return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
    }
  }

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "StockBajo":
      case "Vencimiento":
        return <i className="bi bi-exclamation-triangle text-warning"></i>
      case "ReseñaProducto":
      case "ReseñaServicio":
      case "ReseñaGeneral":
        return <i className="bi bi-chat-left-text text-info"></i>
      case "Comprobante":
        return <i className="bi bi-receipt text-primary"></i>
      case "Cita":
        return <i className="bi bi-calendar-check text-success"></i>
      default:
        return <i className="bi bi-bell text-secondary"></i>
    }
  }

  // Contar notificaciones no leídas
  const unreadCount = notificaciones.filter((notif) => notif.Estado === "Pendiente").length

  return (
    <div className="user-profile ms-auto">
      {/* Componente de notificaciones */}
      <div className="notification-dropdown" ref={notificationsRef}>
        <div className="notification-bell" onClick={toggleNotifications}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FiBell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </motion.div>
        </div>

        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div
              className="notification-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-header">
                <h6 className="mb-0">Notificaciones</h6>
                {unreadCount > 0 && (
                  <button className="btn btn-link btn-sm p-0" onClick={handleMarkAllAsRead}>
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="notification-body">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mb-0 mt-2">Cargando notificaciones...</p>
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="mb-0">No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notificaciones.slice(0, 5).map((notification) => (
                      <div
                        key={notification.IdNotificacion}
                        className={`notification-item ${notification.Estado === "Pendiente" ? "unread" : ""}`}
                      >
                        <div className="notification-icon">{getNotificationIcon(notification.TipoNotificacion)}</div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.Titulo}</div>
                          <div className="notification-message">{notification.Mensaje}</div>
                          <div className="notification-time">{formatRelativeTime(notification.FechaCreacion)}</div>
                        </div>
                        {notification.Estado === "Pendiente" && (
                          <button
                            className="btn btn-sm mark-read-btn"
                            onClick={(e) => handleMarkAsRead(notification.IdNotificacion, e)}
                            title="Marcar como leída"
                          >
                            <FiCheck />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <Link to="/admin/notificaciones" onClick={() => setIsNotificationsOpen(false)}>
                  Ver todas las notificaciones
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="dropdown">
        <motion.button
          className="profile-button"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="avatar">
            <FiUser size={20} />
          </div>
          <div className="user-info">
            <div className="user-name">{userData.name || "Usuario"}</div>
            <div className="user-role">{userData.role || "Invitado"}</div>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <FiChevronDown className="dropdown-icon" size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="dropdown-backdrop"
                onClick={() => setIsOpen(false)}
                ref={backdropRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="dropdown-menu show"
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="dropdown-header">
                  <div className="header-name">{userData.name || "Usuario"}</div>
                  <div className="header-email">{userData.email || "usuario@ejemplo.com"}</div>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-content">
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link to="/perfil" className="dropdown-item" onClick={() => setIsOpen(false)}>
                      <FiUser className="item-icon" size={16} />
                      <span>Mi Perfil</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <FiLogOut className="item-icon" size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserProfile
