"use client"

import { useState } from "react"
import { X, Save, AlertCircle } from "lucide-react"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Modal para crear un nuevo tipo de atributo
 */
const AttributeTypeModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!show) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar error específico
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del tipo de atributo es obligatorio"
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = "El nombre no puede exceder los 50 caracteres"
    }

    if (formData.descripcion && formData.descripcion.length > 200) {
      newErrors.descripcion = "La descripción no puede exceder los 200 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Llamar a la API para crear el tipo de atributo
      const response = await ProductosService.createTipoAtributo({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
      })

      // Notificar éxito y cerrar modal
      onSuccess(response)

      // Limpiar formulario
      setFormData({
        nombre: "",
        descripcion: "",
      })
    } catch (error) {
      console.error("Error al crear tipo de atributo:", error)
      setError(
        error.response?.data?.message ||
          "No se pudo crear el tipo de atributo. Verifique los datos e intente nuevamente.",
      )
    } finally {
      setLoading(false)
    }
  }

  // Manejar el evento de tecla Escape para cerrar el modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crear Nuevo Tipo de Atributo</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <AlertCircle size={18} className="me-2" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Ej: Color, Tamaño, Material"
                    required
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  <div className="form-text">Máximo 50 caracteres.</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    className={`form-control ${errors.descripcion ? "is-invalid" : ""}`}
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    maxLength={200}
                    placeholder="Descripción opcional del tipo de atributo"
                  ></textarea>
                  {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                  <div className="form-text">Máximo 200 caracteres.</div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                <X size={18} className="me-1" />
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-1" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttributeTypeModal
