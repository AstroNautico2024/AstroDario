"use client"

/**
 * Componente para mostrar la información de la venta
 */
const VentaInfoSection = ({ venta, formatNumber }) => {
  // Si no hay venta, no renderizar nada
  if (!venta) return null

  return (
    <div className="row">
      <div className="col-md-3">
        <label className="form-label">Nombre del Cliente</label>
        <input
          type="text"
          className="form-control"
          value={venta.cliente ? venta.cliente.nombre : venta.Cliente || `Cliente ID: ${venta.IdCliente || ""}`}
          readOnly
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Fecha de Venta</label>
        <input type="date" className="form-control" value={venta.fechaVenta || venta.FechaVenta || ""} readOnly />
      </div>
      <div className="col-md-3">
        <label className="form-label">Número de Factura</label>
        <input type="text" className="form-control" value={venta.codigoFactura || venta.IdVenta || ""} readOnly />
      </div>
      <div className="col-md-3">
        <label className="form-label">Total de la Venta</label>
        <input
          type="text"
          className="form-control"
          value={`$${formatNumber(venta.total || venta.TotalMonto || 0)}`}
          readOnly
        />
      </div>
    </div>
  )
}

export default VentaInfoSection
