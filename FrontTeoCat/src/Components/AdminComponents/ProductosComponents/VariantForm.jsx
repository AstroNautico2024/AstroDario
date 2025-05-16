"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, X, Plus, Image, Calculator } from 'lucide-react'
import { toast } from "react-toastify"

/**
 * Componente para crear o editar una variante de producto
 * @param {Object} baseProduct - Producto base al que pertenece la variante
 * @param {Function} onSave - Función para guardar la variante
 * @param {Function} onCancel - Función para cancelar la operación
 * @param {Object} initialData - Datos iniciales para edición (opcional)
 * @param {boolean} isEditing - Indica si se está editando una variante existente
 */
const VariantForm = ({ baseProduct, onSave, onCancel, initialData = null, isEditing = false }) => {
  // Estado para el formulario de la variante
  const [variantData, setVariantData] = useState({
    NombreProducto: isEditing && initialData ? initialData.NombreProducto : `${baseProduct.NombreProducto} - Variante`,
    Descripcion: isEditing && initialData ? initialData.Descripcion : baseProduct.Descripcion,
    Precio: isEditing && initialData ? initialData.Precio : baseProduct.Precio,
    Costo: isEditing && initialData ? initialData.Costo : baseProduct.Costo,
    MargenGanancia: isEditing && initialData ? initialData.MargenGanancia : baseProduct.MargenGanancia,
    PorcentajeIVA: isEditing && initialData ? initialData.PorcentajeIVA : baseProduct.PorcentajeIVA,
    Stock: isEditing && initialData ? initialData.Stock : "0",
    StockMinimo: isEditing && initialData ? initialData.StockMinimo : "5",
    Ubicacion: isEditing && initialData ? initialData.Ubicacion : "",
    CodigoBarras: isEditing && initialData ? initialData.CodigoBarras : "",
    Activo: isEditing && initialData ? initialData.Activo : true,
    ProductoBase: baseProduct.IdProducto,
    Atributos: [],
    ImagenVariante: null,
    imagenPreview: null
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    NombreProducto: "",
    Precio: "",
    Stock: "",
    Atributos: ""
  })

  // Estado para el nuevo atributo
  const [nuevoAtributo, setNuevoAtributo] = useState({
    nombre: "",
    valor: ""
  })

  // Cargar atributos iniciales si estamos editando
  useEffect(() => {
    if (isEditing && initialData && initialData.Atributos) {
      setVariantData(prev => ({
        ...prev,
        Atributos: initialData.Atributos.map(attr => ({
          nombre: attr.NombreAtributo || attr.nombre,
          valor: attr.Valor || attr.valor
        }))
      }))
    }
  }, [isEditing, initialData])

  // Manejador para cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target

    if (type === "file") {
      if (files && files[0]) {
        // Crear URL para vista previa de la imagen
        const imageUrl = URL.createObjectURL(files[0])
        
        setVariantData({
          ...variantData,
          [name]: files[0],
          imagenPreview: imageUrl
        })
      }
    } else if (type === "checkbox") {
      setVariantData({
        ...variantData,
        [name]: checked
      })
    } else {
      setVariantData({
        ...variantData,
        [name]: value
      })
    }

    // Limpiar el error específico
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      })
    }
  }

  // Manejador para agregar un nuevo atributo
  const handleAddAtributo = () => {
    if (nuevoAtributo.nombre.trim() === "" || nuevoAtributo.valor.trim() === "") {
      toast.warning("Debe completar el nombre y valor del atributo")
      return
    }

    // Verificar si ya existe un atributo con el mismo nombre
    const existeNombre = variantData.Atributos.some(
      (attr) => attr.nombre.toLowerCase() === nuevoAtributo.nombre.trim().toLowerCase()
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
        valor: nuevoAtributo.valor.trim()
      }
    ]

    // Actualizar el estado
    setVariantData({
      ...variantData,
      Atributos: updatedAtributos
    })

    // Limpiar el error de atributos si existe
    if (formErrors.Atributos) {
      setFormErrors({
        ...formErrors,
        Atributos: ""
      })
    }

    // Limpiar el formulario
    setNuevoAtributo({ nombre: "", valor: "" })
  }

  // Manejador para eliminar un atributo
  const handleRemoveAtributo = (index) => {
    const updatedAtributos = [...variantData.Atributos]
    updatedAtributos.splice(index, 1)

    setVariantData({
      ...variantData,
      Atributos: updatedAtributos
    })
  }

  // Validar el formulario
  const validateForm = () => {
    let isValid = true
    const errors = {
      NombreProducto: "",
      Precio: "",
      Stock: "",
      Atributos: ""
    }

    // Validar nombre (requerido)
    if (!variantData.NombreProducto?.trim()) {
      errors.NombreProducto = "El nombre de la variante es obligatorio"
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
      errors.Atributos = "Debe agregar al menos un atributo para la variante"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Manejador para guardar la variante
  const handleSaveVariant = () => {
    if (!validateForm()) {
      // Mostrar mensaje de error
      toast.error("Por favor, corrija los errores del formulario")
      return
    }

    // Preparar datos para enviar
    const variantToSave = {
      ...variantData,
      Precio: parseFloat(variantData.Precio),
      Costo: parseFloat(variantData.Costo || 0),
      MargenGanancia: parseFloat(variantData.MargenGanancia || 0),
      PorcentajeIVA: parseFloat(variantData.PorcentajeIVA || 0),
      Stock: parseInt(variantData.Stock),
      StockMinimo: parseInt(variantData.StockMinimo || 0)
    }

    onSave(variantToSave)
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

  // Limpiar recursos al desmontar el componente
  useEffect(() => {
    return () => {
      // Revocar URL de la vista previa de la imagen si existe
      if (variantData.imagenPreview) {
        URL.revokeObjectURL(variantData.imagenPreview)
      }
    }
  }, [variantData.imagenPreview])

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Editar Variante de Producto" : "Crear Variante de Producto"}</h2>
        <button 
          type="button"
          className="btn btn-outline-secondary d-flex align-items-center" 
          onClick={onCancel}
        >
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
                <p className="fw-bold">{baseProduct.Categoria?.NombreCategoria || "No especificada"}</p>
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
                <label htmlFor="NombreProducto" className="form-label">
                  Nombre de la Variante <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.NombreProducto ? "is-invalid" : ""}`}
                  id="NombreProducto"
                  name="NombreProducto"
                  value={variantData.NombreProducto}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.NombreProducto && <div className="invalid-feedback">{formErrors.NombreProducto}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="ImagenVariante" className="form-label">
                  Imagen de la Variante
                </label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control"
                    id="ImagenVariante"
                    name="ImagenVariante"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  <label className="input-group-text" htmlFor="ImagenVariante">
                    <Image size={18} />
                  </label>
                </div>
                {variantData.imagenPreview && (
                  <div className="mt-2">
                    <img 
                      src={variantData.imagenPreview || "/placeholder.svg"} 
                      alt="Vista previa" 
                      className="img-thumbnail" 
                      style={{ maxHeight: "100px" }} 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <label htmlFor="Costo" className="form-label">
                  Costo
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="Costo"
                    name="Costo"
                    value={variantData.Costo}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="MargenGanancia" className="form-label">
                  Margen de Ganancia (%)
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="MargenGanancia"
                    name="MargenGanancia"
                    value={variantData.MargenGanancia}
                    onChange={handleInputChange}
                    min="0"
                    max="500"
                    step="0.1"
                  />
                  <span className="input-group-text">%</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      const costo = parseFloat(variantData.Costo) || 0
                      const margen = parseFloat(variantData.MargenGanancia) || 0
                      
                      if (costo > 0 && margen >= 0) {
                        const precio = costo * (1 + margen / 100)
                        setVariantData({
                          ...variantData,
                          Precio: Math.round(precio).toString()
                        })
                      } else {
                        toast.warning("El costo debe ser mayor que cero y el margen no puede ser negativo")
                      }
                    }}
                    title="Calcular precio"
                  >
                    <Calculator size={18} />
                  </button>
                </div>
              </div>
              <div className="col-md-4">
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
                    required
                  />
                  {formErrors.Precio && <div className="invalid-feedback">{formErrors.Precio}</div>}
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label htmlFor="StockMinimo" className="form-label">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="StockMinimo"
                  name="StockMinimo"
                  value={variantData.StockMinimo}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="Activo" className="form-label d-block">
                  Estado
                </label>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="Activo"
                    name="Activo"
                    checked={variantData.Activo}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="Activo">
                    {variantData.Activo ? "Activo" : "Inactivo"}
                  </label>
                </div>
              </div>
            </div>

            <h5 className="card-title mb-3">Atributos de la Variante</h5>
            {formErrors.Atributos && (
              <div className="alert alert-danger">{formErrors.Atributos}</div>
            )}
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
                {isEditing ? "Actualizar Variante" : "Guardar Variante"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VariantForm