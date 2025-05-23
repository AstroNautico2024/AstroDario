"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Search } from "lucide-react";
import Select from "react-select";
import { Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js";

/**
 * Componente para el formulario de información básica de la compra
 */
const CompraForm = ({
  formData,
  formErrors,
  proveedoresOptions,
  handleInputChange,
  handleSelectProveedor,
  handleSelectProduct,
  handleAddProduct,
}) => {
  const [productos, setProductos] = useState([]);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosData = await ProductosService.getActivosParaCompras();
        setProductos(productosData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

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
  };

  const openCatalogo = () => {
    setShowCatalogo(true);
  };

  const closeCatalogo = () => {
    setShowCatalogo(false);
  };

  const handleProductSelect = (producto) => {
    handleSelectProduct(producto);
    closeCatalogo();
  };

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
          <label className="form-label">
            Producto <span className="text-danger">*</span>
          </label>
          <div className="d-flex">
            {formData.productoSeleccionado ? (
              <div className="selected-product-info form-control d-flex align-items-center">
                <span className="text-truncate">
                  {formData.productoSeleccionado.NombreProducto} - {formData.productoSeleccionado.CodigoBarras}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={openCatalogo}
              >
                <Search size={18} className="me-2" />
                Buscar en Catálogo
              </button>
            )}
            {formData.productoSeleccionado && (
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => handleSelectProduct(null)}
                title="Cambiar producto"
              >
                Cambiar
              </button>
            )}
          </div>
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
            disabled={!formData.productoSeleccionado}
          />
          {formErrors.cantidad && <div className="invalid-feedback">{formErrors.cantidad}</div>}
          <small className="form-text text-muted">Ingrese la cantidad deseada</small>
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
      <div className="row g-3">
        {productos.map((producto) => (
          <div className="col-md-4" key={producto.IdProducto}>
            <div className="card h-100 shadow-sm catalogo-card">
              <img
                src={producto.Imagen || "/img/no-image.png"}
                className="card-img-top p-3"
                alt={producto.NombreProducto}
                style={{ height: 140, objectFit: "contain", background: "#f8f9fa" }}
              />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title mb-1">{producto.NombreProducto}</h6>
                <div className="text-muted small mb-2">{producto.CodigoBarras}</div>
                <div className="mb-2">
                  <span className="badge bg-primary">{producto.NombreCategoria}</span>
                </div>
                <div className="mb-2">
                  <strong>Precio:</strong>{" "}
                  <span className="text-success">${producto.PrecioVenta?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="mb-3">
                  <strong>Stock:</strong> {producto.Stock}
                </div>
                <button
                  className="btn btn-outline-primary mt-auto"
                  onClick={() => onSelectProduct(producto)}
                >
                  <i className="bi bi-cart-plus me-2"></i>Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal del Catálogo */}
      <CatalogoModal show={showCatalogo} onHide={closeCatalogo} onSelectProduct={handleProductSelect} />
    </>
  );
};

const CatalogoModal = ({ show, onHide, onSelectProduct }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setLoading(true);
      ProductosService.getActivosParaCompras()
        .then((productosData) => {
          setProductos(productosData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Catálogo de Productos del Proveedor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
            <Spinner animation="border" variant="primary" />
            <span className="ms-3">Cargando productos...</span>
          </div>
        ) : productos.length === 0 ? (
          <div className="alert alert-info text-center">No hay productos en el catálogo de este proveedor.</div>
        ) : (
          <div className="row g-3">
            {productos.map((producto) => (
              <div className="col-md-4" key={producto.IdProducto}>
                <div className="card h-100 shadow-sm catalogo-card">
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 140 }}>
                    <img
                      src={producto.Imagen || "/img/no-image.png"}
                      className="card-img-top"
                      alt={producto.NombreProducto}
                      style={{ maxHeight: 120, objectFit: "contain", width: "auto" }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title mb-1">{producto.NombreProducto}</h6>
                    <div className="text-muted small mb-2">{producto.CodigoBarras}</div>
                    <div className="mb-2">
                      <span className="badge bg-primary">{producto.NombreCategoria}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Precio:</strong>{" "}
                      <span className="text-success">${producto.PrecioVenta?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="mb-3">
                      <strong>Stock:</strong> {producto.Stock}
                    </div>
                    <button
                      className="btn btn-outline-primary mt-auto"
                      onClick={() => {
                        onSelectProduct(producto);
                        onHide();
                      }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompraForm;
