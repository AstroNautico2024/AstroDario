"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Mascotas.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import MascotaForm from "../../../Components/AdminComponents/MascotasComponents/MascotaForm"
import ConfirmDialog from "../../../Components/AdminComponents/ConfirmDialog"
import LoadingOverlay from "../../../Components/AdminComponents/LoadingOverlay" // Nuevo componente
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary"
import mascotasService from "../../../Services/ConsumoAdmin/MascotasService.js"
import clientesService from "../../../Services/ConsumoAdmin/ClientesService.js"
import axiosInstance from "../../../Services/ConsumoAdmin/axios.js"

// Importar los estilos SCSS
import "../../../Components/AdminComponents/MascotasComponents/MascotaForm.scss"

/**
 * Componente para la gestión de mascotas
 * Permite visualizar, crear, editar, activar/desactivar y eliminar mascotas
 */
const Mascotas = () => {
  // Estado para las mascotas
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para los clientes
  const [clientes, setClientes] = useState([])

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Mascota")
  const [currentMascota, setCurrentMascota] = useState(null)

  // Estado para la foto
  const [fotoMascota, setFotoMascota] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [isImageLoading, setIsImageLoading] = useState(false) // Estado para controlar la carga de la imagen

  // Estado para el formulario
  const [formData, setFormData] = useState({
    cliente: null,
    nombre: "",
    especie: "",
    raza: "",
    tamaño: "",
    fechaNacimiento: "",
  })

  // Estado para los diálogos de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [mascotaToDelete, setMascotaToDelete] = useState(null)
  const [mascotaToEdit, setMascotaToEdit] = useState(null)
  const [mascotaToToggle, setMascotaToToggle] = useState(null)

  // Referencias para las notificaciones
  const pendingToastRef = useRef(null)
  const toastShownRef = useRef(false)
  const toastIds = useRef({})

  // NUEVOS ESTADOS PARA EL LOADINGOVERLAY
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")

  const modalRef = useRef(null)

  // Función para mostrar toast
  const showPendingToast = () => {
    if (pendingToastRef.current && !toastShownRef.current) {
      const { type, message } = pendingToastRef.current

      // Marcar como mostrado
      toastShownRef.current = true

      // Limpiar todas las notificaciones existentes primero
      toast.dismiss()

      // Mostrar la notificación después de un pequeño retraso
      setTimeout(() => {
        toast[type](message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          onClose: () => {
            // Resetear cuando se cierra la notificación
            pendingToastRef.current = null
            // Esperar un momento antes de permitir nuevas notificaciones
            setTimeout(() => {
              toastShownRef.current = false
            }, 300)
          },
        })
      }, 300)
    }
  }

  // Limpiar notificaciones
  const clearAllToasts = () => {
    toast.dismiss()
    pendingToastRef.current = null
    toastShownRef.current = false
  }

  // Modificar el useEffect para cargar datos iniciales y asegurar que todas las mascotas tengan un estado
  useEffect(() => {
    clearAllToasts()
    fetchData()

    return () => {
      clearAllToasts()
    }
  }, [])

  const fetchData = async () => {
    try {
      // Cargar mascotas
      const mascotasData = await mascotasService.getAll()
      console.log("Datos de mascotas cargados:", mascotasData)

      // Obtener estados guardados en localStorage
      const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")

      // Aplicar estados guardados localmente y normalizar los datos
      const mascotasNormalizadas = mascotasData.map((mascota) => {
        const estadoGuardado = mascotasEstados[mascota.IdMascota]

        // Normalizar la estructura de datos para asegurar consistencia
        const mascotaNormalizada = {
          ...mascota,
          // Normalizar el ID
          IdMascota: mascota.IdMascota || mascota.id,
          // Normalizar el nombre
          Nombre: mascota.Nombre || mascota.nombre,
          // Normalizar la especie
          Especie: mascota.Especie || mascota.especie || mascota.Tipo || mascota.tipo,
          // Normalizar el estado
          Estado: estadoGuardado || mascota.Estado || "Activo",
          // IMPORTANTE: Normalizar la URL de la foto - usar Foto como en productos
          FotoURL: mascota.Foto || null,
        }

        // Guardar la mascota normalizada en localStorage para persistencia
        if (mascotaNormalizada.IdMascota) {
          const mascotasGuardadas = JSON.parse(localStorage.getItem("mascotasData") || "{}")
          mascotasGuardadas[mascotaNormalizada.IdMascota] = mascotaNormalizada
          localStorage.setItem("mascotasData", JSON.stringify(mascotasGuardadas))
        }

        return mascotaNormalizada
      })

      console.log("Mascotas normalizadas:", mascotasNormalizadas)
      setMascotas(mascotasNormalizadas)

      // Cargar clientes
      const clientesData = await clientesService.getAll()
      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error)

      // Guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos. Por favor, intente nuevamente.",
      }

      // Intentar cargar datos desde localStorage como respaldo
      try {
        const mascotasGuardadas = JSON.parse(localStorage.getItem("mascotasData") || "{}")
        if (Object.keys(mascotasGuardadas).length > 0) {
          const mascotasArray = Object.values(mascotasGuardadas)
          console.log("Cargando mascotas desde localStorage:", mascotasArray)
          setMascotas(mascotasArray)

          pendingToastRef.current = {
            type: "info",
            message: "Se cargaron datos guardados localmente mientras se resuelven los problemas de conexión.",
          }
        }
      } catch (localError) {
        console.error("Error al cargar datos desde localStorage:", localError)
      }
    } finally {
      setLoading(false)
      // Mostrar cualquier notificación pendiente
      showPendingToast()
    }
  }

  /**
   * Función para formatear fechas
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada en formato local
   */
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Modificar la columna de acciones para ocultar el botón de eliminar cuando la mascota tiene un cliente asociado:
  const columns = [
    { field: "Nombre", header: "Nombre de la Mascota" },
    { field: "Raza", header: "Raza" },
    {
      field: "FechaNacimiento",
      header: "Fecha de Nacimiento",
      render: (row) => formatDate(row.FechaNacimiento),
    },
    // Modificar la columna Estado para asegurar que siempre muestre un valor
    {
      field: "Estado",
      header: "Estado",
      render: (row) => {
        // Convertir valores numéricos a texto
        let estadoTexto = row.Estado

        // Si es un número, convertirlo a texto
        if (typeof row.Estado === "number") {
          estadoTexto = row.Estado === 1 ? "Activo" : "Inactivo"
        }

        // Si no hay valor, usar "Activo" por defecto
        if (row.Estado === undefined || row.Estado === null) {
          estadoTexto = "Activo"
        }

        return <span className={`badge ${estadoTexto === "Activo" ? "bg-success" : "bg-danger"}`}>{estadoTexto}</span>
      },
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", row.IdCliente ? null : "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleConfirmEdit}
          onToggleStatus={handleConfirmToggleStatus}
          onDelete={handleConfirmDelete}
          customLabels={{
            toggleStatus: row.Estado === "Activo" ? "Desactivar" : "Activar",
          }}
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de una mascota
   * @param {Object} mascota - Objeto de mascota a visualizar
   */
  const handleView = (mascota) => {
    try {
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Cargando detalles de la mascota...") // Mensaje para el LoadingOverlay

      setCurrentMascota(mascota)
      setModalTitle("Ver Detalles de la Mascota")

      // Cargar datos de la mascota en el formulario
      setFormData({
        cliente: mascota.IdCliente,
        nombre: mascota.Nombre,
        especie: mascota.Especie,
        raza: mascota.Raza,
        tamaño: mascota.Tamaño,
        fechaNacimiento: mascota.FechaNacimiento ? mascota.FechaNacimiento.split("T")[0] : "",
      })

      // Cargar foto si existe
      console.log("Foto URL en handleView:", mascota.FotoURL)
      if (mascota.FotoURL) {
        setFotoPreview(mascota.FotoURL)
      } else {
        setFotoPreview(null)
      }

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar detalles de la mascota:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los detalles de la mascota",
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  /**
   * Manejador para confirmar la edición de una mascota
   */
  const handleConfirmEdit = (mascota) => {
    setMascotaToEdit(mascota)
    setShowEditConfirm(true)
  }

  /**
   * Función para confirmar la edición
   */
  const confirmEdit = async () => {
    try {
      setShowEditConfirm(false)
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Preparando edición de la mascota...") // Mensaje para el LoadingOverlay

      const mascota = mascotaToEdit
      setCurrentMascota(mascota)
      setModalTitle("Editar Mascota")

      // Cargar datos de la mascota en el formulario
      setFormData({
        cliente: mascota.IdCliente,
        nombre: mascota.Nombre,
        especie: mascota.Especie,
        raza: mascota.Raza,
        tamaño: mascota.Tamaño,
        fechaNacimiento: mascota.FechaNacimiento ? mascota.FechaNacimiento.split("T")[0] : "",
      })

      // Cargar foto si existe
      if (mascota.FotoURL) {
        setFotoPreview(mascota.FotoURL)
      } else {
        setFotoPreview(null)
      }

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar datos para editar mascota:", err)

      // En caso de error, guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cargar los datos para editar la mascota",
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  /**
   * Manejador para confirmar el cambio de estado de una mascota
   */
  const handleConfirmToggleStatus = (mascota) => {
    setMascotaToToggle(mascota)
    setShowStatusConfirm(true)
  }

  /**
   * Manejador para cambiar el estado de una mascota
   */
  const handleToggleStatus = async () => {
    if (!mascotaToToggle) return

    try {
      setShowStatusConfirm(false)
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage("Cambiando estado de la mascota...") // Mensaje para el LoadingOverlay

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Verificar que la mascota tenga un ID válido
      if (!mascotaToToggle.IdMascota) {
        throw new Error("Error: Mascota sin ID válido")
      }

      // Asegurar que el estado actual sea un string
      let estadoActual = mascotaToToggle.Estado

      // Convertir valores numéricos a texto
      if (typeof estadoActual === "number") {
        estadoActual = estadoActual === 1 ? "Activo" : "Inactivo"
      }

      // Si no hay valor, usar "Activo" por defecto
      if (estadoActual === undefined || estadoActual === null) {
        estadoActual = "Activo"
      }

      const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo"

      // Guardar el ID de la mascota para referencia
      const mascotaId = mascotaToToggle.IdMascota

      // Actualizar primero en el estado local para mejorar la experiencia de usuario
      setMascotas((prevMascotas) =>
        prevMascotas.map((m) => {
          if (m.IdMascota === mascotaId) {
            return {
              ...m,
              Estado: nuevoEstado,
            }
          }
          return m
        }),
      )

      // Guardar el estado en localStorage para persistencia
      const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
      mascotasEstados[mascotaId] = nuevoEstado
      localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))

      // Convertir a formato numérico para la API
      const estadoNumerico = nuevoEstado === "Activo" ? 1 : 0

      // Llamar directamente al endpoint con solo el campo Estado
      await axiosInstance.put(`/customers/mascotas/${mascotaId}`, { Estado: estadoNumerico })

      // Guardar el toast para después
      const newStatus = estadoActual === "Activo" ? "inactiva" : "activa"
      pendingToastRef.current = {
        type: "success",
        message: `La mascota "${mascotaToToggle.Nombre}" ahora está ${newStatus}.`,
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error)

      // En caso de error, también guardar el toast para después
      pendingToastRef.current = {
        type: "error",
        message: "Error al cambiar el estado de la mascota",
      }

      // Revertir el cambio en el estado local si hubo error
      if (mascotaToToggle && mascotaToToggle.IdMascota) {
        setMascotas((prevMascotas) =>
          prevMascotas.map((m) => {
            if (m.IdMascota === mascotaToToggle.IdMascota) {
              // Revertir al estado original
              return {
                ...m,
                Estado: mascotaToToggle.Estado,
              }
            }
            return m
          }),
        )

        // También revertir en localStorage
        try {
          const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
          mascotasEstados[mascotaToToggle.IdMascota] = mascotaToToggle.Estado
          localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))
        } catch (e) {
          console.error("Error al revertir estado en localStorage:", e)
        }
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
      // Cerrar el modal de confirmación
      setMascotaToToggle(null)
    }
  }

  /**
   * Manejador para cancelar el cambio de estado
   */
  const handleCancelToggleStatus = () => {
    setShowStatusConfirm(false)
    setMascotaToToggle(null)
  }

  /**
   * Manejador para confirmar la eliminación de una mascota
   */
  const handleConfirmDelete = async (mascota) => {
    try {
      // Verificar si la mascota tiene un cliente asociado
      if (mascota.IdCliente) {
        pendingToastRef.current = {
          type: "error",
          message: "No se puede eliminar la mascota porque tiene un cliente asociado.",
        }
        showPendingToast()
        return
      }

      // Si no tiene dependencias, mostrar el modal de confirmación
      setMascotaToDelete(mascota)
      setShowDeleteConfirm(true)
    } catch (error) {
      console.error("Error al verificar dependencias de la mascota:", error)

      // Si hay un error al verificar, mostrar el modal de todas formas
      // El servidor validará nuevamente al intentar eliminar
      setMascotaToDelete(mascota)
      setShowDeleteConfirm(true)
    }
  }

  /**
   * Función para confirmar la eliminación de una mascota
   */
  const confirmDelete = async () => {
    if (mascotaToDelete) {
      try {
        setShowDeleteConfirm(false)
        setIsProcessing(true) // Mostrar LoadingOverlay
        setProcessingMessage("Eliminando mascota...") // Mensaje para el LoadingOverlay

        // Limpiar notificaciones existentes
        pendingToastRef.current = null
        toastShownRef.current = false

        // Verificar que la mascota tenga un ID válido
        if (!mascotaToDelete.IdMascota) {
          throw new Error("Error: Mascota sin ID válido")
        }

        //// Verificar si la mascota tiene un cliente asociado
        if (mascotaToDelete.IdCliente) {
          throw new Error("No se puede eliminar la mascota porque tiene un cliente asociado.")
        }

        // Eliminar en el servidor
        await mascotasService.delete(mascotaToDelete.IdMascota)

        // Actualizar estado local
        const updatedMascotas = mascotas.filter((m) => m.IdMascota !== mascotaToDelete.IdMascota)
        setMascotas(updatedMascotas)

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "info",
          message: `La mascota "${mascotaToDelete.Nombre}" ha sido eliminada correctamente.`,
        }
      } catch (error) {
        console.error("Error al eliminar mascota:", error)

        // Verificar si el error es por dependencias con cliente
        if (error.isClientDependency || (error.message && error.message.toLowerCase().includes("cliente"))) {
          pendingToastRef.current = {
            type: "error",
            message: "No se puede eliminar la mascota porque tiene un cliente asociado.",
          }
        } else {
          pendingToastRef.current = {
            type: "error",
            message: "Error al eliminar la mascota. Por favor, intente nuevamente.",
          }
        }
      } finally {
        setIsProcessing(false) // Ocultar LoadingOverlay
        showPendingToast() // Mostrar cualquier notificación pendiente
      }
      setMascotaToDelete(null)
    }
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setMascotaToDelete(null)
  }

  /**
   * Manejador para abrir el modal de agregar mascota
   */
  const handleAddMascota = () => {
    setCurrentMascota(null)
    setModalTitle("Agregar Mascota")

    // Resetear el formulario
    setFormData({
      cliente: null,
      nombre: "",
      especie: "",
      raza: "",
      tamaño: "",
      fechaNacimiento: "",
    })

    // Resetear la foto
    setFotoMascota(null)
    setFotoPreview(null)

    setShowModal(true)
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Manejador para cambios en los inputs del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  /**
   * Manejador para seleccionar un cliente en el select
   * @param {Object} selectedOption - Opción seleccionada del select
   */
  const handleSelectCliente = (selectedOption) => {
    setFormData({
      ...formData,
      cliente: selectedOption ? selectedOption.value : null,
    })
  }

  /**
   * Manejador para cambios en el input de foto
   * @param {Event} e - Evento del input
   */
  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      pendingToastRef.current = {
        type: "error",
        message: "Por favor, seleccione un archivo de imagen válido",
      }
      showPendingToast()
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      pendingToastRef.current = {
        type: "error",
        message: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
      }
      showPendingToast()
      return
    }

    // Guardar el archivo para referencia
    setFotoMascota(file)

    // Crear URL para previsualización temporal
    const localPreview = URL.createObjectURL(file)
    setFotoPreview(localPreview)

    // Indicar que la imagen está cargando
    setIsImageLoading(true)
    setIsProcessing(true) // Mostrar LoadingOverlay
    setProcessingMessage("Subiendo imagen...") // Mensaje para el LoadingOverlay

    try {
      // Subir la imagen a Cloudinary en la carpeta 'mascotas'
      const imageUrl = await uploadImageToCloudinary(file, "mascotas")

      if (imageUrl) {
        console.log("Guardando mascota con foto URL:", imageUrl)

        // Revocar la URL temporal para liberar memoria
        URL.revokeObjectURL(localPreview)

        // Actualizar la vista previa con la URL de Cloudinary
        setFotoPreview(imageUrl)

        // Ya no necesitamos guardar el archivo, solo la URL
        setFotoMascota(null)

        pendingToastRef.current = {
          type: "success",
          message: "La imagen se ha subido correctamente.",
        }
      } else {
        pendingToastRef.current = {
          type: "error",
          message: "Error al subir la imagen. Intente nuevamente.",
        }
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      pendingToastRef.current = {
        type: "error",
        message: "Error al subir la imagen. Intente nuevamente.",
      }
    } finally {
      // Indicar que la imagen ya no está cargando
      setIsImageLoading(false)
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  /**
   * Manejador para guardar la mascota
   */
  const handleSaveMascota = async () => {
    // Verificar si hay una imagen cargando
    if (isImageLoading) {
      pendingToastRef.current = {
        type: "warning",
        message: "Espere a que se complete la carga de la imagen",
      }
      showPendingToast()
      return
    }

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.especie || !formData.fechaNacimiento || !formData.cliente) {
      pendingToastRef.current = {
        type: "error",
        message: "Por favor, complete todos los campos obligatorios.",
      }
      showPendingToast()
      return
    }

    try {
      setIsProcessing(true) // Mostrar LoadingOverlay
      setProcessingMessage(currentMascota ? "Actualizando mascota..." : "Creando mascota...") // Mensaje para el LoadingOverlay

      // Limpiar cualquier notificación pendiente anterior
      pendingToastRef.current = null
      toastShownRef.current = false

      // Preparar datos para enviar al servidor
      const mascotaData = {
        // CORRECCIÓN: Convertir IdCliente a número
        IdCliente: Number.parseInt(formData.cliente),
        Nombre: formData.nombre,
        Especie: formData.especie,
        Raza: formData.raza,
        Tamaño: formData.tamaño,
        FechaNacimiento: formData.fechaNacimiento,
        // IMPORTANTE: Usar FotoURL para la UI, pero el servicio lo convertirá a Foto para la BD
        FotoURL: fotoPreview,
        // IMPORTANTE: Siempre establecer el estado como "Activo" para nuevas mascotas
        Estado: "Activo",
      }

      if (currentMascota) {
        // Actualizar mascota existente
        const updatedMascota = await mascotasService.update(currentMascota.IdMascota, mascotaData)

        // Actualizar estado local
        setMascotas((prevMascotas) =>
          prevMascotas.map((m) => {
            if (m.IdMascota === currentMascota.IdMascota) {
              return {
                ...updatedMascota,
                FotoURL: mascotaData.FotoURL || updatedMascota.FotoURL || updatedMascota.Foto,
                Estado: updatedMascota.Estado || mascotaData.Estado,
              }
            }
            return m
          }),
        )

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La mascota "${formData.nombre}" ha sido actualizada correctamente.`,
        }
      } else {
        // Crear nueva mascota
        const newMascota = await mascotasService.create(mascotaData)

        // Actualizar estado local
        setMascotas([
          ...mascotas,
          {
            ...newMascota,
            FotoURL: mascotaData.FotoURL || newMascota.FotoURL || newMascota.Foto,
            Estado: "Activo", // Siempre "Activo" para nuevas mascotas
          },
        ])

        // Guardar el toast para después
        pendingToastRef.current = {
          type: "success",
          message: `La mascota "${formData.nombre}" ha sido creada correctamente.`,
        }
      }

      // Cerrar el modal
      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar mascota:", error)

      pendingToastRef.current = {
        type: "error",
        message: "Error al guardar la mascota. Por favor, intente nuevamente.",
      }
    } finally {
      setIsProcessing(false) // Ocultar LoadingOverlay
      showPendingToast() // Mostrar cualquier notificación pendiente
    }
  }

  // Opciones para el select de clientes
  const clientesOptions = clientes.map((cliente) => ({
    value: cliente.IdCliente,
    label: `${cliente.Nombre} ${cliente.Apellido} - ${cliente.Documento || "Sin documento"}`,
  }))

  // Opciones para el select de especies
  const especiesOptions = [
    { value: "Canino", label: "Canino" },
    { value: "Felino", label: "Felino" },
  ]

  // Opciones para el select de tamaños
  const tamañosOptions = [
    { value: "Pequeño", label: "Pequeño" },
    { value: "Mediano", label: "Mediano" },
    { value: "Grande", label: "Grande" },
  ]

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    const modalElement = document.getElementById("mascotaModal")
    modalRef.current = modalElement
    let modalInstance = null

    if (showModal && modalElement) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)
        modalInstance.show()
      })
    } else if (!showModal && modalElement && modalElement.classList.contains("show")) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)
        modalInstance.hide()
      })
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      if (showModal) setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      // Limpiar backdrop y clases de Bootstrap
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) backdrop.remove()
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [showModal])

  return (
    <div className="mascotas-container">
      <h2 className="mb-4">Gestión de Mascotas</h2>

      <DataTable
        columns={columns}
        data={mascotas}
        onAdd={handleAddMascota}
        addButtonLabel="Agregar Mascota"
        searchPlaceholder="Buscar mascotas..."
        loading={loading}
      />

      {/* Modal para Agregar/Editar/Ver Mascota */}
      <MascotaForm
        showModal={showModal}
        modalTitle={modalTitle}
        formData={formData}
        fotoPreview={fotoPreview}
        especiesOptions={especiesOptions}
        tamañosOptions={tamañosOptions}
        clientesOptions={clientesOptions}
        onInputChange={handleInputChange}
        onSelectCliente={handleSelectCliente}
        onFotoChange={handleFotoChange}
        onSave={handleSaveMascota}
        onClose={handleCloseModal}
        disableSave={isImageLoading}
      />

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        show={showEditConfirm}
        title="Confirmar edición"
        message={`¿Está seguro de editar la mascota "${mascotaToEdit?.Nombre}"?`}
        type="info"
        onConfirm={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
      />

      <ConfirmDialog
        show={showStatusConfirm}
        title="Confirmar cambio de estado"
        message={`¿Está seguro de ${mascotaToToggle?.Estado === "Activo" ? "desactivar" : "activar"} la mascota "${mascotaToToggle?.Nombre}"?`}
        type="warning"
        onConfirm={handleToggleStatus}
        onCancel={handleCancelToggleStatus}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        title="Confirmar eliminación"
        message={
          <>
            ¿Está seguro que desea eliminar la mascota <strong>{mascotaToDelete?.Nombre}</strong>?
            <br />
            <span className="text-danger">Esta acción no se puede deshacer.</span>
          </>
        }
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Añadir LoadingOverlay */}
      <LoadingOverlay
        isLoading={isProcessing}
        message={processingMessage}
        variant="primary"
        onHide={showPendingToast}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        limit={1}
      />
    </div>
  )
}

export default Mascotas
