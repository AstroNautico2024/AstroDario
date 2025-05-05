"use client"

import { useState } from "react"
import { Card, Button, ListGroup, Badge, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfilePhones.scss"

const ProfilePhones = ({ user, updateUser }) => {
  // Estado para el modal de nuevo teléfono
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  // Estado para el formulario de nuevo teléfono
  const [newPhoneForm, setNewPhoneForm] = useState({
    numero: "",
    principal: false,
  })

  // Manejar cambios en el formulario de nuevo teléfono
  const handleNewPhoneChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewPhoneForm({
      ...newPhoneForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Agregar nuevo teléfono
  const handleAddPhone = (e) => {
    e.preventDefault()

    if (!newPhoneForm.numero) {
      toast.error("Por favor ingresa un número de teléfono")
      return
    }

    // Validar formato de teléfono (simple)
    if (!/^\d{10}$/.test(newPhoneForm.numero)) {
      toast.error("Por favor ingresa un número de teléfono válido (10 dígitos)")
      return
    }

    // Si el nuevo teléfono es principal, actualizar los demás
    let updatedTelefonos = [...user.telefonos]
    if (newPhoneForm.principal) {
      updatedTelefonos = updatedTelefonos.map((tel) => ({
        ...tel,
        principal: false,
      }))
    }

    // Agregar el nuevo teléfono
    const newPhone = {
      id: user.telefonos.length + 1,
      ...newPhoneForm,
    }

    updatedTelefonos.push(newPhone)

    // Actualizar el usuario
    updateUser({
      ...user,
      telefonos: updatedTelefonos,
    })

    // Cerrar modal y resetear formulario
    setShowPhoneModal(false)
    setNewPhoneForm({
      numero: "",
      principal: false,
    })

    toast.success("Teléfono agregado correctamente")
  }

  // Eliminar teléfono
  const handleDeletePhone = (phoneId) => {
    // No permitir eliminar si solo hay un teléfono
    if (user.telefonos.length <= 1) {
      toast.error("Debes tener al menos un teléfono")
      return
    }

    // No permitir eliminar el teléfono principal
    const phoneToDelete = user.telefonos.find((tel) => tel.id === phoneId)
    if (phoneToDelete.principal) {
      toast.error("No puedes eliminar el teléfono principal")
      return
    }

    // Confirmar eliminación
    if (window.confirm("¿Estás seguro de que deseas eliminar este teléfono?")) {
      const updatedTelefonos = user.telefonos.filter((tel) => tel.id !== phoneId)

      // Actualizar el usuario
      updateUser({
        ...user,
        telefonos: updatedTelefonos,
      })

      toast.success("Teléfono eliminado correctamente")
    }
  }

  // Establecer teléfono como principal
  const handleSetPrimaryPhone = (phoneId) => {
    // Actualizar teléfonos
    const updatedTelefonos = user.telefonos.map((tel) => ({
      ...tel,
      principal: tel.id === phoneId,
    }))

    // Actualizar el usuario
    updateUser({
      ...user,
      telefonos: updatedTelefonos,
    })

    toast.success("Teléfono principal actualizado")
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
            <h4 className="mb-0">Mis Teléfonos</h4>
            <Button variant="success" size="sm" onClick={() => setShowPhoneModal(true)}>
              <i className="bi bi-plus-circle me-1"></i> Añadir Teléfono
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {user.telefonos.map((telefono) => (
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
                  <div className="tc-phone-actions">
                    {!telefono.principal && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSetPrimaryPhone(telefono.id)}
                      >
                        <i className="bi bi-check-circle"></i>
                      </Button>
                    )}
                    {!telefono.principal && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeletePhone(telefono.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Modal para agregar teléfono */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Teléfono</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPhone}>
            <Form.Group className="mb-3" controlId="newPhoneNumero">
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

            <Form.Group className="mb-3" controlId="newPhonePrincipal">
              <Form.Check
                type="checkbox"
                label="Establecer como teléfono principal"
                name="principal"
                checked={newPhoneForm.principal}
                onChange={handleNewPhoneChange}
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
