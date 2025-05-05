"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import DeleteConfirmModal from "../../../Components/AdminComponents/ProductosComponents/DeleteConfirmModal"
import "../../../Styles/AdminStyles/Productos.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import { useNavigate } from "react-router-dom"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Componente para la gestión de productos
 * Permite crear, ver, editar, activar/desactivar y eliminar productos
 */
const Productos = () => {
  // Estado para los productos
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [usandoDatosEjemplo, setUsandoDatosEjemplo] = useState(false)
  const [categorias, setCategorias] = useState([])

  // Hook para navegación
  const navigate = useNavigate()

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Ver Detalles del Producto")
  const [currentProduct, setCurrentProduct] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    NombreProducto: "",
    Descripcion: "",
    IdCategoriaDeProducto: "",
    Foto: "",
    Stock: "",
    Precio: "",
    PorcentajeIVA: "19",
    AplicaIVA: false,
    CodigoBarras: "",
    Referencia: "",
    FechaVencimiento: "",
    NoVence: false,
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProductos()
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
   * Función para obtener todos los productos desde la API
   */
  const fetchProductos = async () => {
    try {
      setLoading(true)
      console.log("Iniciando fetchProductos...")

      const data = await ProductosService.getAll()

      // Verificar que data sea un array antes de usar map
      if (!Array.isArray(data)) {
        console.error("Error: La respuesta no es un array", data)
        setProductos([])
        return
      }

      // Transformar los datos de la API al formato esperado por el componente
      const formattedProductos = data.map((prod) => ({
        id: prod.IdProducto,
        nombre: prod.NombreProducto, // Para el modal de eliminación
        NombreProducto: prod.NombreProducto,
        Descripcion: prod.Descripcion || "",
        IdCategoriaDeProducto: prod.IdCategoriaDeProducto,
        NombreCategoria: prod.NombreCategoria || "Sin categoría",
        Foto: prod.Foto || "",
        Stock: prod.Stock,
        Precio: prod.Precio,
        PorcentajeIVA: prod.PorcentajeIVA || 0,
        AplicaIVA: !!prod.AplicaIVA,
        CodigoBarras: prod.CodigoBarras || "",
        Referencia: prod.Referencia || "",
        FechaVencimiento: prod.FechaVencimiento || "",
        NoVence: !!prod.NoVence,
        Estado: prod.Estado ? "Activo" : "Inactivo",
      }))

      console.log("Productos formateados:", formattedProductos)
      setProductos(formattedProductos)
    } catch (error) {
      console.error("Error en fetchProductos:", error)

      // Mostrar notificación de error
      showToast(
        "error",
        "Error",
        `No se pudieron cargar los productos. ${error.response?.data?.message || error.message}`,
      )

      // Establecer un array vacío para evitar errores
      setProductos([])
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

  /**
   * Función para formatear números con separadores de miles en formato colombiano
   */
  const formatNumber = (number) => {
    if (number === undefined || number === null) {
      return "0"
    }

    // Convertir a número si es string
    const num = typeof number === "string" ? Number.parseFloat(number) : number

    // Verificar si es un número válido
    if (isNaN(num)) return "0"

    // Formatear con separador de miles (punto) y sin decimales para pesos colombianos
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Definición de columnas para la tabla
  const columns = [
    { field: "NombreProducto", header: "Nombre" },
    { field: "NombreCategoria", header: "Categoría" },
    {
      field: "Precio",
      header: "Precio",
      render: (row) => `$${formatNumber(row.Precio)} COP`,
    },
    { field: "Stock", header: "Stock" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado === "Activo" ? "bg-success" : "bg-danger"}`}>{row.Estado}</span>
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
   * Manejador para ver detalles de un producto
   */
  const handleView = async (product) => {
    try {
      // Obtener datos completos del producto
      const productoCompleto = await ProductosService.getById(product.id)

      setCurrentProduct(productoCompleto)
      setModalTitle("Ver Detalles del Producto")

      // Cargar datos del producto en el formulario
      setFormData({
        NombreProducto: productoCompleto.NombreProducto,
        Descripcion: productoCompleto.Descripcion || "",
        IdCategoriaDeProducto: productoCompleto.IdCategoriaDeProducto,
        NombreCategoria: productoCompleto.NombreCategoria || "Sin categoría",
        Foto: productoCompleto.Foto || "",
        Stock: productoCompleto.Stock?.toString(),
        Precio: productoCompleto.Precio?.toString(),
        PorcentajeIVA: productoCompleto.PorcentajeIVA?.toString() || "0",
        AplicaIVA: !!productoCompleto.AplicaIVA,
        CodigoBarras: productoCompleto.CodigoBarras || "",
        Referencia: productoCompleto.Referencia || "",
        FechaVencimiento: productoCompleto.FechaVencimiento || "",
        NoVence: !!productoCompleto.NoVence,
      })

      setShowModal(true)
    } catch (error) {
      console.error("Error al obtener detalles del producto:", error)
      showToast(
        "error",
        "Error",
        `No se pudieron cargar los detalles del producto. ${error.response?.data?.message || error.message}`,
      )
    }
  }

  /**
   * Manejador para editar un producto
   */
  const handleEdit = (product) => {
    // Redirigir a la página de edición de producto
    navigate(`/inventario/registrar-producto?id=${product.id}`)
  }

  /**
   * Manejador para cambiar el estado de un producto
   */
  const handleToggleStatus = async (product) => {
    try {
      // Limpiar notificaciones existentes
      toast.dismiss()

      // Llamar a la API para cambiar el estado
      const newStatus = product.Estado === "Activo" ? false : true
      await ProductosService.changeStatus(product.id, newStatus)

      // Actualizar el estado local
      const updatedProducts = productos.map((p) => {
        if (p.id === product.id) {
          return {
            ...p,
            Estado: p.Estado === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return p
      })

      setProductos(updatedProducts)

      // Añadir notificación
      const statusText = product.Estado === "Activo" ? "inactivo" : "activo"
      showToast(
        "success",
        "Estado actualizado",
        `El producto "${product.NombreProducto}" ahora está ${statusText}.`,
        "🔄",
        3000,
      )

      // Recargar los productos para asegurar sincronización con el servidor
      await fetchProductos()
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "No se pudo cambiar el estado del producto. Intente nuevamente.",
      )
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación
   */
  const handleDelete = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        // Limpiar notificaciones existentes
        toast.dismiss()

        // Llamar a la API para eliminar el producto
        await ProductosService.delete(productToDelete.id)

        // Actualizar el estado local
        const updatedProducts = productos.filter((p) => p.id !== productToDelete.id)
        setProductos(updatedProducts)

        // Añadir notificación
        showToast(
          "info",
          "Producto eliminado",
          `El producto "${productToDelete.NombreProducto}" ha sido eliminado correctamente.`,
          "🗑️",
          3000,
        )

        // Recargar los productos para asegurar sincronización con el servidor
        await fetchProductos()
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        showToast(
          "error",
          "Error",
          error.response?.data?.message || "No se pudo eliminar el producto. Intente nuevamente.",
        )
      }
    }
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar producto
   */
  const handleAddProduct = () => {
    navigate("/inventario/registrar-producto")
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
    const modalElement = document.getElementById("productModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

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
    <div className="productos-container">
      <h2 className="mb-4">Gestión de Productos</h2>

      <DataTable
        columns={columns}
        data={productos}
        onAdd={handleAddProduct}
        addButtonLabel="Agregar Producto"
        searchPlaceholder="Buscar productos..."
        loading={loading}
      />

      {/* Modal para Ver Detalles del Producto */}
      <div
        className="modal fade"
        id="productModal"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="productModalLabel">
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
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Nombre:</strong> {formData.NombreProducto || ""}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {formData.NombreCategoria || ""}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${formData.Precio ? formatNumber(formData.Precio) : "0"} COP
                  </p>
                  <p>
                    <strong>Stock:</strong> {formData.Stock || "0"}
                  </p>
                  <p>
                    <strong>IVA:</strong> {formData.AplicaIVA ? `${formData.PorcentajeIVA || "0"}%` : "No aplica"}
                  </p>
                  {formData.CodigoBarras && (
                    <p>
                      <strong>Código de Barras:</strong> {formData.CodigoBarras}
                    </p>
                  )}
                  {formData.Referencia && (
                    <p>
                      <strong>Referencia:</strong> {formData.Referencia}
                    </p>
                  )}
                  {!formData.NoVence && formData.FechaVencimiento && (
                    <p>
                      <strong>Fecha de Vencimiento:</strong> {new Date(formData.FechaVencimiento).toLocaleDateString()}
                    </p>
                  )}
                  {formData.NoVence && (
                    <p>
                      <strong>Vencimiento:</strong> No vence
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  {formData.Foto && (
                    <img
                      src={formData.Foto.split("|")[0] || "/placeholder.svg"}
                      alt={formData.NombreProducto || "Producto"}
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px" }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <p>
                    <strong>Descripción:</strong>
                  </p>
                  <p>{formData.Descripcion || "Sin descripción"}</p>
                </div>
              </div>
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
      <DeleteConfirmModal
        show={showDeleteConfirm}
        item={productToDelete}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        itemType="producto"
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

export default Productos
