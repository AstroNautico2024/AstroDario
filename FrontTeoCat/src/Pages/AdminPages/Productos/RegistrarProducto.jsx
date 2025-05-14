"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Save, ArrowLeft, X, Info, Plus } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import BasicInfoSection from "../../../Components/AdminComponents/ProductosComponents/BasicInfoSection"
import CharacteristicsSection from "../../../Components/AdminComponents/ProductosComponents/CharacteristicsSection"
import SpecificationsSection from "../../../Components/AdminComponents/ProductosComponents/SpecificationsSection"
import ImagesSection from "../../../Components/AdminComponents/ProductosComponents/ImagesSection"
import PricingSection from "../../../Components/AdminComponents/ProductosComponents/PricingSection"
import AdditionalInfoSection from "../../../Components/AdminComponents/ProductosComponents/AdditionalInfoSection"
import VariantsSection from "../../../Components/AdminComponents/ProductosComponents/VariantsSection"
import VariantForm from "../../../Components/AdminComponents/ProductosComponents/VariantForm"
import { uploadImageToCloudinary } from "../../../Services/uploadImageToCloudinary"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"
import CategoriasService from "../../../Services/ConsumoAdmin/CategoriasService.js"

/**
 * Componente para registrar un nuevo producto o editar uno existente
 */
