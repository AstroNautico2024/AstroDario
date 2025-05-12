"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import VentasService from "../../../Services/ConsumoAdmin/VentasService.js"
import DetallesVentasService from "../../../Services/ConsumoAdmin/DetallesVentasService.js"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"
import "../../../Pages/AdminPages/Ventas/DevolucionVenta.scss"

// Función para formatear moneda
const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return "$0"
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

// Función para formatear fecha
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ""

  // Si la fecha ya tiene formato YYYY-MM-DD, devolverla tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr

  try {
    // Intentar convertir la fecha a formato YYYY-MM-DD
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return ""

    return fecha.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return ""
  }
}

const DevolucionVenta = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ventaId = searchParams.get("id")

  // Estados principales
  const [venta, setVenta] = useState(null)
  const [detallesProductos, setDetallesProductos] = useState([])
  const [productosDevolver, setProductosDevolver] = useState([])
  const [productosCambio, setProductosCambio] = useState([])
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Estados del formulario
  const [motivo, setMotivo] = useState("")
  const [motivoPersonalizado, setMotivoPersonalizado] = useState("")
  const [estado, setEstado] = useState("Efectiva") // Cambiado a "Efectiva" por defecto
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split("T")[0])

  // Cargar datos iniciales
  useEffect(() => {
    if (!ventaId) {
      setError("ID de venta no proporcionado")
      setLoading(false)
      return
    }

    // Modificar la función cargarDatos para manejar mejor los errores CORS y 404
    const cargarDatos = async () => {
      try {
        setLoading(true)

        // Intentar obtener la venta primero
        let ventaData = null
        try {
          ventaData = await VentasService.getById(Number(ventaId))
        } catch (ventaError) {
          console.warn("Error al obtener venta directamente, intentando obtener de la lista:", ventaError)
          // Intentar obtener la venta de la lista completa
          const todasLasVentas = await VentasService.getAll()
          ventaData = todasLasVentas.find((v) => v.IdVenta == ventaId)

          if (!ventaData) {
            throw new Error("No se pudo encontrar la venta")
          }
        }

        // Dentro de la función cargarDatos, después de obtener ventaData, agregar:
        if (ventaData) {
          // Intentar obtener información del cliente si no está incluida en la venta
          if (!ventaData.cliente && ventaData.IdCliente) {
            try {
              // Intentar obtener el cliente directamente
              const clienteResponse = await fetch(`/api/customers/clientes/${ventaData.IdCliente}`)
              if (clienteResponse.ok) {
                const clienteData = await clienteResponse.json()
                ventaData.cliente = clienteData
                console.log("Cliente obtenido:", clienteData)
              } else {
                console.warn("No se pudo obtener el cliente, usando datos genéricos")
                // Crear un cliente genérico si es el ID 3 (Consumidor Final)
                if (ventaData.IdCliente === 3) {
                  ventaData.cliente = {
                    nombre: "Consumidor",
                    apellido: "Final",
                    documento: "0000000000",
                  }
                }
              }
            } catch (clienteError) {
              console.warn("Error al obtener datos del cliente:", clienteError)
              // Si es consumidor final (ID 3), crear un objeto cliente genérico
              if (ventaData.IdCliente === 3) {
                ventaData.cliente = {
                  nombre: "Consumidor",
                  apellido: "Final",
                  documento: "0000000000",
                }
              }
            }
          }

          // Asegurar que la fecha de venta tenga el formato correcto
          if (ventaData.FechaVenta) {
            try {
              // Convertir la fecha a un objeto Date
              const fecha = new Date(ventaData.FechaVenta)
              if (!isNaN(fecha.getTime())) {
                // Formatear la fecha como YYYY-MM-DD
                ventaData.FechaVenta = fecha.toISOString().split("T")[0]
                console.log("Fecha formateada:", ventaData.FechaVenta)
              } else {
                console.warn("Fecha inválida:", ventaData.FechaVenta)
                ventaData.FechaVenta = new Date().toISOString().split("T")[0] // Usar fecha actual como fallback
              }
            } catch (fechaError) {
              console.error("Error al formatear fecha:", fechaError)
              ventaData.FechaVenta = new Date().toISOString().split("T")[0] // Usar fecha actual como fallback
            }
          } else {
            console.warn("La venta no tiene fecha, usando fecha actual")
            ventaData.FechaVenta = new Date().toISOString().split("T")[0]
          }
        }

        // Intentar obtener detalles de productos
        let detallesData = []
        try {
          detallesData = await DetallesVentasService.getByVenta(Number(ventaId))
        } catch (detallesError) {
          console.warn("Error al obtener detalles de productos:", detallesError)
          // Si hay error, usar un array vacío
          detallesData = []
        }

        // Obtener productos disponibles
        let productosData = []
        try {
          productosData = await ProductosService.getActivosParaCompras()
        } catch (productosError) {
          console.warn("Error al obtener productos activos:", productosError)
          productosData = []
        }

        if (!ventaData) {
          setError("No se encontró la venta especificada")
          return
        }

        // Formatear la fecha de venta si existe
        if (ventaData.FechaVenta) {
          ventaData.FechaVenta = formatearFecha(ventaData.FechaVenta)
        }

        setVenta(ventaData)
        setDetallesProductos(Array.isArray(detallesData) ? detallesData : [])
        setProductosDisponibles(productosData || [])
        setError(null)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [ventaId])

  // Agregar producto a devolver
  const handleAgregarProductoDevolver = (producto, cantidad) => {
    if (!producto) return

    // Verificar si ya existe el producto
    const productoExistente = productosDevolver.find((p) => p.IdProducto === producto.IdProducto)

    if (productoExistente) {
      setProductosDevolver(
        productosDevolver.map((p) =>
          p.IdProducto === producto.IdProducto
            ? { ...p, Cantidad: cantidad, Subtotal: producto.PrecioUnitario * cantidad }
            : p,
        ),
      )
    } else {
      setProductosDevolver([
        ...productosDevolver,
        {
          IdProducto: producto.IdProducto,
          NombreProducto: producto.NombreProducto || producto.producto?.nombre || `Producto ID: ${producto.IdProducto}`,
          PrecioUnitario: producto.PrecioUnitario,
          Cantidad: cantidad,
          Subtotal: producto.PrecioUnitario * cantidad,
        },
      ])
    }
  }

  // Agregar producto de cambio
  const handleAgregarProductoCambio = (producto, cantidad) => {
    if (!producto) return

    // Verificar si ya existe el producto
    const productoExistente = productosCambio.find((p) => p.IdProducto === producto.IdProducto)

    if (productoExistente) {
      setProductosCambio(
        productosCambio.map((p) =>
          p.IdProducto === producto.IdProducto ? { ...p, Cantidad: cantidad, Subtotal: producto.Precio * cantidad } : p,
        ),
      )
    } else {
      setProductosCambio([
        ...productosCambio,
        {
          IdProducto: producto.IdProducto,
          NombreProducto: producto.NombreProducto,
          PrecioUnitario: producto.Precio,
          Cantidad: cantidad,
          Subtotal: producto.Precio * cantidad,
        },
      ])
    }
  }

  // Eliminar productos
  const handleEliminarProductoDevolver = (idProducto) => {
    setProductosDevolver(productosDevolver.filter((p) => p.IdProducto !== idProducto))
  }

  const handleEliminarProductoCambio = (idProducto) => {
    setProductosCambio(productosCambio.filter((p) => p.IdProducto !== idProducto))
  }

  // Calcular totales
  const calcularTotales = () => {
    const subtotalDevolucion = productosDevolver.reduce((total, p) => total + p.Subtotal, 0)
    const subtotalCambio = productosCambio.reduce((total, p) => total + p.Subtotal, 0)
    const saldoCliente = subtotalDevolucion - subtotalCambio

    return {
      devolucion: { subtotal: subtotalDevolucion, total: subtotalDevolucion },
      cambio: { subtotal: subtotalCambio, total: subtotalCambio },
      saldoCliente,
    }
  }

  // Agregar la función handleCancel después de calcularTotales()
  const handleCancel = () => {
    navigate("/ventas/ventas")
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones básicas
    if (productosDevolver.length === 0) {
      toast.error("Debe seleccionar al menos un producto para devolver")
      return
    }

    if (!motivo) {
      toast.error("Debe seleccionar un motivo para la devolución")
      return
    }

    if (motivo === "otro" && !motivoPersonalizado.trim()) {
      toast.error("Debe ingresar el motivo de la devolución")
      return
    }

    try {
      setSubmitting(true)
      const totales = calcularTotales()
      const motivoFinal = motivo === "otro" ? motivoPersonalizado : motivo

      // Obtener información del cliente para incluirla en las notas
      // Modificar la función para obtener el nombre del cliente para asegurar que siempre muestre algo
      // Reemplazar la sección donde se define nombreCliente con este código:

      // Obtener información del cliente de manera más robusta
      const nombreCliente = (() => {
        if (venta.cliente) {
          const nombre = venta.cliente.nombre || venta.cliente.Nombre || ""
          const apellido = venta.cliente.apellido || venta.cliente.Apellido || ""
          if (nombre || apellido) {
            return `${nombre} ${apellido}`.trim()
          }
        }

        // Si el ID es 3, es probablemente Consumidor Final
        if (venta.IdCliente === 3) {
          return "Consumidor Final"
        }

        return `Cliente ID: ${venta.IdCliente || "No disponible"}`
      })()

      console.log("Información del cliente:", {
        nombreCliente,
        clienteData: venta.cliente,
        idCliente: venta.IdCliente,
      })

      // Crear mensaje de saldo
      const mensajeSaldo =
        totales.saldoCliente >= 0
          ? `Saldo a favor del cliente: ${formatearMoneda(totales.saldoCliente)}`
          : `Cliente debe pagar: ${formatearMoneda(Math.abs(totales.saldoCliente))}`

      // Crear objeto de devolución con formato de fecha corregido
      const devolucionData = {
        venta: {
          IdCliente: Number(venta.IdCliente || 3),
          IdUsuario: Number(venta.IdUsuario || 1),
          // Usar formato de fecha YYYY-MM-DD para evitar errores
          FechaVenta: fechaDevolucion,
          Subtotal: Number(totales.devolucion.subtotal),
          TotalIva: 0,
          TotalMonto: Number(totales.devolucion.total),
          NotasAdicionales: `Devolución de venta #${ventaId} para ${nombreCliente}. Fecha original: ${venta.FechaVenta || "No disponible"}. Motivo: ${motivoFinal}. ${mensajeSaldo}${productosCambio.length > 0 ? ` Productos para cambio: ${productosCambio.map((p) => `${p.Cantidad} x ${p.NombreProducto}`).join(", ")}` : ""}`,
          // Usar el estado seleccionado por el usuario
          Estado: estado,
          Tipo: "Devolucion",
          IdVentaOriginal: Number(ventaId),
          MetodoPago: "efectivo",
        },
        detallesProductos: productosDevolver.map((p) => ({
          IdProducto: Number(p.IdProducto),
          Cantidad: Number(p.Cantidad),
          PrecioUnitario: Number(p.PrecioUnitario),
          IvaUnitario: 0,
        })),
        // No enviar productosCambio como un array separado, ya que la tabla no tiene el campo EsCambio
        // En su lugar, incluimos la información en las notas adicionales
      }

      // Agregar console.log para depuración
      console.log("Datos de devolución a enviar:", JSON.stringify(devolucionData, null, 2))

      // Registrar devolución
      const resultado = await VentasService.registrarDevolucion(devolucionData)
      console.log("Resultado de la devolución:", resultado)
      toast.success("Devolución registrada exitosamente")

      // Modificar la redirección en handleSubmit para usar la misma ruta
      setTimeout(() => {
        navigate("/ventas/ventas")
      }, 1500)
    } catch (error) {
      console.error("Error al procesar la devolución:", error)

      // Mostrar más detalles del error
      if (error.response) {
        console.error("Detalles del error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
        toast.error(
          `Error ${error.response.status}: ${error.response.data?.message || "Error al registrar la devolución"}`,
        )
      } else {
        toast.error("Error al registrar la devolución: " + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Obtener información del cliente de manera más robusta
  const nombreCliente = (() => {
    if (venta?.cliente) {
      const nombre = venta.cliente.nombre || venta.cliente.Nombre || ""
      const apellido = venta.cliente.apellido || venta.cliente.Apellido || ""
      if (nombre || apellido) {
        return `${nombre} ${apellido}`.trim()
      }
    }

    // Si el ID es 3, es probablemente Consumidor Final
    if (venta?.IdCliente === 3) {
      return "Consumidor Final"
    }

    return `Cliente ID: ${venta?.IdCliente || "No disponible"}`
  })()

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/ventas/ventas" className="btn btn-primary">
          Volver a Ventas
        </Link>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">No se encontró la venta especificada</div>
        <Link to="/ventas/ventas" className="btn btn-primary">
          Volver a Ventas
        </Link>
      </div>
    )
  }

  const totales = calcularTotales()

  return (
    <div className="devolucion-venta-container container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Devolución de Venta</h2>
        <Link to="/ventas/ventas" className="btn btn-outline-secondary">
          ← Volver a Ventas
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Información de la venta original - Versión compacta */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Información de la Venta Original</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="cliente-nombre"
                    placeholder="Cliente"
                    value={nombreCliente} 
                    readOnly 
                  />
                  <label htmlFor="cliente-nombre">Cliente</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="date"
                    className="form-control"
                    id="fecha-venta"
                    placeholder="Fecha de Venta"
                    value={venta.FechaVenta || ""}
                    readOnly
                    onChange={() => {}} // Agregar onChange vacío para evitar advertencias de React
                  />
                  <label htmlFor="fecha-venta">Fecha de Venta</label>
                  {/* Mostrar la fecha en formato legible como texto de ayuda */}
                  {venta.FechaVenta && (
                    <small className="text-muted">
                      {new Date(venta.FechaVenta).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </small>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="factura"
                    placeholder="Factura"
                    value={venta.IdVenta || ""} 
                    readOnly 
                  />
                  <label htmlFor="factura">Factura</label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-floating">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="total-venta"
                    placeholder="Total"
                    value={formatearMoneda(venta.TotalMonto || 0)} 
                    readOnly 
                  />
                  <label htmlFor="total-venta">Total</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interfaz de pestañas para reducir el scroll */}
        <ul className="nav nav-tabs mb-3" id="devolucionTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="productos-tab"
              data-bs-toggle="tab"
              data-bs-target="#productos"
              type="button"
              role="tab"
              aria-controls="productos"
              aria-selected="true"
            >
              Productos a Devolver
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="cambio-tab"
              data-bs-toggle="tab"
              data-bs-target="#cambio"
              type="button"
              role="tab"
              aria-controls="cambio"
              aria-selected="false"
            >
              Productos para Cambio
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="motivo-tab"
              data-bs-toggle="tab"
              data-bs-target="#motivo"
              type="button"
              role="tab"
              aria-controls="motivo"
              aria-selected="false"
            >
              Motivo y Estado
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="resumen-tab"
              data-bs-toggle="tab"
              data-bs-target="#resumen"
              type="button"
              role="tab"
              aria-controls="resumen"
              aria-selected="false"
            >
              Resumen
            </button>
          </li>
        </ul>

        <div className="tab-content" id="devolucionTabContent">
          {/* Pestaña de Productos a Devolver */}
          <div className="tab-pane fade show active" id="productos" role="tabpanel" aria-labelledby="productos-tab">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Productos de la Venta Original</h5>
              </div>
              <div className="card-body">
                {detallesProductos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallesProductos.map((detalle) => (
                          <tr key={detalle.IdDetalleVentas || detalle.id}>
                            <td>
                              {detalle.NombreProducto ||
                                (detalle.producto ? detalle.producto.nombre : `Producto ID: ${detalle.IdProducto}`)}
                            </td>
                            <td>{detalle.Cantidad}</td>
                            <td>{formatearMoneda(detalle.PrecioUnitario)}</td>
                            <td>{formatearMoneda(detalle.PrecioUnitario * detalle.Cantidad)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm me-2"
                                  style={{ width: "60px" }}
                                  min="1"
                                  max={detalle.Cantidad}
                                  defaultValue="1"
                                  onChange={(e) =>
                                    (e.target.value = Math.min(
                                      Math.max(1, Number.parseInt(e.target.value) || 1),
                                      detalle.Cantidad,
                                    ))
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={(e) =>
                                    handleAgregarProductoDevolver(
                                      detalle,
                                      Number.parseInt(e.target.previousSibling.value),
                                    )
                                  }
                                >
                                  Devolver
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No hay productos en esta venta</div>
                )}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Productos a Devolver</h5>
              </div>
              <div className="card-body">
                {productosDevolver.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosDevolver.map((producto) => (
                          <tr key={producto.IdProducto}>
                            <td>{producto.NombreProducto}</td>
                            <td>{producto.Cantidad}</td>
                            <td>{formatearMoneda(producto.PrecioUnitario)}</td>
                            <td>{formatearMoneda(producto.Subtotal)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleEliminarProductoDevolver(producto.IdProducto)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="3" className="text-end fw-bold">
                            Total:
                          </td>
                          <td className="fw-bold">{formatearMoneda(totales.devolucion.total)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No hay productos agregados a la devolución</div>
                )}
              </div>
            </div>
          </div>

          {/* Pestaña de Productos para Cambio */}
          <div className="tab-pane fade" id="cambio" role="tabpanel" aria-labelledby="cambio-tab">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Productos para Cambio</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Seleccione los productos que desea entregar como cambio por la devolución.
                </p>

                <div className="row mb-3">
                  <div className="col-md-5">
                    <div className="form-floating">
                      <select className="form-select" id="productoCambio" placeholder="Seleccione un producto">
                        <option value="">Seleccione un producto...</option>
                        {productosDisponibles.map((producto) => (
                          <option key={producto.IdProducto} value={producto.IdProducto}>
                            {producto.NombreProducto} - {formatearMoneda(producto.Precio)}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="productoCambio">Producto</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-floating">
                      <input 
                        type="number" 
                        className="form-control" 
                        id="cantidadCambio" 
                        placeholder="Cantidad"
                        min="1" 
                        defaultValue="1" 
                      />
                      <label htmlFor="cantidadCambio">Cantidad</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => {
                        const select = document.getElementById("productoCambio")
                        const cantidad = Number.parseInt(document.getElementById("cantidadCambio").value) || 1
                        const productoId = Number.parseInt(select.value)
                        if (productoId) {
                          const producto = productosDisponibles.find((p) => p.IdProducto === productoId)
                          handleAgregarProductoCambio(producto, cantidad)
                        } else {
                          toast.error("Debe seleccionar un producto")
                        }
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {productosCambio.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosCambio.map((producto) => (
                          <tr key={producto.IdProducto}>
                            <td>{producto.NombreProducto}</td>
                            <td>{producto.Cantidad}</td>
                            <td>{formatearMoneda(producto.PrecioUnitario)}</td>
                            <td>{formatearMoneda(producto.Subtotal)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleEliminarProductoCambio(producto.IdProducto)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="3" className="text-end fw-bold">
                            Total:
                          </td>
                          <td className="fw-bold">{formatearMoneda(totales.cambio.total)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No hay productos de cambio agregados</div>
                )}
              </div>
            </div>
          </div>

          {/* Pestaña de Motivo y Estado */}
          <div className="tab-pane fade" id="motivo" role="tabpanel" aria-labelledby="motivo-tab">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Motivo y Estado</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-floating">
                      <select 
                        className="form-select" 
                        id="motivo-select"
                        placeholder="Motivo de la Devolución"
                        value={motivo} 
                        onChange={(e) => setMotivo(e.target.value)} 
                        required
                      >
                        <option value="">Seleccione un motivo...</option>
                        <option value="defectuoso">Producto defectuoso</option>
                        <option value="equivocado">Producto equivocado</option>
                        <option value="insatisfaccion">Insatisfacción del cliente</option>
                        <option value="otro">Otro motivo</option>
                      </select>
                      <label htmlFor="motivo-select">Motivo de la Devolución</label>
                    </div>

                    {motivo === "otro" && (
                      <div className="form-floating mt-3">
                        <textarea
                          className="form-control"
                          id="motivo-personalizado"
                          placeholder="Especifique el motivo"
                          value={motivoPersonalizado}
                          onChange={(e) => setMotivoPersonalizado(e.target.value)}
                          style={{ height: "100px" }}
                          required
                        ></textarea>
                        <label htmlFor="motivo-personalizado">Especifique el motivo</label>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating">
                      <select 
                        className="form-select" 
                        id="estado-select"
                        placeholder="Estado de la Devolución"
                        value={estado} 
                        onChange={(e) => setEstado(e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Efectiva">Efectiva</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                      <label htmlFor="estado-select">Estado de la Devolución</label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating">
                      <input
                        type="date"
                        className="form-control"
                        id="fecha-devolucion"
                        placeholder="Fecha de Devolución"
                        value={fechaDevolucion}
                        onChange={(e) => setFechaDevolucion(e.target.value)}
                      />
                      <label htmlFor="fecha-devolucion">Fecha de Devolución</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestaña de Resumen */}
          <div className="tab-pane fade" id="resumen" role="tabpanel" aria-labelledby="resumen-tab">
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Resumen</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Total Devolución: {formatearMoneda(totales.devolucion.total)}</h6>
                  </div>
                  <div className="col-md-6">
                    <h6>Total Productos de Cambio: {formatearMoneda(totales.cambio.total)}</h6>
                  </div>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <h5>Saldo a Favor del Cliente:</h5>
                  <h4 className={totales.saldoCliente >= 0 ? "text-success" : "text-danger"}>
                    {formatearMoneda(totales.saldoCliente)}
                  </h4>
                </div>

                {totales.saldoCliente >= 0 ? (
                  <p className="text-success">
                    El cliente tiene un saldo a favor que puede ser utilizado en futuras compras.
                  </p>
                ) : (
                  <p className="text-danger">
                    El cliente debe pagar la diferencia ya que el valor de los productos de cambio excede el valor de la
                    devolución.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : (
              "Confirmar Devolución"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DevolucionVenta