"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle } from "lucide-react"
import "../../../Styles/AdminStyles/Servicios.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
// Importar useNavigate para la redirección
import { useNavigate } from "react-router-dom"
// Importar el servicio de servicios
import serviciosService from "../../../Services/ConsumoAdmin/serviciosService.js"

/**
 * Componente para la gestión de servicios
 * Permite crear, ver, editar, activar/desactivar y eliminar servicios
 */
const Servicios = () => {
  // Estado para los servicios
  const [servicios, setServicios] = useState([])
  // Estado para indicar carga
  const [loading, setLoading] = useState(true)

  // Hook para navegación
  const navigate = useNavigate()

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Ver Detalles del Servicio")
  const [currentServicio, setCurrentServicio] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    beneficios: [],
    queIncluye: [],
    imagenes: [null, null, null, null],
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [servicioToDelete, setServicioToDelete] = useState(null)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  /**
   * Efecto para cargar datos iniciales
   * Implementación de la carga de servicios desde la API
   */
  useEffect(() => {
    fetchServicios()
  }, [])

  /**
   * Función para cargar servicios desde la API
   */
  const fetchServicios = async () => {
    setLoading(true)
    try {
      const data = await serviciosService.obtenerTodos()

      // Verificar si data es un array (respuesta directa) o tiene una estructura con data y pagination
      const serviciosData = Array.isArray(data) ? data : data.data || []

      // Transformar los datos al formato esperado por la tabla
      const serviciosFormateados = serviciosData.map((servicio) => ({
        id: servicio.IdServicio,
        nombre: servicio.Nombre,
        precio: servicio.Precio,
        duracion: servicio.Duracion,
        estado: servicio.Estado ? "Activo" : "Inactivo",
        // Datos adicionales para el modal de detalles
        descripcion: servicio.Descripcion,
        beneficios: servicio.Beneficios ? servicio.Beneficios.split(", ").filter((b) => b.trim()) : [],
        queIncluye: parseQueIncluye(servicio.Que_incluye),
        imagenes: servicio.Foto
          ? servicio.Foto.split("|")
              .map((url) => url.trim())
              .filter((url) => url)
          : [],
        // Datos originales para operaciones
        original: servicio,
      }))

      setServicios(serviciosFormateados)
    } catch (error) {
      console.error("Error al cargar servicios:", error)
      toast.error("No se pudieron cargar los servicios. Intente nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función para parsear el campo Que_incluye a un formato utilizable
   */
  const parseQueIncluye = (queIncluye) => {
    if (!queIncluye) return []

    try {
      return queIncluye.split(", ").map((item) => {
        const [nombre, valor] = item.split(": ")
        return { nombre, valor }
      })
    } catch (error) {
      console.error("Error al parsear Que_incluye:", error)
      return []
    }
  }

  /**
   * Función para formatear números con separadores de miles
   * @param {number} number - Número a formatear
   * @returns {string} Número formateado con separadores de miles
   */
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  /**
   * Función para formatear duración en minutos a formato legible
   * @param {number} minutos - Duración en minutos
   * @returns {string} Duración formateada (ej: "1 h 30 min")
   */
  const formatDuracion = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      const min = minutos % 60
      return min > 0 ? `${horas} h ${min} min` : `${horas} h`
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "nombre", header: "Nombre del Servicio" },
    {
      field: "precio",
      header: "Precio",
      render: (row) => `$${formatNumber(row.precio)}`,
    },
    {
      field: "duracion",
      header: "Duración",
      render: (row) => formatDuracion(row.duracion),
    },
    {
      field: "estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.estado === "Activo" ? "bg-success" : "bg-danger"}`}>{row.estado}</span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          customLabels={{
            toggleStatus: row.estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un servicio
   * @param {Object} servicio - Objeto de servicio a visualizar
   */
  const handleView = (servicio) => {
    setCurrentServicio(servicio)
    setModalTitle("Ver Detalles del Servicio")

    // Cargar datos del servicio en el formulario
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toString(),
      duracion: servicio.duracion.toString(),
      beneficios: servicio.beneficios || [],
      queIncluye: servicio.queIncluye || [],
      imagenes: servicio.imagenes || [null, null, null, null],
    })

    setShowModal(true)
  }

  /**
   * Manejador para editar un servicio
   * @param {Object} servicio - Objeto de servicio a editar
   */
  const handleEdit = (servicio) => {
    // Redirigir a la página de edición de servicio
    navigate(`/servicios/registrar-servicio?id=${servicio.id}`)
  }

  /**
   * Manejador para cambiar el estado de un servicio (Activo/Inactivo)
   * @param {Object} servicio - Objeto de servicio a cambiar estado
   */
  const handleToggleStatus = async (servicio) => {
    try {
      // Llamar a la API para cambiar el estado
      await serviciosService.cambiarEstado(servicio.id, servicio.estado !== "Activo")

      // Actualizar el estado local
      const updatedServicios = servicios.map((s) => {
        if (s.id === servicio.id) {
          return {
            ...s,
            estado: s.estado === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return s
      })

      setServicios(updatedServicios)

      // Añadir notificación
      const newStatus = servicio.estado === "Activo" ? "inactivo" : "activo"

      // Descartar notificación anterior si existe
      if (toastIds.current.status) {
        toast.dismiss(toastIds.current.status)
      }

      toastIds.current.status = toast.success(
        <div>
          <strong>Estado actualizado</strong>
          <p>
            El servicio "{servicio.nombre}" ahora está {newStatus}.
          </p>
        </div>,
        {
          icon: "🔄",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } catch (error) {
      console.error("Error al cambiar el estado del servicio:", error)
      toast.error("No se pudo cambiar el estado del servicio")
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación de un servicio
   * @param {Object} servicio - Objeto de servicio a eliminar
   */
  const handleDelete = (servicio) => {
    setServicioToDelete(servicio)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación de un servicio
   */
  const confirmDelete = async () => {
    if (servicioToDelete) {
      try {
        // Llamar a la API para eliminar el servicio
        await serviciosService.eliminar(servicioToDelete.id)

        // Actualizar el estado local
        const updatedServicios = servicios.filter((s) => s.id !== servicioToDelete.id)
        setServicios(updatedServicios)

        // Añadir notificación
        if (toastIds.current.delete) {
          toast.dismiss(toastIds.current.delete)
        }

        toastIds.current.delete = toast.info(
          <div>
            <strong>Servicio eliminado</strong>
            <p>El servicio "{servicioToDelete.nombre}" ha sido eliminado correctamente.</p>
          </div>,
          {
            icon: "🗑️",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )
      } catch (error) {
        console.error("Error al eliminar el servicio:", error)
        toast.error("No se pudo eliminar el servicio")
      }
    }
    setShowDeleteConfirm(false)
    setServicioToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setServicioToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar servicio
   */
  const handleAddServicio = () => {
    // Redirigir a la página de registro de servicio
    navigate("/servicios/registrar-servicio")
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("servicioModal")

    if (showModal && modalElement) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowModal(false)
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

  return (
    <div className="servicios-container">
      <h2 className="mb-4">Gestión de Servicios</h2>

      <DataTable
        columns={columns}
        data={servicios}
        onAdd={handleAddServicio}
        addButtonLabel="Agregar Servicio"
        searchPlaceholder="Buscar servicios..."
        loading={loading}
      />

      {/* Modal para Ver Detalles del Servicio */}
      <div
        className="modal fade"
        id="servicioModal"
        tabIndex="-1"
        aria-labelledby="servicioModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="servicioModalLabel">
                {modalTitle}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              {/* Aquí iría el contenido para ver detalles del servicio */}
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Nombre:</strong> {formData.nombre}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${formatNumber(formData.precio)}
                  </p>
                  <p>
                    <strong>Duración:</strong> {formatDuracion(formData.duracion)}
                  </p>
                </div>
                <div className="col-md-6">
                  {formData.imagenes && formData.imagenes[0] && (
                    <img
                      src={
                        typeof formData.imagenes[0] === "string"
                          ? formData.imagenes[0]
                          : URL.createObjectURL(formData.imagenes[0])
                      }
                      alt={formData.nombre}
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <p>
                    <strong>Descripción:</strong>
                  </p>
                  <p>{formData.descripcion || "Sin descripción"}</p>
                </div>
              </div>

              {/* Mostrar beneficios si existen */}
              {formData.beneficios && formData.beneficios.length > 0 && (
                <div className="row mt-3">
                  <div className="col-12">
                    <p>
                      <strong>Beneficios:</strong>
                    </p>
                    <ul className="list-group">
                      {formData.beneficios.map((beneficio, index) => (
                        <li key={index} className="list-group-item">
                          {beneficio}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Mostrar que incluye si existe */}
              {formData.queIncluye && formData.queIncluye.length > 0 && (
                <div className="row mt-3">
                  <div className="col-12">
                    <p>
                      <strong>Que Incluye:</strong>
                    </p>
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Elemento</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.queIncluye.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre}</td>
                            <td>{item.valor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${showDeleteConfirm ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button type="button" className="btn-close btn-close-white" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">¿Está seguro de eliminar el servicio "{servicioToDelete?.nombre}"?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </div>
  )
}

export default Servicios
