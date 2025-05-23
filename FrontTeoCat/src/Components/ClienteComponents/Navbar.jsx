// Navbar.jsx
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Navbar as BSNavbar, Container, Nav, Button, Badge, Dropdown } from "react-bootstrap"
import { useCart } from "../../Context/CartContext.jsx"
import "./Navbar.scss"

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [notificationCount, setNotificationCount] = useState(2)
  const [userData, setUserData] = useState({ nombre: "", apellido: "", correo: "" })
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  // Usa el contador global del contexto
  const { cartCount } = useCart()

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    // Obtener datos del usuario si está autenticado
    if (token) {
      const userDataStr = localStorage.getItem("userData")
      if (userDataStr) {
        try {
          const parsedUserData = JSON.parse(userDataStr)
          setUserData(parsedUserData)
        } catch (error) {
          setUserData({
            nombre: "Usuario",
            apellido: "Ejemplo",
            correo: "usuario@ejemplo.com",
          })
        }
      } else {
        setUserData({
          nombre: "Usuario",
          apellido: "Ejemplo",
          correo: "usuario@ejemplo.com",
        })
      }
    }

    // Efecto de scroll para el navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Manejar clic en notificaciones
  const handleNotificationClick = (type, id) => {
    if (type === "order") {
      navigate("/perfil?tab=orders")
    } else if (type === "appointment") {
      navigate("/perfil?tab=appointments")
    } else {
      navigate("/perfil")
    }
  }

  return (
    <BSNavbar expand="lg" fixed="top" className={`custom-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Container>
        <BSNavbar.Brand className="navbar-logo">
          <Link to="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo2.jpg-KEo5YRO1SwydScSYxiiPG92bVBqOnm.jpeg"
              alt="Teo/Cat Logo"
              className="logo-image"
            />
          </Link>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                Inicio
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/catalogo" className={`nav-link ${location.pathname === "/catalogo" ? "active" : ""}`}>
                Catálogo
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/servicios" className={`nav-link ${location.pathname === "/servicios" ? "active" : ""}`}>
                Servicios
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                to="/sobre-nosotros"
                className={`nav-link sobre-nosotros-link ${location.pathname === "/sobre-nosotros" ? "active" : ""}`}
              >
                Sobre Nosotros
              </Link>
            </Nav.Item>
          </Nav>


            {/* Icono del carrito */}
            <div className="cart-icon-container">
              <Link to="/carrito" className="cart-icon">
                <i className="bi bi-cart3 fs-4"></i>
                {cartCount > 0 && (
                  <Badge pill bg="success" className="position-absolute top-0 start-100 translate-middle">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>

            <div className="auth-button-container">
              {isLoggedIn ? (
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-user" className="user-dropdown">
                    <i className="bi bi-person-circle me-1"></i>
                    <span className="user-name d-none d-md-inline">{userData.nombre}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="user-dropdown-menu">
                    <div className="user-info px-3 py-2 text-center border-bottom">
                      <div className="user-avatar mb-2">
                        <i className="bi bi-person-circle fs-1"></i>
                      </div>
                      <h6 className="mb-0">
                        {userData.nombre} {userData.apellido}
                      </h6>
                      <small className="text-muted">{userData.correo}</small>
                    </div>
                    <div className="dropdown-item p-0">
                      <Link to="/perfil" className="dropdown-item">
                        <i className="bi bi-person me-2"></i> Mi Perfil
                      </Link>
                    </div>
                    <div className="dropdown-item p-0">
                      <Link to="/perfil?tab=orders" className="dropdown-item">
                        <i className="bi bi-box-seam me-2"></i> Mis compras
                      </Link>
                    </div>
                    <div className="dropdown-item p-0">
                      <Link to="/agendar-cita" className="dropdown-item">
                        <i className="bi bi-calendar-check me-2"></i> Agendar Cita
                      </Link>
                    </div>
                    <Dropdown.Divider />
                    <div className="dropdown-item p-0">
                      <Link
                        to="/"
                        className="dropdown-item text-danger"
                        onClick={(e) => {
                          e.preventDefault()
                          localStorage.removeItem("token")
                          localStorage.removeItem("userRole")
                          localStorage.removeItem("userData")
                          window.dispatchEvent(new Event("logout"))
                          setIsLoggedIn(false)
                          navigate("/")
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                      </Link>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="btn btn-success login-btn">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
                </Link>
              )}
            </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar