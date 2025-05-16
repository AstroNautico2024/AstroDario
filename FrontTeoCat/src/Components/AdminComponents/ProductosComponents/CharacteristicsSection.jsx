"use client"

import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

const CharacteristicsSection = ({ atributos = [], setAtributos }) => {
  const [loading, setLoading] = useState(false)
  const [tiposAtributos, setTiposAtributos] = useState([])
  const [nuevoAtributo, setNuevoAtributo] = useState({
    tipoId: "",
    tipoNombre: "",
    valorId: "",
    valorNombre: "",
  })
  const [valoresDisponibles, setValoresDisponibles] = useState([])
  const [error, setError] = useState(null)

  // Cargar tipos de atributos al montar el componente
  useEffect(() => {
    cargarTiposAtributos()
  }, [])

  // Cargar valores cuando se selecciona un tipo de atributo
  useEffect(() => {
    if (nuevoAtributo.tipoId) {
      cargarValoresAtributo(nuevoAtributo.tipoId)
    } else {
      setValoresDisponibles([])
    }
  }, [nuevoAtributo.tipoId])

  // Función para cargar tipos de atributos
  const cargarTiposAtributos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ProductosService.getTiposAtributos()

      // Verificar que data sea un array y que cada elemento tenga las propiedades necesarias
      if (!Array.isArray(data)) {
        console.warn("getTiposAtributos no devolvió un array:", data)
        setTiposAtributos([])
        return
      }

      // Filtrar elementos inválidos
      const tiposFiltrados = data.filter(
        (tipo) => tipo && typeof tipo === "object" && tipo.id !== undefined && tipo.nombre !== undefined,
      )

      setTiposAtributos(tiposFiltrados)
    } catch (error) {
      console.error("Error al cargar tipos de atributos:", error)
      setError("No se pudieron cargar los tipos de atributos")
      setTiposAtributos([])
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar valores de un tipo de atributo
  const cargarValoresAtributo = async (tipoId) => {
    if (!tipoId) return

    try {
      setLoading(true)
      setError(null)
      const data = await ProductosService.getValoresAtributo(tipoId)

      // Verificar que data sea un array y que cada elemento tenga las propiedades necesarias
      if (!Array.isArray(data)) {
        console.warn("getValoresAtributo no devolvió un array:", data)
        setValoresDisponibles([])
        return
      }

      // Filtrar elementos inválidos
      const valoresFiltrados = data.filter(
        (valor) => valor && typeof valor === "object" && valor.id !== undefined && valor.valor !== undefined,
      )

      setValoresDisponibles(valoresFiltrados)
    } catch (error) {
      console.error(`Error al cargar valores del tipo de atributo ${tipoId}:`, error)
      setError("No se pudieron cargar los valores del atributo")
      setValoresDisponibles([])
    } finally {
      setLoading(false)
    }
  }

  // Manejador para cambio de tipo de atributo
  const handleTipoChange = (e) => {
    const tipoId = e.target.value
    if (!tipoId) {
      setNuevoAtributo({
        tipoId: "",
        tipoNombre: "",
        valorId: "",
        valorNombre: "",
      })
      return
    }

    // Buscar el tipo seleccionado de forma segura
    const tipoSeleccionado = tiposAtributos.find((t) => t && t.id !== undefined && String(t.id) === tipoId)

    setNuevoAtributo({
      tipoId,
      tipoNombre: tipoSeleccionado ? tipoSeleccionado.nombre || "" : "",
      valorId: "",
      valorNombre: "",
    })
  }

  // Manejador para cambio de valor de atributo
  const handleValorChange = (e) => {
    const valorId = e.target.value
    if (!valorId) {
      setNuevoAtributo({
        ...nuevoAtributo,
        valorId: "",
        valorNombre: "",
      })
      return
    }

    // Buscar el valor seleccionado de forma segura
    const valorSeleccionado = valoresDisponibles.find((v) => v && v.id !== undefined && String(v.id) === valorId)

    setNuevoAtributo({
      ...nuevoAtributo,
      valorId,
      valorNombre: valorSeleccionado ? valorSeleccionado.valor || "" : "",
    })
  }

  // Función para agregar un atributo
  const handleAddAtributo = () => {
    if (!nuevoAtributo.tipoId || !nuevoAtributo.valorId) {
      return
    }

    // Verificar si ya existe este atributo de forma segura
    const atributoExistente =
      Array.isArray(atributos) &&
      atributos.some((attr) => attr && attr.tipoId === nuevoAtributo.tipoId && attr.valorId === nuevoAtributo.valorId)

    if (atributoExistente) {
      alert("Este atributo ya ha sido agregado")
      return
    }

    // Agregar el nuevo atributo
    const nuevoAtributoCompleto = {
      ...nuevoAtributo,
      id: Date.now(), // ID temporal para la interfaz
    }

    setAtributos((prevAtributos) => [...(Array.isArray(prevAtributos) ? prevAtributos : []), nuevoAtributoCompleto])

    // Limpiar el formulario
    setNuevoAtributo({
      tipoId: "",
      tipoNombre: "",
      valorId: "",
      valorNombre: "",
    })
  }

  // Función para eliminar un atributo
  const handleRemoveAtributo = (id) => {
    if (!Array.isArray(atributos)) {
      console.warn("atributos no es un array:", atributos)
      return
    }

    setAtributos(atributos.filter((attr) => attr && attr.id !== id))
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
        <button
          className="btn btn-outline-danger btn-sm mt-2"
          onClick={() => {
            setError(null)
            cargarTiposAtributos()
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Características del Producto</h5>

      {/* Formulario para agregar atributos */}
      <div className="row mb-3">
        <div className="col-md-5">
          <label htmlFor="tipoAtributo" className="form-label">
            Tipo de Atributo
          </label>
          <select
            id="tipoAtributo"
            className="form-select"
            value={nuevoAtributo.tipoId}
            onChange={handleTipoChange}
            disabled={loading}
          >
            <option value="">Seleccione un tipo</option>
            {Array.isArray(tiposAtributos) &&
              tiposAtributos.map((tipo) => {
                // Verificar que tipo sea válido y tenga id
                if (!tipo || tipo.id === undefined) return null

                // Convertir id a string de forma segura
                const idStr = String(tipo.id)

                return (
                  <option key={idStr} value={idStr}>
                    {tipo.nombre || ""}
                  </option>
                )
              })}
          </select>
        </div>

        <div className="col-md-5">
          <label htmlFor="valorAtributo" className="form-label">
            Valor
          </label>
          <select
            id="valorAtributo"
            className="form-select"
            value={nuevoAtributo.valorId}
            onChange={handleValorChange}
            disabled={!nuevoAtributo.tipoId || loading}
          >
            <option value="">Seleccione un valor</option>
            {Array.isArray(valoresDisponibles) &&
              valoresDisponibles.map((valor) => {
                // Verificar que valor sea válido y tenga id
                if (!valor || valor.id === undefined) return null

                // Convertir id a string de forma segura
                const idStr = String(valor.id)

                return (
                  <option key={idStr} value={idStr}>
                    {valor.valor || ""}
                  </option>
                )
              })}
          </select>
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleAddAtributo}
            disabled={!nuevoAtributo.tipoId || !nuevoAtributo.valorId || loading}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Lista de atributos agregados */}
      {Array.isArray(atributos) && atributos.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Tipo de Atributo</th>
                <th>Valor</th>
                <th className="text-center" style={{ width: "80px" }}>
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {atributos.map((atributo) => {
                // Verificar que atributo sea válido y tenga id
                if (!atributo || atributo.id === undefined) return null

                return (
                  <tr key={atributo.id}>
                    <td>{atributo.tipoNombre || ""}</td>
                    <td>{atributo.valorNombre || ""}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveAtributo(atributo.id)}
                        aria-label="Eliminar atributo"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-light">No hay características agregadas</div>
      )}
    </div>
  )
}

export default CharacteristicsSection
