"use client"
import { Edit, Trash2 } from "lucide-react"

const VariantsSection = ({ formData, setFormData, setCreatingVariant, onDeleteVariant }) => {
  // Función para formatear números con separadores de miles
  const formatNumber = (number) => {
    const num = typeof number === "string" ? Number.parseFloat(number) : number
    if (isNaN(num)) return "0"
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Manejador para eliminar una variante
  const handleDeleteVariant = (variantId) => {
    if (onDeleteVariant) {
      onDeleteVariant(variantId)
    } else {
      const updatedVariantes = formData.Variantes.filter((v) => v.id !== variantId)
      setFormData({
        ...formData,
        Variantes: updatedVariantes,
      })
    }
  }

  return (
    <div>
      {formData.Variantes.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Atributos</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {formData.Variantes.map((variant) => (
                <tr key={variant.id}>
                  <td className="align-middle">{variant.NombreVariante}</td>
                  <td className="align-middle">
                    <div className="d-flex flex-wrap gap-1">
                      {variant.Atributos?.map((attr, index) => (
                        <span key={index} className="badge bg-light text-dark border">
                          {attr.nombre}: {attr.valor}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="align-middle">${formatNumber(variant.Precio)}</td>
                  <td className="align-middle">{formatNumber(variant.Stock)}</td>
                  <td className="text-end align-middle">
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // Implementar edición de variante
                          console.log("Editar variante", variant.id)
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteVariant(variant.id)}
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
      ) : (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted mb-3">No hay variantes para este producto</p>
          <button type="button" className="btn btn-outline-primary" onClick={() => setCreatingVariant(true)}>
            Crear primera variante
          </button>
        </div>
      )}
    </div>
  )
}

export default VariantsSection
