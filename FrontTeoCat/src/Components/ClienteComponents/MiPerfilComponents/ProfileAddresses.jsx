"use client"

import { useState } from "react"
import { Card, Button, ListGroup, Badge, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import "../MiPerfilComponents/ProfileAddresses.scss"

const ProfileAddresses = ({ user, updateUser }) => {
  // Estado para el modal de nueva dirección
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Estado para el formulario de nueva dirección
  const [newAddressForm, setNewAddressForm] = useState({
    direccion: "",
    principal: false,
  })

  // Manejar cambios en el formulario de nueva dirección
  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAddressForm({
      ...newAddressForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Agregar nueva dirección
  const handleAddAddress = (e) => {
    e.preventDefault()

    if (!newAddressForm.direccion) {
      toast.error("Por favor ingresa una dirección")
      return
    }

    // Si la nueva dirección es principal, actualizar las demás
    let updatedDirecciones = [...user.direcciones]
    if (newAddressForm.principal) {
      updatedDirecciones = updatedDirecciones.map((dir) => ({
        ...dir,
        principal: false,
      }))
    }

    // Agregar la nueva dirección
    const newAddress = {
      id: user.direcciones.length + 1,
      ...newAddressForm,
    }

    updatedDirecciones.push(newAddress)

    // Actualizar el usuario
    updateUser({
      ...user,
      direcciones: updatedDirecciones,
    })

    // Cerrar modal y resetear formulario
    setShowAddressModal(false)
    setNewAddressForm({
      direccion: "",
      principal: false,
    })

    toast.success("Dirección agregada correctamente")
  }

  // Eliminar dirección
  const handleDeleteAddress = (addressId) => {
    // No permitir eliminar si solo hay una dirección
    if (user.direcciones.length <= 1) {
      toast.error("Debes tener al menos una dirección")
      return
    }

    // No permitir eliminar la dirección principal
    const addressToDelete = user.direcciones.find((dir) => dir.id === addressId)
    if (addressToDelete.principal) {
      toast.error("No puedes eliminar la dirección principal")
      return
    }

    // Confirmar eliminación
    if (window.confirm("¿Estás seguro de que deseas eliminar esta dirección?")) {
      const updatedDirecciones = user.direcciones.filter((dir) => dir.id !== addressId)

      // Actualizar el usuario
      updateUser({
        ...user,
        direcciones: updatedDirecciones,
      })

      toast.success("Dirección eliminada correctamente")
    }
  }

  // Establecer dirección como principal
  const handleSetPrimaryAddress = (addressId) => {
    // Actualizar direcciones
    const updatedDirecciones = user.direcciones.map((dir) => ({
      ...dir,
      principal: dir.id === addressId,
    }))

    // Actualizar el usuario
    updateUser({
      ...user,
      direcciones: updatedDirecciones,
    })

    toast.success("Dirección principal actualizada")
  }

  return (
    <>
      <Card className="border-0 shadow mb-4">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mis Direcciones</h4>
            <Button variant="success" size="sm" onClick={() => setShowAddressModal(true)}>
              <i className="bi bi-plus-circle me-1"></i> Añadir Dirección
            </Button>
          </div>
        </Card.Header>
        <Card.Body>




          <ListGroup variant="flush">
            {(user.direcciones || []).map((direccion) => (
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
                  <div className="tc-address-actions">
                    {!direccion.principal && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSetPrimaryAddress(direccion.id)}
                      >
                        <i className="bi bi-check-circle"></i>
                      </Button>
                    )}
                    {!direccion.principal && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(direccion.id)}>
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

      {/* Modal para agregar dirección */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Dirección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAddress}>
            <Form.Group className="mb-3" controlId="newAddressDireccion">
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

            <Form.Group className="mb-3" controlId="newAddressPrincipal">
              <Form.Check
                type="checkbox"
                label="Establecer como dirección principal"
                name="principal"
                checked={newAddressForm.principal}
                onChange={handleNewAddressChange}
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
