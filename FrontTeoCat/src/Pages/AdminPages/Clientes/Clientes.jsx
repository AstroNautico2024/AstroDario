"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Clientes.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import ClienteForm from "../../../Components/AdminComponents/ClientesComponents/ClienteForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/ClientesComponents/DeleteConfirmModal"
import clientesService from "../../../Services/ConsumoAdmin/ClientesService.js"

/**
 * Componente para la gestión de clientes
 * Permite visualizar, crear, editar y cambiar el estado de clientes en el sistema
 */
const Clientes = () => {
  // Estado para los clientes
  const [clientes, setClientes] = useState([])

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Cliente")
  const [currentCliente, setCurrentCliente] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState(null)

  // Estado para indicar carga de datos
  const [isLoading, setIsLoading] = useState(false)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  /**
   * Efecto para cargar datos iniciales
   * Implementa la llamada a la API para obtener clientes
   */
  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true)
      try {
        console.log("Iniciando carga de clientes...")
        const data = await clientesService.getAll()
        console.log("Clientes cargados exitosamente:", data)

        // Obtener estados guardados en localStorage
        const clientesEstados = JSON.parse(localStorage.getItem("clientesEstados") || "{}")

        // Aplicar estados guardados localmente
        const clientesConEstadoActualizado = data.map((cliente) => {
          const estadoGuardado = clientesEstados[cliente.IdCliente]
          if (estadoGuardado) {
            console.log(`Aplicando estado guardado para cliente ID ${cliente.IdCliente}:`, estadoGuardado)
            return {
              ...cliente,
              Estado: estadoGuardado,
            }
          }
          return cliente
        })

        setClientes(clientesConEstadoActualizado)
      } catch (error) {
        console.error("Error al cargar los clientes:", error)
        toast.error("Error al cargar los clientes. Por favor, intente nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientes()
  }, [])

  // Definición de columnas para la tabla
  const columns = [
    {
      field: "nombreCompleto",
      header: "Nombre",
      render: (row) => `${row.Nombre} ${row.Apellido}`,
    },
    { field: "Correo", header: "Correo" },
    { field: "Documento", header: "Documento" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => {
        // Asegurarse de que Estado sea siempre un string
        const estado =
          typeof row.Estado === "number" ? (row.Estado === 1 ? "Activo" : "Inactivo") : row.Estado || "Inactivo"

        return <span className={`badge ${estado === "Activo" ? "bg-success" : "bg-danger"}`}>{estado}</span>
      },
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", row.tieneVentas ? null : "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          customLabels={{
            toggleStatus: row.Estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un cliente
   * @param {Object} cliente - Objeto de cliente a visualizar
   */
  const handleView = (cliente) => {
    setCurrentCliente(cliente)
    setModalTitle("Ver Detalles del Cliente")

    // Cargar datos del cliente en el formulario
    setFormData({
      documento: cliente.Documento,
      correo: cliente.Correo,
      nombre: cliente.Nombre,
      apellido: cliente.Apellido,
      direccion: cliente.Direccion,
      telefono: cliente.Telefono,
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para editar un cliente
   * @param {Object} cliente - Objeto de cliente a editar
   */
  const handleEdit = (cliente) => {
    setCurrentCliente(cliente)
    setModalTitle("Editar Cliente")

    // Cargar datos del cliente en el formulario
    setFormData({
      documento: cliente.Documento,
      correo: cliente.Correo,
      nombre: cliente.Nombre,
      apellido: cliente.Apellido,
      direccion: cliente.Direccion,
      telefono: cliente.Telefono,
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    })

    setShowModal(true)
  }

  // Modificar la función handleToggleStatus para asegurar que el ID se pase correctamente
  const handleToggleStatus = async (cliente) => {
    try {
      // Verificar que el cliente tenga un ID válido
      if (!cliente.IdCliente) {
        console.error("Error: Cliente sin ID válido", cliente)
        toast.error("Error: No se puede cambiar el estado de un cliente sin ID válido")
        return
      }

      // Asegurarse de que el ID sea un número
      const idNumerico = Number.parseInt(cliente.IdCliente, 10)
      if (isNaN(idNumerico)) {
        console.error(`Error: ID de cliente inválido: ${cliente.IdCliente}`)
        toast.error("Error: ID de cliente inválido")
        return
      }

      const nuevoEstado = cliente.Estado === "Activo" ? "Inactivo" : "Activo"
      console.log(`Cambiando estado del cliente ID ${idNumerico} de ${cliente.Estado} a ${nuevoEstado}`)

      // Limpiar TODAS las notificaciones existentes
      toast.dismiss()

      // Mostrar notificación de carga con un ID único basado en timestamp
      const timestamp = Date.now()
      const loadingToastId = toast.loading(
        <div>
          <strong>Actualizando estado</strong>
          <p>
            Cambiando estado del cliente "{cliente.Nombre} {cliente.Apellido}"...
          </p>
        </div>,
        {
          position: "top-right",
          toastId: `loading-${timestamp}`,
        },
      )

      // Actualizar primero en el estado local para mejorar la experiencia de usuario
      setClientes((prevClientes) =>
        prevClientes.map((c) => {
          if (c.IdCliente === idNumerico) {
            return {
              ...c,
              Estado: nuevoEstado,
            }
          }
          return c
        }),
      )

      try {
        // Usar el método específico para actualizar el estado
        await clientesService.updateStatus(idNumerico, nuevoEstado)

        // Añadir notificación
        const newStatus = cliente.Estado === "Activo" ? "inactivo" : "activo"

        // Descartar notificación de carga de forma segura
        setTimeout(() => {
          toast.dismiss(loadingToastId)

          // Crear nueva notificación con un ID único
          toast.success(
            <div>
              <strong>Estado actualizado</strong>
              <p>
                El cliente "{cliente.Nombre} {cliente.Apellido}" ahora está {newStatus}.
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
              toastId: `status-${timestamp}`, // Usar un ID único basado en timestamp
            },
          )
        }, 300)
      } catch (error) {
        // Descartar notificación de carga en caso de error
        setTimeout(() => {
          toast.dismiss(loadingToastId)

          // Mostrar notificación de advertencia en lugar de error
          toast.warning(
            <div>
              <strong>Estado actualizado localmente</strong>
              <p>El estado se ha actualizado en la interfaz, pero hubo un problema al sincronizar con el servidor.</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `warning-${Date.now()}`,
            },
          )
        }, 300)
      }
    } catch (error) {
      console.error("Error al cambiar estado del cliente:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo cambiar el estado del cliente. Por favor, intente nuevamente.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-${Date.now()}`,
        },
      )
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación de un cliente
   * @param {Object} cliente - Objeto de cliente a eliminar
   */
  const handleDelete = async (cliente) => {
    // Verificar si el cliente tiene ventas o mascotas asociadas
    if (cliente.tieneVentas) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se puede eliminar el cliente porque tiene ventas asociadas.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-dependency-${Date.now()}`,
        },
      )
      return
    }

    try {
      // Verificar si el cliente tiene mascotas asociadas
      const mascotas = await clientesService.getMascotas(cliente.IdCliente)
      if (mascotas && mascotas.length > 0) {
        toast.error(
          <div>
            <strong>No se puede eliminar</strong>
            <p>No se puede eliminar el cliente porque tiene {mascotas.length} mascota(s) asociada(s).</p>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: `error-dependency-${Date.now()}`,
          },
        )
        return
      }

      // Si no tiene dependencias, mostrar el modal de confirmación
      setClienteToDelete(cliente)
      setShowDeleteConfirm(true)
    } catch (error) {
      console.error("Error al verificar dependencias del cliente:", error)

      // Si hay un error al verificar, mostrar el modal de todas formas
      // El servidor validará nuevamente al intentar eliminar
      setClienteToDelete(cliente)
      setShowDeleteConfirm(true)
    }
  }

  /**
   * Función para confirmar la eliminación de un cliente
   */
  const confirmDelete = async () => {
    if (clienteToDelete) {
      try {
        // Limpiar todas las notificaciones existentes
        toast.dismiss()

        // Mostrar notificación de carga
        const timestamp = Date.now()
        const loadingToastId = toast.loading(
          <div>
            <strong>Eliminando cliente</strong>
            <p>
              Procesando la eliminación del cliente "{clienteToDelete.Nombre} {clienteToDelete.Apellido}"...
            </p>
          </div>,
          {
            position: "top-right",
            toastId: `loading-${timestamp}`,
          },
        )

        try {
          // Eliminar en el servidor
          await clientesService.delete(clienteToDelete.IdCliente)

          // Actualizar estado local
          const updatedClientes = clientes.filter((c) => c.IdCliente !== clienteToDelete.IdCliente)
          setClientes(updatedClientes)

          // Descartar notificación de carga de forma segura
          setTimeout(() => {
            toast.dismiss(loadingToastId)

            // Añadir notificación de éxito
            toast.info(
              <div>
                <strong>Cliente eliminado</strong>
                <p>
                  El cliente "{clienteToDelete.Nombre} {clienteToDelete.Apellido}" ha sido eliminado correctamente.
                </p>
              </div>,
              {
                icon: "🗑️",
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                toastId: `delete-${timestamp}`,
              },
            )
          }, 300)
        } catch (error) {
          // Descartar notificación de carga en caso de error
          setTimeout(() => {
            toast.dismiss(loadingToastId)
            throw error
          }, 300)
        }
      } catch (error) {
        console.error("Error al eliminar cliente:", error)

        // Verificar si el error es por dependencias
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data &&
          (error.response.data.message?.toLowerCase().includes("mascota") ||
            error.response.data.message?.toLowerCase().includes("venta") ||
            error.response.data.message?.toLowerCase().includes("cita"))
        ) {
          toast.error(
            <div>
              <strong>No se puede eliminar</strong>
              <p>
                {error.response.data.message || "No se puede eliminar el cliente porque tiene dependencias asociadas."}
              </p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-dependency-${Date.now()}`,
            },
          )
        } else {
          toast.error(
            <div>
              <strong>Error</strong>
              <p>Error al eliminar el cliente. Por favor, intente nuevamente.</p>
              <p className="text-sm text-red-600">Detalles: {error.message || "Error desconocido"}</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-${Date.now()}`,
            },
          )
        }
      }
    }
    setShowDeleteConfirm(false)
    setClienteToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setClienteToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar cliente
   */
  const handleAddCliente = () => {
    setCurrentCliente(null)
    setModalTitle("Agregar Cliente")

    // Resetear el formulario
    setFormData({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    })

    // Resetear errores
    setFormErrors({
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
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
      documento: "",
      correo: "",
      nombre: "",
      apellido: "",
      direccion: "",
      telefono: "",
    }

    // Validar documento (requerido y formato)
    if (!formData.documento.trim()) {
      errors.documento = "El documento es obligatorio"
      isValid = false
    } else if (!/^\d{7,12}$/.test(formData.documento)) {
      errors.documento = "El documento debe tener entre 7 y 12 dígitos"
      isValid = false
    } else {
      // Verificar si el documento ya existe (excepto para el cliente actual en edición)
      const documentoExiste = clientes.some(
        (c) => c.Documento === formData.documento && (!currentCliente || c.IdCliente !== currentCliente.IdCliente),
      )
      if (documentoExiste) {
        errors.documento = "Este documento ya está registrado"
        isValid = false
      }
    }

    // Validar correo (requerido y formato)
    if (!formData.correo.trim()) {
      errors.correo = "El correo es obligatorio"
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo)) {
        errors.correo = "Formato de correo inválido"
        isValid = false
      } else {
        // Verificar si el correo ya existe (excepto para el cliente actual en edición)
        const correoExiste = clientes.some(
          (c) => c.Correo === formData.correo && (!currentCliente || c.IdCliente !== currentCliente.IdCliente),
        )
        if (correoExiste) {
          errors.correo = "Este correo ya está registrado"
          isValid = false
        }
      }
    }

    // Validar nombre (requerido)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 50) {
      errors.nombre = "El nombre no puede exceder los 50 caracteres"
      isValid = false
    }

    // Validar apellido (requerido)
    if (!formData.apellido.trim()) {
      errors.apellido = "El apellido es obligatorio"
      isValid = false
    } else if (formData.apellido.trim().length > 50) {
      errors.apellido = "El apellido no puede exceder los 50 caracteres"
      isValid = false
    }

    // Validar teléfono (requerido y formato)
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
      isValid = false
    } else if (!/^\d{7,10}$/.test(formData.telefono)) {
      errors.telefono = "El teléfono debe tener entre 7 y 10 dígitos"
      isValid = false
    }

    // Validar dirección (requerida)
    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es obligatoria"
      isValid = false
    } else if (formData.direccion.trim().length > 100) {
      errors.direccion = "La dirección no puede exceder los 100 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el cliente (crear nuevo o actualizar existente)
   * Valida los datos y envía la información
   */
  // Modificar la función handleSaveCliente para asegurar que el ID se mantenga después de actualizar
  const handleSaveCliente = async () => {
    // Validar el formulario
    if (!validateForm()) {
      // Mostrar notificación de error general
      toast.dismiss() // Limpiar notificaciones previas

      toast.error(
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
          toastId: `error-form-${Date.now()}`,
        },
      )
      return
    }

    try {
      // Preparar datos para enviar al servidor
      const clienteData = {
        Documento: formData.documento,
        Correo: formData.correo,
        Nombre: formData.nombre,
        Apellido: formData.apellido,
        Direccion: formData.direccion,
        Telefono: formData.telefono,
        Estado: "Activo",
      }

      // Limpiar todas las notificaciones existentes para evitar duplicados
      toast.dismiss()

      // Mostrar notificación de carga
      const loadingToastId = toast.loading(
        <div>
          <strong>{currentCliente ? "Actualizando" : "Creando"} cliente</strong>
          <p>Por favor, espere...</p>
        </div>,
        {
          position: "top-right",
          toastId: `loading-${Date.now()}`,
        },
      )

      let updatedCliente

      if (currentCliente) {
        // Actualizar cliente existente
        console.log("Actualizando cliente:", clienteData)
        updatedCliente = await clientesService.update(currentCliente.IdCliente, clienteData)

        // Asegurarnos que el cliente actualizado tenga el ID correcto
        const clienteConID = {
          ...updatedCliente,
          IdCliente: currentCliente.IdCliente, // Asegurar que el ID se mantenga
        }

        // Actualizar estado local
        const updatedClientes = clientes.map((c) => {
          if (c.IdCliente === currentCliente.IdCliente) {
            return clienteConID
          }
          return c
        })

        setClientes(updatedClientes)

        // Descartar notificación de carga
        toast.dismiss(loadingToastId)

        // Notificación de éxito para edición
        toast.success(
          <div>
            <strong>Cliente actualizado</strong>
            <p>
              El cliente "{formData.nombre} {formData.apellido}" ha sido actualizado correctamente.
            </p>
          </div>,
          {
            icon: "✏️",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: `edit-${Date.now()}`,
          },
        )
      } else {
        // Crear nuevo cliente
        console.log("Creando nuevo cliente:", clienteData)
        const newCliente = await clientesService.create(clienteData)

        // Actualizar estado local
        setClientes([...clientes, newCliente])

        // Descartar notificación de carga
        toast.dismiss(loadingToastId)

        // Notificación de éxito para creación
        toast.success(
          <div>
            <strong>Cliente creado</strong>
            <p>
              El cliente "{formData.nombre} {formData.apellido}" ha sido creado correctamente.
            </p>
          </div>,
          {
            icon: "✅",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: `create-${Date.now()}`,
          },
        )
      }

      // Cerrar el modal
      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar cliente:", error)

      // Mostrar mensaje de error más detallado
      let errorMessage = "Error al guardar el cliente. Por favor, intente nuevamente."

      // Verificar si es un error de documento duplicado
      if (
        error.isDocumentDuplicate ||
        (error.response &&
          error.response.data &&
          (error.response.data.message?.includes("Duplicate entry") ||
            error.response.data.error?.includes("Duplicate entry")))
      ) {
        errorMessage = "Ya existe un cliente con este número de documento."

        // Actualizar el error específico en el formulario
        setFormErrors({
          ...formErrors,
          documento: "Este documento ya está registrado",
        })
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }

      toast.error(
        <div>
          <strong>Error</strong>
          <p>{errorMessage}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-${Date.now()}`,
        },
      )
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("clienteModal")

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

  // Función para limpiar todas las notificaciones
  const clearAllToasts = () => {
    // Usar el ID de cada toast si está disponible
    Object.values(toastIds.current).forEach((id) => {
      if (id) toast.dismiss(id)
    })

    // Limpiar todas las demás notificaciones
    toast.dismiss()
  }

  // Limpiar notificaciones al montar y desmontar el componente
  useEffect(() => {
    // Limpiar todas las notificaciones al montar
    clearAllToasts()

    // Configurar un intervalo para limpiar notificaciones huérfanas cada 10 segundos
    const cleanupInterval = setInterval(() => {
      const toastContainers = document.querySelectorAll(".Toastify__toast-container")
      if (toastContainers.length > 1) {
        clearAllToasts()
      }
    }, 10000)

    // Limpiar todas las notificaciones al desmontar
    return () => {
      clearInterval(cleanupInterval)
      clearAllToasts()
    }
  }, [])

  return (
    <div className="clientes-container">
      <h2 className="mb-4">Gestión de Clientes</h2>

      <DataTable
        columns={columns}
        data={clientes}
        onAdd={handleAddCliente}
        addButtonLabel="Agregar Cliente"
        searchPlaceholder="Buscar clientes..."
        loading={isLoading}
      />

      {/* Modal para Agregar/Editar/Ver Cliente */}
      <ClienteForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSaveCliente={handleSaveCliente}
        handleCloseModal={handleCloseModal}
        isViewMode={modalTitle === "Ver Detalles del Cliente"}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        cliente={clienteToDelete}
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
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        limit={2}
        closeButton
        containerId="clientes-toast-container"
        enableMultiContainer={true}
      />
    </div>
  )
}

export default Clientes
