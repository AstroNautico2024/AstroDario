"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const CharacteristicsSection = ({ caracteristicas, onAddCaracteristica, onRemoveCaracteristica }) => {
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState("")

  const handleAddCaracteristica = () => {
    if (nuevaCaracteristica.trim()) {
      onAddCaracteristica(nuevaCaracteristica)
      setNuevaCaracteristica("")
    }
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Características</h5>
      <div className="row mb-3">
        <div className="col-md-10">
          <input
            type="text"
            className="form-control"
            placeholder="Añadir característica (ej: Resistente al agua)"
            value={nuevaCaracteristica}
            onChange={(e) => setNuevaCaracteristica(e.target.value)}
            maxLength={100}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCaracteristica())}
          />
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleAddCaracteristica}
            disabled={!nuevaCaracteristica.trim()}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="form-text mb-3">Máximo 100 caracteres por característica.</div>

      {caracteristicas.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {caracteristicas.map((caracteristica, index) => (
            <div key={index} className="badge bg-light text-dark border d-flex align-items-center p-2">
              {caracteristica}
              <button
                type="button"
                className="btn-close ms-2"
                style={{ fontSize: "0.5rem" }}
                onClick={() => onRemoveCaracteristica(index)}
                aria-label="Eliminar"
              ></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light">No hay características agregadas</div>
      )}
    </div>
  )
}

export default CharacteristicsSection
