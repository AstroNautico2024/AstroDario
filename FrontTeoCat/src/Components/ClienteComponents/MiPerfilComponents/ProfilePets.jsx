"use client"

import { useState, useRef, useEffect } from "react"
import { Card, Button, Row, Col, Alert, Badge, Modal, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import "./ProfilePets.scss"
import MascotasService from "../../../Services/ConsumoCliente/MascotasClienteService.js"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService";
import EspeciesClienteService from "../../../Services/ConsumoCliente/EspeciesClienteService";

const ProfilePets = () => {
  const fileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  const [pets, setPets] = useState([])
  const [showPetModal, setShowPetModal] = useState(false)
  const [newPetForm, setNewPetForm] = useState({
    nombre: "",
    especie: "",
    raza: "",
    tamaño: "Pequeño",
    fechaNacimiento: "",
    foto: null,
    fotoPreview: "",
  })
  const [showEditPetModal, setShowEditPetModal] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [showPetDetails, setShowPetDetails] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [usuario, setUsuario] = useState(null);
  const [idCliente, setIdCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [especies, setEspecies] = useState([]);

  // Cargar usuario y cliente al montar
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const usuarioData = await PerfilClienteService.getPerfil();
        setUsuario(usuarioData);
        setIdCliente(usuarioData.cliente.id);
      } catch (error) {
        setError(error?.message || "Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  // Cuando tengas el idCliente, carga las mascotas
  const fetchMascotas = async () => {
    if (!idCliente) return;
    const data = await MascotasService.getMascotasByCliente(idCliente);
    const mappedPets = Array.isArray(data)
      ? data.map(m => ({
          id: m.IdMascota ?? m.id,
          idCliente: m.IdCliente ?? m.idCliente,
          nombre: m.Nombre ?? m.nombre ?? "",
          especie: m.Especie ?? m.especie ?? "",
          raza: m.Raza ?? m.raza ?? "",
          tamaño: m.Tamaño ?? m.tamaño ?? "",
          fechaNacimiento: (m.FechaNacimiento ?? m.fechaNacimiento ?? "").slice(0, 10),
          imagen: m.Foto ? `data:image/${m.TipoMime || "jpeg"};base64,${m.Foto}` : "/placeholder.svg",        }))
      : [];
        console.log("Mascotas mapeadas:", mappedPets);
    setPets(mappedPets);
  };

  useEffect(() => {
    fetchMascotas();
    // eslint-disable-next-line
  }, [idCliente]);

  useEffect(() => {
    EspeciesClienteService.getAll().then(setEspecies);
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!usuario) return <div>No autenticado</div>;

  // Manejar cambios en el formulario de nueva mascota
  const handleNewPetChange = (e) => {
    const { name, value } = e.target
    setNewPetForm({
      ...newPetForm,
      [name]: value,
    })
  }

  // Manejar cambio de archivo para la foto de la mascota
  const handlePetPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const filePreview = URL.createObjectURL(file)
      setNewPetForm({
        ...newPetForm,
        foto: file,
        fotoPreview: filePreview,
      })
    }
  }

  // Manejar cambio de archivo para editar la foto de la mascota
  const handleEditPetPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const filePreview = URL.createObjectURL(file)
      setEditingPet({
        ...editingPet,
        foto: file,
        fotoPreview: filePreview,
      })
    }
  }

  // Manejar cambios en el formulario de editar mascota
  const handleEditPetChange = (e) => {
    const { name, value } = e.target
    setEditingPet({
      ...editingPet,
      [name]: value,
    })
  }

  // Agregar nueva mascota (POST)
  const handleAddPet = async (e) => {
    e.preventDefault();

    if (
      !newPetForm.nombre ||
      !newPetForm.especie ||
      !newPetForm.raza ||
      !newPetForm.tamaño ||
      !newPetForm.fechaNacimiento
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      await MascotasService.createMascota(idCliente, {
        IdEspecie: parseInt(newPetForm.especie, 10),
        IdCliente: idCliente,
        Nombre: newPetForm.nombre,
        Foto: newPetForm.foto || null, // <-- Cambia esto, no envíes el File
        Raza: newPetForm.raza,
        Tamaño: newPetForm.tamaño,
        FechaNacimiento: newPetForm.fechaNacimiento,
      });
      setShowPetModal(false);
      setNewPetForm({
        nombre: "",
        especie: "",
        raza: "",
        tamaño: "Pequeño",
        fechaNacimiento: "",
        foto: null,
        fotoPreview: "",
      });
      toast.success("Mascota agregada correctamente");
      await fetchMascotas();
    } catch (error) {
      toast.error(error?.message || "Error al agregar mascota");
    }
  };

  // Abrir modal para editar mascota
  const handleEditPetClick = (pet) => {
    const petToEdit = {
      ...pet,
      nombre: pet.nombre ?? "",
      especie: pet.especie ?? "",
      raza: pet.raza ?? "",
      tamaño: pet.tamaño ?? "",
      fechaNacimiento: pet.fechaNacimiento ? pet.fechaNacimiento.slice(0, 10) : "",
      foto: null,
      fotoPreview: pet.image || "",
    };
    setEditingPet(petToEdit);
    setShowEditPetModal(true);
  };

  // Abrir modal para ver detalles de mascota
  const handleViewPetDetails = (pet) => {
    setSelectedPet({ ...pet })
    setShowPetDetails(true)
  }

  // Guardar cambios de mascota (PUT)
  const handleSavePet = async (e) => {
    e.preventDefault();

    if (
      !editingPet.nombre ||
      !editingPet.especie ||
      !editingPet.raza ||
      !editingPet.tamaño ||
      !editingPet.fechaNacimiento
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await MascotasService.updateMascota(editingPet.id, {
        Nombre: editingPet.nombre,
        Especie: editingPet.especie,
        Raza: editingPet.raza,
        Tamaño: editingPet.tamaño,
        FechaNacimiento: editingPet.fechaNacimiento,
        Foto: editingPet.foto,
      });
      setShowEditPetModal(false);
      setEditingPet(null);
      toast.success("Mascota actualizada correctamente");
      await fetchMascotas();
    } catch (error) {
      toast.error(error?.message || "Error al actualizar mascota");
    }
  };

  // Eliminar mascota (DELETE)
  const handleDeletePet = async (petId) => {
    try {
      await MascotasService.deleteMascota(petId);
      toast.success("Mascota eliminada correctamente");
      await fetchMascotas();
    } catch (error) {
      toast.error(error?.message || "Error al eliminar mascota");
    }
  };

  // Calcular la edad de la mascota en años y meses
  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    if (months < 0) {
      years--
      months += 12
    }
    if (years === 0) {
      return `${months} meses`
    } else if (months === 0) {
      return `${years} años`
    } else {
      return `${years} años y ${months} meses`
    }
  }

  return (
    <>
      <Card className="border-0 shadow">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mis Mascotas</h4>
            <Button variant="success" size="sm" onClick={() => setShowPetModal(true)}>
              <i className="bi bi-plus-circle me-1"></i> Añadir Mascota
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {pets.length === 0 ? (
            <Alert variant="info">
              <div className="text-center py-4">
                <i className="bi bi-emoji-smile fs-1 mb-3"></i>
                <h5>No tienes mascotas registradas</h5>
                <p className="mb-3">Registra a tus compañeros peludos para gestionar mejor sus citas y servicios.</p>
                <Button variant="success" onClick={() => setShowPetModal(true)}>
                  <i className="bi bi-plus-circle me-1"></i> Añadir Mascota
                </Button>
              </div>
            </Alert>
          ) : (
            <Row className="g-4">
              {pets.map((pet) => (
                <Col md={6} key={pet.id}>
                  <Card className="tc-pet-card h-100">
                    <Row className="g-0">
                      <Col xs={4}>
                        <div className="tc-pet-image-container">
                          {/* Cambiar pet.image a pet.imagen */}
                          <img src={pet.imagen || "/placeholder.svg"} alt={pet.nombre} className="tc-pet-image" />
                        </div>
                      </Col>
                      <Col xs={8}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <Card.Title className="tc-pet-name">{pet.nombre}</Card.Title>
                            <Badge bg={pet.especie === "Perro" ? "success" : "info"} className="tc-pet-badge">
                              {pet.especie}
                            </Badge>
                          </div>
                          <Card.Text as="div" className="tc-pet-details">
                            <p className="mb-1">
                              <strong>Raza:</strong> {pet.raza}
                            </p>
                            <p className="mb-1">
                              <strong>Tamaño:</strong> {pet.tamaño}
                            </p>
                            <p className="mb-3">
                              <strong>Nacimiento:</strong> {new Date(pet.fechaNacimiento).toLocaleDateString()}
                            </p>
                            <div className="tc-pet-actions">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewPetDetails(pet)}
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEditPetClick(pet)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeletePet(pet.id)}>
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </Card.Text>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>          )}
        </Card.Body>
      </Card>
      {/* Modal para agregar mascota */}
      <Modal show={showPetModal} onHide={() => setShowPetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Mascota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPet}>
            <Form.Group className="mb-3" controlId="petNombre">
              <Form.Label>Nombre de la mascota *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre"
                name="nombre"
                value={newPetForm.nombre}
                onChange={handleNewPetChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="petEspecie">
              <Form.Label>Especie *</Form.Label>
              <Form.Select name="especie" value={newPetForm.especie} onChange={handleNewPetChange} required>
                <option value="">Seleccionar...</option>
                {especies.map(e => (
                  <option key={e.IdEspecie} value={e.IdEspecie}>{e.NombreEspecie}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="petRaza">
              <Form.Label>Raza *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Raza"
                name="raza"
                value={newPetForm.raza}
                onChange={handleNewPetChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="petTamaño">
              <Form.Label>Tamaño *</Form.Label>
              <Form.Select name="tamaño" value={newPetForm.tamaño} onChange={handleNewPetChange} required>
                <option value="Pequeño">Pequeño</option>
                <option value="Grande">Grande</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="petFechaNacimiento">
              <Form.Label>Fecha de nacimiento *</Form.Label>
              <Form.Control
                type="date"
                name="fechaNacimiento"
                value={newPetForm.fechaNacimiento}
                onChange={handleNewPetChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="petFoto">
              <Form.Label>Foto</Form.Label>
              <div className="d-flex align-items-center">
                <Button variant="outline-secondary" onClick={() => fileInputRef.current.click()} className="me-2">
                  <i className="bi bi-upload me-1"></i> Subir imagen
                </Button>
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePetPhotoChange}
                  style={{ display: "none" }}
                />
                <span className="small text-muted">
                  {newPetForm.foto ? newPetForm.foto.name : "No se ha seleccionado archivo"}
                </span>
              </div>
              {newPetForm.fotoPreview && (
                <div className="mt-2">
                  <img
                    src={newPetForm.fotoPreview || "/placeholder.svg"}
                    alt="Vista previa"
                    className="img-thumbnail"
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              )}
              <Form.Text className="text-muted">Sube una foto de tu mascota (opcional)</Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowPetModal(false)}>
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Modal para editar mascota */}
      <Modal show={showEditPetModal} onHide={() => setShowEditPetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Mascota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingPet && (
            <Form onSubmit={handleSavePet}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="editPetId">
                    <Form.Label>ID Mascota</Form.Label>
                    <Form.Control type="text" value={editingPet.id} disabled className="bg-light" />
                    <Form.Text className="text-muted">El ID no se puede modificar</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editPetIdCliente">
                    <Form.Label>ID Cliente</Form.Label>
                    <Form.Control type="text" value={editingPet.idCliente} disabled className="bg-light" />
                    <Form.Text className="text-muted">El ID del cliente no se puede modificar</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="editPetNombre">
                <Form.Label>Nombre de la mascota *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre"
                  name="nombre"
                  value={editingPet.nombre}
                  onChange={handleEditPetChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPetEspecie">
                <Form.Label>Especie *</Form.Label>
                <Form.Select name="especie" value={editingPet.especie} onChange={handleEditPetChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPetRaza">
                <Form.Label>Raza *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Raza"
                  name="raza"
                  value={editingPet.raza}
                  onChange={handleEditPetChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPetTamaño">
                <Form.Label>Tamaño *</Form.Label>
                <Form.Select name="tamaño" value={editingPet.tamaño} onChange={handleEditPetChange} required>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Grande">Grande</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPetFechaNacimiento">
                <Form.Label>Fecha de nacimiento *</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaNacimiento"
                  value={editingPet.fechaNacimiento}
                  onChange={handleEditPetChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPetFoto">
                <Form.Label>Foto</Form.Label>
                <div className="d-flex align-items-center">
                  <Button variant="outline-secondary" onClick={() => editFileInputRef.current.click()} className="me-2">
                    <i className="bi bi-upload me-1"></i> Cambiar imagen
                  </Button>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    ref={editFileInputRef}
                    onChange={handleEditPetPhotoChange}
                    style={{ display: "none" }}
                  />
                  <span className="small text-muted">
                    {editingPet.foto ? editingPet.foto.name : "Mantener imagen actual"}
                  </span>
                </div>
                {editingPet.fotoPreview && (
                  <div className="mt-2">
                    <img
                      src={editingPet.fotoPreview || "/placeholder.svg"}
                      alt="Vista previa"
                      className="img-thumbnail"
                      style={{ maxHeight: "150px" }}
                    />
                  </div>
                )}
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEditPetModal(false)}>
                  Cancelar
                </Button>
                <Button variant="success" type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      {/* Modal para ver detalles de mascota - Rediseñado como carnet estilo pasaporte */}
      {/* Modal para ver detalles de mascota - Rediseñado como carnet estilo pasaporte */}
      <Modal show={showPetDetails} onHide={() => setShowPetDetails(false)} centered className="tc-pet-details-modal">
        <Modal.Header closeButton>
          <Modal.Title>Carnet de Mascota</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedPet && (
            <div className="tc-pet-carnet">
              {/* Foto de la mascota */}
              <div className="tc-pet-carnet-photo-container">
                <img
                  src={selectedPet.imagen || "/placeholder.svg"} // Cambiado de selectedPet.image a selectedPet.imagen
                  alt={selectedPet.nombre}
                  className="tc-pet-carnet-photo"
                />
              </div>
              {/* Nombre de la mascota (ahora debajo de la foto) */}
              <h2 className="tc-pet-carnet-title">{selectedPet.nombre}</h2>
              {/* Información de la mascota en columnas */}
              <div className="tc-pet-carnet-info">
                <Row>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-award"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Raza</h6>
                        <p>{selectedPet.raza}</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-rulers"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Tamaño</h6>
                        <p>{selectedPet.tamaño}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-calendar-heart"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Fecha de Nacimiento</h6>
                        <p>{new Date(selectedPet.fechaNacimiento).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="tc-pet-carnet-info-item">
                      <div className="tc-pet-carnet-info-icon">
                        <i className="bi bi-hourglass-split"></i>
                      </div>
                      <div className="tc-pet-carnet-info-content">
                        <h6>Edad</h6>
                        <p>{calculateAge(selectedPet.fechaNacimiento)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
              {/* Botones de acción */}
              <div className="tc-pet-carnet-footer">
                <Button
                  variant="success"
                  className="tc-pet-carnet-btn-edit"
                  onClick={() => {
                    setShowPetDetails(false);
                    handleEditPetClick(selectedPet);
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Editar
                </Button>
                <Button
                  variant="danger"
                  className="tc-pet-carnet-btn-delete"
                  onClick={() => {
                    setShowPetDetails(false);
                    handleDeletePet(selectedPet.id);
                  }}
                >
                  <i className="bi bi-trash me-1"></i> Eliminar
                </Button>
              </div>
              <div className="tc-pet-carnet-copyright">
                <p>© {new Date().getFullYear()} Teo/Cat. Todos los derechos reservados.</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>    </>
  )
}

export default ProfilePets
