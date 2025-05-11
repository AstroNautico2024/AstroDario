import { Save, PawPrint, Upload } from 'lucide-react'

/**
 * Componente de formulario para crear/editar/ver mascotas
 */
const MascotaForm = ({
  showModal,
  modalTitle,
  formData,
  fotoPreview,
  especiesOptions = [],
  tamañosOptions = [],
  clientesOptions = [],
  onInputChange,
  onSelectCliente,
  onFotoChange,
  onSave,
  onClose,
  disableSave,
}) => {
  const isViewMode = modalTitle === "Ver Detalles de la Mascota"

  return (
    <div className="modal fade" id="mascotaModal" tabIndex="-1" aria-labelledby="mascotaModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="mascotaModalLabel">
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
            <form className="mascota-form">
              <div className="row mb-3">
                <div className="col-md-12">
                  <label htmlFor="cliente" className="form-label">
                    Cliente <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="cliente"
                    name="cliente"
                    value={formData.cliente ?? ""}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientesOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-12">
                  <label htmlFor="nombre" className="form-label">
                    Nombre de la Mascota <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <PawPrint size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="especie" className="form-label">
                    Especie <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="especie"
                    name="especie"
                    value={formData.especie}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Seleccione una especie</option>
                    {especiesOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="raza" className="form-label">
                    Raza <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="raza"
                    name="raza"
                    value={formData.raza}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="tamaño" className="form-label">
                    Tamaño <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="tamaño"
                    name="tamaño"
                    value={formData.tamaño}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Seleccione un tamaño</option>
                    {tamañosOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="fechaNacimiento" className="form-label">
                    Fecha de Nacimiento <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-12">
                  <label htmlFor="foto" className="form-label">
                    Foto de la Mascota
                  </label>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="flex-grow-1">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Upload size={18} />
                        </span>
                        <input
                          type="file"
                          className="form-control"
                          id="foto"
                          name="foto"
                          accept="image/*"
                          onChange={onFotoChange}
                          disabled={isViewMode || disableSave}
                        />
                      </div>
                      <small className="text-muted">Formatos aceptados: JPG, PNG, GIF. Máximo 5MB.</small>
                      {disableSave && (
                        <div className="text-info mt-1">
                          <small>Subiendo imagen a Cloudinary...</small>
                        </div>
                      )}
                    </div>
                    {fotoPreview && (
                      <div className="flex-shrink-0">
                        <img
                          src={fotoPreview || "/placeholder.svg"}
                          alt="Vista previa"
                          className="img-thumbnail"
                          style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>
              Cancelar
            </button>

            {!isViewMode && (
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
                onClick={onSave}
                disabled={disableSave}
              >
                <Save size={18} className="me-1" />
                {disableSave ? "Subiendo imagen..." : "Guardar Mascota"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MascotaForm