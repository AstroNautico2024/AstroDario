"use client"

import { Save } from "lucide-react"

/**
 * Componente de formulario para crear/editar/ver proveedores
 * Versión simplificada que evita manipulación directa del DOM
 */
const ProveedorForm = ({ showModal, modalTitle, formData, formErrors, onInputChange, onSave, onClose }) => {
  const isViewMode = modalTitle === "Ver Detalles del Proveedor"

  // No usamos useEffect para manipular el modal - dejamos que Bootstrap lo maneje naturalmente

  if (!showModal) return null // No renderizar nada si no se debe mostrar

  return (
    <div
      className="modal fade show"
      id="proveedorModal"
      tabIndex="-1"
      aria-labelledby="proveedorModalLabel"
      aria-hidden="true"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="proveedorModalLabel">
              {modalTitle}
            </h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form className="proveedor-form">
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ej: 900123456-7"
                  />
                  {formErrors.documento && <div className="invalid-feedback">{formErrors.documento}</div>}
                  <small className="form-text text-muted">NIT, RUT o identificación fiscal del proveedor.</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="correo" className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.correo ? "is-invalid" : ""}`}
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    placeholder="correo@ejemplo.com"
                  />
                  {formErrors.correo && <div className="invalid-feedback">{formErrors.correo}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="nombreEmpresa" className="form-label">
                    Nombre Empresa <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.nombreEmpresa ? "is-invalid" : ""}`}
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    value={formData.nombreEmpresa}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Nombre de la empresa o representante"
                  />
                  {formErrors.nombreEmpresa && <div className="invalid-feedback">{formErrors.nombreEmpresa}</div>}
                  <small className="form-text text-muted">Nombre de la empresa o representante legal.</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="personaDeContacto" className="form-label">
                    Persona de Contacto <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.personaDeContacto ? "is-invalid" : ""}`}
                    id="personaDeContacto"
                    name="personaDeContacto"
                    value={formData.personaDeContacto}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Nombre de la persona de contacto"
                  />
                  {formErrors.personaDeContacto && (
                    <div className="invalid-feedback">{formErrors.personaDeContacto}</div>
                  )}
                  <small className="form-text text-muted">Persona con quien se mantiene el contacto directo.</small>
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                    placeholder="Ej: 3101234567"
                  />
                  {formErrors.telefono && <div className="invalid-feedback">{formErrors.telefono}</div>}
                  <small className="form-text text-muted">Número de teléfono de contacto (7-10 dígitos).</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="direccion" className="form-label">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    placeholder="Dirección física del proveedor"
                  />
                  {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            {!isViewMode && (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={onSave}>
                <Save size={18} className="me-1" />
                Guardar Proveedor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProveedorForm
