"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Proveedores.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import ProveedorForm from "../../../Components/AdminComponents/ProveedoresComponents/ProveedorForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/ProveedoresComponents/DeleteConfirmModal"
import proveedoresService from "../../../Services/ConsumoAdmin/ProveedoresService.js"

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Proveedor")
  const [currentProveedor, setCurrentProveedor] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(false)

  const [formData, setFormData] = useState({
    documento: "",
    correo: "",
    nombreEmpresa: "",
    personaDeContacto: "",
    telefono: "",
    direccion: "",
  })

  const [formErrors, setFormErrors] = useState({
    documento: "",
    correo: "",
    nombreEmpresa: "",
    personaDeContacto: "",
    telefono: "",
    direccion: "",
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOperations, setPendingOperations] = useState({})
  const toastIds = useRef({})

  // Limpiar notificaciones
  const clearAllToasts = () => {
    toast.dismiss()
  }

  useEffect(() => {
    clearAllToasts()
    return () => {
      clearAllToasts()
    }
  }, [])

  // Cargar proveedores con dependencia en reloadTrigger
  useEffect(() => {
    const fetchProveedores = async () => {
      setIsLoading(true)
      try {
        const data = await proveedoresService.getAll()
        console.log("Proveedores recibidos:", data)

        const proveedoresEstados = JSON.parse(localStorage.getItem("proveedoresEstados") || "{}")

        const proveedoresConEstadoActualizado = data.map((proveedor) => {
          const proveedorId = proveedor.id || proveedor.IdProveedor
          const estadoGuardado = proveedoresEstados[proveedorId]
          if (estadoGuardado) {
            return {
              ...proveedor,
              estado: estadoGuardado,
            }
          }
          return proveedor
        })

        setProveedores(proveedoresConEstadoActualizado)
      } catch (error) {
        console.error("Error al cargar los proveedores:", error)
        toast.error("Error al cargar los proveedores. Por favor, intente nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProveedores()
  }, [reloadTrigger])

  const columns = [
    { field: "nombreEmpresa", header: "Nombre Empresa" },
    { field: "personaDeContacto", header: "Persona de Contacto" },
    { field: "documento", header: "Documento" },
    { field: "telefono", header: "Teléfono" },
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

  const handleView = (proveedor) => {
    setCurrentProveedor(proveedor)
    setModalTitle("Ver Detalles del Proveedor")
    setFormData({
      documento: proveedor.documento,
      correo: proveedor.correo,
      nombreEmpresa: proveedor.nombreEmpresa,
      personaDeContacto: proveedor.personaDeContacto,
      telefono: proveedor.telefono,
      direccion: proveedor.direccion,
    })
    setFormErrors({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    })
    setShowModal(true)
  }

  const handleEdit = (proveedor) => {
    setCurrentProveedor(proveedor)
    setModalTitle("Editar Proveedor")
    setFormData({
      documento: proveedor.documento,
      correo: proveedor.correo,
      nombreEmpresa: proveedor.nombreEmpresa,
      personaDeContacto: proveedor.personaDeContacto,
      telefono: proveedor.telefono,
      direccion: proveedor.direccion,
    })
    setFormErrors({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (proveedor) => {
    try {
      const proveedorId = proveedor.id || proveedor.IdProveedor

      if (!proveedorId) {
        proveedor.id = `temp_${Date.now()}`
        proveedor.IdProveedor = proveedor.id
      }

      if (pendingOperations[proveedorId]) {
        toast.info("Por favor, espere a que se complete la operación anterior")
        return
      }

      const nuevoEstado = proveedor.estado === "Activo" ? "Inactivo" : "Activo"

      setPendingOperations((prev) => ({ ...prev, [proveedorId]: true }))
      toast.dismiss()

      const timestamp = Date.now()
      const loadingToastId = toast.loading(
        <div>
          <strong>Actualizando estado</strong>
          <p>Cambiando estado del proveedor "{proveedor.nombreEmpresa}"...</p>
        </div>,
        { position: "top-right", toastId: `loading-${timestamp}` }
      )

      // Actualizar estado local primero
      setProveedores(prevProveedores =>
        prevProveedores.map((p) => {
          if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
            return { ...p, estado: nuevoEstado }
          }
          return p
        })
      )

      try {
        const resultado = await proveedoresService.updateStatus(proveedorId, nuevoEstado)

        if (resultado.IdProveedor && resultado.IdProveedor !== proveedorId) {
          setProveedores(prevProveedores =>
            prevProveedores.map((p) => {
              if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
                return {
                  ...p,
                  id: resultado.IdProveedor,
                  IdProveedor: resultado.IdProveedor,
                  estado: resultado.estado || nuevoEstado,
                }
              }
              return p
            })
          )
        }

        toast.dismiss(loadingToastId)
        const newStatus = proveedor.estado === "Activo" ? "inactivo" : "activo"

        toast.success(
          <div>
            <strong>Estado actualizado</strong>
            <p>El proveedor "{proveedor.nombreEmpresa}" ahora está {newStatus}.</p>
          </div>,
          {
            icon: "🔄",
            position: "top-right",
            autoClose: 3000,
            toastId: `status-${Date.now()}`,
          }
        )
      } catch (error) {
        console.error("Error al cambiar estado del proveedor:", error)
        toast.dismiss(loadingToastId)
        toast.warning(
          <div>
            <strong>Estado actualizado localmente</strong>
            <p>El estado se ha actualizado en la interfaz, pero hubo un problema al sincronizar con el servidor.</p>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            toastId: `warning-${Date.now()}`,
          }
        )
      } finally {
        setPendingOperations((prev) => {
          const newState = { ...prev }
          delete newState[proveedorId]
          return newState
        })
      }
    } catch (error) {
      console.error("Error al cambiar estado del proveedor:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo cambiar el estado del proveedor. Por favor, intente nuevamente.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          toastId: `error-${Date.now()}`,
        }
      )
    }
  }

  const handleDelete = (proveedor) => {
    setProveedorToDelete(proveedor)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (proveedorToDelete) {
      try {
        const proveedorId = proveedorToDelete.id || proveedorToDelete.IdProveedor

        if (!proveedorId) {
          console.error("Error: Proveedor sin ID válido", proveedorToDelete)
          toast.error("Error: No se puede eliminar un proveedor sin ID válido")
          setShowDeleteConfirm(false)
          setProveedorToDelete(null)
          return
        }

        await proveedoresService.delete(proveedorId)
        
        setProveedores(prevProveedores => 
          prevProveedores.filter((p) => p.id !== proveedorId && p.IdProveedor !== proveedorId)
        )

        const toastId = toast.info(
          <div>
            <strong>Proveedor eliminado</strong>
            <p>El proveedor "{proveedorToDelete.nombreEmpresa}" ha sido eliminado correctamente.</p>
          </div>,
          {
            icon: "🗑️",
            position: "top-right",
            autoClose: 3000,
            toastId: `delete-${Date.now()}`,
          }
        )

        toastIds.current.delete = toastId
      } catch (error) {
        console.error("Error al eliminar proveedor:", error)
        if (error.response && error.response.status === 400) {
          toast.error(
            <div>
              <strong>No se puede eliminar</strong>
              <p>{error.response.data.message}</p>
            </div>
          )
        } else {
          toast.error("Error al eliminar el proveedor. Por favor, intente nuevamente.")
        }
      }
    }
    setShowDeleteConfirm(false)
    setProveedorToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setProveedorToDelete(null)
  }

  const handleAddProveedor = () => {
    setCurrentProveedor(null)
    setModalTitle("Agregar Proveedor")
    setFormData({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    })
    setFormErrors({
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
  }

  const validateForm = () => {
    let isValid = true
    const errors = {
      documento: "",
      correo: "",
      nombreEmpresa: "",
      personaDeContacto: "",
      telefono: "",
      direccion: "",
    }

    if (!formData.nombreEmpresa.trim()) {
      errors.nombreEmpresa = "El nombre de la empresa es obligatorio"
      isValid = false
    } else if (formData.nombreEmpresa.trim().length > 100) {
      errors.nombreEmpresa = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    }

    if (!formData.personaDeContacto.trim()) {
      errors.personaDeContacto = "La persona de contacto es obligatoria"
      isValid = false
    } else if (formData.personaDeContacto.trim().length > 100) {
      errors.personaDeContacto = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    }

    if (!formData.documento.trim()) {
      errors.documento = "El documento es obligatorio"
      isValid = false
    } else {
      const documentoRegex = /^[0-9]{6,12}(-[0-9kK])?$/
      if (!documentoRegex.test(formData.documento.trim())) {
        errors.documento = "El documento debe tener un formato válido (ej: 900123456-7)"
        isValid = false
      } else {
        const documentoExiste = proveedores.some(
          (p) =>
            p.documento.toLowerCase() === formData.documento.trim().toLowerCase() &&
            (!currentProveedor || p.id !== currentProveedor.id)
        )

        if (documentoExiste) {
          errors.documento = "Ya existe un proveedor con este documento"
          isValid = false
        }
      }
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
      isValid = false
    } else {
      const telefonoRegex = /^[0-9]{7,10}$/
      if (!telefonoRegex.test(formData.telefono.replace(/\s+/g, ""))) {
        errors.telefono = "El teléfono debe tener entre 7 y 10 dígitos"
        isValid = false
      }
    }

    if (formData.correo.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo.trim())) {
        errors.correo = "El correo electrónico no tiene un formato válido"
        isValid = false
      }
    }

    if (formData.direccion.trim() && formData.direccion.trim().length > 200) {
      errors.direccion = "La dirección no puede exceder los 200 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSaveProveedor = async () => {
    if (!validateForm()) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, corrija los errores en el formulario.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          toastId: `error-form-${Date.now()}`,
        }
      )
      return
    }

    try {
      const proveedorData = {
        Documento: formData.documento.trim(),
        Correo: formData.correo.trim(),
        NombreEmpresa: formData.nombreEmpresa.trim(),
        PersonaDeContacto: formData.personaDeContacto.trim(),
        Telefono: formData.telefono.trim(),
        Direccion: formData.direccion.trim(),
        Estado: "Activo",
      }

      toast.dismiss()
      const timestamp = Date.now()
      const loadingToastId = toast.loading(
        <div>
          <strong>{currentProveedor ? "Actualizando" : "Creando"} proveedor</strong>
          <p>Por favor, espere...</p>
        </div>,
        {
          position: "top-right",
          toastId: `loading-${timestamp}`,
        }
      )

      try {
        if (currentProveedor) {
          const proveedorId = currentProveedor.id || currentProveedor.IdProveedor

          if (!proveedorId) {
            console.error("Error: Proveedor sin ID válido", currentProveedor)
            toast.error("Error: No se puede actualizar un proveedor sin ID válido")
            return
          }

          const idNumerico = Number.parseInt(proveedorId, 10)
          if (isNaN(idNumerico)) {
            console.error(`Error: ID de proveedor inválido: ${proveedorId}`)
            toast.error("Error: ID de proveedor inválido")
            return
          }

          // 1. Actualización optimista del estado local
          setProveedores(prevProveedores =>
            prevProveedores.map(p => {
              if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
                return {
                  ...p,
                  documento: formData.documento.trim(),
                  correo: formData.correo.trim(),
                  nombreEmpresa: formData.nombreEmpresa.trim(),
                  personaDeContacto: formData.personaDeContacto.trim(),
                  telefono: formData.telefono.trim(),
                  direccion: formData.direccion.trim(),
                }
              }
              return p
            })
          )

          // 2. Llamada al servidor para actualizar
          const updatedProveedor = await proveedoresService.update(idNumerico, proveedorData)

          // 3. Actualización con respuesta del servidor
          if (updatedProveedor) {
            setProveedores(prevProveedores =>
              prevProveedores.map(p => {
                if ((p.id && p.id === proveedorId) || (p.IdProveedor && p.IdProveedor === proveedorId)) {
                  return {
                    ...p,
                    ...updatedProveedor,
                    id: updatedProveedor.id || updatedProveedor.IdProveedor || proveedorId,
                    IdProveedor: updatedProveedor.id || updatedProveedor.IdProveedor || proveedorId,
                  }
                }
                return p
              })
            )
          }

          toast.dismiss(loadingToastId)
          toast.success(
            <div>
              <strong>Proveedor actualizado</strong>
              <p>El proveedor "{formData.nombreEmpresa}" ha sido actualizado correctamente.</p>
            </div>,
            {
              icon: "✏️",
              position: "top-right",
              autoClose: 3000,
              toastId: `edit-${Date.now()}`,
            }
          )
        } else {
          // Creación de nuevo proveedor
          const newProveedor = await proveedoresService.create(proveedorData)
          
          if (!newProveedor.id && !newProveedor.IdProveedor) {
            throw new Error("El servidor no devolvió un ID válido")
          }

          setProveedores(prevProveedores => [...prevProveedores, newProveedor])
          setReloadTrigger(prev => !prev)

          toast.dismiss(loadingToastId)
          toast.success(
            <div>
              <strong>Proveedor creado</strong>
              <p>El proveedor "{formData.nombreEmpresa}" ha sido creado correctamente.</p>
            </div>,
            {
              icon: "✅",
              position: "top-right",
              autoClose: 3000,
              toastId: `create-${Date.now()}`,
            }
          )
        }

        setShowModal(false)
      } catch (error) {
        toast.dismiss(loadingToastId)
        throw error
      }
    } catch (error) {
      console.error("Error al guardar proveedor:", error)
      let errorMessage = "Error al guardar el proveedor. Por favor, intente nuevamente."

      if (error.isEmailDuplicate) {
        errorMessage = "Ya existe un proveedor con este correo electrónico."
        setFormErrors({
          ...formErrors,
          correo: "Este correo electrónico ya está registrado",
        })
      } else if (error.isDocumentDuplicate) {
        errorMessage = "Ya existe un proveedor con este documento."
        setFormErrors({
          ...formErrors,
          documento: "Este documento ya está registrado",
        })
      } else if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message

          if (errorMessage.includes("Duplicate entry") && errorMessage.includes("CorreoProveedor")) {
            errorMessage = "Ya existe un proveedor con este correo electrónico."
            setFormErrors({
              ...formErrors,
              correo: "Este correo electrónico ya está registrado",
            })
          } else if (errorMessage.includes("Duplicate entry") && errorMessage.includes("Documento")) {
            errorMessage = "Ya existe un proveedor con este documento."
            setFormErrors({
              ...formErrors,
              documento: "Este documento ya está registrado",
            })
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(
        <div>
          <strong>Error</strong>
          <p>{errorMessage}</p>
          {error.response && error.response.status && (
            <p className="text-sm">Código de error: {error.response.status}</p>
          )}
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          toastId: `error-${Date.now()}`,
        }
      )
    }
  }

  return (
    <div className="proveedores-container">
      <h2 className="mb-4">Gestión de Proveedores</h2>

      <DataTable
        columns={columns}
        data={proveedores}
        onAdd={handleAddProveedor}
        addButtonLabel="Agregar Proveedor"
        searchPlaceholder="Buscar proveedores..."
        loading={isLoading}
      />

      <ProveedorForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveProveedor}
        onClose={handleCloseModal}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        proveedor={proveedorToDelete}
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
        containerId="proveedores-toast-container"
        enableMultiContainer={true}
      />
    </div>
  )
}

export default Proveedores