"use client"

import { Barcode, Info } from "lucide-react"

/**
 * Componente para la información básica del producto
 * Versión completamente revisada
 */
const BasicInfoSection = ({
  formData,
  formErrors,
  categorias,
  handleInputChange,
  handleScanBarcode,
  isExistingProduct,
  handleExistingProductChange,
}) => {
  // Opciones para el select de unidad de medida
  const unidadesMedida = [
    { value: "Unidad", label: "Unidad" },
    { value: "Kilogramo", label: "Kilogramo" },
    { value: "Libra", label: "Libra" },
    { value: "Bulto", label: "Bulto" },
    { value: "Gramo", label: "Gramo" },
    { value: "Litro", label: "Litro" },
    { value: "Mililitro", label: "Mililitro" },
    { value: "Metro", label: "Metro" },
    { value: "Centimetro", label: "Centímetro" },
  ]

  // Opciones para el select de porcentaje de IVA
  const opcionesIVA = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "19", label: "19%" },
  ]

  // Opciones para el origen del producto
  const opcionesOrigen = [
    { value: "Catálogo", label: "Catálogo" },
    { value: "Stock", label: "Stock" },
  ]

  // Función para generar código de barras aleatorio
  const generarCodigoBarras = () => {
    if (handleScanBarcode) {
      handleScanBarcode()
    } else {
      const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
      handleInputChange({
        target: {
          name: "CodigoBarras",
          value: randomBarcode.toString(),
        },
      })
    }
  }

  // Calcular el valor del IVA y el precio final
  const calcularIVA = () => {
    if (!formData.Precio || !formData.AplicaIVA) return { valorIVA: 0, precioFinal: formData.Precio || 0 }

    const precio = Number.parseFloat(formData.Precio)
    const porcentajeIVA = Number.parseFloat(formData.PorcentajeIVA || 19)
    const valorIVA = precio * (porcentajeIVA / 100)
    const precioFinal = precio + valorIVA

    return {
      valorIVA: valorIVA.toFixed(2),
      precioFinal: precioFinal.toFixed(2),
    }
  }

  const { valorIVA, precioFinal } = calcularIVA()

  // Estilos personalizados para reducir el tamaño de los campos
  const inputStyle = {
    height: "28px",
    fontSize: "0.8125rem",
    padding: "0.2rem 0.4rem",
    lineHeight: "1.2",
  }

  const selectStyle = {
    height: "28px",
    fontSize: "0.8125rem",
    padding: "0 0.4rem",
    lineHeight: "1.2",
  }

  const labelStyle = {
    fontSize: "0.8125rem",
    marginBottom: "0.2rem",
    fontWeight: "500",
  }

  return (
    <div className="mb-3">
      <h5 className="card-title mb-2" style={{ fontSize: "1rem" }}>
        Información Básica
      </h5>

      {/* Checkbox para producto existente */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="isExistingProduct"
          checked={isExistingProduct || false}
          onChange={handleExistingProductChange}
        />
        <label
          className="form-check-label d-flex align-items-center"
          htmlFor="isExistingProduct"
          style={{ fontSize: "0.875rem" }}
        >
          Producto existente (sin ingreso de stock)
          <span
            className="ms-2 text-muted"
            style={{ cursor: "help" }}
            title="Marque esta opción si el producto ya existe en su inventario y no desea ingresar stock inicial. El stock se mantendrá en 0 y deberá actualizarlo posteriormente."
          >
            <Info size={16} />
          </span>
        </label>
      </div>

      <div className="container-fluid p-0">
        {/* Nombre y Categoría */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="NombreProducto" className="form-label" style={labelStyle}>
              Nombre <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className={`form-control ${formErrors.NombreProducto ? "is-invalid" : ""}`}
              id="NombreProducto"
              name="NombreProducto"
              value={formData.NombreProducto || ""}
              onChange={handleInputChange}
              placeholder="Nombre del producto"
              required
              style={inputStyle}
            />
            {formErrors.NombreProducto && <div className="invalid-feedback small">{formErrors.NombreProducto}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="IdCategoriaDeProducto" className="form-label" style={labelStyle}>
              Categoría <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-4">
            <select
              className={`form-select ${formErrors.IdCategoriaDeProducto ? "is-invalid" : ""}`}
              id="IdCategoriaDeProducto"
              name="IdCategoriaDeProducto"
              value={formData.IdCategoriaDeProducto || ""}
              onChange={handleInputChange}
              required
              style={selectStyle}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.IdCategoriaDeProductos} value={categoria.IdCategoriaDeProductos}>
                  {categoria.NombreCategoria}
                </option>
              ))}
            </select>
            {formErrors.IdCategoriaDeProducto && (
              <div className="invalid-feedback small">{formErrors.IdCategoriaDeProducto}</div>
            )}
          </div>
        </div>

        {/* Código de barras y Referencia */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="CodigoBarras" className="form-label" style={labelStyle}>
              Código de Barras
            </label>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${formErrors.CodigoBarras ? "is-invalid" : ""}`}
                id="CodigoBarras"
                name="CodigoBarras"
                value={formData.CodigoBarras || ""}
                onChange={handleInputChange}
                placeholder="Código de barras"
                style={inputStyle}
              />
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={generarCodigoBarras}
                title="Generar código de barras"
                style={{ height: "28px", padding: "0 0.5rem" }}
              >
                <Barcode size={14} />
              </button>
            </div>
            <small className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
              Se requiere código de barras o referencia
            </small>
            {formErrors.CodigoBarras && <div className="invalid-feedback small">{formErrors.CodigoBarras}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="Referencia" className="form-label" style={labelStyle}>
              Referencia
            </label>
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className={`form-control ${formErrors.Referencia ? "is-invalid" : ""}`}
              id="Referencia"
              name="Referencia"
              value={formData.Referencia || ""}
              onChange={handleInputChange}
              placeholder="Referencia del producto"
              style={inputStyle}
            />
            <small className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
              Código único para identificar el producto
            </small>
            {formErrors.Referencia && <div className="invalid-feedback small">{formErrors.Referencia}</div>}
          </div>
        </div>

        {/* Unidad de Medida, Factor de Conversión y Origen */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="UnidadMedida" className="form-label" style={labelStyle}>
              Unidad de Medida <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-2">
            <select
              className={`form-select ${formErrors.UnidadMedida ? "is-invalid" : ""}`}
              id="UnidadMedida"
              name="UnidadMedida"
              value={formData.UnidadMedida || "Unidad"}
              onChange={handleInputChange}
              required
              style={selectStyle}
            >
              {unidadesMedida.map((unidad) => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </option>
              ))}
            </select>
            {formErrors.UnidadMedida && <div className="invalid-feedback small">{formErrors.UnidadMedida}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="FactorConversion" className="form-label" style={labelStyle}>
              Factor de Conversión
            </label>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className={`form-control ${formErrors.FactorConversion ? "is-invalid" : ""}`}
              id="FactorConversion"
              name="FactorConversion"
              value={formData.FactorConversion || ""}
              onChange={handleInputChange}
              placeholder="1"
              min="0.0001"
              step="0.0001"
              style={inputStyle}
            />
            {formErrors.FactorConversion && <div className="invalid-feedback small">{formErrors.FactorConversion}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="Origen" className="form-label" style={labelStyle}>
              Origen
            </label>
          </div>
          <div className="col-md-2">
            <select
              className={`form-select ${formErrors.Origen ? "is-invalid" : ""}`}
              id="Origen"
              name="Origen"
              value={formData.Origen || "Catálogo"}
              onChange={handleInputChange}
              style={selectStyle}
            >
              {opcionesOrigen.map((origen) => (
                <option key={origen.value} value={origen.value}>
                  {origen.label}
                </option>
              ))}
            </select>
            {formErrors.Origen && <div className="invalid-feedback small">{formErrors.Origen}</div>}
          </div>
        </div>

        {/* Precio de Compra, Margen de Ganancia y Precio de Venta */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="Precio" className="form-label" style={labelStyle}>
              Precio de Compra <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-2">
            <div className="input-group">
              <span className="input-group-text" style={{ height: "28px", padding: "0 0.5rem" }}>
                $
              </span>
              <input
                type="number"
                className={`form-control ${formErrors.Precio ? "is-invalid" : ""}`}
                id="Precio"
                name="Precio"
                value={formData.Precio || ""}
                onChange={handleInputChange}
                placeholder=""
                min="0"
                step="0.01"
                required
                style={inputStyle}
              />
            </div>
            {formErrors.Precio && <div className="invalid-feedback small">{formErrors.Precio}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="MargenGanancia" className="form-label" style={labelStyle}>
              Margen de Ganancia (%)
            </label>
          </div>
          <div className="col-md-2">
            <div className="input-group">
              <input
                type="number"
                className={`form-control ${formErrors.MargenGanancia ? "is-invalid" : ""}`}
                id="MargenGanancia"
                name="MargenGanancia"
                value={formData.MargenGanancia || ""}
                onChange={handleInputChange}
                placeholder="30"
                min="0"
                max="100"
                step="0.01"
                style={inputStyle}
              />
              <span className="input-group-text" style={{ height: "28px", padding: "0 0.5rem" }}>
                %
              </span>
            </div>
            {formErrors.MargenGanancia && <div className="invalid-feedback small">{formErrors.MargenGanancia}</div>}
          </div>

          <div className="col-md-2">
            <label htmlFor="PrecioVenta" className="form-label" style={labelStyle}>
              Precio de Venta
            </label>
          </div>
          <div className="col-md-2">
            <div className="input-group">
              <span className="input-group-text" style={{ height: "28px", padding: "0 0.5rem" }}>
                $
              </span>
              <input
                type="number"
                className={`form-control ${formErrors.PrecioVenta ? "is-invalid" : ""}`}
                id="PrecioVenta"
                name="PrecioVenta"
                value={formData.PrecioVenta || ""}
                onChange={handleInputChange}
                placeholder=""
                min="0"
                step="0.01"
                style={inputStyle}
              />
            </div>
            <small className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
              Calculado automáticamente
            </small>
            {formErrors.PrecioVenta && <div className="invalid-feedback small">{formErrors.PrecioVenta}</div>}
          </div>
        </div>

        {/* Stock, Fecha de Vencimiento y Aplica IVA */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="Stock" className="form-label" style={labelStyle}>
              Stock <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className={`form-control ${formErrors.Stock ? "is-invalid" : ""}`}
              id="Stock"
              name="Stock"
              value={formData.Stock || ""}
              onChange={handleInputChange}
              placeholder=""
              min="0"
              step="1"
              required
              disabled={isExistingProduct}
              style={inputStyle}
            />
            {formErrors.Stock && <div className="invalid-feedback small">{formErrors.Stock}</div>}
          </div>





         <div className="col-md-2">
  <label htmlFor="FechaVencimiento" className="form-label" style={labelStyle}>
    Fecha de Vencimiento
  </label>
</div>
<div className="col-md-2">
  <input
    type="date"
    className={`form-control ${formErrors.FechaVencimiento ? "is-invalid" : ""}`}
    id="FechaVencimiento"
    name="FechaVencimiento"
    value={formData.FechaVencimiento || ""}
    onChange={handleInputChange}
    style={inputStyle}
    disabled={formData.NoVence}
  />
  {formErrors.FechaVencimiento && <div className="invalid-feedback small">{formErrors.FechaVencimiento}</div>}
  <div className="form-check mt-2">
    <input
      className="form-check-input"
      type="checkbox"
      id="NoVence"
      name="NoVence"
      checked={formData.NoVence}
      onChange={handleInputChange}
    />
    <label className="form-check-label" htmlFor="NoVence">
      Este producto no vence
    </label>
  </div>
</div>







          <div className="col-md-2">
            <div className="form-check mt-1">
              <input
                className="form-check-input"
                type="checkbox"
                id="AplicaIVA"
                name="AplicaIVA"
                checked={formData.AplicaIVA || false}
                onChange={handleInputChange}
              />
              <label className="form-check-label" style={{ fontSize: "0.875rem" }} htmlFor="AplicaIVA">
                Aplica IVA
              </label>
            </div>
          </div>
        </div>

        {/* Porcentaje de IVA (solo si aplica IVA) */}
        {formData.AplicaIVA && (
          <div className="row mb-2 align-items-start">
            <div className="col-md-2">
              <label htmlFor="PorcentajeIVA" className="form-label" style={labelStyle}>
                Porcentaje de IVA
              </label>
            </div>
            <div className="col-md-2">
              <select
                className={`form-select ${formErrors.PorcentajeIVA ? "is-invalid" : ""}`}
                id="PorcentajeIVA"
                name="PorcentajeIVA"
                value={formData.PorcentajeIVA || "19"}
                onChange={handleInputChange}
                style={selectStyle}
              >
                {opcionesIVA.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              {formErrors.PorcentajeIVA && <div className="invalid-feedback small">{formErrors.PorcentajeIVA}</div>}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="row mb-2 align-items-start">
          <div className="col-md-2">
            <label htmlFor="Descripcion" className="form-label" style={labelStyle}>
              Descripción <span className="text-danger">*</span>
            </label>
          </div>
          <div className="col-md-10">
            <textarea
              className={`form-control ${formErrors.Descripcion ? "is-invalid" : ""}`}
              id="Descripcion"
              name="Descripcion"
              value={formData.Descripcion || ""}
              onChange={handleInputChange}
              rows={2}
              placeholder="Descripción detallada del producto"
              required
              style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}
            ></textarea>
            {formErrors.Descripcion && <div className="invalid-feedback small">{formErrors.Descripcion}</div>}
          </div>
        </div>

        {/* Cálculo de IVA (solo mostrar si aplica IVA) */}
        {formData.AplicaIVA && formData.Precio && (
          <div className="row mb-2">
            <div className="col-md-2">
              <label className="form-label" style={labelStyle}>
                Cálculo de IVA
              </label>
            </div>
            <div className="col-md-10">
              <div className="card bg-light">
                <div className="card-body py-1 px-2">
                  <div style={{ fontSize: "0.875rem" }}>
                    <div>
                      <strong>Valor IVA ({formData.PorcentajeIVA || 19}%):</strong> ${valorIVA}
                    </div>
                    <div>
                      <strong>Precio final con IVA:</strong> ${precioFinal}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BasicInfoSection
