"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/TiposServicios.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import TipoServicioForm from "../../../Components/AdminComponents/TiposDeServicioComponents/TipoServicioForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/TiposDeServicioComponents/DeleteConfirmModal"
import tiposServicioService from "../../../services/ConsumoAdmin/tiposServicioService.js"

/**
 * Componente para la gestión de tipos de servicios
 * Permite crear, ver, editar, activar/desactivar y eliminar tipos de servicios
 */
const TiposServicios = () => {
  // Estado para los tipos de servicios
  const [tiposServicios, setTiposServicios] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Tipo de Servicio")
  const [currentTipoServicio, setCurrentTipoServicio] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  // Estado para los errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    descripcion: "",
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tipoServicioToDelete, setTipoServicioToDelete] = useState(null)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    fetchTiposServicios()
  }, [])

  /**
   * Función para cargar tipos de servicio desde la API
   */
  const fetchTiposServicios = async () => {
    setLoading(true)
    try {
      const data = await tiposServicioService.obtenerTodos()
      console.log("Datos recibidos de la API:", data) // Para depuración
      setTiposServicios(data)
    } catch (error) {
      console.error("Error al cargar tipos de servicio:", error)
      toast.error("No se pudieron cargar los tipos de servicio")
    } finally {
      setLoading(false)
    }
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "Nombre", header: "Nombre" }, // Cambiado de "nombre" a "Nombre"
    {
      field: "Estado", // Cambiado de "estado" a "Estado"
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado ? "bg-success" : "bg-danger"}`}>{row.Estado ? "Activo" : "Inactivo"}</span>
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
            toggleStatus: row.Estado ? "Desactivar" : "Activar", // Cambiado de "estado" a "Estado"
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un tipo de servicio
   * @param {Object} tipoServicio - Objeto de tipo de servicio a visualizar
   */
  const handleView = (tipoServicio) => {
    setCurrentTipoServicio(tipoServicio)
    setModalTitle("Ver Detalles del Tipo de Servicio")

    // Cargar datos del tipo de servicio en el formulario
    setFormData({
      nombre: tipoServicio.Nombre || "", // Cambiado de "nombre" a "Nombre"
      descripcion: tipoServicio.Descripcion || "", // Cambiado de "descripcion" a "Descripcion"
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
      descripcion: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para editar un tipo de servicio
   * @param {Object} tipoServicio - Objeto de tipo de servicio a editar
   */
  const handleEdit = (tipoServicio) => {
    setCurrentTipoServicio(tipoServicio)
    setModalTitle("Editar Tipo de Servicio")

    // Cargar datos del tipo de servicio en el formulario
    setFormData({
      nombre: tipoServicio.Nombre || "", // Cambiado de "nombre" a "Nombre"
      descripcion: tipoServicio.Descripcion || "", // Cambiado de "descripcion" a "Descripcion"
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
      descripcion: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para cambiar el estado de un tipo de servicio (Activo/Inactivo)
   * @param {Object} tipoServicio - Objeto de tipo de servicio a cambiar estado
   */
  const handleToggleStatus = async (tipoServicio) => {
    try {
      // Verificar que tipoServicio.IdTipoServicio existe
      if (!tipoServicio.IdTipoServicio) {
        console.error("Error: IdTipoServicio es undefined", tipoServicio)
        toast.error("No se pudo cambiar el estado: ID no válido")
        return
      }

      await tiposServicioService.cambiarEstado(tipoServicio.IdTipoServicio, !tipoServicio.Estado) // Cambiado de "id" a "IdTipoServicio" y "estado" a "Estado"

      // Actualizar la lista de tipos de servicio
      await fetchTiposServicios()

      // Añadir notificación
      const newStatus = tipoServicio.Estado ? "inactivo" : "activo" // Cambiado de "estado" a "Estado"

      // Descartar notificación anterior si existe
      if (toastIds.current.status) {
        toast.dismiss(toastIds.current.status)
      }

      toastIds.current.status = toast.success(
        <div>
          <strong>Estado actualizado</strong>
          <p>
            El tipo de servicio "{tipoServicio.Nombre}" ahora está {newStatus}. {/* Cambiado de "nombre" a "Nombre" */}
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
      console.error("Error al cambiar el estado:", error)
      toast.error("No se pudo cambiar el estado del tipo de servicio")
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación de un tipo de servicio
   * @param {Object} tipoServicio - Objeto de tipo de servicio a eliminar
   */
  const handleDelete = (tipoServicio) => {
    setTipoServicioToDelete(tipoServicio)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación de un tipo de servicio
   */
  const confirmDelete = async () => {
    if (tipoServicioToDelete) {
      try {
        // Verificar que tipoServicioToDelete.IdTipoServicio existe
        if (!tipoServicioToDelete.IdTipoServicio) {
          console.error("Error: IdTipoServicio es undefined", tipoServicioToDelete)
          toast.error("No se pudo eliminar: ID no válido")
          setShowDeleteConfirm(false)
          setTipoServicioToDelete(null)
          return
        }

        await tiposServicioService.eliminar(tipoServicioToDelete.IdTipoServicio) // Cambiado de "id" a "IdTipoServicio"

        // Actualizar la lista de tipos de servicio
        await fetchTiposServicios()

        // Añadir notificación
        if (toastIds.current.delete) {
          toast.dismiss(toastIds.current.delete)
        }

        toastIds.current.delete = toast.info(
          <div>
            <strong>Tipo de servicio eliminado</strong>
            <p>El tipo de servicio "{tipoServicioToDelete.Nombre}" ha sido eliminado correctamente.</p>{" "}
            {/* Cambiado de "nombre" a "Nombre" */}
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
        console.error("Error al eliminar:", error)
        toast.error("No se pudo eliminar el tipo de servicio")
      }
    }
    setShowDeleteConfirm(false)
    setTipoServicioToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setTipoServicioToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar tipo de servicio
   */
  const handleAddTipoServicio = () => {
    setCurrentTipoServicio(null)
    setModalTitle("Agregar Tipo de Servicio")

    // Resetear el formulario
    setFormData({
      nombre: "",
      descripcion: "",
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
      descripcion: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Manejador para cambios en los inputs del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar el error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = {
      nombre: "",
      descripcion: "",
    }

    // Validar nombre (requerido y único)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del tipo de servicio es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 100) {
      errors.nombre = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para el tipo de servicio actual en edición)
      const nombreExiste = tiposServicios.some(
        (t) =>
          t.Nombre && // Verificar que t.Nombre existe
          t.Nombre.toLowerCase() === formData.nombre.trim().toLowerCase() &&
          (!currentTipoServicio || t.IdTipoServicio !== currentTipoServicio.IdTipoServicio), // Cambiado de "id" a "IdTipoServicio"
      )
      if (nombreExiste) {
        errors.nombre = "Ya existe un tipo de servicio con este nombre"
        isValid = false
      }
    }

    // Validar descripción (opcional pero con longitud máxima)
    if (formData.descripcion && formData.descripcion.length > 500) {
      errors.descripcion = "La descripción no puede exceder los 500 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el tipo de servicio (crear nuevo o actualizar existente)
   * Valida los datos y envía la información
   */
  const handleSaveTipoServicio = async () => {
    // Validar el formulario
    if (!validateForm()) {
      // Mostrar notificación de error general
      if (toastIds.current.error) {
        toast.dismiss(toastIds.current.error)
      }

      toastIds.current.error = toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, corrija los errores en el formulario.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    try {
      // Asegurarse de que los datos estén en el formato correcto que espera la API
      const tipoServicioData = {
        Nombre: formData.nombre.trim(),
        Descripcion: formData.descripcion.trim(),
      }

      console.log("Enviando datos:", tipoServicioData) // Para depuración

      if (currentTipoServicio) {
        // Verificar que currentTipoServicio.IdTipoServicio existe
        if (!currentTipoServicio.IdTipoServicio) {
          console.error("Error: IdTipoServicio es undefined", currentTipoServicio)
          toast.error("No se pudo actualizar: ID no válido")
          return
        }

        // Actualizar tipo de servicio existente
        await tiposServicioService.actualizar(currentTipoServicio.IdTipoServicio, tipoServicioData) // Cambiado de "id" a "IdTipoServicio"
      } else {
        // Crear nuevo tipo de servicio
        await tiposServicioService.crear(tipoServicioData)
      }

      // Actualizar la lista de tipos de servicio
      await fetchTiposServicios()

      // Notificación de éxito
      const toastKey = currentTipoServicio ? "edit" : "create"
      const toastMessage = currentTipoServicio
        ? `El tipo de servicio "${formData.nombre.trim()}" ha sido actualizado correctamente.`
        : `El tipo de servicio "${formData.nombre.trim()}" ha sido creado correctamente.`
      const toastIcon = currentTipoServicio ? "✏️" : "✅"
      const toastTitle = currentTipoServicio ? "Tipo de servicio actualizado" : "Tipo de servicio creado"

      if (toastIds.current[toastKey]) {
        toast.dismiss(toastIds.current[toastKey])
      }

      toastIds.current[toastKey] = toast.success(
        <div>
          <strong>{toastTitle}</strong>
          <p>{toastMessage}</p>
        </div>,
        {
          icon: toastIcon,
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )

      // Cerrar el modal
      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar:", error)
      toast.error(
        currentTipoServicio ? "No se pudo actualizar el tipo de servicio" : "No se pudo crear el tipo de servicio",
      )
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("tipoServicioModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      // Si showModal es false y el modal está abierto, cerrarlo programáticamente
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
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
    <div className="tipos-servicios-container">
      <h2 className="mb-4">Gestión de Tipos de Servicios</h2>

      <DataTable
        columns={columns}
        data={tiposServicios}
        onAdd={handleAddTipoServicio}
        addButtonLabel="Agregar Tipo de Servicio"
        searchPlaceholder="Buscar tipos de servicios..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Tipo de Servicio */}
      <TipoServicioForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveTipoServicio}
        onClose={handleCloseModal}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        tipoServicio={tipoServicioToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

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

export default TiposServicios
