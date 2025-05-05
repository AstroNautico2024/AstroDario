"use client"

const PricingSection = ({ formData, formErrors, precioConIva, formatNumber, handleInputChange }) => {
  // Obtener la fecha actual en formato YYYY-MM-DD para el atributo min del input date

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Precios y Stock</h5>
      <div className="row g-3">
        {/* Stock */}
        <div className="col-md-6">
          <label htmlFor="Stock" className="form-label">
            Stock <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${formErrors.Stock ? "is-invalid" : ""}`}
            id="Stock"
            name="Stock"
            value={formData.Stock}
            onChange={handleInputChange}
            min="0"
            max="9999"
            required
          />
          {formErrors.Stock && <div className="invalid-feedback">{formErrors.Stock}</div>}
          <div className="form-text">Cantidad actual: {formatNumber(Number(formData.Stock))}</div>
        </div>

        {/* Precio */}
        <div className="col-md-6">
          <label htmlFor="Precio" className="form-label">
            Precio Base <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className={`form-control ${formErrors.Precio ? "is-invalid" : ""}`}
              id="Precio"
              name="Precio"
              value={formData.Precio}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
            {formErrors.Precio && <div className="invalid-feedback">{formErrors.Precio}</div>}
          </div>
          <div className="form-text">Precio formateado: ${formatNumber(Number(formData.Precio))}</div>
        </div>

        {/* Aplica IVA */}
        <div className="col-md-6">
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="AplicaIVA"
              name="AplicaIVA"
              checked={formData.AplicaIVA}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="AplicaIVA">
              Aplica IVA
            </label>
          </div>
        </div>

        {/* Porcentaje de IVA (solo visible si aplica IVA) - Cambiado a Select */}
        {formData.AplicaIVA && (
          <div className="col-md-6">
            <label htmlFor="PorcentajeIVA" className="form-label">
              Porcentaje de IVA <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${formErrors.PorcentajeIVA ? "is-invalid" : ""}`}
              id="PorcentajeIVA"
              name="PorcentajeIVA"
              value={formData.PorcentajeIVA}
              onChange={handleInputChange}
              required={formData.AplicaIVA}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="19">19%</option>
            </select>
            {formErrors.PorcentajeIVA && <div className="invalid-feedback">{formErrors.PorcentajeIVA}</div>}
          </div>
        )}

        {/* Precio Final (calculado) */}
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body py-2">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Valor del IVA:</small>
                  <div className="fw-bold">${formatNumber(precioConIva.valorIva)}</div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Precio Final:</small>
                  <div className="fw-bold">${formatNumber(precioConIva.precioFinal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingSection
