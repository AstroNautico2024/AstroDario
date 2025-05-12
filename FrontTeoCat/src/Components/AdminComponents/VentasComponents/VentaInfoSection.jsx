"use client"

import "../VentasComponents/VentaInfoSection.scss"

/**
 * Componente para mostrar la información de la venta
 */
const VentaInfoSection = ({ venta, formatNumber }) => {
  // Si no hay venta, no renderizar nada
  if (!venta) return null

  return (
    <div className="venta-info-section">
      <h5 className="section-title">Información de la Venta</h5>
      <div className="row">
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              id="cliente-nombre"
              placeholder="Nombre del Cliente"
              value={venta.cliente ? venta.cliente.nombre : venta.Cliente || `Cliente ID: ${venta.IdCliente || ""}`}
              readOnly
            />
            <label htmlFor="cliente-nombre">Nombre del Cliente</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input 
              type="date" 
              className="form-control fecha" 
              id="fecha-venta"
              placeholder="Fecha de Venta"
              value={venta.fechaVenta || venta.FechaVenta || ""} 
              readOnly 
            />
            <label htmlFor="fecha-venta">Fecha de Venta</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input 
              type="text" 
              className="form-control identificador" 
              id="numero-factura"
              placeholder="Número de Factura"
              value={venta.codigoFactura || venta.IdVenta || ""} 
              readOnly 
            />
            <label htmlFor="numero-factura">Número de Factura</label>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className="form-control valor-monetario"
              id="total-venta"
              placeholder="Total de la Venta"
              value={`$${formatNumber(venta.total || venta.TotalMonto || 0)}`}
              readOnly
            />
            <label htmlFor="total-venta">Total de la Venta</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentaInfoSection