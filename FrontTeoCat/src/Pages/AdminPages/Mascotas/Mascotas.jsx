"use client"

import { useState, useEffect, useRef } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import "../../../Styles/AdminStyles/Mascotas.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import MascotaForm from "../../../Components/AdminComponents/MascotasComponents/MascotaForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/MascotasComponents/DeleteConfirmModal"
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary"
import mascotasService from "../../../Services/ConsumoAdmin/MascotasService.js"
import clientesService from "../../../Services/ConsumoAdmin/ClientesService.js"

/**
 * Componente para la gestión de mascotas
 * Permite visualizar, crear, editar, activar/desactivar y eliminar mascotas
 */
const Mascotas = () => {
  // Estado para las mascotas
  const [mascotas, setMascotas] = useState([])

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

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mascotaToDelete, setMascotaToDelete] = useState(null)

  // Estado para indicar carga de datos
  const [isLoading, setIsLoading] = useState(false)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Modificar el useEffect para cargar datos iniciales y asegurar que todas las mascotas tengan un estado
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
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
        toast.error("Error al cargar los datos. Por favor, intente nuevamente.")

        // Intentar cargar datos desde localStorage como respaldo
        try {
          const mascotasGuardadas = JSON.parse(localStorage.getItem("mascotasData") || "{}")
          if (Object.keys(mascotasGuardadas).length > 0) {
            const mascotasArray = Object.values(mascotasGuardadas)
            console.log("Cargando mascotas desde localStorage:", mascotasArray)
            setMascotas(mascotasArray)
            toast.info("Se cargaron datos guardados localmente mientras se resuelven los problemas de conexión.")
          }
        } catch (localError) {
          console.error("Error al cargar datos desde localStorage:", localError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Función para limpiar todas las notificaciones
  const clearAllToasts = () => {
    // Usar el ID de cada toast si está disponible
    Object.values(toastIds.current).forEach((id) => {
      if (id) toast.dismiss(id)
    })

    // Limpiar todas las demás notificaciones
    toast.dismiss()
  }

  // Limpiar notificaciones al montar y desmontar el componente
  useEffect(() => {
    // Limpiar todas las notificaciones al montar
    clearAllToasts()

    // Limpiar todas las notificaciones al desmontar
    return () => {
      clearAllToasts()
    }
  }, [])

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
          actions={["view", "edit", "toggleStatus", "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
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
    console.log("Ver detalles de mascota:", mascota)
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
  }

  /**
   * Manejador para editar una mascota
   * @param {Object} mascota - Objeto de mascota a editar
   */
  const handleEdit = (mascota) => {
    console.log("Editar mascota:", mascota)
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
    console.log("Foto URL en handleEdit:", mascota.FotoURL)
    if (mascota.FotoURL) {
      setFotoPreview(mascota.FotoURL)
    } else {
      setFotoPreview(null)
    }

    setShowModal(true)
  }

  // Modificar la función handleToggleStatus para usar el servicio actualizado:
  const handleToggleStatus = async (mascota) => {
    try {
      // Verificar que la mascota tenga un ID válido
      if (!mascota.IdMascota) {
        console.warn("Advertencia: Mascota sin ID válido", mascota)
        // En lugar de mostrar un error, continuamos con un ID temporal
        mascota.IdMascota = `temp_${Date.now()}`
      }

      // Asegurar que el estado actual sea un string
      let estadoActual = mascota.Estado

      // Convertir valores numéricos a texto
      if (typeof estadoActual === "number") {
        estadoActual = estadoActual === 1 ? "Activo" : "Inactivo"
      }

      // Si no hay valor, usar "Activo" por defecto
      if (estadoActual === undefined || estadoActual === null) {
        estadoActual = "Activo"
      }

      const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo"

      console.log(`Cambiando estado de la mascota ID ${mascota.IdMascota} de ${estadoActual} a ${nuevoEstado}`)

      // Limpiar TODAS las notificaciones existentes
      toast.dismiss()

      // Mostrar notificación de carga con un ID único basado en timestamp
      const timestamp = Date.now()
      const loadingToastId = toast.loading(
        <div>
          <strong>Actualizando estado</strong>
          <p>Cambiando estado de la mascota "{mascota.Nombre}"...</p>
        </div>,
        {
          position: "top-right",
          toastId: `loading-${timestamp}`,
        },
      )

      // Actualizar primero en el estado local para mejorar la experiencia de usuario
      setMascotas((prevMascotas) =>
        prevMascotas.map((m) => {
          if (m.IdMascota === mascota.IdMascota) {
            return {
              ...m,
              Estado: nuevoEstado,
            }
          }
          return m
        }),
      )

      try {
        // Actualizar en el servidor usando el servicio
        const resultado = await mascotasService.updateStatus(mascota.IdMascota, nuevoEstado)

        // Si el resultado tiene un ID diferente (temporal), actualizamos el estado local
        if (resultado.IdMascota && resultado.IdMascota !== mascota.IdMascota) {
          setMascotas((prevMascotas) =>
            prevMascotas.map((m) => {
              if (m.IdMascota === mascota.IdMascota) {
                return {
                  ...m,
                  IdMascota: resultado.IdMascota,
                  Estado: resultado.Estado || nuevoEstado,
                }
              }
              return m
            }),
          )
        }

        // Guardar el estado en localStorage para persistencia
        const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
        mascotasEstados[mascota.IdMascota] = nuevoEstado
        localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))

        // Añadir notificación
        const newStatus = estadoActual === "Activo" ? "inactiva" : "activa"

        // Descartar notificación de carga de forma segura
        setTimeout(() => {
          toast.dismiss(loadingToastId)

          // Crear nueva notificación con un ID único
          toast.success(
            <div>
              <strong>Estado actualizado</strong>
              <p>
                La mascota "{mascota.Nombre}" ahora está {newStatus}.
              </p>
            </div>,
            {
              icon: "🔄",
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `status-${timestamp}`, // Usar un ID único basado en timestamp
            },
          )
        }, 300)
      } catch (error) {
        console.error("Error al cambiar estado en el servidor:", error)

        // Guardar el estado en localStorage de todos modos para persistencia local
        const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
        mascotasEstados[mascota.IdMascota] = nuevoEstado
        localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))

        // Descartar notificación de carga en caso de error
        setTimeout(() => {
          toast.dismiss(loadingToastId)

          // Mostrar notificación de advertencia en lugar de error
          toast.warning(
            <div>
              <strong>Estado actualizado localmente</strong>
              <p>El estado se ha actualizado en la interfaz, pero hubo un problema al sincronizar con el servidor.</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `warning-${Date.now()}`,
            },
          )
        }, 300)
      }
    } catch (error) {
      console.error("Error al cambiar estado de mascota:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudo cambiar el estado de la mascota. Por favor, intente nuevamente.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-${Date.now()}`,
        },
      )
    }
  }

  // Modificar la función handleDelete para verificar si la mascota tiene un cliente asociado:
  const handleDelete = (mascota) => {
    // Verificar si la mascota tiene un cliente asociado before de mostrar el modal de confirmación
    if (mascota.IdCliente) {
      toast.error(
        <div>
          <strong>No se puede eliminar</strong>
          <p>No se puede eliminar la mascota porque tiene un cliente asociado.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-dependency-${Date.now()}`,
        },
      )
      return
    }

    setMascotaToDelete(mascota)
    setShowDeleteConfirm(true)
  }

  // Modificar la función confirmDelete para manejar mejor el error de cliente asociado:

  const confirmDelete = async () => {
    if (mascotaToDelete) {
      try {
        // Verificar que la mascota tenga un ID válido
        if (!mascotaToDelete.IdMascota) {
          console.error("Error: Mascota sin ID válido", mascotaToDelete)
          toast.error("Error: No se puede eliminar una mascota sin ID válido")
          setShowDeleteConfirm(false)
          setMascotaToDelete(null)
          return
        }

        // Verificar si la mascota tiene un cliente asociado
        if (mascotaToDelete.IdCliente) {
          console.error("Error: La mascota tiene un cliente asociado y no puede ser eliminada", mascotaToDelete)
          toast.error(
            <div>
              <strong>No se puede eliminar</strong>
              <p>No se puede eliminar la mascota porque tiene un cliente asociado.</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-dependency-${Date.now()}`,
            },
          )
          setShowDeleteConfirm(false)
          setMascotaToDelete(null)
          return
        }

        // Limpiar todas las notificaciones existentes
        toast.dismiss()

        // Mostrar notificación de carga
        const timestamp = Date.now()
        const loadingToastId = toast.loading(
          <div>
            <strong>Eliminando mascota</strong>
            <p>Procesando la eliminación de la mascota "{mascotaToDelete.Nombre}"...</p>
          </div>,
          {
            position: "top-right",
            toastId: `loading-${timestamp}`,
          },
        )

        try {
          // Eliminar en el servidor
          await mascotasService.delete(mascotaToDelete.IdMascota)

          // Actualizar estado local
          const updatedMascotas = mascotas.filter((m) => m.IdMascota !== mascotaToDelete.IdMascota)
          setMascotas(updatedMascotas)

          // Descartar notificación de carga de forma segura
          setTimeout(() => {
            toast.dismiss(loadingToastId)

            // Añadir notificación de éxito
            toast.info(
              <div>
                <strong>Mascota eliminada</strong>
                <p>La mascota "{mascotaToDelete.Nombre}" ha sido eliminada correctamente.</p>
              </div>,
              {
                icon: "🗑️",
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                toastId: `delete-${timestamp}`,
              },
            )
          }, 300)
        } catch (error) {
          // Descartar notificación de carga en caso de error
          setTimeout(() => {
            toast.dismiss(loadingToastId)
            throw error
          }, 300)
        }
      } catch (error) {
        console.error("Error al eliminar mascota:", error)

        // Verificar si el error es por dependencias con cliente
        if (
          error.isClientDependency ||
          (error.response && error.response.status === 400) ||
          (error.message &&
            (error.message.toLowerCase().includes("cliente") ||
              error.message.toLowerCase().includes("citas") ||
              error.message.toLowerCase().includes("servicios")))
        ) {
          toast.error(
            <div>
              <strong>No se puede eliminar</strong>
              <p>{error.message || "No se puede eliminar la mascota porque tiene un cliente asociado."}</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-dependency-${Date.now()}`,
            },
          )
        } else {
          toast.error(
            <div>
              <strong>Error</strong>
              <p>Error al eliminar la mascota. Por favor, intente nuevamente.</p>
              <p className="text-sm text-red-600">Detalles: {error.message || "Error desconocido"}</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-${Date.now()}`,
            },
          )
        }
      }
    }
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
      toast.error("Por favor, seleccione un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.")
      return
    }

    // Limpiar notificaciones previas
    toast.dismiss()

    // Mostrar notificación de carga
    const loadingToastId = toast.loading(
      <div>
        <strong>Subiendo imagen</strong>
        <p>Por favor, espere mientras se sube la imagen...</p>
      </div>,
      {
        position: "top-right",
      },
    )

    // Guardar el archivo para referencia
    setFotoMascota(file)

    // Crear URL para previsualización temporal
    const localPreview = URL.createObjectURL(file)
    setFotoPreview(localPreview)

    // Indicar que la imagen está cargando
    setIsImageLoading(true)

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

        // Actualizar la notificación
        toast.update(loadingToastId, {
          render: (
            <div>
              <strong>Imagen subida</strong>
              <p>La imagen se ha subido correctamente.</p>
            </div>
          ),
          type: "success",
          autoClose: 3000,
          isLoading: false,
        })
      } else {
        toast.update(loadingToastId, {
          render: (
            <div>
              <strong>Error</strong>
              <p>Error al subir la imagen. Intente nuevamente.</p>
            </div>
          ),
          type: "error",
          autoClose: 5000,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      toast.update(loadingToastId, {
        render: (
          <div>
            <strong>Error</strong>
            <p>Error al subir la imagen. Intente nuevamente.</p>
            <p className="text-sm text-red-600">Detalles: {error.message || "Error desconocido"}</p>
          </div>
        ),
        type: "error",
        autoClose: 5000,
        isLoading: false,
      })
    } finally {
      // Indicar que la imagen ya no está cargando
      setIsImageLoading(false)
    }
  }

  // Modificar la función handleSaveMascota para cerrar correctamente el modal
  const handleSaveMascota = async () => {
    // Verificar si hay una imagen cargando
    if (isImageLoading) {
      toast.warning("Espere a que se complete la carga de la imagen")
      return
    }

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.especie || !formData.fechaNacimiento || !formData.cliente) {
      // Notificación de error
      toast.dismiss() // Limpiar notificaciones previas

      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, complete todos los campos obligatorios.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-form-${Date.now()}`,
        },
      )
      return
    }

    try {
      // Preparar datos para enviar al servidor
      const mascotaData = {
        // CORRECCIÓN: Convertir IdCliente a número
        IdCliente: parseInt(formData.cliente),
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

      console.log("Guardando mascota con foto URL:", fotoPreview)

      // Limpiar todas las notificaciones existentes para evitar duplicados
      toast.dismiss()

      // Mostrar notificación de carga con tiempo de espera más largo
      const timestamp = Date.now()
      const loadingToastId = toast.loading(
        <div>
          <strong>{currentMascota ? "Actualizando" : "Creando"} mascota</strong>
          <p>Por favor, espere...</p>
        </div>,
        {
          position: "top-right",
          toastId: `loading-${timestamp}`,
          // No establecer autoClose para que no se cierre automáticamente
        },
      )

      try {
        if (currentMascota) {
          // Actualizar mascota existente
          console.log("Actualizando mascota:", mascotaData)

          // Añadir un pequeño retraso antes de la actualización para asegurar que la UI muestre el estado de carga
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const updatedMascota = await mascotasService.update(currentMascota.IdMascota, mascotaData)

          // Verificar que la mascota actualizada tenga un ID válido
          if (!updatedMascota.IdMascota) {
            updatedMascota.IdMascota = currentMascota.IdMascota
            console.warn("ID no devuelto en la respuesta, usando ID original:", currentMascota.IdMascota)
          }

          // Asegurarse de que la FotoURL se mantenga
          updatedMascota.FotoURL = mascotaData.FotoURL || updatedMascota.FotoURL || updatedMascota.Foto

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

          // Guardar el estado en localStorage para persistencia
          const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
          mascotasEstados[currentMascota.IdMascota] = updatedMascota.Estado || mascotaData.Estado
          localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))

          // Descartar notificación de carga después de un tiempo más largo
          setTimeout(() => {
            toast.dismiss(loadingToastId)

            // Notificación de éxito para edición con tiempo más largo
            toast.success(
              <div>
                <strong>Mascota actualizada</strong>
                <p>La mascota "{formData.nombre}" ha sido actualizada correctamente.</p>
              </div>,
              {
                icon: "✏️",
                position: "top-right",
                autoClose: 7000, // Aumentar el tiempo a 7 segundos
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                toastId: `edit-${timestamp}`,
              },
            )

            // Esperar un poco antes de cerrar el modal para que el usuario vea la notificación
            setTimeout(() => {
              cerrarModal()
            }, 2000) // Aumentar el tiempo de espera a 2 segundos
          }, 1500) // Aumentar el tiempo de espera a 1.5 segundos
        } else {
          // Crear nueva mascota - código similar al existente pero con tiempos ajustados
          console.log("Creando nueva mascota:", mascotaData)

          // Añadir un pequeño retraso antes de la creación
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const newMascota = await mascotasService.create(mascotaData)

          // Verificar que la nueva mascota tenga un ID válido
          if (!newMascota.IdMascota) {
            // Asignar un ID temporal si no se recibió uno del servidor
            newMascota.IdMascota = `temp_${Date.now()}`
            console.warn("ID no devuelto en la respuesta, usando ID temporal:", newMascota.IdMascota)
          }

          // Asegurarse de que la FotoURL se mantenga
          newMascota.FotoURL = mascotaData.FotoURL || newMascota.FotoURL || newMascota.Foto

          // IMPORTANTE: Asegurar que el estado sea "Activo" para nuevas mascotas
          newMascota.Estado = "Activo"

          // Actualizar estado local
          setMascotas([
            ...mascotas,
            {
              ...newMascota,
              FotoURL: mascotaData.FotoURL || newMascota.FotoURL || newMascota.Foto,
              Estado: "Activo", // Siempre "Activo" para nuevas mascotas
            },
          ])

          // Guardar el estado en localStorage para persistencia
          const mascotasEstados = JSON.parse(localStorage.getItem("mascotasEstados") || "{}")
          mascotasEstados[newMascota.IdMascota] = "Activo"
          localStorage.setItem("mascotasEstados", JSON.stringify(mascotasEstados))

          // Descartar notificación de carga después de un tiempo más largo
          setTimeout(() => {
            toast.dismiss(loadingToastId)

            // Notificación de éxito para creación con tiempo más largo
            toast.success(
              <div>
                <strong>Mascota creada</strong>
                <p>La mascota "{formData.nombre}" ha sido creada correctamente.</p>
              </div>,
              {
                icon: "✅",
                position: "top-right",
                autoClose: 7000, // Aumentar el tiempo a 7 segundos
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                toastId: `create-${timestamp}`,
              },
            )

            // Esperar un poco antes de cerrar el modal
            setTimeout(() => {
              cerrarModal()
            }, 2000) // Aumentar el tiempo de espera a 2 segundos
          }, 1500) // Aumentar el tiempo de espera a 1.5 segundos
        }
      } catch (error) {
        // Descartar notificación de carga en caso de error después de un tiempo
        setTimeout(() => {
          toast.dismiss(loadingToastId)

          // Mostrar notificación de error con más detalles y tiempo más largo
          toast.error(
            <div>
              <strong>Error al {currentMascota ? "actualizar" : "crear"} mascota</strong>
              <p>Ocurrió un problema al procesar la solicitud.</p>
              {error.message && <p className="text-sm text-red-600">Detalles: {error.message}</p>}
              {error.response && error.response.data && (
                <p className="text-sm text-red-600">
                  Respuesta del servidor: {JSON.stringify(error.response.data)}
                </p>
              )}
            </div>,
            {
              position: "top-right",
              autoClose: 10000, // Aumentar el tiempo a 10 segundos para errores
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: `error-${Date.now()}`,
            },
          )
        }, 500)
      }
    } catch (error) {
      console.error("Error al guardar mascota:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Error al guardar la mascota. Por favor, intente nuevamente.</p>
          {error.message && <p className="text-sm text-red-600">Detalles: {error.message}</p>}
        </div>,
        {
          position: "top-right",
          autoClose: 10000, // Aumentar el tiempo a 10 segundos para errores
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `error-${Date.now()}`,
        },
      )
    }
  }

  // Agregar una función para cerrar el modal correctamente
  const cerrarModal = () => {
    try {
      // Cerrar el modal usando Bootstrap
      const modalElement = document.getElementById("mascotaModal")
      if (modalElement) {
        import("bootstrap")
          .then((bootstrap) => {
            try {
              const modalInstance = bootstrap.Modal.getInstance(modalElement)
              if (modalInstance) {
                modalInstance.hide()
              } else {
                console.warn("No se encontró instancia del modal, intentando crear una nueva")
                const newModalInstance = new bootstrap.Modal(modalElement)
                newModalInstance.hide()
              }

              // Limpiar el backdrop manualmente si es necesario
              const backdrop = document.querySelector(".modal-backdrop")
              if (backdrop) {
                backdrop.remove()
              }
              document.body.classList.remove("modal-open")
              document.body.style.overflow = ""
              document.body.style.paddingRight = ""
            } catch (error) {
              console.error("Error al cerrar el modal con Bootstrap:", error)
              // Intento alternativo de cerrar el modal
              modalElement.classList.remove("show")
              modalElement.style.display = "none"

              const backdrop = document.querySelector(".modal-backdrop")
              if (backdrop) {
                backdrop.remove()
              }
              document.body.classList.remove("modal-open")
              document.body.style.overflow = ""
              document.body.style.paddingRight = ""
            }
          })
          .catch((error) => {
            console.error("Error al importar Bootstrap:", error)
          })
      }

      // Actualizar el estado para indicar que el modal está cerrado
      setShowModal(false)
    } catch (error) {
      console.error("Error general al cerrar el modal:", error)
      // Forzar actualización del estado
      setShowModal(false)
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
    let modalInstance = null
    const modalElement = document.getElementById("mascotaModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      // Si showModal es false y el modal está abierto, cerrarlo programáticamente
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

    // Evento para cuando el modal se cierra con el botón X o haciendo clic fuera
    const handleHidden = () => {
      setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      // No llamar a dispose() aquí, solo ocultar si es necesario
    }
  }, [showModal])

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setMascotaToDelete(null)
  }

  return (
    <div className="mascotas-container">
      <h2 className="mb-4">Gestión de Mascotas</h2>

      <DataTable
        columns={columns}
        data={mascotas}
        onAdd={handleAddMascota}
        addButtonLabel="Agregar Mascota"
        searchPlaceholder="Buscar mascotas..."
        loading={isLoading}
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
        disableSave={isImageLoading} // Pasar el estado de carga al formulario
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        mascota={mascotaToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Modificar la configuración del ToastContainer */}
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
        limit={2}
        closeButton
        containerId="mascotas-toast-container"
        enableMultiContainer={true}
      />
    </div>
  )
}

export default Mascotas