"use client"

import { useState } from "react"
import { ArrowLeft, Save, X, Plus } from "lucide-react"
import { toast } from "react-toastify"

const VariantForm = ({ baseProduct, onSave, onCancel }) => {
  // Estado para el formulario de la variante
  const [variantData, setVariantData] = useState({
    NombreVariante: `${baseProduct.NombreProducto} - Variante`,
    Precio: baseProduct.Precio,
    Stock: "0", // Siempre empezamos con stock 0 para las variantes
    Atributos: [],
    ImagenVariante: null,
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    NombreVariante: "",
    Precio: "",
    Stock: "",
  })

  // Estado para el nuevo atributo
  const [nuevoAtributo, setNuevoAtributo] = useState({
    nombre: "",
    valor: "",
  })

  // Manejador para cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === "file") {
      if (files && files[0]) {
        setVariantData({
          ...variantData,
          [name]: files[0],
        })
      }
    } else {
      setVariantData({
        ...variantData,
        [name]: value,
      })
    }

    // Limpiar el error específico
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
  }

  // Manejador para agregar un nuevo atributo
  const handleAddAtributo = () => {
    if (nuevoAtributo.nombre.trim() === "" || nuevoAtributo.valor.trim() === "") {
      return
    }

    // Verificar si ya existe un atributo con el mismo nombre
    const existeNombre = variantData.Atributos.some(
      (attr) => attr.nombre.toLowerCase() === nuevoAtributo.nombre.trim().toLowerCase(),
    )

    if (existeNombre) {
      toast.error("Ya existe un atributo con este nombre")
      return
    }

    // Agregar el nuevo atributo
    const updatedAtributos = [
      ...variantData.Atributos,
      {
        nombre: nuevoAtributo.nombre.trim(),
        valor: nuevoAtributo.valor.trim(),
      },
    ]

    // Actualizar el estado
    setVariantData({
      ...variantData,
      Atributos: updatedAtributos,
    })

    // Limpiar el formulario
    setNuevoAtributo({ nombre: "", valor: "" })
  }

  // Manejador para eliminar un atributo
  const handleRemoveAtributo = (index) => {
    const updatedAtributos = [...variantData.Atributos]
    updatedAtributos.splice(index, 1)

    setVariantData({
      ...variantData,
      Atributos: updatedAtributos,
    })
  }

  // Validar el formulario
  const validateForm = () => {
    let isValid = true
    const errors = {
      NombreVariante: "",
      Precio: "",
      Stock: "",
    }

    // Validar nombre (requerido)
    if (!variantData.NombreVariante?.trim()) {
      errors.NombreVariante = "El nombre de la variante es obligatorio"
      isValid = false
    }

    // Validar precio (requerido y numérico)
    if (variantData.Precio === "") {
      errors.Precio = "El precio es obligatorio"
      isValid = false
    } else {
      const precioNum = Number(variantData.Precio)
      if (isNaN(precioNum) || precioNum <= 0) {
        errors.Precio = "El precio debe ser un número positivo"
        isValid = false
      }
    }

    // Validar stock (requerido y numérico)
    if (variantData.Stock === "") {
      errors.Stock = "El stock es obligatorio"
      isValid = false
    } else {
      const stockNum = Number(variantData.Stock)
      if (isNaN(stockNum) || stockNum < 0) {
        errors.Stock = "El stock debe ser un número positivo"
        isValid = false
      }
    }

    // Validar que tenga al menos un atributo
    if (variantData.Atributos.length === 0) {
      toast.error("Debe agregar al menos un atributo para la variante")
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Manejador para guardar la variante
  const handleSaveVariant = () => {
    if (!validateForm()) {
      return
    }

    onSave(variantData)
  }

  // Función para formatear números
  const formatNumber = (number) => {
    const num = typeof number === "string" ? Number.parseFloat(number) : number
    if (isNaN(num)) return "0"
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Crear Variante de Producto</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={onCancel}>
          <ArrowLeft size={18} className="me-1" />
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4">Producto Base</h5>
          <div className="bg-light p-3 rounded mb-4">
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1 text-muted">Nombre:</p>
                <p className="fw-bold">{baseProduct.NombreProducto}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1 text-muted">Categoría:</p>
                <p className="fw-bold">{baseProduct.IdCategoriaDeProducto}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1 text-muted">Precio Base:</p>
                <p className="fw-bold">${formatNumber(baseProduct.Precio)}</p>
              </div>
            </div>
          </div>

          <form>
            <div className="row mb-4">
              <div className="col-md-6">
                <label htmlFor="NombreVariante" className="form-label">
                  Nombre de la Variante <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.NombreVariante ? "is-invalid" : ""}`}
                  id="NombreVariante"
                  name="NombreVariante"
                  value={variantData.NombreVariante}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.NombreVariante && <div className="invalid-feedback">{formErrors.NombreVariante}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="ImagenVariante" className="form-label">
                  Imagen de la Variante
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="ImagenVariante"
                  name="ImagenVariante"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label htmlFor="Precio" className="form-label">
                  Precio <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className={`form-control ${formErrors.Precio ? "is-invalid" : ""}`}
                    id="Precio"
                    name="Precio"
                    value={variantData.Precio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  {formErrors.Precio && <div className="invalid-feedback">{formErrors.Precio}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="Stock" className="form-label">
                  Stock <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${formErrors.Stock ? "is-invalid" : ""}`}
                  id="Stock"
                  name="Stock"
                  value={variantData.Stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
                {formErrors.Stock && <div className="invalid-feedback">{formErrors.Stock}</div>}
              </div>
            </div>

            <h5 className="card-title mb-3">Atributos de la Variante</h5>
            <div className="row mb-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre (ej: Color)"
                  value={nuevoAtributo.nombre}
                  onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, nombre: e.target.value })}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Valor (ej: Rojo)"
                  value={nuevoAtributo.valor}
                  onChange={(e) => setNuevoAtributo({ ...nuevoAtributo, valor: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleAddAtributo}
                  disabled={!nuevoAtributo.nombre.trim() || !nuevoAtributo.valor.trim()}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {variantData.Atributos.length > 0 ? (
              <div className="table-responsive mb-4">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Valor</th>
                      <th className="text-center" style={{ width: "80px" }}>
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantData.Atributos.map((atributo, index) => (
                      <tr key={index}>
                        <td>{atributo.nombre}</td>
                        <td>{atributo.valor}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveAtributo(index)}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info mb-4">
                No hay atributos agregados. Debe agregar al menos un atributo (como color, talla, etc.)
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                <X size={18} className="me-1" />
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveVariant}>
                <Save size={18} className="me-1" />
                Guardar Variante
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VariantForm