const RegistrarProducto = () => {
  // Obtener parámetros de la URL para edición
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const productId = params.get("id")
  const isEditing = !!productId

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("info-basica")

  // Estado para el formulario
  const [formData, setFormData] = useState({
    NombreProducto: "",
    Descripcion: "",
    IdCategoriaDeProducto: "",
    Foto: "",
    Stock: "0",
    Precio: "0",
    PorcentajeIVA: "19",
    AplicaIVA: true,
    CodigoBarras: "",
    Referencia: "",
    FechaVencimiento: "",
    NoVence: false,
    Caracteristicas: [],
    Especificaciones: [],
    Variantes: [],
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    NombreProducto: "",
    Descripcion: "",
    IdCategoriaDeProducto: "",
    Stock: "",
    Precio: "",
    CodigoBarras: "",
    Referencia: "",
    FechaVencimiento: "",
  })

  // Estado para mostrar el cálculo del IVA
  const [precioConIva, setPrecioConIva] = useState({
    valorIva: 0,
    precioFinal: 0,
  })

  // Estado para manejar las imágenes
  const [imagenes, setImagenes] = useState([null, null, null, null])
  const [imagenesPreview, setImagenesPreview] = useState([null, null, null, null])
  const [imagenesLoading, setImagenesLoading] = useState([false, false, false, false])

  // Estado para las categorías
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para productos existentes (para validación de duplicados)
  const [productosExistentes, setProductosExistentes] = useState([])

  // Estado para controlar si el producto es existente (para deshabilitar el stock)
  const [isExistingProduct, setIsExistingProduct] = useState(false)

  // Estado para controlar si estamos creando una variante
  const [creatingVariant, setCreatingVariant] = useState(false)

  // Hook para navegación
  const navigate = useNavigate()

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        console.log("Iniciando carga de datos iniciales...")

        // Cargar categorías
        let categoriasData
        try {
          categoriasData = await CategoriasService.getAll()
          console.log("Categorías obtenidas:", categoriasData)
        } catch (error) {
          console.error("Error al cargar categorías:", error)
          toast.error(`No se pudieron cargar las categorías. ${error.response?.data?.message || error.message}`)
          categoriasData = []
        }
        setCategorias(categoriasData)

        // Cargar productos para validación
        let productosData
        try {
          productosData = await ProductosService.getAll()
          console.log("Productos obtenidos para validación:", productosData)
        } catch (error) {
          console.error("Error al cargar productos para validación:", error)
          toast.error(
            `No se pudieron cargar los productos para validación. ${error.response?.data?.message || error.message}`,
          )
          productosData = []
        }
        setProductosExistentes(productosData)

        // Si estamos en modo edición, cargar datos del producto
        if (isEditing) {
          try {
            const productoData = await ProductosService.getById(productId)
            console.log("Producto para edición obtenido:", productoData)

            // Formatear datos para el formulario
            setFormData({
              NombreProducto: productoData.NombreProducto || "",
              Descripcion: productoData.Descripcion || "",
              IdCategoriaDeProducto: productoData.IdCategoriaDeProducto?.toString() || "",
              Foto: productoData.Foto || "",
              Stock: productoData.Stock?.toString() || "0",
              Precio: productoData.Precio?.toString() || "0",
              PorcentajeIVA: productoData.PorcentajeIVA?.toString() || "19",
              AplicaIVA: !!productoData.AplicaIVA,
              CodigoBarras: productoData.CodigoBarras || "",
              Referencia: productoData.Referencia || "",
              FechaVencimiento: productoData.FechaVencimiento
                ? new Date(productoData.FechaVencimiento).toISOString().split("T")[0]
                : "",
              NoVence: !!productoData.NoVence,
              Caracteristicas: productoData.Caracteristicas
                ? productoData.Caracteristicas.split(", ").filter((c) => c)
                : [],
              Especificaciones: productoData.Especificaciones
                ? productoData.Especificaciones.split(", ")
                    .filter((e) => e)
                    .map((e) => {
                      const [nombre, valor] = e.split(": ")
                      return { nombre, valor }
                    })
                : [],
              Variantes: productoData.Variantes || [],
            })

            // Cargar imágenes si el producto tiene fotos
            if (productoData.Foto) {
              const fotosArray = productoData.Foto.split("|")
              const newImagenesPreview = [...imagenesPreview]
              const newImagenes = [...imagenes]

              fotosArray.forEach((url, index) => {
                if (index < 4) {
                  newImagenesPreview[index] = url
                  newImagenes[index] = url
                }
              })

              setImagenesPreview(newImagenesPreview)
              setImagenes(newImagenes)
            }
          } catch (error) {
            console.error(`Error al cargar producto con ID ${productId}:`, error)
            toast.error(`No se pudo cargar el producto para edición. ${error.response?.data?.message || error.message}`)
          }
        }
      } catch (error) {
        console.error("Error general al cargar datos iniciales:", error)
        toast.error("Error al cargar datos. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    // Limpiar notificaciones al montar
    toast.dismiss()

    return () => {
      // Limpiar URLs de vista previa al desmontar
      imagenesPreview.forEach((preview) => {
        if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview)
        }
      })
      // Limpiar notificaciones
      toast.dismiss()
    }
  }, [isEditing, productId])

  /**
   * Efecto para calcular el precio con IVA cuando cambia el precio o el IVA
   */
  useEffect(() => {
    if (formData.Precio && formData.AplicaIVA) {
      const precio = Number.parseFloat(formData.Precio) || 0
      const iva = Number.parseFloat(formData.PorcentajeIVA) || 0
      const valorIva = precio * (iva / 100)
      const precioFinal = precio + valorIva

      setPrecioConIva({
        valorIva: valorIva,
        precioFinal: precioFinal,
      })
    } else {
      setPrecioConIva({
        valorIva: 0,
        precioFinal: Number.parseFloat(formData.Precio) || 0,
      })
    }
  }, [formData.Precio, formData.PorcentajeIVA, formData.AplicaIVA])

  /**
   * Manejador para cambios en los inputs del formulario
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
        // Si se marca "No vence", limpiar la fecha de vencimiento
        ...(name === "NoVence" && checked ? { FechaVencimiento: "" } : {}),
      })
    } else if (type === "file") {
      // Si es un input de tipo file, guardar el archivo
      if (files && files[0]) {
        setFormData({
          ...formData,
          [name]: files[0],
        })
      }
    } else {
      // Para otros tipos de input, guardar el valor
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Limpiar el error específico cuando el usuario comienza a escribir
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
  }

  /**
   * Manejador para el cambio del checkbox de producto existente
   */
  const handleExistingProductChange = (e) => {
    const checked = e.target.checked
    setIsExistingProduct(checked)

    // Si es un producto existente, establecer el stock a 0
    if (checked) {
      setFormData({
        ...formData,
        Stock: "0",
      })
    }
  }

  /**
   * Manejador para subir imágenes
   * @param {Event} e - Evento del input file
   * @param {Number} index - Índice de la imagen (0-3)
   */
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (file) {
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

      // Crear una copia de los arrays
      const newImagenes = [...imagenes]
      const newImagenesPreview = [...imagenesPreview]
      const newImagenesLoading = [...imagenesLoading]

      // Actualizar la imagen y su vista previa local temporal
      newImagenes[index] = file
      newImagenesPreview[index] = URL.createObjectURL(file)

      // Indicar que esta imagen está cargando
      newImagenesLoading[index] = true
      setImagenesLoading(newImagenesLoading)

      // Actualizar los estados con la vista previa local
      setImagenes(newImagenes)
      setImagenesPreview(newImagenesPreview)

      try {
        // Subir imagen a Cloudinary
        let imageUrl
        try {
          imageUrl = await uploadImageToCloudinary(file, "productos")
        } catch (error) {
          console.error("Error al subir imagen a Cloudinary:", error)
          toast.error("Error al subir la imagen a Cloudinary. Se usará una URL local temporal.")
          imageUrl = newImagenesPreview[index]
        }

        if (imageUrl) {
          // Actualizar la vista previa con la URL de Cloudinary
          const updatedImagenesPreview = [...imagenesPreview]

          // Revocar la URL temporal para liberar memoria si es diferente
          if (
            newImagenesPreview[index] &&
            newImagenesPreview[index].startsWith("blob:") &&
            newImagenesPreview[index] !== imageUrl
          ) {
            URL.revokeObjectURL(newImagenesPreview[index])
          }

          updatedImagenesPreview[index] = imageUrl
          setImagenesPreview(updatedImagenesPreview)

          // Actualizar el formData con las imágenes
          const updatedImagenes = [...imagenes]
          updatedImagenes[index] = imageUrl // Guardamos la URL en lugar del archivo

          setImagenes(updatedImagenes)
        } else {
          toast.error("Error al subir la imagen. Intente nuevamente.")
        }
      } catch (error) {
        console.error("Error al subir la imagen:", error)
        toast.error("Error al subir la imagen. Intente nuevamente.")
      } finally {
        // Indicar que esta imagen ya no está cargando
        const finalImagenesLoading = [...imagenesLoading]
        finalImagenesLoading[index] = false
        setImagenesLoading(finalImagenesLoading)
      }
    }
  }

  /**
   * Manejador para eliminar una imagen
   * @param {Number} index - Índice de la imagen a eliminar (0-3)
   */
  const handleRemoveImage = (index) => {
    // Crear una copia de los arrays
    const newImagenes = [...imagenes]
    const newImagenesPreview = [...imagenesPreview]

    // Limpiar la imagen y su vista previa
    newImagenes[index] = null

    // Revocar la URL para liberar memoria
    if (imagenesPreview[index] && imagenesPreview[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagenesPreview[index])
    }
    newImagenesPreview[index] = null

    // Actualizar los estados
    setImagenes(newImagenes)
    setImagenesPreview(newImagenesPreview)
  }

  /**
   * Función para simular el escaneo de un código de barras
   */
  const handleScanBarcode = () => {
    // Generar un código de barras aleatorio de 13 dígitos (formato EAN-13)
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000

    setFormData({
      ...formData,
      CodigoBarras: randomBarcode.toString(),
    })

    // Limpiar el error si existía
    setFormErrors({
      ...formErrors,
      CodigoBarras: "",
    })
  }

  /**
   * Función para formatear números con separadores de miles en formato colombiano
   */
  const formatNumber = (number) => {
    // Asegurarse de que number sea un número
    const num = typeof number === "string" ? Number.parseFloat(number) : number

    // Verificar si es un número válido
    if (isNaN(num)) return "0"

    // Formatear con separador de miles (punto) y sin decimales para pesos colombianos
    return num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  /**
   * Manejador para agregar una nueva característica
   */
  const handleAddCaracteristica = (caracteristica) => {
    if (caracteristica.trim() === "") {
      return
    }

    // Verificar si la característica ya existe
    if (formData.Caracteristicas.includes(caracteristica.trim())) {
      toast.error("Esta característica ya ha sido agregada")
      return
    }

    // Agregar la nueva característica
    const updatedCaracteristicas = [...formData.Caracteristicas, caracteristica.trim()]

    // Actualizar el formData
    setFormData({
      ...formData,
      Caracteristicas: updatedCaracteristicas,
    })
  }

  /**
   * Manejador para eliminar una característica
   * @param {Number} index - Índice de la característica a eliminar
   */
  const handleRemoveCaracteristica = (index) => {
    const updatedCaracteristicas = [...formData.Caracteristicas]
    updatedCaracteristicas.splice(index, 1)

    setFormData({
      ...formData,
      Caracteristicas: updatedCaracteristicas,
    })
  }

  /**
   * Manejador para agregar una nueva especificación
   */
  const handleAddEspecificacion = (especificacion) => {
    if (especificacion.nombre.trim() === "" || especificacion.valor.trim() === "") {
      return
    }

    // Verificar si ya existe una especificación con el mismo nombre
    const existeNombre = formData.Especificaciones.some(
      (spec) => spec.nombre.toLowerCase() === especificacion.nombre.trim().toLowerCase(),
    )

    if (existeNombre) {
      toast.error("Ya existe una especificación con este nombre")
      return
    }

    // Agregar la nueva especificación
    const updatedEspecificaciones = [
      ...formData.Especificaciones,
      {
        nombre: especificacion.nombre.trim(),
        valor: especificacion.valor.trim(),
      },
    ]

    // Actualizar el formData
    setFormData({
      ...formData,
      Especificaciones: updatedEspecificaciones,
    })
  }

  /**
   * Manejador para eliminar una especificación
   * @param {Number} index - Índice de la especificación a eliminar
   */
  const handleRemoveEspecificacion = (index) => {
    const updatedEspecificaciones = [...formData.Especificaciones]
    updatedEspecificaciones.splice(index, 1)

    setFormData({
      ...formData,
      Especificaciones: updatedEspecificaciones,
    })
  }

  /**
   * Manejador para guardar una variante
   */
  const handleSaveVariant = (variantData) => {
    // Agregar la variante al producto base
    const updatedVariantes = [
      ...formData.Variantes,
      {
        id: Date.now(), // Generamos un ID único temporal
        ...variantData,
      },
    ]

    setFormData({
      ...formData,
      Variantes: updatedVariantes,
    })

    // Salir del modo de creación de variante
    setCreatingVariant(false)

    // Mostrar mensaje de éxito
    toast.success("Variante creada correctamente")

    // Cambiar a la pestaña de variantes
    setActiveTab("variantes")
  }

  /**
   * Manejador para eliminar una variante
   */
  const handleDeleteVariant = (variantId) => {
    const updatedVariantes = formData.Variantes.filter((v) => v.id !== variantId)

    setFormData({
      ...formData,
      Variantes: updatedVariantes,
    })

    toast.success("Variante eliminada correctamente")
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true
    const errors = {
      NombreProducto: "",
      Descripcion: "",
      IdCategoriaDeProducto: "",
      Stock: "",
      Precio: "",
      CodigoBarras: "",
      Referencia: "",
      FechaVencimiento: "",
    }

    // Validar nombre (requerido y único)
    if (!formData.NombreProducto?.trim()) {
      errors.NombreProducto = "El nombre del producto es obligatorio"
      isValid = false
    } else if (formData.NombreProducto.trim().length > 100) {
      errors.NombreProducto = "El nombre no puede exceder los 100 caracteres"
      isValid = false
    } else {
      // Verificar si el nombre ya existe (excepto para el producto actual en edición)
      const nombreExiste = productosExistentes.some(
        (prod) =>
          prod.NombreProducto?.toLowerCase() === formData.NombreProducto.trim().toLowerCase() &&
          (!isEditing || prod.IdProducto !== Number.parseInt(productId)),
      )
      if (nombreExiste) {
        errors.NombreProducto = "Ya existe un producto con este nombre"
        isValid = false
      }
    }

    // Validar descripción (opcional pero con longitud máxima)
    if (formData.Descripcion && formData.Descripcion.length > 500) {
      errors.Descripcion = "La descripción no puede exceder los 500 caracteres"
      isValid = false
    }

    // Validar categoría (requerida)
    if (!formData.IdCategoriaDeProducto) {
      errors.IdCategoriaDeProducto = "Debe seleccionar una categoría"
      isValid = false
    }

    // Validar stock solo si no es un producto existente
    if (!isExistingProduct) {
      if (formData.Stock === "") {
        errors.Stock = "El stock es obligatorio"
        isValid = false
      } else {
        const stockNum = Number(formData.Stock)
        if (isNaN(stockNum) || stockNum < 0) {
          errors.Stock = "El stock debe ser un número positivo"
          isValid = false
        } else if (!Number.isInteger(stockNum)) {
          errors.Stock = "El stock debe ser un número entero"
          isValid = false
        } else if (stockNum > 9999) {
          errors.Stock = "El stock no puede ser mayor a 9999"
          isValid = false
        }
      }
    }

    // Validar precio (requerido y numérico)
    if (formData.Precio === "") {
      errors.Precio = "El precio es obligatorio"
      isValid = false
    } else {
      const precioNum = Number(formData.Precio)
      if (isNaN(precioNum) || precioNum <= 0) {
        errors.Precio = "El precio debe ser un número positivo"
        isValid = false
      } else if (precioNum > 999999999) {
        errors.Precio = "El precio no puede ser mayor a 999,999,999"
        isValid = false
      }
    }

    // Validar código de barras (opcional pero con formato)
    if (formData.CodigoBarras) {
      if (!/^\d{8,14}$/.test(formData.CodigoBarras)) {
        errors.CodigoBarras = "El código de barras debe tener entre 8 y 14 dígitos"
        isValid = false
      } else {
        // Verificar si el código de barras ya existe (excepto para el producto actual en edición)
        const codigoExiste = productosExistentes.some(
          (prod) =>
            prod.CodigoBarras === formData.CodigoBarras &&
            (!isEditing || prod.IdProducto !== Number.parseInt(productId)),
        )
        if (codigoExiste) {
          errors.CodigoBarras = "Ya existe un producto con este código de barras"
          isValid = false
        }
      }
    }

    // Validar referencia (opcional pero con longitud máxima)
    if (formData.Referencia && formData.Referencia.length > 50) {
      errors.Referencia = "La referencia no puede exceder los 50 caracteres"
      isValid = false
    }

    // Validar fecha de vencimiento si el producto vence
    if (!formData.NoVence && !formData.FechaVencimiento) {
      errors.FechaVencimiento = "Debe ingresar una fecha de vencimiento o marcar 'No vence'"
      isValid = false
    } else if (!formData.NoVence && formData.FechaVencimiento) {
      // Verificar que la fecha de vencimiento sea futura
      const fechaVencimiento = new Date(formData.FechaVencimiento)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0) // Resetear la hora para comparar solo fechas

      if (fechaVencimiento < hoy) {
        errors.FechaVencimiento = "La fecha de vencimiento debe ser futura"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  /**
   * Manejador para guardar el producto
   */
  const handleSaveProduct = async () => {
    // Verificar si hay imágenes cargando
    if (imagenesLoading.some((loading) => loading)) {
      toast.warning("Espere a que se completen las cargas de imágenes")
      return
    }

    // Evitar múltiples envíos
    if (isSaving) {
      return
    }

    // Validar el formulario
    if (!validateForm()) {
      // Mostrar notificación de error general
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, corrija los errores en el formulario.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )

      // Hacer scroll al primer error
      const firstErrorField = Object.keys(formErrors).find((key) => formErrors[key])
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.focus()
        }
      }

      return
    }

    try {
      setIsSaving(true)

      // Filtrar las URLs de las imágenes
      const imageUrls = imagenes.filter((img) => img !== null && typeof img === "string")

      // Concatenar las URLs con un delimitador para guardarlas en un solo campo
      const fotosString = imageUrls.join("|")

      // Preparar los datos para enviar a la base de datos
      const productoData = {
        NombreProducto: formData.NombreProducto,
        Descripcion: formData.Descripcion || "",
        IdCategoriaDeProducto: Number.parseInt(formData.IdCategoriaDeProducto),
        Foto: fotosString, // URLs de imágenes separadas por |
        Stock: Number.parseInt(formData.Stock),
        Precio: Number.parseFloat(formData.Precio),
        PorcentajeIVA: formData.AplicaIVA ? Number.parseFloat(formData.PorcentajeIVA) : 0,
        AplicaIVA: formData.AplicaIVA,
        CodigoBarras: formData.CodigoBarras || "",
        Referencia: formData.Referencia || "",
        FechaVencimiento: formData.NoVence ? null : formData.FechaVencimiento,
        Caracteristicas: formData.Caracteristicas?.join(", ") || "", // Convertir array a string separado por comas
        Especificaciones: formData.Especificaciones?.map((item) => `${item.nombre}: ${item.valor}`)?.join(", ") || "", // Convertir a string
        Estado: true, // Asegurarse de que el producto se cree como activo
        Variantes: formData.Variantes || [], // Incluir las variantes
      }

      console.log("Datos del producto a guardar:", productoData)

      // Guardar o actualizar el producto
      if (isEditing) {
        await ProductosService.update(productId, productoData)
        toast.success(
          <div>
            <strong>Producto actualizado</strong>
            <p>El producto "{formData.NombreProducto}" ha sido actualizado correctamente.</p>
          </div>,
          {
            icon: "✅",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )
      } else {
        await ProductosService.create(productoData)
        toast.success(
          <div>
            <strong>Producto guardado</strong>
            <p>El producto "{formData.NombreProducto}" ha sido guardado correctamente.</p>
          </div>,
          {
            icon: "✅",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )
      }

      // Esperar a que se muestre la notificación y luego redirigir
      setTimeout(() => {
        navigate("/inventario/productos")
      }, 2000)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast.error(
        <div>
          <strong>Error al guardar producto</strong>
          <p>
            {error.response?.data?.message || error.message || "No se pudo guardar el producto. Intente nuevamente."}
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Manejador para cancelar y volver a la lista de productos
   */
  const handleCancel = () => {
    navigate("/inventario/productos")
  }

  // Si estamos creando una variante, mostrar el formulario de variante
  if (creatingVariant) {
    return <VariantForm baseProduct={formData} onSave={handleSaveVariant} onCancel={() => setCreatingVariant(false)} />
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Editar Producto" : "Registrar Nuevo Producto"}</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleCancel}>
          <ArrowLeft size={18} className="me-1" />
          Volver a Productos
        </button>
      </div>

      {/* Checkbox para producto existente */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isExistingProduct"
              checked={isExistingProduct}
              onChange={handleExistingProductChange}
            />
            <label className="form-check-label d-flex align-items-center" htmlFor="isExistingProduct">
              Producto existente (sin ingreso de stock)
              <span
                className="ms-2 text-muted"
                style={{ cursor: "help" }}
                title="Marque esta opción si el producto ya existe en su inventario y no desea ingresar stock inicial. El stock se mantendrá en 0 y deberá actualizarlo posteriormente."
              >
                <Info size={16} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {/* Pestañas de navegación */}
            <ul className="nav nav-tabs mb-4" id="productTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "info-basica" ? "active" : ""}`}
                  onClick={() => setActiveTab("info-basica")}
                  type="button"
                >
                  Información Básica
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "caracteristicas" ? "active" : ""}`}
                  onClick={() => setActiveTab("caracteristicas")}
                  type="button"
                >
                  Características
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "especificaciones" ? "active" : ""}`}
                  onClick={() => setActiveTab("especificaciones")}
                  type="button"
                >
                  Especificaciones
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "imagenes" ? "active" : ""}`}
                  onClick={() => setActiveTab("imagenes")}
                  type="button"
                >
                  Imágenes
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "precios" ? "active" : ""}`}
                  onClick={() => setActiveTab("precios")}
                  type="button"
                >
                  Precios y Stock
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "adicional" ? "active" : ""}`}
                  onClick={() => setActiveTab("adicional")}
                  type="button"
                >
                  Información Adicional
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "variantes" ? "active" : ""}`}
                  onClick={() => setActiveTab("variantes")}
                  type="button"
                >
                  Variantes
                  {formData.Variantes.length > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">{formData.Variantes.length}</span>
                  )}
                </button>
              </li>
            </ul>

            <form className="product-form">
              {/* Contenido de las pestañas */}
              <div className="tab-content" id="productTabsContent">
                {/* Pestaña de Información Básica */}
                <div className={`tab-pane fade ${activeTab === "info-basica" ? "show active" : ""}`}>
                  <BasicInfoSection
                    formData={formData}
                    formErrors={formErrors}
                    categorias={categorias}
                    handleInputChange={handleInputChange}
                  />
                </div>

                {/* Pestaña de Características */}
                <div className={`tab-pane fade ${activeTab === "caracteristicas" ? "show active" : ""}`}>
                  <CharacteristicsSection
                    caracteristicas={formData.Caracteristicas}
                    onAddCaracteristica={handleAddCaracteristica}
                    onRemoveCaracteristica={handleRemoveCaracteristica}
                  />
                </div>

                {/* Pestaña de Especificaciones */}
                <div className={`tab-pane fade ${activeTab === "especificaciones" ? "show active" : ""}`}>
                  <SpecificationsSection
                    especificaciones={formData.Especificaciones}
                    onAddEspecificacion={handleAddEspecificacion}
                    onRemoveEspecificacion={handleRemoveEspecificacion}
                  />
                </div>

                {/* Pestaña de Imágenes */}
                <div className={`tab-pane fade ${activeTab === "imagenes" ? "show active" : ""}`}>
                  <ImagesSection
                    imagenesPreview={imagenesPreview}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                  />
                  {/* Indicador de carga de imágenes */}
                  {imagenesLoading.some((loading) => loading) && (
                    <div className="alert alert-info mt-2 py-2">
                      <small>Subiendo imágenes a Cloudinary...</small>
                    </div>
                  )}
                </div>

                {/* Pestaña de Precios y Stock */}
                <div className={`tab-pane fade ${activeTab === "precios" ? "show active" : ""}`}>
                  <PricingSection
                    formData={formData}
                    formErrors={formErrors}
                    precioConIva={precioConIva}
                    formatNumber={formatNumber}
                    handleInputChange={handleInputChange}
                    isExistingProduct={isExistingProduct}
                  />
                </div>

                {/* Pestaña de Información Adicional */}
                <div className={`tab-pane fade ${activeTab === "adicional" ? "show active" : ""}`}>
                  <AdditionalInfoSection
                    formData={formData}
                    formErrors={formErrors}
                    handleInputChange={handleInputChange}
                    handleScanBarcode={handleScanBarcode}
                  />
                </div>

                {/* Pestaña de Variantes */}
                <div className={`tab-pane fade ${activeTab === "variantes" ? "show active" : ""}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Variantes del Producto</h5>
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center"
                      onClick={() => setCreatingVariant(true)}
                    >
                      <Plus size={18} className="me-1" />
                      Crear Variante
                    </button>
                  </div>

                  <VariantsSection
                    formData={formData}
                    setFormData={setFormData}
                    setCreatingVariant={setCreatingVariant}
                    onDeleteVariant={handleDeleteVariant}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  <X size={18} className="me-1" />
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveProduct}
                  disabled={imagenesLoading.some((loading) => loading) || isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditing ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="me-1" />
                      {isEditing ? "Actualizar Producto" : "Guardar Producto"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor para las notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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

export default RegistrarProducto
