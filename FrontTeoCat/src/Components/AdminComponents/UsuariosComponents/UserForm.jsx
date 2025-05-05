"use client"

import { useState } from "react"
import { Save, Eye, EyeOff } from "lucide-react"
import { uploadImageToCloudinary } from "../../../services/uploadImageToCloudinary"

/**
 * Componente de formulario para crear/editar/ver usuarios
 */
const UserForm = ({
  showModal,
  modalTitle,
  formData,
  formErrors,
  roles,
  currentUser,
  onInputChange,
  onSave,
  onClose,
}) => {
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const isViewMode = modalTitle === "Ver Detalles del Usuario"

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Creamos un objeto de evento simulado para mantener la compatibilidad con onInputChange
    const event = {
      target: {
        name: e.target.name,
        value: file, // Mantenemos el archivo en el estado temporal para mostrar el nombre
      },
    }

    // Actualizamos el estado del formulario con el archivo seleccionado
    onInputChange(event)

    // Mostramos indicador de carga
    setImageLoading(true)

    try {
      // Subimos la imagen a Cloudinary en la carpeta 'usuarios'
      const imageUrl = await uploadImageToCloudinary(file, "usuarios")

      if (imageUrl) {
        // Actualizamos el estado del formulario con la URL de la imagen
        const urlEvent = {
          target: {
            name: e.target.name,
            value: imageUrl,
          },
        }
        onInputChange(urlEvent)
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <div className="modal fade" id="userModal" tabIndex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="userModalLabel">
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
            <form className="user-form">
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  />
                  {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  />
                  {formErrors.apellido && <div className="invalid-feedback">{formErrors.apellido}</div>}
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
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  />
                  {formErrors.direccion && <div className="invalid-feedback">{formErrors.direccion}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="foto" className="form-label">
                    Foto
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="foto"
                    name="foto"
                    onChange={handleImageUpload}
                    disabled={isViewMode || imageLoading}
                    accept="image/*"
                  />
                  {imageLoading && <small className="form-text text-info">Subiendo imagen...</small>}
                  {formData.foto && typeof formData.foto === "object" && (
                    <small className="form-text text-success">Archivo seleccionado: {formData.foto.name}</small>
                  )}
                  {formData.foto && typeof formData.foto === "string" && formData.foto.trim() !== "" && (
                    <div className="mt-2">
                      <img
                        src={formData.foto || "/placeholder.svg"}
                        alt="Vista previa"
                        style={{ maxWidth: "100%", maxHeight: "100px" }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="rol" className="form-label">
                    Rol <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${formErrors.rol ? "is-invalid" : ""}`}
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={onInputChange}
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                  {formErrors.rol && <div className="invalid-feedback">{formErrors.rol}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="contrasena" className="form-label">
                    Contraseña {!currentUser && <span className="text-danger">*</span>}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${formErrors.contrasena ? "is-invalid" : ""}`}
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required={!currentUser}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isViewMode}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.contrasena && <div className="invalid-feedback">{formErrors.contrasena}</div>}
                  {currentUser && !isViewMode && (
                    <small className="form-text text-muted">Dejar en blanco para mantener la contraseña actual.</small>
                  )}
                  {!currentUser && (
                    <small className="form-text text-muted">
                      La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula, un número y un
                      carácter especial.
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmarContrasena" className="form-label">
                    Confirmar Contraseña {!currentUser && <span className="text-danger">*</span>}
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${formErrors.confirmarContrasena ? "is-invalid" : ""}`}
                      id="confirmarContrasena"
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={onInputChange}
                      disabled={isViewMode}
                      required={!currentUser}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isViewMode}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.confirmarContrasena && (
                    <div className="invalid-feedback">{formErrors.confirmarContrasena}</div>
                  )}
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
                disabled={imageLoading}
              >
                <Save size={18} className="me-1" />
                Guardar Usuario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserForm
