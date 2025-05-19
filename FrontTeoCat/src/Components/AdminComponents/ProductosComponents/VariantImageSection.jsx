"use client"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { AlertCircle } from "lucide-react"

/**
 * Componente para gestionar las imágenes de un producto
 * Versión mejorada con diseño profesional
 */
const VariantImageSection = ({ images, errors = {}, onUpload, onRemove }) => {
  const [error, setError] = useState(null)

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Imágenes del Producto</h5>

      <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
        <AlertCircle size={18} className="me-2" />
        <div>
          Debe agregar al menos una imagen para el producto. La imagen marcada como principal será la que se muestre
          primero.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2" />
          <div>{error}</div>
          <button className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Cerrar"></button>
        </div>
      )}

      {errors.images && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2" />
          <div>{errors.images}</div>
        </div>
      )}

      {/* Mostrar imágenes en una cuadrícula con diseño mejorado */}
      <div className="row g-3 mb-4">
        {[0, 1, 2, 3].map((index) => (
          <div className="col-md-3 col-6" key={index}>
            <div
              className={`shadow-sm rounded position-relative ${
                index === 0 ? "border border-2 border-primary" : "border"
              }`}
              style={{
                height: "200px",
                background: "#f8f9fa",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
            >
              {images[index] ? (
                <>
                  {/* Imagen cargada */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src={images[index] || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      className="img-fluid"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        padding: "8px",
                      }}
                    />

                    {/* Botón para eliminar */}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                      style={{ width: "28px", height: "28px", padding: "0", lineHeight: "1" }}
                      onClick={() => onRemove && onRemove(index)}
                      title="Eliminar imagen"
                    >
                      <X size={16} />
                    </button>

                    {/* Etiqueta de Principal */}
                    {index === 0 && (
                      <div
                        className="position-absolute top-0 start-0 m-2 bg-primary text-white px-2 py-1 rounded-pill"
                        style={{ fontSize: "0.7rem", fontWeight: "500" }}
                      >
                        Principal
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Área para subir imagen */}
                  <label
                    htmlFor={`imagen${index}`}
                    className="d-flex flex-column align-items-center justify-content-center h-100 cursor-pointer"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="text-center p-3">
                      <div
                        className={`rounded-circle mb-2 mx-auto d-flex align-items-center justify-content-center ${
                          index === 0 ? "bg-primary text-white" : "bg-light text-secondary"
                        }`}
                        style={{ width: "50px", height: "50px" }}
                      >
                        <Upload size={24} />
                      </div>
                      <h6
                        className={`mb-1 ${index === 0 ? "text-primary" : "text-secondary"}`}
                        style={{ fontSize: "0.9rem" }}
                      >
                        Imagen {index + 1}
                      </h6>
                      {index === 0 && <span className="badge bg-primary mb-2">Principal</span>}
                      <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        Haga clic para subir
                      </p>
                    </div>
                    <input
                      type="file"
                      className="d-none"
                      id={`imagen${index}`}
                      onChange={(e) => onUpload && onUpload(e, index)}
                      accept="image/*"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center mt-3">
        <div className="small text-muted">
          <span className="me-3">
            <span className="badge bg-primary me-1" style={{ fontSize: "0.7rem" }}>
              i
            </span>
            Formatos permitidos: JPG, PNG, GIF
          </span>
          <span className="me-3">
            <span className="badge bg-primary me-1" style={{ fontSize: "0.7rem" }}>
              i
            </span>
            Máximo 4 imágenes
          </span>
          <span>
            <span className="badge bg-primary me-1" style={{ fontSize: "0.7rem" }}>
              i
            </span>
            La primera imagen será la principal
          </span>
        </div>
      </div>
    </div>
  )
}

export default VariantImageSection
