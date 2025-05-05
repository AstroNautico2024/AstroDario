"use client"
import { X, Upload } from "lucide-react"

const ImagesSection = ({ imagenesPreview, onImageUpload, onRemoveImage }) => {
  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Fotos del Producto (Máximo 4)</h5>
      <div className="row g-2">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="col-6 col-sm-3">
              <div
                className="image-upload-container border rounded d-flex flex-column justify-content-center align-items-center position-relative"
                style={{ height: "150px", overflow: "hidden" }}
              >
                {imagenesPreview[index] ? (
                  <>
                    <img
                      src={imagenesPreview[index] || "/placeholder.svg"}
                      alt={`Vista previa ${index + 1}`}
                      className="img-fluid"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      onClick={() => onRemoveImage(index)}
                      title="Eliminar imagen"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-muted mb-2" />
                    <small className="text-muted text-center">Imagen {index + 1}</small>
                    <input
                      type="file"
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                      accept="image/*"
                      onChange={(e) => onImageUpload(e, index)}
                      style={{ cursor: "pointer" }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="form-text mt-2">Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.</div>
    </div>
  )
}

export default ImagesSection
