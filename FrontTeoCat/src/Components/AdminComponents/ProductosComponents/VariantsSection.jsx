"use client"

import { useState } from "react"
import { Plus, Edit, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useNavigate } from "react-router-dom" // Cambiado de next/navigation a react-router-dom

const VariantsSection = ({ productId, variants, onDeleteVariant, onEditVariant }) => {
  const navigate = useNavigate() // Cambiado de useRouter a useNavigate
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
    // Manejar tanto el formato antiguo como el nuevo formato de atributos
    const atributos = variant.atributos || variant.Atributos
    
    if (!atributos || atributos.length === 0) return "Sin atributos"

    return atributos
      .map((attr) => {
        return `${attr.tipoNombre || attr.NombreAtributo}: ${attr.valorNombre || attr.Valor}`
      })
      .join(", ")
  }

  // Manejar la navegación a la página de creación de variante
  const handleAddVariant = () => {
    navigate(`/admin/productos/variante/nueva/${productId}`)
  }

  // Manejar la navegación a la página de edición de variante
  const handleEditVariant = (variantId) => {
    // Si se proporciona una función onEditVariant, usarla
    if (onEditVariant) {
      onEditVariant(variantId);
      return;
    }
    // De lo contrario, navegar a la página de edición
    navigate(`/admin/productos/variante/editar/${variantId}`)
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
              <button 
                onClick={handleAddVariant} 
                className="btn btn-primary"
              >
                <Plus size={18} className="me-1" />
                Agregar Variante
              </button>
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
                    <th>SKU</th>
                    <th>Atributos</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id || variant.IdProducto}>
                      <td>{variant.sku || variant.SKU}</td>
                      <td>{getVariantAttributesText(variant)}</td>
                      <td>{formatCurrency(variant.precio || variant.Precio)}</td>
                      <td>{variant.stock || variant.Stock}</td>
                      <td>
                        <span className={`badge ${(variant.estado || variant.Activo) ? "bg-success" : "bg-danger"}`}>
                          {(variant.estado || variant.Activo) ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() => handleEditVariant(variant.id || variant.IdProducto)}
                            className="btn btn-sm btn-outline-primary"
                            title="Editar variante"
                          >
                            <Edit size={16} />
                          </button>
                          {onDeleteVariant && (
                            <button
                              onClick={() => onDeleteVariant(variant.id || variant.IdProducto)}
                              className="btn btn-sm btn-outline-danger"
                              title="Eliminar variante"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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