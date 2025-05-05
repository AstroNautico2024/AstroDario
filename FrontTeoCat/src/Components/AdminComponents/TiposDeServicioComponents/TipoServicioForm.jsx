"use client"

import { Save } from "lucide-react"

/**
 * Componente de formulario para crear/editar/ver tipos de servicios
 */
const TipoServicioForm = ({ showModal, modalTitle, formData, formErrors, onInputChange, onSave, onClose }) => {
  const isViewMode = modalTitle === "Ver Detalles del Tipo de Servicio"

  return (
    <div
      className="modal fade"
      id="tipoServicioModal"
      tabIndex="-1"
      aria-labelledby="tipoServicioModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="tipoServicioModalLabel">
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
            <form className="tipo-servicio-form">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre del Tipo de Servicio <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={onInputChange}
                  disabled={isViewMode}
                  required
                  maxLength={100}
                  placeholder="Ingrese el nombre del tipo de servicio"
                />
                {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                <small className="form-text text-muted">Máximo 100 caracteres.</small>
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
                  maxLength={500}
                  placeholder="Ingrese una descripción (opcional)"
                ></textarea>
                {formErrors.descripcion && <div className="invalid-feedback">{formErrors.descripcion}</div>}
                <small className="form-text text-muted">Máximo 500 caracteres.</small>
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
                Guardar Tipo de Servicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TipoServicioForm
