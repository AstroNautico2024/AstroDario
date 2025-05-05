"use client"

/**
 * Componente para mostrar el resumen de la devolución
 */
const ResumenDevolucion = ({ montoTotal, formatNumber }) => {
  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">Resumen</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Monto Total de Devolución:</h4>
          <h4 className="text-primary">${formatNumber(montoTotal)}</h4>
        </div>
      </div>
    </div>
  )
}

export default ResumenDevolucion

