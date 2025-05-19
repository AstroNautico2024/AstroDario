"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Save, Plus, Trash2, AlertCircle } from "lucide-react"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Modal para crear nuevos valores para un tipo de atributo
 */
const AttributeValueModal = ({ show, tipoAtributoId, onClose, onSuccess }) => {
  const [tipoAtributo, setTipoAtributo] = useState(null)
  const [nuevoValor, setNuevoValor] = useState("")
  const [valoresAgregados, setValoresAgregados] = useState([])
  const [valoresExistentes, setValoresExistentes] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingTipo, setLoadingTipo] = useState(false)
  const [error, setError] = useState(null)

  // Usar useCallback para las funciones que se usan en useEffect
  const cargarTipoAtributo = useCallback(async () => {
    try {
      setLoadingTipo(true)
      const data = await ProductosService.getTipoAtributo(tipoAtributoId)
      setTipoAtributo(data)
    } catch (error) {
      console.error("Error al cargar tipo de atributo:", error)
      setError("No se pudo cargar la información del tipo de atributo")
    } finally {
      setLoadingTipo(false)
    }
  }, [tipoAtributoId])

  // Cargar valores existentes para este tipo de atributo
  const cargarValoresExistentes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProductosService.getValoresAtributo(tipoAtributoId)

      if (Array.isArray(data)) {
        setValoresExistentes(
          data.map((valor) => ({
            id: valor.id || valor.IdValorAtributo,
            valor: valor.valor || valor.Valor,
          })),
        )
      } else {
        setValoresExistentes([])
      }
    } catch (error) {
      console.error("Error al cargar valores existentes:", error)
      setError("No se pudieron cargar los valores existentes")
    } finally {
      setLoading(false)
    }
  }, [tipoAtributoId])

  // Cargar información del tipo de atributo y sus valores existentes
  useEffect(() => {
    if (show && tipoAtributoId) {
      cargarTipoAtributo()
      cargarValoresExistentes()
    }
  }, [show, tipoAtributoId, cargarTipoAtributo, cargarValoresExistentes])

  // Limpiar estado al cerrar el modal
  useEffect(() => {
    if (!show) {
      setNuevoValor("")
      setValoresAgregados([])
      setError(null)
      setErrors({})
    }
  }, [show])

  const handleChange = (e) => {
    setNuevoValor(e.target.value)
    setErrors({})
  }

  const handleAddValor = () => {
    if (!nuevoValor.trim()) {
      setErrors({ valor: "El valor no puede estar vacío" })
      return
    }

    if (nuevoValor.length > 100) {
      setErrors({ valor: "El valor no puede exceder los 100 caracteres" })
      return
    }

    // Verificar si ya existe en los valores agregados
    if (valoresAgregados.some((v) => v.toLowerCase() === nuevoValor.trim().toLowerCase())) {
      setErrors({ valor: "Este valor ya ha sido agregado" })
      return
    }

    // Verificar si ya existe en los valores existentes
    if (valoresExistentes.some((v) => v.valor.toLowerCase() === nuevoValor.trim().toLowerCase())) {
      setErrors({ valor: "Este valor ya existe para este tipo de atributo" })
      return
    }

    // Agregar el nuevo valor
    setValoresAgregados([...valoresAgregados, nuevoValor.trim()])
    setNuevoValor("")
    setErrors({})
  }

  const handleRemoveValor = (index) => {
    const nuevosValores = [...valoresAgregados]
    nuevosValores.splice(index, 1)
    setValoresAgregados(nuevosValores)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (valoresAgregados.length === 0) {
    setError("Debe agregar al menos un valor")
    return
  }

  try {
    setLoading(true)
    setError(null)

    // Crear un array para almacenar todos los valores creados
    const createdValues = []

    // Enviar cada valor individualmente
    for (const valor of valoresAgregados) {
      // Formato correcto para la API
      const valorData = {
        IdTipoAtributo: Number.parseInt(tipoAtributoId),
        Valor: valor
      }

      // Llamar a la API para cada valor
      const response = await ProductosService.createValorAtributo(valorData)
      
      if (response) {
        createdValues.push(response)
      }
    }

    // Notificar éxito y cerrar modal
    onSuccess(createdValues)

    // Limpiar formulario
    setNuevoValor("")
    setValoresAgregados([])
  } catch (error) {
    console.error("Error al crear valores de atributo:", error)
    setError(
      error.response?.data?.message || "No se pudieron crear los valores. Verifique los datos e intente nuevamente."
    )
  } finally {
    setLoading(false)
  }
}

  // Manejar el evento de tecla Escape para cerrar el modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    }

    // Si presiona Enter en el input, agregar el valor
    if (e.key === "Enter" && document.activeElement.id === "nuevoValor") {
      e.preventDefault()
      handleAddValor()
    }
  }

  if (!show) return null

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {loadingTipo
                  ? "Cargando..."
                  : `Agregar Valores para: ${tipoAtributo?.nombre || tipoAtributo?.Nombre || "Tipo de Atributo"}`}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <AlertCircle size={18} className="me-2" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="nuevoValor" className="form-label">
                    Nuevo Valor
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className={`form-control ${errors.valor ? "is-invalid" : ""}`}
                      id="nuevoValor"
                      value={nuevoValor}
                      onChange={handleChange}
                      placeholder="Ej: Rojo, Grande, Algodón"
                      maxLength={100}
                    />
                    <button type="button" className="btn btn-primary" onClick={handleAddValor}>
                      <Plus size={18} />
                    </button>
                    {errors.valor && <div className="invalid-feedback">{errors.valor}</div>}
                  </div>
                  <div className="form-text">Presione Enter o el botón + para agregar. Máximo 100 caracteres.</div>
                </div>

                {/* Lista de valores agregados */}
                <div className="mb-3">
                  <label className="form-label">Valores a agregar</label>
                  {valoresAgregados.length > 0 ? (
                    <div className="list-group">
                      {valoresAgregados.map((valor, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {valor}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveValor(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-light">No hay valores agregados</div>
                  )}
                </div>

                {/* Lista de valores existentes */}
                {valoresExistentes.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Valores existentes</label>
                    <div className="card">
                      <div className="card-body p-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
                        <div className="d-flex flex-wrap gap-2">
                          {valoresExistentes.map((valor) => (
                            <span key={valor.id} className="badge bg-light text-dark border">
                              {valor.valor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                <X size={18} className="me-1" />
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || valoresAgregados.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-1" />
                    Guardar Valores
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttributeValueModal
