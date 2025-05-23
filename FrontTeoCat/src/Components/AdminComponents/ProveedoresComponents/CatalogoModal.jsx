"use client";

import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js";

const CatalogoModal = ({ show, onHide, onSelectProduct }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const productosData = await ProductosService.getActivosParaCompras();
          setProductos(productosData);
        } catch (error) {
          console.error("Error al cargar productos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [show]);

  const handleSelectProducto = (producto) => {
    onSelectProduct(producto);

    // Mostrar notificación
    toast.success(`${producto.NombreProducto} ha sido seleccionado`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
      <ToastContainer /> {/* Asegúrate de que esté presente */}
      <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} className="catalogo-modal">
        <Modal.Header closeButton>
          <Modal.Title>Catálogo de Productos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div>Cargando productos...</div>
          ) : (
            <div>
              {productos.map((producto) => (
                <div key={producto.IdProducto}>
                  <span>{producto.NombreProducto}</span>
                  <button onClick={() => handleSelectProducto(producto)}>Seleccionar</button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={onHide}>Cerrar</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CatalogoModal;
