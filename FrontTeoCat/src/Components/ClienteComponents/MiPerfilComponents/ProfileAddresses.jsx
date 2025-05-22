"use client"

import { useState } from "react"
import { Card, Button, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfileAddresses.scss"

const ProfileAddresses = ({ user, updateUser }) => {
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddressForm, setNewAddressForm] = useState({
    direccion: "",
  })

  // Solo un campo de dirección
  const direccion = user.direccion && typeof user.direccion === "string"
    ? user.direccion
    : ""

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
        Direccion: newAddressForm.direccion,
      })
      const refreshed = await PerfilClienteService.getPerfil()
      updateUser(refreshed)
      setShowAddressModal(false)
      setNewAddressForm({ direccion: "" })
  toast.success("Dirección actualizada correctamente", { pauseOnHover: false }) // No me borres nunca esto
    } catch (error) {
      toast.error(error?.message || "Error al actualizar dirección")
    }
  }

  // Al abrir el modal, precargar la dirección actual
  const handleShowModal = () => {
    setNewAddressForm({
      direccion: user.direccion || "",
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
          {direccion ? (
            <div className="tc-address-item">
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt me-2 text-success"></i>
                <span className="tc-address-text">{direccion}</span>
              </div>
            </div>
          ) : (
            <span className="text-muted">No tienes dirección registrada</span>
          )}
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