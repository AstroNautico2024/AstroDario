"use client"

import Select from "react-select"

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
  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : formErrors.producto ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : formErrors.producto ? "#dc3545" : "#ced4da",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0d6efd" : state.isFocused ? "#f8f9fa" : null,
      color: state.isSelected ? "white" : "black",
    }),
  }

  const motivoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : formErrors.motivo ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : formErrors.motivo ? "#dc3545" : "#ced4da",
      },
    }),
  }

  const estadoSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : formErrors.estado ? "#dc3545" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : formErrors.estado ? "#dc3545" : "#ced4da",
      },
    }),
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">Agregar Producto a Devolver</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">
              Seleccionar Producto <span className="text-danger">*</span>
            </label>
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
            />
            {formErrors.producto && <div className="invalid-feedback d-block">{formErrors.producto}</div>}
          </div>
          <div className="col-md-2">
            <label className="form-label">
              Cantidad <span className="text-danger">*</span>
            </label>
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
            {formErrors.cantidad && <div className="invalid-feedback d-block">{formErrors.cantidad}</div>}
            {devolucionActual.producto && (
              <small className="text-muted">Original: {devolucionActual.producto.cantidad}</small>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Motivo <span className="text-danger">*</span>
            </label>
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
            />
            {formErrors.motivo && <div className="invalid-feedback d-block">{formErrors.motivo}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Estado <span className="text-danger">*</span>
            </label>
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
            />
            {formErrors.estado && <div className="invalid-feedback d-block">{formErrors.estado}</div>}
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
  )
}

export default ProductoDevolucionForm

