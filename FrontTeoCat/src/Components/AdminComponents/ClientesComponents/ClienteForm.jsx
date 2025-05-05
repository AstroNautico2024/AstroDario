"use client"

import { Save } from "lucide-react"

/**
 * Componente de formulario para crear/editar/ver clientes
 */
const ClienteForm = ({
  showModal,
  modalTitle,
  formData,
  formErrors,
  handleInputChange,
  handleSaveCliente,
  handleCloseModal,
  isViewMode,
}) => {
  return (
    <div className="modal fade" id="clienteModal" tabIndex="-1" aria-labelledby="clienteModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="clienteModalLabel">
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleCloseModal}
            ></button>
          </div>
          <div className="modal-body">
            <form className="cliente-form">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="documento" className="form-label">
                    Documento <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.documento ? "is-invalid" : ""}`}
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ingrese el número de documento"
                  />
                  {formErrors.documento && <div className="invalid-feedback">{formErrors.documento}</div>}
                  <small className="form-text text-muted">Ingrese entre 7 y 12 dígitos sin puntos ni espacios.</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="correo" className="form-label">
                    Correo Electrónico <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.correo ? "is-invalid" : ""}`}
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="ejemplo@correo.com"
                  />
                  {formErrors.correo && <div className="invalid-feedback">{formErrors.correo}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ingrese el nombre"
                    maxLength={50}
                  />
                  {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                  <small className="form-text text-muted">Máximo 50 caracteres.</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="apellido" className="form-label">
                    Apellido <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.apellido ? "is-invalid" : ""}`}
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ingrese el apellido"
                    maxLength={50}
                  />
                  {formErrors.apellido && <div className="invalid-feedback">{formErrors.apellido}</div>}
                  <small className="form-text text-muted">Máximo 50 caracteres.</small>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="telefono" className="form-label">
                    Teléfono <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${formErrors.telefono ? "is-invalid" : ""}`}
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ej: 3101234567"
                  />
                  {formErrors.telefono && <div className="invalid-feedback">{formErrors.telefono}</div>}
                  <small className="form-text text-muted">Ingrese entre 7 y 10 dígitos sin espacios.</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="direccion" className="form-label">
                    Dirección <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ingrese la dirección"
                    maxLength={100}
                  />
                  {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                  <small className="form-text text-muted">Máximo 100 caracteres.</small>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseModal}>
              Cancelar
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={handleSaveCliente}>
                <Save size={18} className="me-1" />
                Guardar Cliente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteForm
