"use client"

import { Link } from "react-router-dom"
import { Card, Badge, Button } from "react-bootstrap"
import "../MiPerfilComponents/ProfileOrders.scss"

const ProfileOrders = ({ orders }) => {
  // Función para abrir WhatsApp con mensaje predefinido
  const openWhatsApp = (orderId) => {
    const message = `Hola, necesito ayuda con mi pedido #${orderId} en Teo/Cat.`
    const whatsappUrl = `https://wa.me/+573XXXXXXXXX?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Card className="border-0 shadow">
      <Card.Header className="tc-profile-card-header">
        <h4 className="mb-0">Mis Pedidos</h4>
      </Card.Header>
      <Card.Body>
        {orders.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-box-seam fs-1 mb-3" style={{ color: "#7ab51d" }}></i>
            <h5>No tienes pedidos aún</h5>
            <p className="mb-4">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
            <Link to="/catalogo" className="btn btn-success">
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="accordion" id="accordionOrders">
            {orders.map((order, index) => (
              <div className="accordion-item tc-order-item" key={order.id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                  >
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <span className="tc-order-id">
                        <strong>Pedido:</strong> {order.id}
                      </span>
                      <span className="tc-order-date d-none d-md-block">
                        <strong>Fecha:</strong> {order.date}
                      </span>
                      <span className="tc-order-total d-none d-md-block">
                        <strong>Total:</strong> ${order.total.toLocaleString()}
                      </span>
                      <span>
                        <Badge
                          bg={order.status === "Entregado" ? "success" : "warning"}
                          text={order.status === "Entregado" ? "white" : "dark"}
                          className="tc-order-status"
                        >
                          {order.status}
                        </Badge>
                      </span>
                    </div>
                  </button>
                </h2>
                <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#accordionOrders">
                  <div className="accordion-body">
                    <div className="table-responsive">
                      <table className="table tc-order-items-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, itemIndex) => (
                            <tr key={itemIndex}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>${item.price.toLocaleString()}</td>
                              <td>${(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">
                              Total:
                            </td>
                            <td className="fw-bold">${order.total.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="d-flex justify-content-end mt-3">
                      <Button variant="success" size="sm" className="me-2" onClick={() => openWhatsApp(order.id)}>
                        <i className="bi bi-whatsapp me-1"></i> WhatsApp
                      </Button>
                      <Button variant="brown" size="sm" className="me-2">
                        <i className="bi bi-file-earmark-text me-1"></i> Ver Factura
                      </Button>
                      {order.status !== "Entregado" && (
                        <Button variant="outline-danger" size="sm">
                          <i className="bi bi-x-circle me-1"></i> Cancelar Pedido
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProfileOrders
