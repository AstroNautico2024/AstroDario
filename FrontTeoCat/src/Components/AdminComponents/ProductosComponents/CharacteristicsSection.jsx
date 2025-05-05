"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const CharacteristicsSection = ({ caracteristicas, onAddCaracteristica, onRemoveCaracteristica }) => {
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState("")

  const handleSubmit = (e) => {
    if (e) e.preventDefault() // Prevenir el envío del formulario si hay evento
    if (nuevaCaracteristica.trim()) {
      onAddCaracteristica(nuevaCaracteristica)
      setNuevaCaracteristica("")
    }
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Características</h5>
      <div className="row g-3">
        <div className="col-12">
          {/* Cambiar de form a div para evitar anidación de formularios */}
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Añadir característica (ej: Resistente al agua)"
              value={nuevaCaracteristica}
              onChange={(e) => setNuevaCaracteristica(e.target.value)}
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSubmit())}
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={!nuevaCaracteristica.trim()}
              onClick={handleSubmit}
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="form-text">Máximo 100 caracteres por característica.</div>
        </div>

        <div className="col-12">
          {caracteristicas && caracteristicas.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {caracteristicas.map((caracteristica, index) => (
                <div key={index} className="badge bg-light text-dark border d-flex align-items-center p-2">
                  <span>{caracteristica}</span>
                  <button
                    type="button"
                    className="btn btn-sm text-danger border-0 p-0 ms-2"
                    onClick={() => onRemoveCaracteristica(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted small">No hay características agregadas</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacteristicsSection
