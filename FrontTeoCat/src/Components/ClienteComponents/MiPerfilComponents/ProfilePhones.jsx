"use client"

import { useState } from "react"
import { Card, Button, ListGroup, Badge, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfilePhones.scss"

const ProfilePhones = ({ user, updateUser }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [newPhoneForm, setNewPhoneForm] = useState({
    numero: "",
    principal: false,
  })

  // Simula el array de teléfonos a partir del campo Telefono (string)
  const telefonos =
    user.Telefono && typeof user.Telefono === "string"
      ? [
          {
            id: 1,
            numero: user.Telefono,
            principal: true,
          },
        ]
      : []

  const handleNewPhoneChange = (e) => {
    const { name, value } = e.target
    setNewPhoneForm({
      ...newPhoneForm,
      [name]: value,
    })
  }

  // Editar teléfono y guardar en backend
  const handleEditPhone = async (e) => {
    e.preventDefault()

    if (!newPhoneForm.numero) {
      toast.error("Por favor ingresa un número de teléfono")
      return
    }

    if (!/^\d{10}$/.test(newPhoneForm.numero)) {
      toast.error("Por favor ingresa un número de teléfono válido (10 dígitos)")
      return
    }

    try {
      await PerfilClienteService.updatePerfil(user.id, {
        ...user,
        Telefono: newPhoneForm.numero,
      })
      const refreshed = await PerfilClienteService.getPerfil()
      updateUser(refreshed)
      setShowPhoneModal(false)
      setNewPhoneForm({
        numero: "",
        principal: false,
      })
      toast.success("Teléfono actualizado correctamente")
    } catch (error) {
      toast.error(error?.message || "Error al actualizar teléfono")
    }
  }

  // Eliminar teléfono (no permitido por regla de negocio)
  const handleDeletePhone = () => {
    toast.info("Debes tener al menos un teléfono registrado")
  }

  // Establecer teléfono como principal (no aplica, solo uno)
  const handleSetPrimaryPhone = () => {
    toast.info("Solo puedes tener un teléfono principal")
  }

  // Al abrir el modal, precargar el teléfono actual
  const handleShowModal = () => {
    setNewPhoneForm({
      numero: user.Telefono || "",
      principal: true,
    })
    setShowPhoneModal(true)
  }

  // Formatear número de teléfono para mostrar
  const formatPhoneNumber = (phone) => {
    const cleaned = ("" + phone).replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  return (
    <>
      <Card className="border-0 shadow mb-4">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mi Teléfono</h4>
            <Button variant="success" size="sm" onClick={handleShowModal}>
              <i className="bi bi-pencil-square me-1"></i> Editar teléfono
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {telefonos.length > 0 ? (
              telefonos.map((telefono) => (
                <ListGroup.Item key={telefono.id} className="tc-phone-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-telephone me-2 text-success"></i>
                        <span className="tc-phone-text">{formatPhoneNumber(telefono.numero)}</span>
                      </div>
                      {telefono.principal && (
                        <Badge bg="success" className="mt-1">
                          Principal
                        </Badge>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="tc-phone-item">
                <span className="text-muted">No tienes teléfono registrado</span>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Modal para editar teléfono */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Teléfono</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditPhone}>
            <Form.Group className="mb-3" controlId="editPhoneNumero">
              <Form.Label>Número de Teléfono *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Ingresa 10 dígitos"
                name="numero"
                value={newPhoneForm.numero}
                onChange={handleNewPhoneChange}
                required
                maxLength={10}
              />
              <Form.Text className="text-muted">
                Ingresa solo los 10 dígitos, sin espacios ni caracteres especiales.
              </Form.Text>
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