"use client"

import { Save } from "lucide-react"
import "../ProveedoresComponents/ProveedoresForm.scss"

/**
 * Componente de formulario para crear/editar/ver proveedores
 * Actualizado con etiquetas flotantes
 */
const ProveedorForm = ({ showModal, modalTitle, formData, formErrors, onInputChange, onSave, onClose }) => {
  const isViewMode = modalTitle === "Ver Detalles del Proveedor"

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
          <div className="modal-body compact-form">
            <form className="proveedor-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.documento ? "is-invalid" : ""}`}
                      id="documento"
                      name="documento"
                      placeholder=" "
                      value={formData.documento}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="documento">
                      Documento <span className="text-danger">*</span>
                    </label>
                    {formErrors.documento && <div className="invalid-feedback">{formErrors.documento}</div>}
                    <small className="form-text text-muted">NIT, RUT o identificación fiscal del proveedor.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className={`form-control ${formErrors.correo ? "is-invalid" : ""}`}
                      id="correo"
                      name="correo"
                      placeholder=" "
                      value={formData.correo}
                      onChange={onInputChange}
                      disabled={isViewMode}
                    />
                    <label htmlFor="correo">Correo Electrónico</label>
                    {formErrors.correo && <div className="invalid-feedback">{formErrors.correo}</div>}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.nombreEmpresa ? "is-invalid" : ""}`}
                      id="nombreEmpresa"
                      name="nombreEmpresa"
                      placeholder=" "
                      value={formData.nombreEmpresa}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="nombreEmpresa">
                      Nombre Empresa <span className="text-danger">*</span>
                    </label>
                    {formErrors.nombreEmpresa && <div className="invalid-feedback">{formErrors.nombreEmpresa}</div>}
                    <small className="form-text text-muted">Nombre de la empresa o representante legal.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.personaDeContacto ? "is-invalid" : ""}`}
                      id="personaDeContacto"
                      name="personaDeContacto"
                      placeholder=" "
                      value={formData.personaDeContacto}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="personaDeContacto">
                      Persona de Contacto <span className="text-danger">*</span>
                    </label>
                    {formErrors.personaDeContacto && (
                      <div className="invalid-feedback">{formErrors.personaDeContacto}</div>
                    )}
                    <small className="form-text text-muted">Persona con quien se mantiene el contacto directo.</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="tel"
                      className={`form-control ${formErrors.telefono ? "is-invalid" : ""}`}
                      id="telefono"
                      name="telefono"
                      placeholder=" "
                      value={formData.telefono}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                    <label htmlFor="telefono">
                      Teléfono <span className="text-danger">*</span>
                    </label>
                    {formErrors.telefono && <div className="invalid-feedback">{formErrors.telefono}</div>}
                    <small className="form-text text-muted">Número de teléfono de contacto (7-10 dígitos).</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                      id="direccion"
                      name="direccion"
                      placeholder=" "
                      value={formData.direccion}
                      onChange={onInputChange}
                      disabled={isViewMode}
                    />
                    <label htmlFor="direccion">Dirección</label>
                    {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {isViewMode ? "Cerrar" : "Cancelar"}
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
