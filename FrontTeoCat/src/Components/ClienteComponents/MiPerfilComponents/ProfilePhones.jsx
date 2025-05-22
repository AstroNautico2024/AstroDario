"use client"

import { useState } from "react"
import { Card, Button, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"

const ProfilePhones = ({ user, updateUser }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [newPhone, setNewPhone] = useState(user.telefono || "")

  const handlePhoneChange = (e) => {
    setNewPhone(e.target.value)
  }

  const handleEditPhone = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(newPhone)) {
      toast.error("Por favor ingresa un número de teléfono válido (10 dígitos)")
      return
    }
    try {
      await PerfilClienteService.updatePerfil(user.IdCliente, {
        Telefono: newPhone,
      })
      const refreshed = await PerfilClienteService.getPerfil()
      updateUser(refreshed)
      setShowPhoneModal(false)
      toast.success("Teléfono actualizado correctamente", { pauseOnHover: false }) //no me borres nunca esto
    } catch (error) {
      toast.error(error?.message || "Error al actualizar teléfono")
    }
  }

  return (
    <>
      <Card className="border-0 shadow mb-4">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mi Teléfono</h4>
            <Button variant="success" size="sm" onClick={() => setShowPhoneModal(true)}>
              <i className="bi bi-pencil-square me-1"></i> Editar teléfono
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {user.telefono ? (
            <div className="tc-phone-item">
              <div className="d-flex align-items-center">
                <i className="bi bi-telephone me-2 text-success"></i>
                <span className="tc-phone-text">{user.telefono}</span>
              </div>
            </div>
          ) : (
            <span className="text-muted">No tienes teléfono registrado</span>
          )}
        </Card.Body>
      </Card>

      {/* Modal para editar teléfono */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Teléfono</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditPhone}>
            <Form.Group className="mb-3" controlId="editPhone">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Número de teléfono"
                name="telefono"
                value={newPhone}
                onChange={handlePhoneChange}
                required
                maxLength={10}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowPhoneModal(false)}>
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

export default ProfilePhones