"use client"

import { Save } from "lucide-react"

/**
 * Componente de formulario para crear/editar/ver categorías
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.showModal - Indica si se debe mostrar el modal
 * @param {string} props.modalTitle - Título del modal
 * @param {Object} props.formData - Datos del formulario
 * @param {Object} props.formErrors - Errores de validación del formulario
 * @param {Function} props.onInputChange - Función para manejar cambios en los inputs
 * @param {Function} props.onSave - Función para guardar los cambios
 * @param {Function} props.onClose - Función para cerrar el modal
 */
const CategoryForm = ({ showModal, modalTitle, formData, formErrors, onInputChange, onSave, onClose }) => {
  const isViewMode = modalTitle === "Ver Detalles de la Categoría"

  return (
    <div
      className="modal fade"
      id="categoriaModal"
      tabIndex="-1"
      aria-labelledby="categoriaModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="categoriaModalLabel">
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form className="categoria-form">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre de la Categoría <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  maxLength={50}
                  required
                />
                {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                <small className="form-text text-muted">Máximo 50 caracteres.</small>
              </div>

              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                  Descripción
                </label>
                <textarea
                  className={`form-control ${formErrors.descripcion ? "is-invalid" : ""}`}
                  id="descripcion"
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  maxLength={255}
                ></textarea>
                {formErrors.descripcion && <div className="invalid-feedback">{formErrors.descripcion}</div>}
                <small className="form-text text-muted">Máximo 255 caracteres.</small>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              Cancelar
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={onSave}>
                <Save size={18} className="me-1" />
                Guardar Categoría
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm
