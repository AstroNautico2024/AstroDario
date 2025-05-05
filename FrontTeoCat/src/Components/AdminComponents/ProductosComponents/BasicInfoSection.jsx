"use client"

const BasicInfoSection = ({ formData, formErrors, categorias, handleInputChange }) => {
  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Información Básica</h5>
      <div className="row g-3">
        {/* Nombre del producto */}
        <div className="col-md-6">
          <label htmlFor="NombreProducto" className="form-label">
            Nombre del Producto <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${formErrors.NombreProducto ? "is-invalid" : ""}`}
            id="NombreProducto"
            name="NombreProducto"
            value={formData.NombreProducto}
            onChange={handleInputChange}
            maxLength={100}
            required
          />
          {formErrors.NombreProducto && <div className="invalid-feedback">{formErrors.NombreProducto}</div>}
          <div className="form-text">Máximo 100 caracteres.</div>
        </div>

        {/* Categoría */}
        <div className="col-md-6">
          <label htmlFor="IdCategoriaDeProducto" className="form-label">
            Categoría <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${formErrors.IdCategoriaDeProducto ? "is-invalid" : ""}`}
            id="IdCategoriaDeProducto"
            name="IdCategoriaDeProducto"
            value={formData.IdCategoriaDeProducto}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.IdCategoriaDeProductos} value={cat.IdCategoriaDeProductos}>
                {cat.NombreCategoria}
              </option>
            ))}
          </select>
          {formErrors.IdCategoriaDeProducto && (
            <div className="invalid-feedback">{formErrors.IdCategoriaDeProducto}</div>
          )}
        </div>

        {/* Descripción */}
        <div className="col-12">
          <label htmlFor="Descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            className={`form-control ${formErrors.Descripcion ? "is-invalid" : ""}`}
            id="Descripcion"
            name="Descripcion"
            rows="3"
            value={formData.Descripcion}
            onChange={handleInputChange}
            maxLength={500}
          ></textarea>
          {formErrors.Descripcion && <div className="invalid-feedback">{formErrors.Descripcion}</div>}
          <div className="form-text">Máximo 500 caracteres.</div>
        </div>
      </div>
    </div>
  )
}

export default BasicInfoSection
