"use client"

import { useState } from "react"
import { Card, Button, Form, Row, Col } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService" // Importa el service
import "../MiPerfilComponents/ProfileInfo.scss"

const ProfileInfo = ({ user, updateUser }) => {
  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({ ...user })

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Guardar cambios del perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const updatedData = {
        Nombre: formData.nombre,
        Apellido: formData.apellido,
        Correo: formData.correo,
        Documento: formData.documento,
        // Otros campos si los tienes
      }
      // Usa el ID del cliente, no del usuario
      await PerfilClienteService.updatePerfil(user.IdCliente, updatedData)
      const refreshed = await PerfilClienteService.getPerfil()
      updateUser(refreshed)
      setIsEditing(false)
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      toast.error(error.message || "Error al actualizar perfil")
    }
  }

  return (
    <Card className="border-0 shadow mb-4">
      <Card.Header className="tc-profile-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Información Personal</h4>
          <Button
            variant={isEditing ? "outline-secondary" : "success"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                setFormData({ ...user })
              }
              setIsEditing(!isEditing)
            }}
          >
            {isEditing ? (
              <>
                <i className="bi bi-x-circle me-1"></i> Cancelar
              </>
            ) : (
              <>
                <i className="bi bi-pencil me-1"></i> Editar
              </>
            )}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {isEditing ? (
          <Form onSubmit={handleSaveProfile}>
            <Row className="mb-3">
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="documento">
                  <Form.Label>Documento</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-card-text"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={formData.documento}
                      disabled
                      className="bg-light"
                    />
                  </div>
                  <Form.Text className="text-muted">El documento no se puede modificar</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="correo">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} className="mb-3 mb-md-0">
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="apellido">
                  <Form.Label>Apellido</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" variant="success">
                <i className="bi bi-save me-1"></i> Guardar Cambios
              </Button>
            </div>
          </Form>
        ) : (
          <div className="tc-profile-info">
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Documento</h6>
                  <p className="tc-info-value">{user.documento}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Correo Electrónico</h6>
                  <p className="tc-info-value">{user.correo}</p>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Nombre</h6>
                  <p className="tc-info-value">{user.nombre}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="tc-info-group">
                  <h6 className="tc-info-label">Apellido</h6>
                  <p className="tc-info-value">{user.apellido}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProfileInfo