"use client";

import { useRef } from "react";
import { Link } from "react-router-dom";
import { Card, Nav } from "react-bootstrap";
import { toast } from "react-toastify";
import PerfilClienteService from "../../../Services/ConsumoCliente/PerfilClienteService";
import "../MiPerfilComponents/ProfileSidebar.scss";

const ProfileSidebar = ({ user, activeTab, setActiveTab, updateUser }) => {
  const fileInputRef = useRef(null);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Sube el archivo directamente usando FormData
      await PerfilClienteService.updateFoto(user.id, file);
      // Refresca el usuario desde el backend
      const refreshed = await PerfilClienteService.getPerfil();
      if (updateUser) {
        updateUser(refreshed);
      }
      toast.success("Foto actualizada correctamente");
    } catch (err) {
      toast.error("Error al actualizar la foto");
    }
  };

  return (
    <Card className="tc-profile-sidebar border-0 shadow">
      <Card.Body className="p-0">
        <div className="tc-profile-header">
          <div
            className="tc-profile-image-container d-flex align-items-center justify-content-center"
            style={{ width: "120px", height: "120px", margin: "0 auto" }}
          >
            {/* Ícono de perfil */}
            <i
              className="bi bi-person-circle text-muted"
              style={{
                fontSize: "120px",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                objectFit: "cover"
              }}
            ></i>
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
            Mis compras
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
  );
};

export default ProfileSidebar;