"use client"
import { Scan } from "lucide-react"

const AdditionalInfoSection = ({ formData, formErrors, handleInputChange, handleScanBarcode }) => {
  // Obtener la fecha actual en formato YYYY-MM-DD para el atributo min del input date
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Información Adicional</h5>
      <div className="row g-3">
        {/* Código de Barras */}
        <div className="col-md-6">
          <label htmlFor="CodigoBarras" className="form-label">
            Código de Barras
          </label>
          <div className="input-group">
            <input
              type="text"
              className={`form-control ${formErrors.CodigoBarras ? "is-invalid" : ""}`}
              id="CodigoBarras"
              name="CodigoBarras"
              value={formData.CodigoBarras}
              onChange={handleInputChange}
              maxLength={14}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleScanBarcode}
              title="Escanear código de barras"
            >
              <Scan size={18} />
            </button>
            {formErrors.CodigoBarras && <div className="invalid-feedback">{formErrors.CodigoBarras}</div>}
          </div>
          <div className="form-text">Entre 8 y 14 dígitos numéricos.</div>
        </div>

        {/* Referencia */}
        <div className="col-md-6">
          <label htmlFor="Referencia" className="form-label">
            Referencia
          </label>
          <input
            type="text"
            className={`form-control ${formErrors.Referencia ? "is-invalid" : ""}`}
            id="Referencia"
            name="Referencia"
            value={formData.Referencia}
            onChange={handleInputChange}
            maxLength={50}
          />
          {formErrors.Referencia && <div className="invalid-feedback">{formErrors.Referencia}</div>}
          <div className="form-text">Código o referencia interna del producto.</div>
        </div>

        {/* Fecha de Vencimiento - Agregado atributo min para evitar fechas pasadas */}
        <div className="col-md-6">
          <label htmlFor="FechaVencimiento" className="form-label">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            className={`form-control ${formErrors.FechaVencimiento ? "is-invalid" : ""}`}
            id="FechaVencimiento"
            name="FechaVencimiento"
            value={formData.FechaVencimiento}
            onChange={handleInputChange}
            disabled={formData.NoVence}
            min={today}
          />
          {formErrors.FechaVencimiento && <div className="invalid-feedback">{formErrors.FechaVencimiento}</div>}
        </div>

        {/* No Vence */}
        <div className="col-md-6">
          <div className="form-check mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="NoVence"
              name="NoVence"
              checked={formData.NoVence}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="NoVence">
              No vence
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdditionalInfoSection
