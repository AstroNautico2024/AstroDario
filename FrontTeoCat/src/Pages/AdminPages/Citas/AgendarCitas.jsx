"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle, Calendar, Clock, User, Scissors } from 'lucide-react'
import "../../../Styles/AdminStyles/AgendarCitas.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"

// Importar el servicio de citas
import CitasService from "../../../Services/ConsumoAdmin/CitasService.js"
// Importar los nuevos componentes
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"

/**
 * Componente para la gestión de citas
 * Permite visualizar, crear, editar y cancelar citas
 */
const AgendarCitas = () => {
  const navigate = useNavigate()

  // Estado para las citas
  const [citas, setCitas] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Estado para clientes y servicios
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])

  // Estado para el modal de cita
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Ver Detalles de la Cita")
  const [currentCita, setCurrentCita] = useState(null)

  // Estado para el modal de confirmación de cancelación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [citaToCancel, setCitaToCancel] = useState(null)

  // Referencias para las notificaciones
  const toastIds = useRef({})
  
  // NUEVOS ESTADOS PARA LAS MEJORAS
  // Estado para el indicador de carga global
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")
  
  // Añadir estos nuevos estados para manejar las notificaciones pendientes
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)
  
  // Función para mostrar toast después de que el loading se oculte
  const showPendingToast = () => {
    if (pendingToastRef.current && !toastShownRef.current) {
      const { type, message } = pendingToastRef.current

      // Marcar como mostrado
      toastShownRef.current = true

      // Limpiar todas las notificaciones existentes primero
      toast.dismiss()

      // Mostrar la notificación después de un pequeño retraso
      setTimeout(() => {
        toast[type](message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          onClose: () => {
            // Resetear cuando se cierra la notificación
            pendingToastRef.current = null
            // Esperar un momento antes de permitir nuevas notificaciones
            setTimeout(() => {
              toastShownRef.current = false
            }, 300)
          },
        })
      }, 300)
    }
  }

  /**
   * Función para formatear números con separadores de miles
   * @param {number|string} number - Número a formatear
   * @returns {string} Número formateado con separadores de miles
   */
  const formatNumber = (number) => {
    if (number === null || number === undefined) return "0";
    
    // Si es string, convertir a número
    if (typeof number === 'string') {
      // Eliminar el símbolo $ y cualquier otro carácter no numérico excepto puntos y comas
      const numeroLimpio = number.replace(/[^\d.,]/g, '');
      
      // Determinar si el formato original usa punto como separador decimal o de miles
      if (numeroLimpio.includes(',')) {
        // Si tiene coma como separador decimal (ej: "35.000,00")
        // Reemplazar puntos por nada (eliminar separadores de miles) y coma por punto
        number = parseFloat(numeroLimpio.replace(/\./g, '').replace(',', '.'));
      } else if ((numeroLimpio.match(/\./g) || []).length > 1) {
        // Si tiene múltiples puntos, asumir que el último es el decimal
        const partes = numeroLimpio.split('.');
        const parteDecimal = partes.pop();
        const parteEntera = partes.join('');
        number = parseFloat(`${parteEntera}.${parteDecimal}`);
      } else {
        // Si solo tiene un punto o ninguno
        number = parseFloat(numeroLimpio);
      }
    }
    
    // Asegurarse de que sea un número válido
    if (isNaN(number)) return "0";
    
    // Formatear el número con separadores de miles
    return number.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Función para formatear duración en minutos a formato legible
   * @param {number} minutos - Duración en minutos
   * @returns {string} Duración formateada (ej: "1 h 30 min")
   */
  const formatDuracion = (minutos) => {
    if (!minutos) return "0 min"
    if (minutos < 60) {
      return `${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      const min = minutos % 60
      return min > 0 ? `${horas} h ${min} min` : `${horas} h`
    }
  }

  /**
   * Función para formatear fecha ISO a formato legible
   * @param {string} fechaISO - Fecha en formato ISO o cualquier otro formato
   * @returns {string} Fecha formateada (ej: "30/04/2025")
   */
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Sin fecha";
    
    try {
      // Intentar extraer la fecha de diferentes formatos
      let fecha;
      
      if (fechaISO.includes('T')) {
        // Formato ISO: 2025-04-30T22:30:00.000Z
        fecha = fechaISO.split('T')[0];
      } else if (fechaISO.includes(' ')) {
        // Formato con espacio: 2025-04-30 22:30:00
        fecha = fechaISO.split(' ')[0];
      } else {
        // Asumir que ya es solo fecha: 2025-04-30
        fecha = fechaISO;
      }
      
      // Dividir en componentes
      const [year, month, day] = fecha.split('-');
      
      // Formatear como DD/MM/YYYY
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return fechaISO; // Devolver el original si hay error
    }
  }

  /**
   * Función para formatear hora de diferentes formatos
   * @param {string} horaString - Hora en cualquier formato
   * @returns {string} Hora formateada (ej: "15:30")
   */
  const formatearHora = (horaString) => {
    if (!horaString) return "Sin hora";
    
    try {
      let hora;
      
      if (horaString.includes('T')) {
        // Formato ISO: 2025-04-30T22:30:00.000Z
        hora = horaString.split('T')[1].substring(0, 5);
      } else if (horaString.includes(' ')) {
        // Formato con espacio: 2025-04-30 22:30:00
        hora = horaString.split(' ')[1].substring(0, 5);
      } else if (horaString.includes(':')) {
        // Ya es formato hora: 22:30:00
        hora = horaString.substring(0, 5);
      } else {
        return horaString; // No se puede formatear
      }
      
      return hora;
    } catch (error) {
      console.error("Error al formatear hora:", error);
      return horaString; // Devolver el original si hay error
    }
  }

  /**
   * Función para procesar correctamente el precio
   * @param {number|string} precio - Precio a procesar
   * @returns {number} Precio como número
   */
  const procesarPrecio = (precio) => {
    if (precio === null || precio === undefined) return 0;
    
    // Si es string, convertir a número
    if (typeof precio === 'string') {
      // Eliminar el símbolo $ y cualquier otro carácter no numérico excepto puntos y comas
      const numeroLimpio = precio.replace(/[^\d.,]/g, '');
      
      // Determinar si el formato original usa punto como separador decimal o de miles
      if (numeroLimpio.includes(',')) {
        // Si tiene coma como separador decimal (ej: "35.000,00")
        // Reemplazar puntos por nada (eliminar separadores de miles) y coma por punto
        return parseFloat(numeroLimpio.replace(/\./g, '').replace(',', '.'));
      } else if ((numeroLimpio.match(/\./g) || []).length > 1) {
        // Si tiene múltiples puntos, asumir que el último es el decimal
        const partes = numeroLimpio.split('.');
        const parteDecimal = partes.pop();
        const parteEntera = partes.join('');
        return parseFloat(`${parteEntera}.${parteDecimal}`);
      } else {
        // Si solo tiene un punto o ninguno
        return parseFloat(numeroLimpio);
      }
    }
    
    // Si ya es un número, devolverlo
    return precio;
  }

  // Definición de columnas para la tabla
  const columns = [
    { 
      field: "cliente", 
      header: "Cliente",
      render: (row) => row.cliente?.nombre || "Sin cliente" 
    },
    { 
      field: "fecha", 
      header: "Fecha",
      render: (row) => {
        // Extraer y formatear la fecha
        if (row.Fecha) {
          return formatearFecha(row.Fecha);
        }
        return formatearFecha(row.fecha) || "Sin fecha";
      }
    },
    { 
      field: "hora", 
      header: "Hora",
      render: (row) => {
        // Extraer y formatear la hora
        if (row.Fecha) {
          return formatearHora(row.Fecha);
        }
        return formatearHora(row.hora) || "Sin hora";
      }
    },
    {
      field: "precio",
      header: "Precio Total",
      render: (row) => {
        let precioTotal = 0;
        if (row.servicios && row.servicios.length > 0) {
          precioTotal = row.servicios.reduce((total, s) => {
            const precio = procesarPrecio(s.Precio || s.precio || 0);
            return total + (isNaN(precio) ? 0 : precio);
          }, 0);
        }
        return `$${formatNumber(precioTotal)}`;
      }
    },
    {
      field: "estado",
      header: "Estado",
      render: (row) => (
        <span
          className={`badge ${
            row.Estado === "Programada" || row.estado === "Programada"
              ? "bg-warning"
              : row.Estado === "Confirmada" || row.estado === "Confirmada"
                ? "bg-primary"
                : row.Estado === "Completada" || row.estado === "Completada"
                  ? "bg-success"
                  : "bg-danger"
          }`}
        >
          {row.Estado || row.estado || "Programada"}
        </span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", (row.Estado !== "Cancelada" && row.estado !== "Cancelada") ? "cancel" : null]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onCancel={handleCancel}
          customLabels={{
            cancel: "Cancelar cita",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una cita
   * @param {Object} cita - Objeto de cita a visualizar
   */
  const handleView = (cita) => {
    setIsProcessing(true) // Mostrar LoadingOverlay
    setProcessingMessage("Cargando detalles de la cita...") // Mensaje para el LoadingOverlay
    
    try {
      setCurrentCita(cita)
      setModalTitle("Ver Detalles de la Cita")
      setShowModal(true)
    } catch (error) {
      console.error("Error al cargar detalles de la cita:", error)
      
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "No se pudieron cargar los detalles de la cita.",
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  /**
   * Manejador para editar una cita
   * Redirige a la vista de NuevaCita con el ID de la cita a editar
   * @param {Object} cita - Objeto de cita a editar
   */
  const handleEdit = (cita) => {
    // Redirigir a la vista de edición
    navigate(`/servicios/NuevaCita?id=${cita.IdCita || cita.id}`)
  }

  /**
   * Manejador para iniciar el proceso de cancelación de una cita
   * @param {Object} cita - Objeto de cita a cancelar
   */
  const handleCancel = (cita) => {
    // Solo permitir cancelar citas que no estén ya canceladas
    if (cita.Estado === "Cancelada" || cita.estado === "Cancelada") {
      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Esta cita ya está cancelada.",
      }
      showPendingToast()
      return
    }

    setCitaToCancel(cita)
    setShowCancelConfirm(true)
  }

  /**
   * Función para confirmar la cancelación de la cita
   * Actualiza el estado de la cita a "Cancelada"
   */
  const confirmCancel = async () => {
    if (citaToCancel) {
      setShowCancelConfirm(false)
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Cancelando cita...") // Mensaje para el LoadingOverlay
      
      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false
      
      try {
        // Actualizar el estado local primero para garantizar la respuesta inmediata en la UI
        const updatedCitas = citas.map((c) => {
          if ((c.IdCita || c.id) === (citaToCancel.IdCita || citaToCancel.id)) {
            return {
              ...c,
              Estado: "Cancelada",
              estado: "Cancelada"
            }
          }
          return c
        })
        
        setCitas(updatedCitas)
        
        // Intentar llamar a la API para cambiar el estado de la cita
        try {
          // Usar la ruta correcta según el controlador y las rutas definidas
          await CitasService.cambiarEstadoCita(citaToCancel.IdCita || citaToCancel.id, "Cancelada")
          console.log("Cita cancelada exitosamente en el servidor")
        } catch (apiError) {
          console.error("Error al llamar a la API:", apiError)
          // Si falla la API, ya tenemos actualizado el estado local
          console.log("Estado local ya actualizado, pero hubo un error en la API")
        }

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: "La cita ha sido cancelada correctamente.",
        }
      } catch (error) {
        console.error("Error al cancelar la cita:", error)
        
        // Guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "No se pudo cancelar la cita. Por favor, intente nuevamente.",
        }
      } finally {
        setIsProcessing(false) // Ocultar LoadingOverlay
        showPendingToast() // Mostrar cualquier notificación pendiente
      }
    }
    setCitaToCancel(null)
  }

  /**
   * Función para cancelar el proceso de cancelación de cita
   */
  const cancelCancel = () => {
    setShowCancelConfirm(false)
    setCitaToCancel(null)
  }

  /**
   * Manejador para cerrar el modal de detalles
   */
  const handleCloseDetallesModal = () => {
    setShowModal(false)
    setCurrentCita(null)
  }

  /**
   * Manejador para redirigir a la vista de agendar cita
   */
  const handleAddCita = () => {
    navigate("/servicios/NuevaCita")
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("detallesCitaModal")

    if (showModal && modalElement) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowModal(false)
      setCurrentCita(null)

      // Asegurarse de que se elimine cualquier backdrop residual
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) {
        backdrop.remove()
      }
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      if (modalInstance) {
        modalInstance.hide()
      }

      // Asegurarse de que se elimine cualquier backdrop residual al desmontar
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) {
        backdrop.remove()
      }
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [showModal])

  /**
   * Efecto para cargar los datos iniciales
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Cargar citas
        const citasResponse = await CitasService.obtenerCitas()
        console.log("Citas cargadas:", citasResponse)
        
        // Cargar clientes para obtener información adicional
        const clientesResponse = await CitasService.obtenerClientes()
        setClientes(clientesResponse)
        
        // Cargar servicios para obtener información adicional
        const serviciosResponse = await CitasService.obtenerServicios()
        
        // Corregir los precios de los servicios
        const serviciosCorregidos = serviciosResponse.map(servicio => {
          return {
            ...servicio,
            Precio: procesarPrecio(servicio.Precio)
          };
        });
        
        setServicios(serviciosCorregidos)
        
        // Procesar las citas para mostrarlas en la tabla
        const citasProcesadas = await Promise.all(citasResponse.map(async (cita) => {
          // Buscar cliente
          const cliente = clientesResponse.find(c => c.IdCliente === cita.IdCliente)
          
          // Obtener servicios de la cita si no vienen incluidos
          let serviciosCita = cita.servicios || []
          if (!serviciosCita.length && cita.IdCita) {
            try {
              // Aquí deberíamos tener un endpoint para obtener los servicios de una cita específica
              // Como no lo tenemos implementado, usamos los servicios que ya tenemos
              serviciosCita = serviciosCorregidos.filter(s => 
                cita.serviciosIds?.includes(s.IdServicio) || 
                cita.servicios?.some(cs => cs.IdServicio === s.IdServicio)
              )
            } catch (error) {
              console.error(`Error al obtener servicios de la cita ${cita.IdCita}:`, error)
            }
          }
          
          return {
            ...cita,
            id: cita.IdCita || cita.id,
            cliente: cliente ? {
              id: cliente.IdCliente,
              nombre: `${cliente.Nombre} ${cliente.Apellido || ''}`,
              telefono: cliente.Telefono
            } : { nombre: "Cliente no encontrado" },
            servicios: serviciosCita.map(s => ({
              id: s.IdServicio,
              nombre: s.Nombre,
              precio: procesarPrecio(s.Precio),
              duracion: s.Duracion
            }))
          }
        }))
        
        console.log("Citas procesadas:", citasProcesadas)
        setCitas(citasProcesadas)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        
        // Guardar el toast para después
        pendingToastRef.current = {
          type: "error",
          message: "Error al cargar los datos. Por favor, intente nuevamente.",
        }
      } finally {
        setIsLoading(false)
        showPendingToast() // Mostrar cualquier notificación pendiente
      }
    }

    fetchData()
  }, [])

  return (
    <div className="citas-container">
      <h2 className="mb-4">Gestión de Citas</h2>

      <DataTable
        columns={columns}
        data={citas}
        onAdd={handleAddCita}
        addButtonLabel="Agendar Cita"
        searchPlaceholder="Buscar citas..."
        loading={isLoading}
      />

      {/* Corregir el ConfirmDialog para evitar anidación de <p> */}
      <ConfirmDialog
        show={showCancelConfirm}
        title="Confirmar cancelación"
        message={
          <span className="d-flex align-items-center">
            <AlertTriangle size={24} className="text-danger me-3" />
            <span>
              ¿Está seguro de cancelar la cita para {citaToCancel?.cliente?.nombre} el día {formatearFecha(citaToCancel?.fecha || citaToCancel?.Fecha)} a
              las {formatearHora(citaToCancel?.hora || citaToCancel?.Fecha)}?
            </span>
          </span>
        }
        type="danger"
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />

      {/* Modal para Ver Detalles de la Cita */}
      <div
        className="modal fade"
        id="detallesCitaModal"
        tabIndex="-1"
        aria-labelledby="detallesCitaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="detallesCitaModalLabel">
                {modalTitle}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseDetallesModal}
              ></button>
            </div>
            <div className="modal-body">
              {currentCita && (
                <div className="cita-details">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="detail-group">
                        <label className="detail-label">Cliente:</label>
                        <div className="detail-value d-flex align-items-center">
                          <User size={18} className="me-2 text-primary" />
                          <strong>{currentCita.cliente?.nombre || "Sin cliente"}</strong>
                        </div>
                      </div>
                      <div className="detail-group mt-3">
                        <label className="detail-label">Teléfono:</label>
                        <div className="detail-value">
                          {currentCita.cliente?.telefono || "No disponible"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="detail-group">
                        <label className="detail-label">Fecha:</label>
                        <div className="detail-value d-flex align-items-center">
                          <Calendar size={18} className="me-2 text-primary" />
                          <strong>{formatearFecha(currentCita.fecha || currentCita.Fecha)}</strong>
                        </div>
                      </div>
                      <div className="detail-group mt-3">
                        <label className="detail-label">Hora:</label>
                        <div className="detail-value d-flex align-items-center">
                          <Clock size={18} className="me-2 text-primary" />
                          <strong>{formatearHora(currentCita.hora || currentCita.Fecha)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="mb-3 text-primary">Servicios</h6>
                  <div className="row mb-4">
                    <div className="col-12">
                      {currentCita.servicios && currentCita.servicios.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Servicio</th>
                                <th>Duración</th>
                                <th>Precio</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentCita.servicios.map((servicio, index) => {
                                // Procesar el precio para asegurarse de que sea un número
                                const precio = procesarPrecio(servicio.precio || servicio.Precio || 0);
                                
                                return (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <Scissors size={16} className="me-2 text-primary" />
                                        {servicio.nombre || servicio.NombreServicio || "Servicio sin nombre"}
                                      </div>
                                    </td>
                                    <td>{formatDuracion(servicio.duracion || servicio.Duracion || 0)}</td>
                                    <td>${formatNumber(precio)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          No hay servicios asociados a esta cita
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="detail-group">
                        <label className="detail-label">Duración Total:</label>
                        <div className="detail-value">
                          <strong>
                            {formatDuracion(
                              currentCita.servicios?.reduce(
                                (total, servicio) => total + (servicio.duracion || servicio.Duracion || 0), 
                                0
                              ) || 0
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="detail-group">
                        <label className="detail-label">Precio Total:</label>
                        <div className="detail-value">
                          <strong className="text-success">
                            ${formatNumber(
                              currentCita.servicios?.reduce(
                                (total, servicio) => {
                                  const precio = procesarPrecio(servicio.precio || servicio.Precio || 0);
                                  return total + (isNaN(precio) ? 0 : precio);
                                }, 
                                0
                              ) || 0
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="detail-group">
                        <label className="detail-label">Estado:</label>
                        <div className="detail-value">
                          <span
                            className={`badge ${
                              (currentCita.Estado || currentCita.estado) === "Programada"
                                ? "bg-warning"
                                : (currentCita.Estado || currentCita.estado) === "Confirmada"
                                  ? "bg-primary"
                                  : (currentCita.Estado || currentCita.estado) === "Completada"
                                    ? "bg-success"
                                    : "bg-danger"
                            } p-2`}
                          >
                            {currentCita.Estado || currentCita.estado || "Programada"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(currentCita.notas || currentCita.NotasAdicionales) && (
                    <>
                      <hr className="my-4" />
                      <div className="row">
                        <div className="col-12">
                          <div className="detail-group">
                            <label className="detail-label">Notas:</label>
                            <div className="detail-value notes p-3 bg-light rounded">
                              {currentCita.notas || currentCita.NotasAdicionales}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleCloseDetallesModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Añadir LoadingOverlay */}
      <LoadingOverlay
        isLoading={isProcessing}
        message={processingMessage}
        variant="primary"
        onHide={showPendingToast}
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable
        theme="light"
        limit={1}
      />
    </div>
  )
}

export default AgendarCitas