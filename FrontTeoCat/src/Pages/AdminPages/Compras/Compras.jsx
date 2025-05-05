"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle, FileText } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/Compras.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import ComprasService from "../../../Services/ConsumoAdmin/ComprasService.js"
import DetalleComprasService from "../../../Services/ConsumoAdmin/DetalleComprasService.js"
import ProveedoresService from "../../../Services/ConsumoAdmin/ProveedoresService.js"

/**
 * Componente para la gestión de compras
 * Permite visualizar, registrar, editar y cancelar compras de productos
 */
const Compras = () => {
  const navigate = useNavigate()

  // Estado para las compras
  const [compras, setCompras] = useState([])

  // Estado para indicar carga de datos
  const [isLoading, setIsLoading] = useState(false)

  // Estado para manejar errores
  const [error, setError] = useState(null)

  // Estado para los proveedores disponibles (para el modal de detalles)
  const [proveedores, setProveedores] = useState([])

  // Estado para el modal de confirmación de cancelación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [compraToCancel, setCompraToCancel] = useState(null)

  // Estado para el modal de detalles
  const [showDetallesModal, setShowDetallesModal] = useState(false)
  const [compraSeleccionada, setCompraSeleccionada] = useState(null)

  // Estado para los detalles de la compra seleccionada
  const [detallesCompra, setDetallesCompra] = useState([])

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Estado para controlar recargas
  const [reloadTrigger, setReloadTrigger] = useState(false)

  /**
   * Efecto para cargar datos iniciales
   * Implementa las llamadas a la API para obtener compras
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Cargar compras desde la API
        const comprasData = await ComprasService.getAll()

        // Verificar si hay estados guardados en localStorage
        try {
          const estadosGuardados = JSON.parse(localStorage.getItem("compras_estados") || "{}")

          // Aplicar estados guardados
          if (Object.keys(estadosGuardados).length > 0) {
            const comprasActualizadas = comprasData.map((compra) => {
              const compraId = compra.IdCompra || compra.id
              if (estadosGuardados[compraId]) {
                return { ...compra, Estado: estadosGuardados[compraId] }
              }
              return compra
            })
            setCompras(comprasActualizadas)
          } else {
            setCompras(comprasData)
          }
        } catch (e) {
          console.error("Error al recuperar estados guardados:", e)
          setCompras(comprasData)
        }

        // Cargar proveedores para el modal de detalles
        const proveedoresData = await ProveedoresService.getAll()
        setProveedores(proveedoresData)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")

        // Intentar recuperar del caché local
        try {
          const cachedData = localStorage.getItem("compras_cache")
          if (cachedData) {
            console.log("Recuperando compras desde caché local")
            const comprasCached = JSON.parse(cachedData)

            // Aplicar estados guardados si existen
            try {
              const estadosGuardados = JSON.parse(localStorage.getItem("compras_estados") || "{}")
              if (Object.keys(estadosGuardados).length > 0) {
                const comprasActualizadas = comprasCached.map((compra) => {
                  const compraId = compra.IdCompra || compra.id
                  if (estadosGuardados[compraId]) {
                    return { ...compra, Estado: estadosGuardados[compraId] }
                  }
                  return compra
                })
                setCompras(comprasActualizadas)
              } else {
                setCompras(comprasCached)
              }
            } catch (e) {
              console.error("Error al aplicar estados guardados:", e)
              setCompras(comprasCached)
            }

            setError(null)
          }
        } catch (e) {
          console.error("Error al recuperar caché:", e)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [reloadTrigger])

  /**
   * Función para formatear números con separadores de miles
   * @param {number} number - Número a formatear
   * @returns {string} Número formateado con separadores de miles
   */
  const formatNumber = (number) => {
    if (number === undefined || number === null) return "0"
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  /**
   * Función para formatear fechas
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada en formato local
   */
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Definición de columnas para la tabla principal
  const columns = [
    // Ocultamos el ID de compra como solicitado
    {
      field: "proveedor",
      header: "Proveedor",
      render: (row) => {
        // Verificar si existe el proveedor y su nombreEmpresa
        if (row.proveedor && row.proveedor.nombreEmpresa) {
          return row.proveedor.nombreEmpresa
        }
        // Verificar si existe IdProveedor y buscar el proveedor en la lista
        else if (row.IdProveedor && proveedores.length > 0) {
          const proveedorEncontrado = proveedores.find(
            (p) => p.IdProveedor == row.IdProveedor || p.id == row.IdProveedor,
          )
          return proveedorEncontrado ? proveedorEncontrado.nombreEmpresa : "Sin proveedor"
        }
        return "Sin proveedor"
      },
    },
    {
      field: "FechaCompra",
      header: "Fecha de Compra",
      render: (row) => formatDate(row.FechaCompra),
    },
    {
      field: "TotalMonto",
      header: "Monto Total",
      render: (row) => `$${formatNumber(row.TotalMonto)}`,
    },
    {
      field: "TotalIva",
      header: "Total IVA",
      render: (row) => `$${formatNumber(row.TotalIva)}`,
    },
    {
      field: "TotalMontoConIva",
      header: "Monto Total con IVA",
      render: (row) => `$${formatNumber(row.TotalMontoConIva)}`,
    },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado === "Efectiva" ? "bg-success" : "bg-danger"}`}>{row.Estado}</span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", row.Estado === "Efectiva" ? "cancel" : null]}
          row={row}
          onView={() => handleView(row)}
          onEdit={() => handleEdit(row)}
          onCancel={() => handleCancel(row)}
          customLabels={{
            cancel: "Cancelar Compra",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una compra
   * @param {Object} compra - Objeto de compra a visualizar
   */
  const handleView = async (compra) => {
    try {
      setIsLoading(true)
      console.log("Obteniendo detalles de compra:", compra)

      // Mostrar toast de carga
      const loadingToastId = toast.loading(
        <div>
          <strong>Cargando detalles</strong>
          <p>Obteniendo información de la compra...</p>
        </div>,
        {
          position: "top-right",
        },
      )

      // Obtener los datos completos de la compra
      const compraCompleta = await ComprasService.getById(compra.IdCompra || compra.id)

      if (!compraCompleta) {
        toast.dismiss(loadingToastId)
        toast.error("No se pudo cargar la información de la compra")
        setIsLoading(false)
        return
      }

      // Asegurarse de que la información del proveedor esté completa
      let proveedorInfo = compraCompleta.proveedor || {}

      // Si no hay información completa del proveedor, intentar obtenerla
      if (!proveedorInfo.personaDeContacto || !proveedorInfo.telefono) {
        try {
          // Buscar el proveedor en la lista de proveedores
          const proveedorEncontrado = proveedores.find(
            (p) => p.IdProveedor == compraCompleta.IdProveedor || p.id == compraCompleta.IdProveedor,
          )

          if (proveedorEncontrado) {
            proveedorInfo = {
              ...proveedorInfo,
              nombreEmpresa: proveedorEncontrado.nombreEmpresa || proveedorInfo.nombreEmpresa,
              documento: proveedorEncontrado.documento || proveedorInfo.documento,
              telefono: proveedorEncontrado.telefono || proveedorInfo.telefono,
              personaDeContacto: proveedorEncontrado.personaDeContacto || proveedorInfo.personaDeContacto,
            }
          }
        } catch (error) {
          console.error("Error al obtener información adicional del proveedor:", error)
        }
      }

      // Actualizar la compra con la información completa del proveedor
      compraCompleta.proveedor = proveedorInfo

      // Obtener los detalles de la compra directamente
      let detalles = []
      try {
        // Intentar obtener detalles directamente desde el servicio
        detalles = await DetalleComprasService.getByCompra(compra.IdCompra || compra.id)
        console.log("Detalles obtenidos:", detalles)
      } catch (error) {
        console.error("Error al obtener detalles:", error)

        // Si falla, intentar usar los detalles que vienen con la compra
        if (compraCompleta.detalles && compraCompleta.detalles.length > 0) {
          detalles = compraCompleta.detalles
          console.log("Usando detalles de la compra:", compraCompleta.detalles)
        }
      }

      // Normalizar los detalles para asegurar consistencia
      const detallesNormalizados = detalles.map((detalle) => ({
        ...detalle,
        IdDetalleCompras: detalle.IdDetalleCompras || detalle.id,
        id: detalle.IdDetalleCompras || detalle.id,
        IdCompra: Number(detalle.IdCompra || compra.IdCompra || compra.id),
        IdProducto: Number(detalle.IdProducto),
        Cantidad: Number(detalle.Cantidad),
        PrecioUnitario: Number(detalle.PrecioUnitario),
        iva: detalle.iva !== undefined ? Number(detalle.iva) : 0,
        IvaUnitario: Number(detalle.IvaUnitario || 0),
        Subtotal: Number(detalle.Subtotal),
        SubtotalConIva: Number(detalle.SubtotalConIva || detalle.Subtotal),
        nombre: detalle.nombre || detalle.NombreProducto || "Producto sin nombre",
        codigoBarras: detalle.codigoBarras || "Sin código",
      }))

      setCompraSeleccionada(compraCompleta)
      setDetallesCompra(detallesNormalizados)

      // Cerrar toast de carga
      toast.dismiss(loadingToastId)

      // Mostrar modal
      setShowDetallesModal(true)
    } catch (error) {
      console.error("Error al obtener detalles de la compra:", error)
      toast.error("Error al cargar los detalles de la compra")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Manejador para editar una compra
   * Redirige a la vista de edición con el ID de la compra
   * @param {Object} compra - Objeto de compra a editar
   */
  const handleEdit = (compra) => {
    // Solo permitir editar compras efectivas
    if (compra.Estado === "Cancelada") {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se puede editar una compra cancelada.</p>
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

    // Verificar si la compra es reciente (menos de 24 horas)
    const fechaCompra = new Date(compra.FechaCompra)
    const ahora = new Date()
    const diferenciaTiempo = ahora - fechaCompra
    const diferenciaHoras = diferenciaTiempo / (1000 * 60 * 60)

    if (diferenciaHoras > 24) {
      toast.warning(
        <div>
          <strong>Advertencia</strong>
          <p>Esta compra tiene más de 24 horas. Los cambios podrían afectar al inventario y reportes.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    }

    // Redirigir a la vista de edición
    navigate(`/compras/registrar-compra?id=${compra.IdCompra || compra.id}`)
  }

  /**
   * Manejador para iniciar el proceso de cancelación de una compra
   * @param {Object} compra - Objeto de compra a cancelar
   */
  const handleCancel = (compra) => {
    // Solo permitir cancelar compras efectivas
    if (compra.Estado === "Cancelada") {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Esta compra ya está cancelada.</p>
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

    // Verificar si la compra es reciente (menos de 24 horas)
    const fechaCompra = new Date(compra.FechaCompra)
    const ahora = new Date()
    const diferenciaTiempo = ahora - fechaCompra
    const diferenciaHoras = diferenciaTiempo / (1000 * 60 * 60)

    if (diferenciaHoras > 24) {
      toast.warning(
        <div>
          <strong>Advertencia</strong>
          <p>Esta compra tiene más de 24 horas. Su cancelación afectará al inventario y reportes.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    }

    setCompraToCancel(compra)
    setShowCancelConfirm(true)
  }

  /**
   * Función para confirmar la cancelación de la compra
   */
  const confirmCancel = async () => {
    if (compraToCancel) {
      try {
        // Mostrar toast de carga
        const loadingToastId = toast.loading(
          <div>
            <strong>Cancelando compra</strong>
            <p>Por favor, espere...</p>
          </div>,
          {
            position: "top-right",
          },
        )

        // Actualizar el estado local primero para una respuesta inmediata
        setCompras((prevCompras) =>
          prevCompras.map((c) => {
            if (
              c.IdCompra === compraToCancel.IdCompra ||
              c.id === compraToCancel.IdCompra ||
              c.IdCompra === compraToCancel.id ||
              c.id === compraToCancel.id
            ) {
              return { ...c, Estado: "Cancelada" }
            }
            return c
          }),
        )

        // Guardar el estado en localStorage para persistencia
        try {
          const comprasEstados = JSON.parse(localStorage.getItem("compras_estados") || "{}")
          const compraId = compraToCancel.IdCompra || compraToCancel.id
          comprasEstados[compraId] = "Cancelada"
          localStorage.setItem("compras_estados", JSON.stringify(comprasEstados))

          // También actualizar en el caché de compras
          const comprasCache = JSON.parse(localStorage.getItem("compras_cache") || "[]")
          const index = comprasCache.findIndex((c) => c.IdCompra == compraId || c.id == compraId)
          if (index !== -1) {
            comprasCache[index].Estado = "Cancelada"
            localStorage.setItem("compras_cache", JSON.stringify(comprasCache))
          }
        } catch (e) {
          console.error("Error al guardar estado en localStorage:", e)
        }

        // Llamar a la API para cancelar la compra
        await ComprasService.updateStatus(compraToCancel.IdCompra || compraToCancel.id, "Cancelada")

        // Cerrar toast de carga
        toast.dismiss(loadingToastId)

        // Mostrar notificación de éxito
        toast.success(
          <div>
            <strong>Compra cancelada</strong>
            <p>La compra ha sido cancelada correctamente.</p>
          </div>,
          {
            icon: "🚫",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )

        // Recargar datos para asegurar consistencia
        setReloadTrigger(!reloadTrigger)
      } catch (error) {
        console.error("Error al cancelar la compra:", error)
        toast.error(
          <div>
            <strong>Error</strong>
            <p>No se pudo cancelar la compra en el servidor, pero se ha marcado como cancelada localmente.</p>
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
      }
    }
    setShowCancelConfirm(false)
    setCompraToCancel(null)
  }

  /**
   * Función para cancelar el proceso de cancelación
   */
  const cancelCancel = () => {
    setShowCancelConfirm(false)
    setCompraToCancel(null)
  }

  /**
   * Manejador para cerrar el modal de detalles
   */
  const handleCloseDetallesModal = () => {
    setShowDetallesModal(false)
    setCompraSeleccionada(null)
    setDetallesCompra([])
  }

  /**
   * Manejador para redirigir a la vista de registrar compra
   */
  const handleAddCompra = () => {
    navigate("/compras/registrar-compra")
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("detallesCompraModal")

    if (showDetallesModal && modalElement) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowDetallesModal(false)
      setCompraSeleccionada(null)
      setDetallesCompra([])
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
  }, [showDetallesModal])

  // Definición de columnas para la tabla de productos en el modal de detalles
  const productosColumns = [
    { field: "codigoBarras", header: "Código de Barras" },
    { field: "nombre", header: "Nombre del Producto" },
    { field: "Cantidad", header: "Cantidad" },
    {
      field: "PrecioUnitario",
      header: "Precio Unitario",
      render: (row) => `$${formatNumber(row.PrecioUnitario)}`,
    },
    {
      field: "iva",
      header: "IVA",
      render: (row) => `${row.iva}%`,
    },
    {
      field: "IvaUnitario",
      header: "IVA Unitario",
      render: (row) => `$${formatNumber(row.IvaUnitario || 0)}`,
    },
    {
      field: "Subtotal",
      header: "Subtotal",
      render: (row) => `$${formatNumber(row.Subtotal)}`,
    },
    {
      field: "SubtotalConIva",
      header: "Total con IVA",
      render: (row) => `$${formatNumber(row.SubtotalConIva || row.Subtotal)}`,
    },
  ]

  return (
    <div className="compras-container">
      <h2 className="mb-4">Gestión de Compras</h2>

      {/* Estado de carga */}
      {error ? (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={compras}
          onAdd={handleAddCompra}
          addButtonLabel="Registrar Compra"
          searchPlaceholder="Buscar compras..."
          emptyMessage="No se encontraron compras"
          loading={isLoading}
        />
      )}

      {/* Modal de confirmación para cancelar compra */}
      {showCancelConfirm && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${showCancelConfirm ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar cancelación</h5>
              <button type="button" className="btn-close btn-close-white" onClick={cancelCancel}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">¿Está seguro de cancelar esta compra?</p>
              </div>
              <div className="alert alert-warning mt-3">
                <small>
                  <strong>Importante:</strong> Al cancelar esta compra, se revertirán los cambios en el inventario. Esta
                  acción no se puede deshacer.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={cancelCancel}>
                No, mantener
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmCancel}>
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Ver Detalles de la Compra */}
      <div
        className="modal fade"
        id="detallesCompraModal"
        tabIndex="-1"
        aria-labelledby="detallesCompraModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="detallesCompraModalLabel">
                Ver Detalles de la Compra
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
              {compraSeleccionada && (
                <form className="compra-form">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="Proveedor" className="form-label">
                        Proveedor
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Proveedor"
                        value={compraSeleccionada.proveedor?.nombreEmpresa || "Sin proveedor"}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="FechaCompra" className="form-label">
                        Fecha de Compra
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="FechaCompra"
                        value={compraSeleccionada.FechaCompra?.split("T")[0] || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="Estado" className="form-label">
                        Estado
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="Estado"
                        value={compraSeleccionada.Estado}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="ContactoProveedor" className="form-label">
                        Contacto del Proveedor
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ContactoProveedor"
                        value={compraSeleccionada.proveedor?.personaDeContacto || "Sin información"}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="TelefonoProveedor" className="form-label">
                        Teléfono del Proveedor
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="TelefonoProveedor"
                        value={compraSeleccionada.proveedor?.telefono || "Sin información"}
                        readOnly
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h5 className="mb-3">Productos</h5>

                  <div className="table-responsive mt-4">
                    <table className="table table-striped table-bordered">
                      <thead className="table-primary">
                        <tr>
                          {productosColumns.map((column) => (
                            <th key={column.field}>{column.header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detallesCompra && detallesCompra.length > 0 ? (
                          detallesCompra.map((producto, index) => (
                            <tr key={`${producto.IdProducto || index}-${index}`}>
                              {productosColumns.map((column) => (
                                <td key={`${producto.IdProducto || index}-${column.field}`}>
                                  {column.render ? column.render(producto) : producto[column.field]}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={productosColumns.length} className="text-center py-3">
                              No hay productos
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h5 className="mb-0 d-flex align-items-center">
                            <FileText size={18} className="me-2" />
                            Resumen de la Compra
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>Monto Total:</strong>
                            <span>${formatNumber(compraSeleccionada.TotalMonto)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <strong>Total IVA:</strong>
                            <span>${formatNumber(compraSeleccionada.TotalIva)}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <strong>Monto Total con IVA:</strong>
                            <span className="text-primary fw-bold">
                              ${formatNumber(compraSeleccionada.TotalMontoConIva)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
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

export default Compras
