"use client"

import { useState, useEffect } from "react"
import Select from "react-select"
import "../VentasComponents/ProductoDevolucionForm.scss"

/**
 * Componente para el formulario de agregar productos a devolver
 */
const ProductoDevolucionForm = ({
  devolucionActual,
  formErrors,
  productosOptions,
  motivosOptions,
  estadosOptions,
  handleSelectProducto,
  handleInputChange,
  handleIncrementarCantidad,
  handleDecrementarCantidad,
  handleSelectMotivo,
  handleSelectEstado,
  handleAgregarDevolucion,
}) => {
  // Estados para controlar el foco en los selects
  const [productoFocused, setProductoFocused] = useState(false)
  const [motivoFocused, setMotivoFocused] = useState(false)
  const [estadoFocused, setEstadoFocused] = useState(false)

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused 
        ? "#00b8e0" 
        : formErrors.producto 
          ? "#dc3545" 
          : "#ced4da",
      boxShadow: state.isFocused 
        ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" 
        : null,
      "&:hover": {
        borderColor: state.isFocused 
          ? "#00b8e0" 
          : formErrors.producto 
            ? "#dc3545" 
            : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? "#00b8e0" 
        : state.isFocused 
          ? "#f8fcff" 
          : null,
      color: state.isSelected ? "white" : "#3a3a3a",
      "&:active": {
        backgroundColor: state.isSelected ? "#00b8e0" : "#e9ecef",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  }

  const motivoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused 
        ? "#00b8e0" 
        : formErrors.motivo 
          ? "#dc3545" 
          : "#ced4da",
      boxShadow: state.isFocused 
        ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" 
        : null,
      "&:hover": {
        borderColor: state.isFocused 
          ? "#00b8e0" 
          : formErrors.motivo 
            ? "#dc3545" 
            : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
  }

  const estadoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused 
        ? "#00b8e0" 
        : formErrors.estado 
          ? "#dc3545" 
          : "#ced4da",
      boxShadow: state.isFocused 
        ? "0 0 0 0.25rem rgba(0, 184, 224, 0.25)" 
        : null,
      "&:hover": {
        borderColor: state.isFocused 
          ? "#00b8e0" 
          : formErrors.estado 
            ? "#dc3545" 
            : "#ced4da",
      },
      height: "calc(3.5rem + 2px)",
      paddingTop: "1.625rem",
      paddingBottom: "0.625rem",
    }),
  }

  return (
    <div className="producto-devolucion-form">
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Agregar Producto a Devolver</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <div className={`select-container ${productoFocused ? "is-focused" : ""} ${formErrors.producto ? "has-error" : ""}`}>
                <div className="select-label">
                  Seleccionar Producto <span className="select-required">*</span>
                </div>
                <Select
                  options={productosOptions}
                  value={
                    devolucionActual.producto
                      ? productosOptions.find((option) => option.value.id === devolucionActual.producto.id)
                      : null
                  }
                  onChange={handleSelectProducto}
                  placeholder="Seleccione un producto..."
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay productos disponibles"}
                  className={formErrors.producto ? "is-invalid" : ""}
                  onFocus={() => setProductoFocused(true)}
                  onBlur={() => setProductoFocused(false)}
                />
                {formErrors.producto && <div className="invalid-feedback">{formErrors.producto}</div>}
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-floating">
                <div className="input-group">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleDecrementarCantidad}
                    disabled={!devolucionActual.producto || devolucionActual.cantidad <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className={`form-control text-center ${formErrors.cantidad ? "is-invalid" : ""}`}
                    name="cantidad"
                    value={devolucionActual.cantidad}
                    onChange={handleInputChange}
                    min="1"
                    max={devolucionActual.producto ? devolucionActual.producto.cantidad : 1}
                    disabled={!devolucionActual.producto}
                    placeholder="Cantidad"
                    id="cantidad-input"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleIncrementarCantidad}
                    disabled={!devolucionActual.producto || devolucionActual.cantidad >= devolucionActual.producto.cantidad}
                  >
                    +
                  </button>
                </div>
                <label htmlFor="cantidad-input">
                  Cantidad <span className="text-danger">*</span>
                </label>
                {formErrors.cantidad && <div className="invalid-feedback">{formErrors.cantidad}</div>}
                {devolucionActual.producto && (
                  <small className="text-muted">Original: {devolucionActual.producto.cantidad}</small>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <div className={`select-container ${motivoFocused ? "is-focused" : ""} ${formErrors.motivo ? "has-error" : ""}`}>
                <div className="select-label">
                  Motivo <span className="select-required">*</span>
                </div>
                <Select
                  options={motivosOptions}
                  value={
                    devolucionActual.motivo
                      ? motivosOptions.find((option) => option.value.id === devolucionActual.motivo.id)
                      : null
                  }
                  onChange={handleSelectMotivo}
                  placeholder="Seleccione un motivo..."
                  styles={motivoSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay motivos disponibles"}
                  className={formErrors.motivo ? "is-invalid" : ""}
                  onFocus={() => setMotivoFocused(true)}
                  onBlur={() => setMotivoFocused(false)}
                />
                {formErrors.motivo && <div className="invalid-feedback">{formErrors.motivo}</div>}
              </div>
            </div>
            <div className="col-md-3">
              <div className={`select-container ${estadoFocused ? "is-focused" : ""} ${formErrors.estado ? "has-error" : ""}`}>
                <div className="select-label">
                  Estado <span className="select-required">*</span>
                </div>
                <Select
                  options={estadosOptions}
                  value={
                    devolucionActual.estado
                      ? estadosOptions.find((option) => option.value.id === devolucionActual.estado.id)
                      : null
                  }
                  onChange={handleSelectEstado}
                  placeholder="Seleccione un estado..."
                  styles={estadoSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay estados disponibles"}
                  className={formErrors.estado ? "is-invalid" : ""}
                  onFocus={() => setEstadoFocused(true)}
                  onBlur={() => setEstadoFocused(false)}
                />
                {formErrors.estado && <div className="invalid-feedback">{formErrors.estado}</div>}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAgregarDevolucion}
              disabled={
                !devolucionActual.producto ||
                !devolucionActual.motivo ||
                !devolucionActual.estado ||
                devolucionActual.cantidad <= 0
              }
            >
              Agregar Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoDevolucionForm