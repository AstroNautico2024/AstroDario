"use client"

import { Edit, Trash2, AlertCircle } from 'lucide-react'

/**
 * Componente para mostrar una tabla de variantes de productos
 * @param {Array} variants - Lista de variantes a mostrar
 * @param {Function} onDelete - Función para manejar la eliminación de una variante
 * @param {Function} onEdit - Función para manejar la edición de una variante
 * @param {boolean} loading - Indica si los datos están cargando
 */
const VariantsTable = ({ variants = [], onDelete, onEdit, loading = false }) => {
  // Función para formatear números con separadores de miles
  const formatNumber = (number) => {
    const num = typeof number === "string" ? Number.parseFloat(number) : number
    if (isNaN(num)) return "0"
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  // Si no hay variantes, mostrar mensaje
  if (!variants || variants.length === 0) {
    return (
      <div className="alert alert-info d-flex align-items-center" role="alert">
        <AlertCircle size={18} className="me-2" />
        <div>No hay variantes disponibles para este producto.</div>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Atributos</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col">Estado</th>
            <th scope="col" className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id || variant.IdProducto}>
              <td>{variant.NombreVariante || variant.NombreProducto}</td>
              <td>
                <div className="d-flex flex-wrap gap-1">
                  {variant.Atributos?.map((attr, index) => (
                    <span
                      key={index}
                      className="badge bg-light text-dark border"
                    >
                      {attr.nombre || attr.NombreAtributo}: {attr.valor || attr.Valor}
                    </span>
                  ))}
                  {(!variant.Atributos || variant.Atributos.length === 0) && (
                    <span className="text-muted">Sin atributos</span>
                  )}
                </div>
              </td>
              <td>${formatNumber(variant.Precio)}</td>
              <td>{formatNumber(variant.Stock)}</td>
              <td>
                <span className={`badge ${variant.Activo ? 'bg-success' : 'bg-danger'}`}>
                  {variant.Activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="text-end">
                <div className="btn-group">
                  <button 
                    onClick={() => onEdit(variant.id || variant.IdProducto)} 
                    className="btn btn-sm btn-outline-primary"
                    title="Editar variante"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(variant.id || variant.IdProducto)} 
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar variante"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VariantsTable