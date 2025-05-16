"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import Select from "react-select"

/**
 * Componente para gestionar los atributos de un producto o variante
 */
const AttributesSection = ({ 
  // Eliminamos formData y setFormData ya que no se utilizan
  formErrors, 
  attributes, 
  selectedAttributes, 
  setSelectedAttributes,
  isVariant,
  parentProductAttributes
}) => {
  const [availableAttributes, setAvailableAttributes] = useState([])

  // Configurar los atributos disponibles basados en los atributos seleccionados
  useEffect(() => {
    if (isVariant && parentProductAttributes) {
      // Si es una variante, solo mostrar los atributos del producto padre
      setAvailableAttributes(parentProductAttributes.map(attr => ({
        value: attr.IdAtributo,
        label: attr.NombreAtributo,
        options: attr.valores.map(val => ({
          value: val.IdValorAtributo,
          label: val.Valor
        }))
      })))
    } else {
      // Si es un producto normal, mostrar todos los atributos disponibles
      setAvailableAttributes(attributes.map(attr => ({
        value: attr.IdAtributo,
        label: attr.NombreAtributo,
        options: attr.valores?.map(val => ({
          value: val.IdValorAtributo,
          label: val.Valor
        })) || []
      })))
    }
  }, [attributes, isVariant, parentProductAttributes])

  // Función para agregar un nuevo atributo
  const handleAddAttribute = () => {
    setSelectedAttributes([
      ...selectedAttributes,
      { attributeId: null, valueId: null }
    ])
  }

  // Función para eliminar un atributo
  const handleRemoveAttribute = (index) => {
    const newAttributes = [...selectedAttributes]
    newAttributes.splice(index, 1)
    setSelectedAttributes(newAttributes)
  }

  // Función para actualizar un atributo seleccionado
  const handleAttributeChange = (index, attributeId) => {
    const newAttributes = [...selectedAttributes]
    newAttributes[index] = { 
      attributeId, 
      valueId: null 
    }
    setSelectedAttributes(newAttributes)
  }

  // Función para actualizar el valor de un atributo
  const handleAttributeValueChange = (index, valueId) => {
    const newAttributes = [...selectedAttributes]
    newAttributes[index].valueId = valueId
    setSelectedAttributes(newAttributes)
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
      <h5 className="card-title mb-3">Atributos del Producto</h5>
      
      {isVariant && (
        <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
          <AlertCircle size={18} className="me-2" />
          <div>
            Seleccione los atributos que definen esta variante. Debe elegir al menos un atributo.
          </div>
        </div>
      )}
      
      {selectedAttributes.map((attr, index) => (
        <div key={index} className="row g-3 mb-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label" htmlFor={`attribute-${index}`}>Atributo</label>
            <Select
              id={`attribute-${index}`}
              options={availableAttributes}
              value={attr.attributeId ? availableAttributes.find(a => a.value === attr.attributeId) : null}
              onChange={(selected) => handleAttributeChange(index, selected?.value)}
              placeholder="Seleccione un atributo..."
              styles={customSelectStyles}
              isClearable
              isSearchable
              noOptionsMessage={() => "No hay atributos disponibles"}
              isDisabled={isVariant && parentProductAttributes}
              aria-label="Seleccionar atributo"
            />
          </div>
          <div className="col-md-5">
            <label className="form-label" htmlFor={`attribute-value-${index}`}>Valor</label>
            <Select
              id={`attribute-value-${index}`}
              options={attr.attributeId ? 
                availableAttributes.find(a => a.value === attr.attributeId)?.options || [] 
                : []
              }
              value={attr.valueId ? 
                availableAttributes.find(a => a.value === attr.attributeId)?.options?.find(o => o.value === attr.valueId) 
                : null
              }
              onChange={(selected) => handleAttributeValueChange(index, selected?.value)}
              placeholder="Seleccione un valor..."
              styles={customSelectStyles}
              isClearable
              isSearchable
              noOptionsMessage={() => "No hay valores disponibles"}
              isDisabled={!attr.attributeId}
              aria-label="Seleccionar valor de atributo"
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => handleRemoveAttribute(index)}
              aria-label={`Eliminar atributo ${index + 1}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={handleAddAttribute}
      >
        <Plus size={18} className="me-1" />
        Agregar Atributo
      </button>
      
      {formErrors.attributes && (
        <div className="invalid-feedback d-block mt-2">{formErrors.attributes}</div>
      )}
    </div>
  )
}

export default AttributesSection