// Modificación para checkout-form.jsx
"use client"

import { useState, useEffect } from "react"
import { Form, Row, Col, InputGroup, Collapse, Alert, Button } from "react-bootstrap"
import { motion } from "framer-motion"

const CheckoutForm = ({ onPlaceOrder }) => {
  // Estado para el formulario de cliente
  const [clientForm, setClientForm] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    ciudad: "Medellín",
    password: "",
    confirmPassword: "",
    notas: "",
    comprobantePago: null,
  })

  // Estado para verificar si el cliente está registrado
  const [isRegistered, setIsRegistered] = useState(false)

  // Estado para controlar la visibilidad del formulario completo
  const [showFullForm, setShowFullForm] = useState(false)

  // Estado para controlar errores de validación
  const [validationErrors, setValidationErrors] = useState({})

  // Estado para mostrar mensaje de cliente encontrado
  const [clientFound, setClientFound] = useState(false)

  // Estado para editar campos específicos
  const [editingField, setEditingField] = useState({
    telefono: false,
    direccion: false,
  })

  // Estado para verificar si el usuario está logueado
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Estado para la vista previa del comprobante
  const [comprobantePrevista, setComprobantePrevista] = useState(null)

  // Verificar si el usuario está logueado
  useEffect(() => {
    // Simulación de verificación de login
    // En producción, esto vendría de un contexto de autenticación o similar
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      // Cargar datos del usuario logueado
      loadLoggedInUserData()
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  // Cargar datos del usuario logueado
  const loadLoggedInUserData = () => {
    // Simulación de carga de datos del usuario logueado
    // En producción, esto vendría de una API
    setIsRegistered(true)
    setClientForm({
      documento: "12345678",
      correo: "cliente@ejemplo.com",
      nombre: "Juan",
      apellido: "Pérez",
      direccion: "Calle 123 #45-67, Medellín",
      telefono: "(604) 123-4567",
      password: "",
      confirmPassword: "",
      notas: "",
      comprobantePago: null,
    })
  }

  // Manejar cambio en el documento para buscar cliente
  const handleDocumentoChange = (e) => {
    const value = e.target.value
    setClientForm({
      ...clientForm,
      documento: value,
    })

    // Si el documento tiene al menos 8 caracteres, buscar cliente
    if (value.length >= 8) {
      checkClientExists(value)
    } else {
      // Resetear formulario si el documento es muy corto
      setIsRegistered(false)
      setShowFullForm(false)
      setClientFound(false)
    }
  }

  // Simular verificación de cliente en la base de datos
  const checkClientExists = (documento) => {
    // Simulación de búsqueda en la base de datos
    // En producción, esto sería una llamada a la API

    // Documento de ejemplo para simular cliente existente
    if (documento === "12345678") {
      // Cliente encontrado
      setIsRegistered(true)
      setClientForm({
        documento: "12345678",
        correo: "cliente@ejemplo.com",
        nombre: "Juan",
        apellido: "Pérez",
        direccion: "Calle 123 #45-67, Medellín",
        telefono: "(604) 123-4567",
        password: "",
        confirmPassword: "",
        notas: "",
        comprobantePago: null,
      })
      setShowFullForm(false)
      setClientFound(true)

      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setClientFound(false)
      }, 3000)
    } else {
      // Cliente no encontrado
      setIsRegistered(false)
      setShowFullForm(true)
    }
  }

  // Manejar cambios en el formulario de cliente
  const handleClientFormChange = (e) => {
    const { name, value, type, files } = e.target
    
    if (type === "file") {
      // Manejar carga de archivos
      if (files && files[0]) {
        setClientForm({
          ...clientForm,
          [name]: files[0]
        });
        
        // Crear URL para vista previa
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          setComprobantePrevista(e.target.result);
        };
        fileReader.readAsDataURL(files[0]);
      }
    } else {
      // Manejar cambios en campos de texto
      setClientForm({
        ...clientForm,
        [name]: value,
      });
    }

    // Validar contraseñas
    if (name === "password" || name === "confirmPassword") {
      validatePasswords(name, value)
    }
  }

  // Validar contraseñas
  const validatePasswords = (field, value) => {
    if (field === "password") {
      const isValid = value.length >= 6
      setValidationErrors({
        ...validationErrors,
        password: !isValid ? "La contraseña debe tener al menos 6 caracteres" : "",
        confirmPassword:
          clientForm.confirmPassword !== value && clientForm.confirmPassword !== ""
            ? "Las contraseñas no coinciden"
            : "",
      })
    } else if (field === "confirmPassword") {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: value !== clientForm.password ? "Las contraseñas no coinciden" : "",
      })
    }
  }

  // Validar el formulario
  const validateForm = () => {
    const errors = {}

    if (!isLoggedIn && !clientForm.documento) errors.documento = "El documento es requerido"
    if (!clientForm.correo) errors.correo = "El correo es requerido"
    if (!clientForm.nombre) errors.nombre = "El nombre es requerido"
    if (!clientForm.apellido) errors.apellido = "El apellido es requerido"
    if (!clientForm.direccion) errors.direccion = "La dirección es requerida"
    if (!clientForm.telefono) errors.telefono = "El teléfono es requerido"
    if (!clientForm.comprobantePago) errors.comprobantePago = "El comprobante de pago es requerido"

    if (!isRegistered && !isLoggedIn) {
      if (!clientForm.password) errors.password = "La contraseña es requerida"
      if (!clientForm.confirmPassword) errors.confirmPassword = "Debe confirmar la contraseña"
      if (clientForm.password !== clientForm.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden"
      if (clientForm.password && clientForm.password.length < 6)
        errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onPlaceOrder(clientForm)
    } else {
      // Scroll al primer error
      const firstError = document.querySelector(".is-invalid")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Alternar edición de campo
  const toggleFieldEdit = (field) => {
    setEditingField({
      ...editingField,
      [field]: !editingField[field],
    })
  }

  // Guardar cambio de campo
  const saveFieldEdit = (field) => {
    // Aquí iría la lógica para guardar el cambio en la API
    // Por ahora solo cambiamos el estado local
    toggleFieldEdit(field)
  }

  return (
    <Form id="checkout-form" onSubmit={handleSubmit}>
      {/* Campo de documento - solo visible si el usuario no está logueado */}
      {!isLoggedIn && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="documento">
              <Form.Label>Documento *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-card-text"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Número de documento"
                  name="documento"
                  value={clientForm.documento}
                  onChange={handleDocumentoChange}
                  isInvalid={!!validationErrors.documento}
                  required
                />
                <Form.Control.Feedback type="invalid">{validationErrors.documento}</Form.Control.Feedback>
              </InputGroup>
              <Form.Text className="text-muted">Si ya estás registrado, tus datos se cargarán automáticamente.</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      )}

      {clientFound && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle me-2"></i>
            Cliente encontrado. Datos cargados automáticamente.
          </Alert>
        </motion.div>
      )}

      {/* Información del cliente si está registrado */}
      {isRegistered && (
        <div className="client-info-summary mb-4 p-3 border rounded bg-light">
          <h6 className="mb-3">Información del cliente:</h6>
          <Row>
            <Col md={6}>
              <p className="mb-1">
                <strong>Nombre:</strong> {clientForm.nombre} {clientForm.apellido}
              </p>
              <p className="mb-1">
                <strong>Documento:</strong> {clientForm.documento}
              </p>
              <p className="mb-1">
                <strong>Correo:</strong> {clientForm.correo}
              </p>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>Teléfono:</strong> {!editingField.telefono && clientForm.telefono}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="edit-field-btn p-0"
                  onClick={() => toggleFieldEdit("telefono")}
                >
                  {editingField.telefono ? "Cancelar" : <i className="bi bi-pencil"></i>}
                </Button>
              </div>
              {editingField.telefono && (
                <div className="mb-2">
                  <InputGroup size="sm">
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={clientForm.telefono}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.telefono}
                    />
                    <Button variant="success" onClick={() => saveFieldEdit("telefono")}>
                      <i className="bi bi-check"></i>
                    </Button>
                  </InputGroup>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>Dirección:</strong> {!editingField.direccion && clientForm.direccion}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="edit-field-btn p-0"
                  onClick={() => toggleFieldEdit("direccion")}
                >
                  {editingField.direccion ? "Cancelar" : <i className="bi bi-pencil"></i>}
                </Button>
              </div>
              {editingField.direccion && (
                <div className="mb-2">
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={clientForm.direccion}
                      onChange={handleClientFormChange}
                      isInvalid={!!validationErrors.direccion}
                    />
                    <Button variant="success" onClick={() => saveFieldEdit("direccion")}>
                      <i className="bi bi-check"></i>
                    </Button>
                  </InputGroup>
                </div>
              )}
            </Col>
          </Row>
        </div>
      )}

      {/* Formulario completo si el cliente no está registrado */}
      <Collapse in={showFullForm}>
        <div>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="correo">
                <Form.Label>Correo electrónico *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-envelope"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
                    name="correo"
                    value={clientForm.correo}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.correo}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.correo}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="telefono">
                <Form.Label>Teléfono *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-telephone"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    placeholder="Teléfono"
                    name="telefono"
                    value={clientForm.telefono}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.telefono}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.telefono}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="nombre">
                <Form.Label>Nombre *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-person"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    name="nombre"
                    value={clientForm.nombre}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.nombre}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.nombre}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="apellido">
                <Form.Label>Apellido *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-person"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Apellido"
                    name="apellido"
                    value={clientForm.apellido}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.apellido}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.apellido}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="direccion">
                <Form.Label>Dirección de envío *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-geo-alt"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Dirección completa"
                    name="direccion"
                    value={clientForm.direccion}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.direccion}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.direccion}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label>Contraseña *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-lock"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Contraseña"
                    name="password"
                    value={clientForm.password}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.password}
                    required={!isRegistered}
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.password}</Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirmar Contraseña *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-lock-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Confirmar contraseña"
                    name="confirmPassword"
                    value={clientForm.confirmPassword}
                    onChange={handleClientFormChange}
                    isInvalid={!!validationErrors.confirmPassword}
                    required={!isRegistered}
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.confirmPassword}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </div>
      </Collapse>

      {/* Campo para subir comprobante de pago */}
      <Form.Group controlId="comprobantePago" className="mb-3">
        <Form.Label>Comprobante de pago *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-receipt"></i>
          </InputGroup.Text>
          <Form.Control
            type="file"
            name="comprobantePago"
            onChange={handleClientFormChange}
            accept="image/*"
            isInvalid={!!validationErrors.comprobantePago}
            required
          />
          <Form.Control.Feedback type="invalid">{validationErrors.comprobantePago}</Form.Control.Feedback>
        </InputGroup>
        <Form.Text className="text-muted">
          Sube una imagen del comprobante de pago (transferencia bancaria).
        </Form.Text>
        
        {/* Vista previa del comprobante */}
        {comprobantePrevista && (
          <div className="mt-2 comprobante-preview">
            <p className="mb-1"><small>Vista previa:</small></p>
            <div className="border rounded p-2 text-center">
              <img 
                src={comprobantePrevista || "/placeholder.svg"} 
                alt="Vista previa del comprobante" 
                className="img-fluid" 
                style={{ maxHeight: '200px' }}
              />
            </div>
          </div>
        )}
      </Form.Group>

      <Form.Group controlId="notas" className="mb-3">
        <Form.Label>Notas adicionales</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Instrucciones especiales para la entrega, referencias, etc."
          name="notas"
          value={clientForm.notas}
          onChange={handleClientFormChange}
        />
      </Form.Group>
    </Form>
  )
}

export default CheckoutForm