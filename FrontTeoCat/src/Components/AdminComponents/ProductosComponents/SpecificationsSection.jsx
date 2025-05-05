"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const SpecificationsSection = ({ especificaciones, onAddEspecificacion, onRemoveEspecificacion }) => {
  const [nuevaEspecificacion, setNuevaEspecificacion] = useState({
    nombre: "",
    valor: "",
  })

  const handleSubmit = (e) => {
    if (e) e.preventDefault() // Prevenir el envío del formulario si hay evento
    if (nuevaEspecificacion.nombre.trim() && nuevaEspecificacion.valor.trim()) {
      onAddEspecificacion(nuevaEspecificacion)
      setNuevaEspecificacion({ nombre: "", valor: "" })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevaEspecificacion({
      ...nuevaEspecificacion,
      [name]: value,
    })
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Especificaciones Técnicas</h5>
      <div className="row g-3">
        <div className="col-12">
          {/* Cambiar de form a div para evitar anidación de formularios */}
          <div className="row g-2">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre (ej: Material)"
                name="nombre"
                value={nuevaEspecificacion.nombre}
                onChange={handleChange}
                maxLength={50}
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Valor (ej: Aluminio)"
                name="valor"
                value={nuevaEspecificacion.valor}
                onChange={handleChange}
                maxLength={100}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                disabled={!nuevaEspecificacion.nombre.trim() || !nuevaEspecificacion.valor.trim()}
                onClick={handleSubmit}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="form-text">Máximo 50 caracteres para el nombre y 100 para el valor.</div>
        </div>

        <div className="col-12">
          {especificaciones && especificaciones.length > 0 ? (
            <div className="table-responsive mt-2">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40%" }}>Nombre</th>
                    <th style={{ width: "50%" }}>Valor</th>
                    <th style={{ width: "10%" }}>Acción</th>
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
                          className="btn btn-sm text-danger border-0"
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
            <div className="text-muted small">No hay especificaciones agregadas</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpecificationsSection
