"use client"

import { Plus, AlertTriangle } from "lucide-react"
import Select from "react-select"

/**
 * Componente para el formulario de información básica de la compra
 */
const CompraForm = ({
  formData,
  formErrors,
  proveedoresOptions,
  productosOptions,
  handleInputChange,
  handleSelectProveedor,
  handleSelectProduct,
  handleAddProduct,
}) => {
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
    <>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="proveedor" className="form-label">
            Proveedor <span className="text-danger">*</span>
          </label>
          <Select
            id="proveedor"
            name="proveedor"
            options={proveedoresOptions}
            value={
              formData.proveedor
                ? proveedoresOptions.find((option) => option.value.IdProveedor === formData.proveedor.IdProveedor)
                : null
            }
            onChange={handleSelectProveedor}
            placeholder="Seleccione un proveedor..."
            styles={customSelectStyles}
            isClearable
            isSearchable
            noOptionsMessage={() => "No se encontraron proveedores"}
            className={formErrors.proveedor ? "is-invalid" : ""}
          />
          {formErrors.proveedor && <div className="invalid-feedback d-block">{formErrors.proveedor}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="FechaCompra" className="form-label">
            Fecha de Compra <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${formErrors.FechaCompra ? "is-invalid" : ""}`}
            id="FechaCompra"
            name="FechaCompra"
            value={formData.FechaCompra}
            onChange={handleInputChange}
            required
            max={new Date().toISOString().split("T")[0]}
          />
          {formErrors.FechaCompra && <div className="invalid-feedback">{formErrors.FechaCompra}</div>}
          <small className="form-text text-muted">No puede ser una fecha futura</small>
        </div>
      </div>

      <hr className="my-4" />

      <h5 className="mb-3">Agregar Productos</h5>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="producto" className="form-label">
            Producto <span className="text-danger">*</span>
          </label>
          <Select
            id="producto"
            name="producto"
            options={productosOptions}
            value={
              formData.productoSeleccionado
                ? productosOptions.find(
                    (option) => option.value.IdProducto === formData.productoSeleccionado.IdProducto,
                  )
                : null
            }
            onChange={handleSelectProduct}
            placeholder="Seleccione un producto..."
            styles={customSelectStyles}
            isClearable
            isSearchable
            noOptionsMessage={() => "No se encontraron productos"}
            className={formErrors.productoSeleccionado ? "is-invalid" : ""}
          />
          {formErrors.productoSeleccionado && (
            <div className="invalid-feedback d-block">{formErrors.productoSeleccionado}</div>
          )}
        </div>
        <div className="col-md-2">
          <label htmlFor="cantidad" className="form-label">
            Cantidad <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${formErrors.cantidad ? "is-invalid" : ""}`}
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            min="1"
            max="1000"
            disabled={!formData.productoSeleccionado}
          />
          {formErrors.cantidad && <div className="invalid-feedback">{formErrors.cantidad}</div>}
          <small className="form-text text-muted">Máximo 1000 unidades</small>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            type="button"
            className="btn btn-success ms-auto"
            onClick={handleAddProduct}
            disabled={!formData.productoSeleccionado}
          >
            <Plus size={18} className="me-1" />
            Agregar
          </button>
        </div>
      </div>

      {formErrors.productosAgregados && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <AlertTriangle size={18} className="me-2" />
          {formErrors.productosAgregados}
        </div>
      )}
    </>
  )
}

export default CompraForm
