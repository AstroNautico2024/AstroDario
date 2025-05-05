"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Categorias.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import CategoryForm from "../../../Components/AdminComponents/CategoriasComponents/CategoryForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/CategoriasComponents/DeleteConfirmModal"
import CategoriasService from "../../../Services/ConsumoAdmin/CategoriasService.js"

/**
 * Componente para la gestión de categorías de productos
 * Permite crear, ver, editar, activar/desactivar y eliminar categorías
 */
const CategoriasProducto = () => {
  // Estado para las categorías
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Categoría")
  const [currentCategoria, setCurrentCategoria] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: "",
    descripcion: "",
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState(null)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias()

    // Limpiar todas las notificaciones al montar el componente
    toast.dismiss()

    return () => {
      // Limpiar todas las notificaciones al desmontar el componente
      toast.dismiss()
      // Limpiar referencias
      toastIds.current = {}
    }
  }, [])

  /**
   * Función para obtener todas las categorías desde la API
   */
  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await CategoriasService.getAll()

      // Transformar los datos de la API al formato esperado por el componente
      const formattedCategorias = data.map((cat) => ({
        id: cat.IdCategoriaDeProductos,
        nombre: cat.NombreCategoria,
        descripcion: cat.Descripcion || "",
        estado: cat.Estado ? "Activo" : "Inactivo",
      }))

      setCategorias(formattedCategorias)
    } catch (error) {
      console.error("Error al cargar categorías:", error)

      // Mostrar notificación de error
      showToast(
        "error",
        "Error",
        `No se pudieron cargar las categorías. ${error.response?.data?.message || error.message}`,
      )
    } finally {
      setLoading(false)
    }
  }

  // Función para mostrar notificaciones de manera consistente
  const showToast = (type, title, message, icon = null, autoClose = 4000) => {
    // Primero, cerrar TODAS las notificaciones existentes
    toast.dismiss()

    // Esperar un momento antes de mostrar la nueva notificación
    setTimeout(() => {
      toast[type](
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>,
        {
          icon: icon,
          position: "top-right",
          autoClose: autoClose,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        },
      )
    }, 300)
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "nombre", header: "Nombre" },
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
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una categoría
   */
  const handleView = (categoria) => {
    setCurrentCategoria(categoria)
    setModalTitle("Ver Detalles de la Categoría")

    // Cargar datos de la categoría en el formulario
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
      descripcion: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para editar una categoría
   */
  const handleEdit = (categoria) => {
    setCurrentCategoria(categoria)
    setModalTitle("Editar Categoría")

    // Cargar datos de la categoría en el formulario
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    })

    // Resetear errores
    setFormErrors({
      nombre: "",
      descripcion: "",
    })

    setShowModal(true)
  }

  /**
   * Manejador para cambiar el estado de una categoría
   */
  const handleToggleStatus = async (categoria) => {
    try {
      // Limpiar notificaciones existentes
      toast.dismiss()

      // Llamar a la API para cambiar el estado
      const newStatus = categoria.estado === "Activo" ? false : true
      await CategoriasService.changeStatus(categoria.id, newStatus)

      // Actualizar el estado local
      const updatedCategorias = categorias.map((c) => {
        if (c.id === categoria.id) {
          return {
            ...c,
            estado: c.estado === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return c
      })

      setCategorias(updatedCategorias)

      // Añadir notificación
      const statusText = categoria.estado === "Activo" ? "inactiva" : "activa"
      showToast(
        "success",
        "Estado actualizado",
        `La categoría "${categoria.nombre}" ahora está ${statusText}.`,
        "🔄",
        3000,
      )

      // Recargar las categorías para asegurar sincronización con el servidor
      await fetchCategorias()
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "No se pudo cambiar el estado de la categoría. Intente nuevamente.",
      )
    }
  }

  /**
   * Función para verificar si una categoría tiene productos asociados
   */
  const hasAssociatedProducts = async (categoriaId) => {
    try {
      const products = await CategoriasService.getProducts(categoriaId)
      return products.length > 0
    } catch (error) {
      console.error("Error al verificar productos asociados:", error)
      return false
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación
   */
  const handleDelete = async (categoria) => {
    try {
      // Verificar si hay productos asociados a esta categoría
      const hasProducts = await hasAssociatedProducts(categoria.id)

      if (hasProducts) {
        showToast(
          "error",
          "Error",
          `No se puede eliminar la categoría "${categoria.nombre}" porque tiene productos asociados.`,
        )
        return
      }

      setCategoriaToDelete(categoria)
      setShowDeleteConfirm(true)
    } catch (error) {
      console.error("Error al preparar eliminación:", error)
      showToast("error", "Error", "Ocurrió un error al procesar la solicitud. Intente nuevamente.")
    }
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (categoriaToDelete) {
      try {
        // Limpiar notificaciones existentes
        toast.dismiss()

        // Llamar a la API para eliminar la categoría
        await CategoriasService.delete(categoriaToDelete.id)

        // Actualizar el estado local
        const updatedCategorias = categorias.filter((c) => c.id !== categoriaToDelete.id)
        setCategorias(updatedCategorias)

        // Añadir notificación
        showToast(
          "info",
          "Categoría eliminada",
          `La categoría "${categoriaToDelete.nombre}" ha sido eliminada correctamente.`,
          "🗑️",
          3000,
        )

        // Recargar las categorías para asegurar sincronización con el servidor
        await fetchCategorias()
      } catch (error) {
        console.error("Error al eliminar categoría:", error)
        showToast(
          "error",
          "Error",
          error.response?.data?.message || "No se pudo eliminar la categoría. Intente nuevamente.",
        )
      }
    }
    setShowDeleteConfirm(false)
    setCategoriaToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setCategoriaToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar categoría
   */
  const handleAddCategoria = () => {
    setCurrentCategoria(null)
    setModalTitle("Agregar Categoría")

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
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar el error específico cuando el usuario comienza a escribir
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
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

    // Validar nombre (requerido y longitud)
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre de la categoría es obligatorio"
      isValid = false
    } else if (formData.nombre.trim().length > 50) {
      errors.nombre = "El nombre no puede exceder los 50 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para la categoría actual en edición)
      const nombreExiste = categorias.some(
        (cat) =>
          cat.nombre.toLowerCase() === formData.nombre.trim().toLowerCase() &&
          (!currentCategoria || cat.id !== currentCategoria.id),
      )
      if (nombreExiste) {
        errors.nombre = "Ya existe una categoría con este nombre"
        isValid = false
      }
    }

    // Validar descripción (opcional pero con longitud máxima)
    if (formData.descripcion && formData.descripcion.length > 255) {
      errors.descripcion = "La descripción no puede exceder los 255 caracteres"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar la categoría
   */
  const handleSaveCategoria = async () => {
    // Validar el formulario
    if (!validateForm()) {
      // Limpiar notificaciones existentes
      toast.dismiss()

      showToast("error", "Error", "Por favor, corrija los errores en el formulario.")
      return
    }

    try {
      // Limpiar notificaciones existentes
      toast.dismiss()

      if (currentCategoria) {
        // Actualizar categoría existente
        await CategoriasService.update(currentCategoria.id, {
          NombreCategoria: formData.nombre.trim(),
          Descripcion: formData.descripcion.trim(),
        })

        // Notificación de éxito para edición
        showToast(
          "success",
          "Categoría actualizada",
          `La categoría "${formData.nombre.trim()}" ha sido actualizada correctamente.`,
          "✏️",
          3000,
        )
      } else {
        // Crear nueva categoría
        await CategoriasService.create({
          NombreCategoria: formData.nombre.trim(),
          Descripcion: formData.descripcion.trim(),
          Estado: true,
        })

        // Notificación de éxito para creación
        showToast(
          "success",
          "Categoría creada",
          `La categoría "${formData.nombre.trim()}" ha sido creada correctamente.`,
          "✅",
          3000,
        )
      }

      // Cerrar el modal
      handleCloseModal()

      // Recargar las categorías para asegurar sincronización con el servidor
      await fetchCategorias()
    } catch (error) {
      console.error("Error al guardar categoría:", error)
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "No se pudo guardar la categoría. Intente nuevamente.",
      )
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("categoriaModal")

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
    <div className="categorias-container">
      <h2 className="mb-4">Gestión de Categorías de Producto</h2>

      <DataTable
        columns={columns}
        data={categorias}
        onAdd={handleAddCategoria}
        addButtonLabel="Agregar Categoría"
        searchPlaceholder="Buscar categorías..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Categoría */}
      <CategoryForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSave={handleSaveCategoria}
        onClose={handleCloseModal}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        categoria={categoriaToDelete}
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
        limit={1}
      />
    </div>
  )
}

export default CategoriasProducto
