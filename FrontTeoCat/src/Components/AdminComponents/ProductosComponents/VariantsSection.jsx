"use client"

import { useState } from "react"
import { Plus, Edit, ChevronDown, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const VariantsSection = ({ productId, variants }) => {
  const [showVariants, setShowVariants] = useState(true)
  const [loading] = useState(false)

  // Función para formatear números como moneda
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Función para obtener una representación de texto de los atributos de una variante
  const getVariantAttributesText = (variant) => {
    if (!variant.atributos || variant.atributos.length === 0) return "Sin atributos"

    return variant.atributos
      .map((attr) => {
        return `${attr.NombreAtributo}: ${attr.Valor}`
      })
      .join(", ")
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="card-title mb-0">Variantes del Producto</h5>
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none"
          onClick={() => setShowVariants(!showVariants)}
        >
          {showVariants ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {showVariants && (
        <>
          {productId ? (
            <div className="mb-3">
              <Link to={`/admin/productos/variante/nueva/${productId}`} className="btn btn-primary">
                <Plus size={18} className="me-1" />
                Agregar Variante
              </Link>
            </div>
          ) : (
            <div className="alert alert-info">Guarde el producto primero para poder agregar variantes.</div>
          )}

          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : variants && variants.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Atributos</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.IdProducto}>
                      <td>{variant.NombreProducto}</td>
                      <td>{getVariantAttributesText(variant)}</td>
                      <td>{formatCurrency(variant.Precio)}</td>
                      <td>{variant.Stock}</td>
                      <td>
                        <span className={`badge ${variant.Activo ? "bg-success" : "bg-danger"}`}>
                          {variant.Activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link
                            to={`/admin/productos/variante/editar/${variant.IdProducto}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Editar variante"
                          >
                            <Edit size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-light text-center">No hay variantes para este producto.</div>
          )}
        </>
      )}
    </div>
  )
}

export default VariantsSection
