"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import { motion } from "framer-motion"

// Componentes
import ProfileSidebar from "../../Components/ClienteComponents/MiPerfilComponents/ProfileSidebar"
import ProfileInfo from "../../Components/ClienteComponents/MiPerfilComponents/ProfileInfo"
import ProfileAddresses from "../../Components/ClienteComponents/MiPerfilComponents/ProfileAddresses"
import ProfilePhones from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePhones"
import ProfilePets from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePets"
import ProfileOrders from "../../Components/ClienteComponents/MiPerfilComponents/ProfileOrders"
import ProfileAppointments from "../../Components/ClienteComponents/MiPerfilComponents/ProfileAppointments"
import ProfilePassword from "../../Components/ClienteComponents/MiPerfilComponents/ProfilePassword"
import ProfileReviews from "../../Components/ClienteComponents/MiPerfilComponents/ProfileReviews"

// Service para consumir el perfil real
import PerfilClienteService from "../../Services/ConsumoCliente/PerfilClienteService"

// Estilos
import "./perfil-page.scss"

const PerfilPage = () => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")

  // Estado para la información del usuario (inicialmente null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado para las mascotas del usuario
  const [pets, setPets] = useState([
    {
      id: 1,
      idCliente: 1,
      nombre: "Max",
      especie: "Perro",
      raza: "Labrador",
      tamaño: "Grande",
      fechaNacimiento: "2021-03-15",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300",
    },
    {
      id: 2,
      idCliente: 1,
      nombre: "Luna",
      especie: "Gato",
      raza: "Siamés",
      tamaño: "Pequeño",
      fechaNacimiento: "2022-05-20",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300",
    },
  ])

  // Estado para los pedidos del usuario
  const [orders, setOrders] = useState([
    {
      id: "ORD-2023-001",
      date: "2023-12-15",
      total: 125000,
      status: "Entregado",
      items: [
        { name: "Alimento Premium para Perros", quantity: 1, price: 75000 },
        { name: "Juguete Interactivo para Gatos", quantity: 1, price: 35000 },
        { name: "Snacks Naturales para Perros", quantity: 1, price: 15000 },
      ],
    },
    {
      id: "ORD-2023-002",
      date: "2024-01-20",
      total: 89000,
      status: "En proceso",
      items: [{ name: "Collar Ajustable con GPS", quantity: 1, price: 89000 }],
    },
  ])

  // Estado para las citas del usuario
  const [appointments, setAppointments] = useState([
    {
      id: "APT-2023-001",
      service: "Peluquería Canina",
      pet: "Max",
      date: "2023-12-10",
      time: "10:00 AM",
      status: "Completada",
    },
    {
      id: "APT-2024-001",
      service: "Baño y Spa",
      pet: "Max",
      date: "2024-02-05",
      time: "11:30 AM",
      status: "Programada",
    },
  ])

  // Estado para las reseñas del usuario
  const [reviews, setReviews] = useState([
    {
      id: 1,
      type: "product",
      itemId: 5,
      itemName: "Alimento Premium para Perros",
      rating: 5,
      comment: "Excelente producto. Mi perro lo adora y he notado mejoras en su pelaje y energía.",
      date: "2023-12-20",
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=300",
    },
    {
      id: 2,
      type: "service",
      itemId: 1,
      itemName: "Peluquería Canina",
      rating: 4,
      comment:
        "Muy buen servicio, aunque tuve que esperar un poco más de lo acordado. El resultado final fue muy bueno.",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=300",
    },
    {
      id: 3,
      type: "product",
      itemId: 8,
      itemName: "Juguete Interactivo para Gatos",
      rating: 5,
      comment: "A mi gata le encanta este juguete. Lo recomiendo totalmente para mantener a los gatos entretenidos.",
      date: "2024-02-05",
      image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=300",
    },
  ])

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("profile")

  // Establecer la pestaña activa basada en el parámetro de URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Cargar datos reales del usuario al montar el componente
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await PerfilClienteService.getPerfil()
        setUser(data)
      } catch (err) {
        setError(err.message || "Error al cargar perfil")
      } finally {
        setLoading(false)
      }
    }
    fetchPerfil()
  }, [])

  // Normalizar datos del usuario para los componentes hijos
const userNormalized = user && {
  id: user.IdUsuario ?? user.id,
  nombre: user.Nombre ?? user.nombre,
  apellido: user.Apellido ?? user.apellido,
  correo: user.Correo ?? user.correo,
  documento: user.Documento ?? user.documento ?? user.Doc,
  direccion: user.Direccion ?? user.direccion,
  telefono: user.Telefono ?? user.telefono,
  foto: user.FotoURL ?? user.Foto ?? user.foto ?? user.fotoURL,
  // Normaliza direcciones y teléfonos como arrays para los componentes
  direcciones: user.Direccion
    ? [{ id: 1, direccion: user.Direccion, principal: true }]
    : [],
  telefonos: user.Telefono
    ? [{ id: 1, numero: user.Telefono, principal: true }]
    : [],
  ...user
}

  // Actualizar usuario
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  // Actualizar mascotas
  const updatePets = (updatedPets) => {
    setPets(updatedPets)
  }

  // Actualizar reseñas
  const updateReviews = (updatedReviews) => {
    setReviews(updatedReviews)
  }

  // Renderizado condicional por carga/error
  if (loading) return <div>Cargando perfil...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>No se encontró información del usuario.</div>

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileInfo user={userNormalized} updateUser={updateUser} />
            <ProfileAddresses user={userNormalized} updateUser={updateUser} />
            <ProfilePhones user={userNormalized} updateUser={updateUser} />
          </motion.div>
        )
      case "pets":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfilePets pets={pets} updatePets={updatePets} />
          </motion.div>
        )
      case "orders":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileOrders orders={orders} />
          </motion.div>
        )
      case "appointments":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileAppointments appointments={appointments} />
          </motion.div>
        )
      case "reviews":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileReviews reviews={reviews} updateReviews={updateReviews} />
          </motion.div>
        )
      case "password":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfilePassword />
          </motion.div>
        )
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileInfo user={userNormalized} updateUser={updateUser} />
            <ProfileAddresses user={userNormalized} updateUser={updateUser} />
            <ProfilePhones user={userNormalized} updateUser={updateUser} />
          </motion.div>
        )
    }
  }

  return (
    <div className="perfil-page">
      <Container className="py-5 mt-5">
        <Row>
          {/* Sidebar de navegación */}
          <Col lg={3} className="mb-4">
            <ProfileSidebar user={userNormalized} activeTab={activeTab} setActiveTab={setActiveTab} />
          </Col>

          {/* Contenido principal */}
          <Col lg={9}>{renderContent()}</Col>
        </Row>
      </Container>
    </div>
  )
}

export default PerfilPage