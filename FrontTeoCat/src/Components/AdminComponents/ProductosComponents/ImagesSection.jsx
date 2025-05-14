"use client"

import { Upload, X } from "lucide-react"

const ImagesSection = ({ imagenesPreview, onImageUpload, onRemoveImage }) => {
  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Imágenes del Producto</h5>
      <div className="row g-3">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="col-md-3 col-6">
              <div
                className="border rounded position-relative d-flex flex-column justify-content-center align-items-center"
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
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="text-muted mb-2" size={24} />
                    <span className="text-muted small">Imagen {index + 1}</span>
                    <input
                      type="file"
                      className="position-absolute inset-0 opacity-0 cursor-pointer"
                      style={{ cursor: "pointer", width: "100%", height: "100%" }}
                      accept="image/*"
                      onChange={(e) => onImageUpload(e, index)}
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
