"use client"

/**
 * Componente para la tabla de detalles de productos
 */
const DetallesProductosTable = ({
  detalles = [],
  seleccionados = {},
  cantidades = {},
  onSeleccionChange,
  onCantidadChange,
}) => {
  // Verificar si detalles es undefined o no es un array
  if (!detalles || !Array.isArray(detalles)) {
    console.error("DetallesProductosTable: detalles is not an array", detalles)
    return <div className="alert alert-warning">No hay datos de productos disponibles</div>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Seleccionar</th>
            <th>Producto</th>
            <th>Precio Unitario</th>
            <th>Cantidad Original</th>
            <th>Cantidad a Devolver</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle) => {
            const detalleId = detalle.IdDetalleVentas || detalle.id
            const cantidadMax = detalle.Cantidad
            const cantidadActual = cantidades[detalleId] || 1
            const isSelected = seleccionados[detalleId] || false
            const precioUnitario = detalle.PrecioUnitario || 0

            return (
              <tr key={detalleId} className={isSelected ? "table-primary" : ""}>
                <td>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSeleccionChange && onSeleccionChange(detalleId)}
                      id={`check-${detalleId}`}
                    />
                  </div>
                </td>
                <td>
                  {detalle.NombreProducto ||
                    (detalle.producto ? detalle.producto.nombre : `Producto ID: ${detalle.IdProducto}`)}
                </td>
                <td>${precioUnitario.toLocaleString("es-CO")}</td>
                <td>{cantidadMax}</td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min="1"
                    max={cantidadMax}
                    value={cantidadActual}
                    onChange={(e) =>
                      onCantidadChange && onCantidadChange(detalleId, Number.parseInt(e.target.value), cantidadMax)
                    }
                    disabled={!isSelected}
                  />
                </td>
                <td>{isSelected ? `$${(precioUnitario * cantidadActual).toLocaleString("es-CO")}` : "-"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DetallesProductosTable
