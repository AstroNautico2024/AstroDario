"use client"

import { useState } from "react"
import { Plus, X } from 'lucide-react'

const SpecificationsSection = ({ especificaciones, onAddEspecificacion, onRemoveEspecificacion }) => {
  const [nuevaEspecificacion, setNuevaEspecificacion] = useState({
    nombre: "",
    valor: "",
  })

  const handleAddEspecificacion = () => {
    if (nuevaEspecificacion.nombre.trim() && nuevaEspecificacion.valor.trim()) {
      onAddEspecificacion(nuevaEspecificacion)
      setNuevaEspecificacion({ nombre: "", valor: "" })
    }
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Especificaciones Técnicas</h5>
      <div className="row mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre (ej: Material)"
            value={nuevaEspecificacion.nombre}
            onChange={(e) => setNuevaEspecificacion({ ...nuevaEspecificacion, nombre: e.target.value })}
            maxLength={50}
          />
        </div>
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Valor (ej: Aluminio)"
            value={nuevaEspecificacion.valor}
            onChange={(e) => setNuevaEspecificacion({ ...nuevaEspecificacion, valor: e.target.value })}
            maxLength={100}
          />
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleAddEspecificacion}
            disabled={!nuevaEspecificacion.nombre.trim() || !nuevaEspecificacion.valor.trim()}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="form-text mb-3">Máximo 50 caracteres para el nombre y 100 para el valor.</div>

      {especificaciones.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Valor</th>
                <th className="text-center" style={{ width: "80px" }}>
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {especificaciones.map((especificacion, index) => (
                <tr key={index}>
                  <td>{especificacion.nombre}</td>
                  <td>{especificacion.valor}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemoveEspecificacion(index)}
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-light">No hay especificaciones agregadas</div>
      )}
    </div>
  )
}

export default SpecificationsSection