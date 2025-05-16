"use client"

import { useRef } from "react"
import { Link } from "react-router-dom"
import { Card, Nav } from "react-bootstrap"
import { toast } from "react-toastify"
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService"
import "../MiPerfilComponents/ProfileSidebar.scss"

const ProfileSidebar = ({ user, activeTab, setActiveTab, updateUser }) => {
  const fileInputRef = useRef(null)

  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const fotoBase64 = reader.result
        const updated = await PerfilClienteService.updateFoto(user.id, { foto: fotoBase64 })
        if (updateUser) {
          updateUser({ ...user, foto: updated.foto || fotoBase64 })
        }
        toast.success("Foto actualizada correctamente")
      } catch (err) {
        toast.error("Error al actualizar la foto")
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="tc-profile-sidebar border-0 shadow">
      <Card.Body className="p-0">
        <div className="tc-profile-header">
          <div
            className="tc-profile-image-container"
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <img
              src={user.foto || user.profileImage || "/placeholder.svg"}
              alt={user.nombre}
              className="tc-profile-image"
            />
            <div className="tc-profile-image-overlay">
              <i className="bi bi-camera"></i>
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFotoChange}
            />
          </div>
          <h4 className="tc-profile-name">
            {user.nombre} {user.apellido}
          </h4>
          <p className="tc-profile-email">{user.correo}</p>
        </div>

        <Nav className="tc-profile-nav flex-column">
          <Nav.Link
            as="button"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <i className="bi bi-person tc-nav-icon"></i>
            Mi Perfil
          </Nav.Link>
          <Nav.Link as="button" className={activeTab === "pets" ? "active" : ""} onClick={() => setActiveTab("pets")}>
            <i className="bi bi-heart tc-nav-icon"></i>
            Mis Mascotas
          </Nav.Link>
          <Nav.Link
            as="button"
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <i className="bi bi-box-seam tc-nav-icon"></i>
            Mis Pedidos
          </Nav.Link>
          <Nav.Link
            as="button"
            className={activeTab === "appointments" ? "active" : ""}
            onClick={() => setActiveTab("appointments")}
          >
            <i className="bi bi-calendar-check tc-nav-icon"></i>
            Mis Citas
          </Nav.Link>
          <Nav.Link
            as="button"
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            <i className="bi bi-star tc-nav-icon"></i>
            Mis Reseñas
          </Nav.Link>
          <Nav.Link
            as="button"
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            <i className="bi bi-shield-lock tc-nav-icon"></i>
            Cambiar Contraseña
          </Nav.Link>
          <Nav.Link as={Link} to="/login" className="text-danger" onClick={() => localStorage.removeItem("token")}>
            <i className="bi bi-box-arrow-right tc-nav-icon"></i>
            Cerrar Sesión
          </Nav.Link>
        </Nav>
      </Card.Body>
    </Card>
  )
}

export default ProfileSidebar