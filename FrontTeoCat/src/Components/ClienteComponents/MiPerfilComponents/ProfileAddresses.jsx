"use client"

import { useState } from "react"
import { Card, Button, ListGroup, Badge, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfileAddresses.scss"

const ProfileAddresses = ({ user, updateUser }) => {
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddressForm, setNewAddressForm] = useState({
    direccion: "",
    principal: false,
  })

  // Simula el array de direcciones a partir del campo Direccion (string)
  const direcciones =
    user.Direccion && typeof user.Direccion === "string"
      ? [
          {
            id: 1,
            direccion: user.Direccion,
            principal: true,
          },
        ]
      : []

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target
    setNewAddressForm({
      ...newAddressForm,
      [name]: value,
    })
  }

  // Editar dirección y guardar en backend
  const handleEditAddress = async (e) => {
    e.preventDefault()

    if (!newAddressForm.direccion) {
      toast.error("Por favor ingresa una dirección")
      return
    }

    try {
      await PerfilClienteService.updatePerfil(user.IdCliente, {
        ...user,
        Direccion: newAddressForm.direccion,
      })
      const refreshed = await PerfilClienteService.getPerfil()
      updateUser(refreshed)
      setShowAddressModal(false)
      setNewAddressForm({
        direccion: "",
        principal: false,
      })
      toast.success("Dirección actualizada correctamente")
    } catch (error) {
      toast.error(error?.message || "Error al actualizar dirección")
    }
  }

  // Al abrir el modal, precargar la dirección actual
  const handleShowModal = () => {
    setNewAddressForm({
      direccion: user.Direccion || "",
      principal: true,
    })
    setShowAddressModal(true)
  }

  return (
    <>
      <Card className="border-0 shadow mb-4">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mi Dirección</h4>
            <Button variant="success" size="sm" onClick={handleShowModal}>
              <i className="bi bi-pencil-square me-1"></i> Editar dirección
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {direcciones.length > 0 ? (
              direcciones.map((direccion) => (
                <ListGroup.Item key={direccion.id} className="tc-address-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt me-2 text-success"></i>
                        <span className="tc-address-text">{direccion.direccion}</span>
                      </div>
                      {direccion.principal && (
                        <Badge bg="success" className="mt-1">
                          Principal
                        </Badge>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="tc-address-item">
                <span className="text-muted">No tienes dirección registrada</span>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Modal para editar dirección */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Dirección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditAddress}>
            <Form.Group className="mb-3" controlId="editAddressDireccion">
              <Form.Label>Dirección *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Dirección completa"
                name="direccion"
                value={newAddressForm.direccion}
                onChange={handleNewAddressChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddressModal(false)}>
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ProfileAddresses