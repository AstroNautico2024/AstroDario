"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import Select from "react-select"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Componente unificado para gestionar atributos y especificaciones del producto
 */
const AttributesAndSpecificationsSection = ({
  selectedAttributes,
  setSelectedAttributes,
  isVariant = false,
  parentProductAttributes = null,
  onOpenAttributeTypeModal,
  onOpenAttributeValueModal,
  atributos,
  caracteristicas,
  especificaciones,
  onAddCaracteristica,
  onRemoveCaracteristica,
  onAddEspecificacion,
  onRemoveEspecificacion,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tiposAtributos, setTiposAtributos] = useState([])
  const [valoresDisponibles, setValoresDisponibles] = useState([])
  const [selectedTipoAtributo, setSelectedTipoAtributo] = useState(null)
  const [selectedValorAtributo, setSelectedValorAtributo] = useState(null)

  // Estados para características y especificaciones
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState("")
  const [nuevaEspecificacion, setNuevaEspecificacion] = useState({
    nombre: "",
    valor: "",
  })

  // Cargar tipos de atributos al montar el componente
  useEffect(() => {
    cargarTiposAtributos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar valores cuando se selecciona un tipo de atributo
  useEffect(() => {
    if (selectedTipoAtributo) {
      cargarValoresAtributo(selectedTipoAtributo.value)
    } else {
      setValoresDisponibles([])
      setSelectedValorAtributo(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTipoAtributo])

  // Sincronizar atributos externos con el estado interno cuando cambian
  useEffect(() => {
    if (atributos && Array.isArray(atributos) && atributos.length > 0) {
      // Actualizar tiposAtributos si es necesario
      const tiposAtributosExternos = atributos.map((attr) => ({
        value: attr.id || attr.IdTipoAtributo,
        label: attr.nombre || attr.Nombre || "Sin nombre",
      }))

      // Solo actualizar si hay cambios significativos
      if (tiposAtributosExternos.length !== tiposAtributos.length) {
        setTiposAtributos(tiposAtributosExternos)
      }
    }
  }, [atributos])

  // Función para cargar tipos de atributos
  const cargarTiposAtributos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Si es una variante y tenemos atributos del producto padre, filtrar solo esos
      if (isVariant && parentProductAttributes) {
        setTiposAtributos(
          parentProductAttributes.map((attr) => ({
            value: attr.IdTipoAtributo || attr.idTipoAtributo,
            label: attr.NombreTipoAtributo || attr.nombreTipoAtributo,
          })),
        )
      } else {
        // Cargar todos los tipos de atributos
        const data = await ProductosService.getTiposAtributos()

        if (Array.isArray(data)) {
          const tiposMapeados = data
            .filter((tipo) => tipo && typeof tipo === "object")
            .map((tipo) => ({
              value: tipo.id || tipo.IdTipoAtributo,
              label: tipo.nombre || tipo.Nombre || "Sin nombre",
            }))

          setTiposAtributos(tiposMapeados)
        } else {
          setTiposAtributos([])
        }
      }
    } catch (error) {
      console.error("Error al cargar tipos de atributos:", error)
      setError("No se pudieron cargar los tipos de atributos")
    } finally {
      setLoading(false)
    }
  }

  // Añadir esta función después de cargarTiposAtributos
  const actualizarTiposAtributos = (nuevoTipo) => {
    // Asegurarse de que el nuevo tipo tenga el formato correcto
    if (nuevoTipo) {
      const nuevoTipoFormateado = {
        value: nuevoTipo.id || nuevoTipo.IdTipoAtributo,
        label: nuevoTipo.nombre || nuevoTipo.Nombre || "Nuevo tipo",
      }

      // Verificar que no exista ya en la lista
      const existe = tiposAtributos.some((tipo) => tipo.value === nuevoTipoFormateado.value)

      if (!existe) {
        setTiposAtributos((prevTipos) => [...prevTipos, nuevoTipoFormateado])

        // Seleccionar automáticamente el nuevo tipo
        setSelectedTipoAtributo(nuevoTipoFormateado)
      }
    }
  }

  // Función para cargar valores de un tipo de atributo
  const cargarValoresAtributo = async (tipoId) => {
    if (!tipoId) return

    try {
      setLoading(true)
      setError(null)

      // Si es una variante y tenemos atributos del producto padre, filtrar solo esos valores
      if (isVariant && parentProductAttributes) {
        const atributoParent = parentProductAttributes.find(
          (attr) => attr.IdTipoAtributo === tipoId || attr.idTipoAtributo === tipoId,
        )
        if (atributoParent && Array.isArray(atributoParent.valores)) {
          setValoresDisponibles(
            atributoParent.valores.map((val) => ({
              value: val.IdValorAtributo || val.idValorAtributo,
              label: val.Valor || val.valor,
            })),
          )
        } else {
          setValoresDisponibles([])
        }
      } else {
        // Cargar todos los valores para este tipo de atributo
        const data = await ProductosService.getValoresAtributo(tipoId)

        if (Array.isArray(data)) {
          const valoresMapeados = data
            .filter((valor) => valor && typeof valor === "object")
            .map((valor) => ({
              value: valor.id || valor.IdValorAtributo,
              label: valor.valor || valor.Valor || "Sin valor",
            }))

          setValoresDisponibles(valoresMapeados)
        } else {
          setValoresDisponibles([])
        }
      }
    } catch (error) {
      console.error(`Error al cargar valores del tipo de atributo ${tipoId}:`, error)
      setError("No se pudieron cargar los valores del atributo")
    } finally {
      setLoading(false)
    }
  }

  // Añadir esta función después de cargarValoresAtributo
  const actualizarValoresAtributo = (nuevosValores) => {
    if (nuevosValores && Array.isArray(nuevosValores)) {
      // Formatear los nuevos valores
      const valoresFormateados = nuevosValores.map((valor) => ({
        value: valor.id || valor.IdValorAtributo,
        label: valor.valor || valor.Valor || "Nuevo valor",
      }))

      // Añadir solo los valores que no existan ya
      const valoresActualizados = [...valoresDisponibles]

      valoresFormateados.forEach((nuevoValor) => {
        const existe = valoresDisponibles.some((v) => v.value === nuevoValor.value)
        if (!existe) {
          valoresActualizados.push(nuevoValor)
        }
      })

      setValoresDisponibles(valoresActualizados)
    }
  }

  // Función para agregar un atributo al producto
  const handleAddAttribute = () => {
    if (!selectedTipoAtributo || !selectedValorAtributo) {
      return
    }

    // Verificar si ya existe este atributo
    const atributoExistente = selectedAttributes.some(
      (attr) =>
        (attr.attributeId === selectedTipoAtributo.value && attr.valueId === selectedValorAtributo.value) ||
        (attr.idTipoAtributo === selectedTipoAtributo.value && attr.idValorAtributo === selectedValorAtributo.value),
    )

    if (atributoExistente) {
      setError("Este atributo ya ha sido agregado")
      return
    }

    // Agregar el nuevo atributo
    const nuevoAtributo = {
      id: Date.now(), // ID temporal para la interfaz
      attributeId: selectedTipoAtributo.value,
      attributeName: selectedTipoAtributo.label,
      valueId: selectedValorAtributo.value,
      valueName: selectedValorAtributo.label,
    }

    setSelectedAttributes([...selectedAttributes, nuevoAtributo])

    // Limpiar selección
    setSelectedValorAtributo(null)
  }

  // Función para eliminar un atributo
  const handleRemoveAttribute = (id) => {
    setSelectedAttributes(selectedAttributes.filter((attr) => attr.id !== id))
  }

  // Manejador para agregar una característica
  const handleAddCaracteristica = () => {
    if (nuevaCaracteristica.trim() === "") {
      return
    }

    if (onAddCaracteristica) {
      onAddCaracteristica(nuevaCaracteristica)
      setNuevaCaracteristica("")
    }
  }

  // Manejador para agregar una especificación
  const handleAddEspecificacion = () => {
    if (nuevaEspecificacion.nombre.trim() === "" || nuevaEspecificacion.valor.trim() === "") {
      return
    }

    if (onAddEspecificacion) {
      onAddEspecificacion(nuevaEspecificacion)
      setNuevaEspecificacion({ nombre: "", valor: "" })
    }
  }

  // Manejador para cambios en el input de especificación
  const handleEspecificacionChange = (e) => {
    const { name, value } = e.target
    setNuevaEspecificacion({
      ...nuevaEspecificacion,
      [name]: value,
    })
  }

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0d6efd" : state.isFocused ? "#f8f9fa" : null,
      color: state.isSelected ? "white" : "black",
    }),
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Atributos y Especificaciones</h5>

      {isVariant && (
        <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
          <AlertCircle size={18} className="me-2" />
          <div>Seleccione los atributos que definen esta variante. Debe elegir al menos un atributo.</div>
        </div>
      )}

      {!isVariant && (
        <div className="alert alert-light border d-flex align-items-center mb-3" role="alert">
          <AlertCircle size={18} className="me-2 text-primary" />
          <div>
            Los atributos definen las características del producto y permiten crear variantes. Por ejemplo: Color,
            Tamaño, Material, etc.
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2" />
          <div>{error}</div>
          <button className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Cerrar"></button>
        </div>
      )}

      {/* Sección de Atributos */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">Atributos</h6>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-5">
              <label className="form-label">Tipo de Atributo</label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <Select
                    options={tiposAtributos}
                    value={selectedTipoAtributo}
                    onChange={setSelectedTipoAtributo}
                    placeholder="Seleccione un tipo..."
                    styles={customSelectStyles}
                    isClearable
                    isSearchable
                    isLoading={loading}
                    noOptionsMessage={() => "No hay tipos disponibles"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => onOpenAttributeTypeModal(actualizarTiposAtributos)}
                  title="Crear nuevo tipo de atributo"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="col-md-5">
              <label className="form-label">Valor</label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <Select
                    options={valoresDisponibles}
                    value={selectedValorAtributo}
                    onChange={setSelectedValorAtributo}
                    placeholder="Seleccione un valor..."
                    styles={customSelectStyles}
                    isClearable
                    isSearchable
                    isLoading={loading}
                    isDisabled={!selectedTipoAtributo}
                    noOptionsMessage={() => "No hay valores disponibles"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    if (selectedTipoAtributo) {
                      // Asegúrate de pasar el ID como número
                      const tipoId = Number.parseInt(selectedTipoAtributo.value)
                      console.log("Abriendo modal para agregar valores al tipo:", tipoId)
                      onOpenAttributeValueModal(tipoId, actualizarValoresAtributo)
                    }
                  }}
                  disabled={!selectedTipoAtributo}
                  title="Crear nuevo valor para este atributo"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddAttribute}
                disabled={!selectedTipoAtributo || !selectedValorAtributo || loading}
              >
                <Plus size={18} className="me-1" />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de atributos agregados */}
          {selectedAttributes && selectedAttributes.length > 0 ? (
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
                  {selectedAttributes.map((atributo) => (
                    <tr key={atributo.id}>
                      <td>{atributo.attributeName}</td>
                      <td>{atributo.valueName}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveAttribute(atributo.id)}
                          aria-label="Eliminar atributo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-light">No hay atributos agregados</div>
          )}
        </div>
      </div>

      {/* Sección de Características */}
      {!isVariant && onAddCaracteristica && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h6 className="mb-0">Características</h6>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-10">
                <label className="form-label">Nueva Característica</label>
                <input
                  type="text"
                  className="form-control"
                  value={nuevaCaracteristica}
                  onChange={(e) => setNuevaCaracteristica(e.target.value)}
                  placeholder="Ej: Resistente al agua, Bajo consumo energético"
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleAddCaracteristica}
                  disabled={!nuevaCaracteristica.trim()}
                >
                  <Plus size={18} className="me-1" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de características */}
            {caracteristicas && caracteristicas.length > 0 ? (
              <div className="list-group">
                {caracteristicas.map((caracteristica, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {caracteristica}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemoveCaracteristica && onRemoveCaracteristica(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-light">No hay características agregadas</div>
            )}
          </div>
        </div>
      )}

      {/* Sección de Especificaciones */}
      {!isVariant && onAddEspecificacion && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h6 className="mb-0">Especificaciones</h6>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={nuevaEspecificacion.nombre}
                  onChange={handleEspecificacionChange}
                  placeholder="Ej: Peso, Dimensiones, Material"
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Valor</label>
                <input
                  type="text"
                  className="form-control"
                  name="valor"
                  value={nuevaEspecificacion.valor}
                  onChange={handleEspecificacionChange}
                  placeholder="Ej: 500g, 10x15x5cm, Aluminio"
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleAddEspecificacion}
                  disabled={!nuevaEspecificacion.nombre.trim() || !nuevaEspecificacion.valor.trim()}
                >
                  <Plus size={18} className="me-1" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de especificaciones */}
            {especificaciones && especificaciones.length > 0 ? (
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
                            onClick={() => onRemoveEspecificacion && onRemoveEspecificacion(index)}
                          >
                            <Trash2 size={16} />
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
        </div>
      )}
    </div>
  )
}

export default AttributesAndSpecificationsSection
