"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Card, Collapse } from "react-bootstrap"
import { toast } from "react-toastify"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import "react-calendar/dist/Calendar.css"
import "../../Pages/ClientePages/agendar-cita-page.scss"

// Componentes
import CalendarWithAvailability from "../../Components/ClienteComponents/AgendarCitasComponents/calendar-with-availability"
import TimeSlots from "../../Components/ClienteComponents/AgendarCitasComponents/time-slots"
import ServicesSelector from "../../Components/ClienteComponents/AgendarCitasComponents/services-selector"
import PetCard from "../../Components/ClienteComponents/AgendarCitasComponents/pet-card"
import MultiPetSelector from "../../Components/ClienteComponents/AgendarCitasComponents/multi-pet-selector"
import AppointmentSummary from "../../Components/ClienteComponents/AgendarCitasComponents/appointment-summary"

const AgendarCitaPage = () => {
  const [searchParams] = useSearchParams()
  const servicioParam = searchParams.get("servicio")

  // Estado para la fecha seleccionada
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Estado para el horario seleccionado
  const [selectedTime, setSelectedTime] = useState("")

  // Estado para el formato de hora (12h o 24h)
  const [use24HourFormat, setUse24HourFormat] = useState(true)

  // Estado para los servicios disponibles
  const [availableServices, setAvailableServices] = useState([])

  // Estado para los servicios seleccionados
  const [selectedServices, setSelectedServices] = useState([])

  // Estado para las mascotas del usuario
  const [userPets, setUserPets] = useState([])

  // Estado para la mascota seleccionada (para servicios normales)
  const [selectedPet, setSelectedPet] = useState("")

  // Estado para las mascotas seleccionadas (para servicio de paseo)
  const [selectedPets, setSelectedPets] = useState([])

  // Estado para los horarios disponibles
  const [availableTimes, setAvailableTimes] = useState([])

  // Estado para los horarios ocupados
  const [unavailableTimes, setUnavailableTimes] = useState([])

  // Estado para las fechas ocupadas
  const [unavailableDates, setUnavailableDates] = useState([])

  // Estado para las fechas con pocas citas disponibles
  const [busyDates, setBusyDates] = useState([])

  // Estado para el formulario de cliente
  const [clientForm, setClientForm] = useState({
    documento: "",
    correo: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  })

  // Estado para verificar si el cliente está registrado
  const [isRegistered, setIsRegistered] = useState(false)

  // Estado para verificar si el usuario está logueado
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Estado para controlar la visibilidad del formulario completo
  const [showFullForm, setShowFullForm] = useState(false)

  // Estado para el formulario de mascota
  const [petForm, setPetForm] = useState({
    nombre: "",
    especie: "",
    raza: "",
    tamaño: "",
    pelaje: "",
    fechaNacimiento: "",
    foto: null
  });

  // Estado para mostrar el formulario de nueva mascota
  const [showNewPetForm, setShowNewPetForm] = useState(false)

  // Estado para el paso actual del formulario
  const [currentStep, setCurrentStep] = useState(1)

  // Estado para controlar errores de validación
  const [validationErrors, setValidationErrors] = useState({
    password: false,
    confirmPassword: false,
  })

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
    })

    // Cargar mascotas del cliente
    const mockPets = [
      {
        id: 1,
        nombre: "Max",
        especie: "Perro",
        raza: "Labrador",
        edad: 3,
        tamaño: "Grande",
        fechaNacimiento: "2021-03-15",
        imagen: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500",
      },
      {
        id: 2,
        nombre: "Luna",
        especie: "Gato",
        raza: "Siamés",
        edad: 2,
        tamaño: "Pequeño",
        fechaNacimiento: "2022-05-20",
        imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500",
      },
      {
        id: 3,
        nombre: "Rocky",
        especie: "Perro",
        raza: "Bulldog",
        edad: 4,
        tamaño: "Mediano",
        fechaNacimiento: "2020-07-10",
        imagen: "https://images.unsplash.com/photo-1583511655826-05700442b31b?q=80&w=500",
      },
    ]

    setUserPets(mockPets)
  }

  // Cargar servicios disponibles
  useEffect(() => {
    // Simulación de carga de datos desde API
    const mockServices = [
      {
        id: 1,
        name: "Peluquería Canina",
        description:
          "Corte y arreglo profesional para tu perro. Incluye corte de pelo, limpieza de oídos y corte de uñas.",
        price: 45000,
        duration: 60, // en minutos
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=500",
      },
      {
        id: 2,
        name: "Baño y Spa",
        description:
          "Baño completo con productos premium, secado, cepillado y perfumado para dejar a tu mascota impecable.",
        price: 35000,
        duration: 45,
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=500",
      },
      {
        id: 3,
        name: "Paseo de Mascotas",
        description: "Paseos diarios con personal capacitado. Incluye recogida y entrega a domicilio.",
        price: 25000,
        duration: 30,
        image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500",
        allowMultiplePets: true, // Permitir seleccionar múltiples mascotas
      },
      {
        id: 4,
        name: "Adiestramiento Básico",
        description: "Enseñamos a tu mascota comandos básicos de obediencia y socialización con otras mascotas.",
        price: 60000,
        duration: 90,
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=500",
      },
      {
        id: 5,
        name: "Consulta Veterinaria",
        description:
          "Revisión general de salud, vacunación y desparasitación con nuestros veterinarios especializados.",
        price: 50000,
        duration: 30,
        image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=500",
      },
    ]

    setAvailableServices(mockServices)

    // Si hay un servicio preseleccionado en la URL, agregarlo a los servicios seleccionados
    if (servicioParam) {
      const selectedServiceId = Number.parseInt(servicioParam)
      const serviceToAdd = mockServices.find((service) => service.id === selectedServiceId)

      if (serviceToAdd) {
        setSelectedServices([serviceToAdd])
        toast.info(`Servicio "${serviceToAdd.name}" preseleccionado`)
      }
    }
  }, [servicioParam])

  // Modificar el useEffect para sincronizar el estado de disponibilidad del calendario con los horarios
  // Generar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    // Verificar si es domingo (0 = domingo)
    if (selectedDate.getDay() === 0) {
      setAvailableTimes([])
      return
    }

    // Simulación de horarios disponibles
    // En producción, esto vendría de una API basado en la fecha seleccionada
    const times = []
    const startHour = 9 // 9 AM
    const endHour = 18 // 6 PM (18:00)
    const lunchStartHour = 13 // 1 PM
    const lunchEndHour = 14 // 2 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      // Excluir la hora de almuerzo (13:00 - 14:00)
      if (hour < lunchStartHour || hour >= lunchEndHour) {
        if (hour < endHour) times.push(`${hour}:00`)
        if (hour < endHour && !(hour === endHour - 1 && endHour % 1 === 0.5)) times.push(`${hour}:30`)
      }
    }

    setAvailableTimes(times)

    // Simulación de horarios ocupados
    // En producción, esto vendría de una API
    const today = new Date()
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()

    // Verificar si la fecha seleccionada está en la lista de fechas ocupadas
    const isUnavailableDate = unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getDate() === selectedDate.getDate() &&
        unavailableDate.getMonth() === selectedDate.getMonth() &&
        unavailableDate.getFullYear() === selectedDate.getFullYear(),
    )

    // Verificar si la fecha seleccionada está en la lista de fechas con pocas citas
    const isBusyDate = busyDates.some(
      (busyDate) =>
        busyDate.getDate() === selectedDate.getDate() &&
        busyDate.getMonth() === selectedDate.getMonth() &&
        busyDate.getFullYear() === selectedDate.getFullYear(),
    )

    // Generar horarios ocupados según el estado del día
    let mockUnavailableTimes = []

    if (isUnavailableDate) {
      // Si el día está marcado como "Lleno", casi todos los horarios están ocupados
      mockUnavailableTimes = times.filter((_, index) => index % 5 !== 0) // Dejar solo algunos disponibles
    } else if (isBusyDate) {
      // Si el día está marcado como "Pocas citas", muchos horarios están ocupados
      mockUnavailableTimes = times.filter((_, index) => index % 3 === 0 || index % 2 === 0)
    } else {
      // Día normal, algunos horarios ocupados
      mockUnavailableTimes = ["9:30", "11:00", "15:30", "17:00"]
    }

    setUnavailableTimes(mockUnavailableTimes)
    setSelectedTime("") // Resetear el horario seleccionado al cambiar de fecha
  }, [selectedDate, unavailableDates, busyDates])

  // Simular fechas ocupadas y con pocas citas disponibles
  useEffect(() => {
    // Fechas completamente ocupadas (en producción, esto vendría de una API)
    const today = new Date()
    const unavailableDatesList = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    ]
    setUnavailableDates(unavailableDatesList)

    // Fechas con pocas citas disponibles
    const busyDatesList = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
    ]
    setBusyDates(busyDatesList)
  }, [])

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
      setUserPets([])
      setShowFullForm(false)
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
      })

      // Cargar mascotas del cliente
      const mockPets = [
        {
          id: 1,
          nombre: "Max",
          especie: "Perro",
          raza: "Labrador",
          edad: 3,
          tamaño: "Grande",
          fechaNacimiento: "2021-03-15",
          imagen: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500",
        },
        {
          id: 2,
          nombre: "Luna",
          especie: "Gato",
          raza: "Siamés",
          edad: 2,
          tamaño: "Pequeño",
          fechaNacimiento: "2022-05-20",
          imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500",
        },
      ]

      setUserPets(mockPets)
      toast.success("Cliente encontrado. Datos cargados automáticamente.")
      setShowFullForm(false)
    } else {
      // Cliente no encontrado
      setIsRegistered(false)
      setUserPets([])
      toast.info("Cliente no encontrado. Por favor complete el formulario para registrarse.")
      setShowFullForm(true)
    }
  }

  // Manejar cambios en el formulario de cliente
  const handleClientFormChange = (e) => {
    const { name, value } = e.target
    setClientForm({
      ...clientForm,
      [name]: value,
    })

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
        password: !isValid,
        confirmPassword: clientForm.confirmPassword !== value && clientForm.confirmPassword !== "",
      })
    } else if (field === "confirmPassword") {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: value !== clientForm.password,
      })
    }
  }

  // Manejar cambios en el formulario de mascota
  const handlePetFormChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      setPetForm({
        ...petForm,
        [name]: files[0]
      });
    } else {
      setPetForm({
        ...petForm,
        [name]: value
      });
    }
  };

  // Agregar servicio a la lista de seleccionados
  const addService = (service) => {
    // Verificar si el servicio ya está seleccionado
    if (selectedServices.some((s) => s.id === service.id)) {
      toast.warning("Este servicio ya está seleccionado")
      return
    }

    setSelectedServices([...selectedServices, service])
  }

  // Eliminar servicio de la lista de seleccionados
  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter((service) => service.id !== serviceId))
  }

  // Calcular el total de la cita
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0)
  }

  // Calcular la duración total de la cita
  const calculateDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0)
  }

  // Formatear la duración en horas y minutos
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins} minutos`
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? "hora" : "horas"}`
    } else {
      return `${hours} ${hours === 1 ? "hora" : "horas"} y ${mins} minutos`
    }
  }

  // Verificar si hay un servicio de paseo seleccionado
  const hasWalkingService = () => {
    return selectedServices.some((service) => service.id === 3) // ID 3 es el servicio de paseo
  }

  // Avanzar al siguiente paso
  const goToNextStep = () => {
    // Validar el paso actual antes de avanzar
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Retroceder al paso anterior
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Validar el paso actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Fecha y hora
        if (!selectedDate) {
          toast.error("Por favor seleccione una fecha para la cita")
          return false
        }
        if (!selectedTime) {
          toast.error("Por favor seleccione un horario para la cita")
          return false
        }
        return true

      case 2: // Servicios
        if (selectedServices.length === 0) {
          toast.error("Por favor seleccione al menos un servicio")
          return false
        }
        return true

      case 3: // Información del cliente
        if (!isLoggedIn && !clientForm.documento) {
          toast.error("Por favor ingrese su número de documento")
          return false
        }

        if (showFullForm) {
          if (
            !clientForm.correo ||
            !clientForm.nombre ||
            !clientForm.apellido ||
            !clientForm.direccion ||
            !clientForm.telefono ||
            !clientForm.password ||
            !clientForm.confirmPassword
          ) {
            toast.error("Por favor complete todos los campos del formulario de cliente")
            return false
          }

          if (validationErrors.password || validationErrors.confirmPassword) {
            toast.error("Por favor corrija los errores en las contraseñas")
            return false
          }
        }
        return true

      case 4: // Información de la mascota
        const hasWalkingServiceOnly = hasWalkingService() && selectedServices.length === 1
        const hasWalkingAndOtherServices = hasWalkingService() && selectedServices.length > 1

        // Si solo hay servicio de paseo
        if (hasWalkingServiceOnly) {
          if (selectedPets.length === 0) {
            toast.error("Por favor seleccione al menos una mascota para el paseo")
            return false
          }
        }
        // Si hay servicio de paseo y otros servicios
        else if (hasWalkingAndOtherServices) {
          if (selectedPets.length === 0) {
            toast.error("Por favor seleccione al menos una mascota para el paseo")
            return false
          }
          if (!selectedPet) {
            toast.error("Por favor seleccione una mascota para los demás servicios")
            return false
          }
        }
        // Si solo hay otros servicios (no paseo)
        else {
          if (!selectedPet && !showNewPetForm) {
            toast.error("Por favor seleccione una mascota o registre una nueva")
            return false
          }

          if (showNewPetForm) {
            if (!petForm.nombre || !petForm.especie || !petForm.raza || !petForm.edad || !petForm.fechaNacimiento) {
              toast.error("Por favor complete todos los campos del formulario de mascota")
              return false
            }
          }
        }
        return true

      default:
        return true
    }
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    // Validar que se hayan seleccionado todos los campos requeridos
    if (!validateCurrentStep()) {
      return
    }

    // Aquí iría la lógica para enviar los datos a la API
    // En este ejemplo, solo mostramos un mensaje de éxito

    toast.success("¡Cita agendada con éxito! Pronto recibirás un correo de confirmación.")

    // Resetear formulario
    setSelectedDate(new Date())
    setSelectedTime("")
    setSelectedServices([])
    setSelectedPet("")
    setSelectedPets([])
    setShowNewPetForm(false)
    setCurrentStep(1)

    if (!isRegistered && !isLoggedIn) {
      setClientForm({
        documento: "",
        correo: "",
        nombre: "",
        apellido: "",
        direccion: "",
        telefono: "",
        password: "",
        confirmPassword: "",
      })
      setShowFullForm(false)
    }

    setPetForm({
      nombre: "",
      especie: "",
      raza: "",
      edad: "",
      fechaNacimiento: "",
    })
  }

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 step-header">
                <div className="step-number">1</div>
                <h4 className="mb-0">Selecciona Fecha y Hora</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={7}>
                    <CalendarWithAvailability
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      unavailableDates={unavailableDates}
                      busyDates={busyDates}
                    />
                  </Col>
                  <Col md={5}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Horarios Disponibles:</h6>
                      <Form.Check
                        type="switch"
                        id="timeFormatSwitch"
                        label={use24HourFormat ? "Formato 24h" : "Formato 12h"}
                        checked={use24HourFormat}
                        onChange={() => setUse24HourFormat(!use24HourFormat)}
                        className="mb-0"
                      />
                    </div>

                    <TimeSlots
                      availableTimes={availableTimes}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                      unavailableTimes={unavailableTimes}
                      use24HourFormat={use24HourFormat}
                    />

                    <div className="selected-datetime mt-4">
                      <h6>Fecha y Hora Seleccionada:</h6>
                      {selectedDate && (
                        <p className="mb-1">
                          <i className="bi bi-calendar-event me-2" style={{ color: "#7ab51d" }}></i>
                          {selectedDate.toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                      {selectedTime && (
                        <p className="mb-0">
                          <i className="bi bi-clock me-2" style={{ color: "#7ab51d" }}></i>
                          {use24HourFormat
                            ? `${selectedTime} hrs`
                            : (() => {
                                const [hour, minute] = selectedTime.split(":")
                                const hourNum = Number.parseInt(hour, 10)
                                const period = hourNum >= 12 ? "PM" : "AM"
                                const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12
                                return `${hour12}:${minute} ${period}`
                              })()}
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 step-header">
                <div className="step-number">2</div>
                <h4 className="mb-0">Selecciona los Servicios</h4>
              </Card.Header>
              <Card.Body>
                <ServicesSelector
                  availableServices={availableServices}
                  selectedServices={selectedServices}
                  addService={addService}
                />
              </Card.Body>
            </Card>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 step-header">
                <div className="step-number">3</div>
                <h4 className="mb-0">Información del Cliente</h4>
              </Card.Header>
              <Card.Body>
                {isLoggedIn ? (
                  // Si el usuario está logueado, mostrar información del cliente
                  <div className="client-info-summary p-3 border rounded bg-light">
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
                        <p className="mb-1">
                          <strong>Teléfono:</strong> {clientForm.telefono}
                        </p>
                        <p className="mb-1">
                          <strong>Dirección:</strong> {clientForm.direccion}
                        </p>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  // Si el usuario no está logueado, mostrar formulario de documento
                  <>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="documento">
                          <Form.Label>Documento *</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-card-text"></i>
                            </span>
                            <Form.Control
                              type="text"
                              placeholder="Número de documento"
                              name="documento"
                              value={clientForm.documento}
                              onChange={handleDocumentoChange}
                              required
                            />
                          </div>
                          <Form.Text className="text-muted">
                            Si ya estás registrado, tus datos se cargarán automáticamente.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Collapse in={showFullForm}>
                      <div>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group controlId="correo">
                              <Form.Label>Correo *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-envelope"></i>
                                </span>
                                <Form.Control
                                  type="email"
                                  placeholder="correo@ejemplo.com"
                                  name="correo"
                                  value={clientForm.correo}
                                  onChange={handleClientFormChange}
                                  required
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="telefono">
                              <Form.Label>Teléfono *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-telephone"></i>
                                </span>
                                <Form.Control
                                  type="tel"
                                  placeholder="Teléfono"
                                  name="telefono"
                                  value={clientForm.telefono}
                                  onChange={handleClientFormChange}
                                  required
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group controlId="nombre">
                              <Form.Label>Nombre *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-person"></i>
                                </span>
                                <Form.Control
                                  type="text"
                                  placeholder="Nombre"
                                  name="nombre"
                                  value={clientForm.nombre}
                                  onChange={handleClientFormChange}
                                  required
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="apellido">
                              <Form.Label>Apellido *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-person"></i>
                                </span>
                                <Form.Control
                                  type="text"
                                  placeholder="Apellido"
                                  name="apellido"
                                  value={clientForm.apellido}
                                  onChange={handleClientFormChange}
                                  required
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="mb-3">
                          <Col md={12}>
                            <Form.Group controlId="direccion">
                              <Form.Label>Dirección *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-geo-alt"></i>
                                </span>
                                <Form.Control
                                  type="text"
                                  placeholder="Dirección"
                                  name="direccion"
                                  value={clientForm.direccion}
                                  onChange={handleClientFormChange}
                                  required
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group controlId="password">
                              <Form.Label>Contraseña *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-lock"></i>
                                </span>
                                <Form.Control
                                  type="password"
                                  placeholder="Contraseña"
                                  name="password"
                                  value={clientForm.password}
                                  onChange={handleClientFormChange}
                                  isInvalid={validationErrors.password}
                                  required
                                />
                              </div>
                              {validationErrors.password && (
                                <Form.Text className="text-danger">
                                  La contraseña debe tener al menos 6 caracteres
                                </Form.Text>
                              )}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="confirmPassword">
                              <Form.Label>Confirmar Contraseña *</Form.Label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <i className="bi bi-lock-fill"></i>
                                </span>
                                <Form.Control
                                  type="password"
                                  placeholder="Confirmar contraseña"
                                  name="confirmPassword"
                                  value={clientForm.confirmPassword}
                                  onChange={handleClientFormChange}
                                  isInvalid={validationErrors.confirmPassword}
                                  required
                                />
                              </div>
                              {validationErrors.confirmPassword && (
                                <Form.Text className="text-danger">Las contraseñas no coinciden</Form.Text>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    </Collapse>

                    {isRegistered && (
                      <div className="client-info-summary mt-3 p-3 border rounded bg-light">
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
                            <p className="mb-1">
                              <strong>Teléfono:</strong> {clientForm.telefono}
                            </p>
                            <p className="mb-1">
                              <strong>Dirección:</strong> {clientForm.direccion}
                            </p>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 step-header">
                <div className="step-number">4</div>
                <h4 className="mb-0">Información de la Mascota</h4>
              </Card.Header>
              <Card.Body>
                {hasWalkingService() ? (
                  // Si hay servicio de paseo, mostrar selector múltiple de mascotas solo para ese servicio
                  <>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Has seleccionado el servicio de paseo, puedes elegir múltiples mascotas para este servicio.
                    </div>
                    <MultiPetSelector pets={userPets} selectedPets={selectedPets} setSelectedPets={setSelectedPets} />

                    {/* Si hay otros servicios además del paseo, mostrar selector de una mascota para esos servicios */}
                    {selectedServices.some((service) => service.id !== 3) && (
                      <div className="mt-4 pt-3 border-top">
                        <h5 className="mb-3">Selecciona una mascota para los demás servicios:</h5>
                        <Row className="g-3">
                          {userPets.map((pet) => (
                            <Col md={6} key={pet.id}>
                              <PetCard
                                pet={pet}
                                isSelected={selectedPet === pet.id}
                                onClick={() => {
                                  setSelectedPet(pet.id)
                                  setShowNewPetForm(false)
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </>
                ) : (
                  // Para otros servicios, mostrar selector de una mascota
                  <>
                    {userPets.length > 0 && (
                      <div className="mb-4">
                        <h5 className="mb-3">Selecciona una mascota registrada:</h5>
                        <Row className="g-3">
                          {userPets.map((pet) => (
                            <Col md={6} key={pet.id}>
                              <PetCard
                                pet={pet}
                                isSelected={selectedPet === pet.id}
                                onClick={() => {
                                  setSelectedPet(pet.id)
                                  setShowNewPetForm(false)
                                }}
                              />
                            </Col>
                          ))}
                        </Row>

                        <div className="mt-3">
                          <Button
                            variant="link"
                            className="text-decoration-none p-0"
                            onClick={() => {
                              setShowNewPetForm(!showNewPetForm)
                              if (!showNewPetForm) setSelectedPet("")
                            }}
                          >
                            {showNewPetForm ? "Cancelar registro de nueva mascota" : "Registrar nueva mascota"}
                          </Button>
                        </div>
                      </div>
                    )}

<Collapse in={showNewPetForm || userPets.length === 0}>
  <div>
    {userPets.length > 0 && <h5 className="mb-3">Registrar nueva mascota:</h5>}

    <Row className="mb-3">
      <Col md={6}>
        <Form.Group controlId="petNombre">
          <Form.Label>Nombre de la mascota *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre"
            name="nombre"
            value={petForm.nombre}
            onChange={handlePetFormChange}
            required
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="petEspecie">
          <Form.Label>Especie *</Form.Label>
          <Form.Select
            name="especie"
            value={petForm.especie}
            onChange={handlePetFormChange}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Perro">Canino</option>
            <option value="Gato">Felino</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>

    <Row className="mb-3">
      <Col md={6}>
        <Form.Group controlId="petRaza">
          <Form.Label>Raza *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Raza"
            name="raza"
            value={petForm.raza}
            onChange={handlePetFormChange}
            required
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="petFoto">
          <Form.Label>Foto</Form.Label>
          <Form.Control
            type="file"
            name="foto"
            onChange={handlePetFormChange}
            accept="image/*"
          />
        </Form.Group>
      </Col>
    </Row>

    <Row className="mb-3">
      <Col md={6}>
        <Form.Group controlId="petTamaño">
          <Form.Label>Tamaño *</Form.Label>
          <Form.Select
            name="tamaño"
            value={petForm.tamaño}
            onChange={handlePetFormChange}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="petPelaje">
          <Form.Label>Pelaje *</Form.Label>
          <Form.Select
            name="pelaje"
            value={petForm.pelaje}
            onChange={handlePetFormChange}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Corto">Corto</option>
            <option value="Medio">Medio</option>
            <option value="Largo">Largo</option>
            <option value="Sin Pelaje">Sin Pelaje</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>

    <Row>
      <Col md={6}>
        <Form.Group controlId="petFechaNacimiento">
          <Form.Label>Fecha de nacimiento *</Form.Label>
          <Form.Control
            type="date"
            name="fechaNacimiento"
            value={petForm.fechaNacimiento}
            onChange={handlePetFormChange}
            required
          />
        </Form.Group>
      </Col>
    </Row>
  </div>
</Collapse>
                  </>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="agendar-cita-page">
      <Container className="py-5 mt-5">
        <div className="page-header mb-5">
          <h1 className="page-title">Agendar Cita</h1>
          <p className="text-muted">Programa una cita para los servicios que tu mascota necesita</p>

          <div className="steps-progress mt-4">
            <div className="steps-container">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`step-item ${currentStep >= step ? "active" : ""} ${currentStep === step ? "current" : ""}`}
                >
                  <div className="step-circle">{step}</div>
                  <div className="step-label">
                    {step === 1 && "Fecha y Hora"}
                    {step === 2 && "Servicios"}
                    {step === 3 && "Cliente"}
                    {step === 4 && "Mascota"}
                  </div>
                </div>
              ))}
              <div className="steps-line"></div>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Columna izquierda: Pasos del formulario */}
            <Col lg={8}>
              <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
            </Col>

            {/* Columna derecha: Resumen de la cita */}
            <Col lg={4}>
              <AppointmentSummary
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedServices={selectedServices}
                removeService={removeService}
                calculateTotal={calculateTotal}
                calculateDuration={calculateDuration}
                formatDuration={formatDuration}
                currentStep={currentStep}
                goToNextStep={goToNextStep}
                goToPreviousStep={goToPreviousStep}
                handleSubmit={currentStep === 4 ? handleSubmit : undefined}
                use24HourFormat={use24HourFormat}
              />
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  )
}

export default AgendarCitaPage
