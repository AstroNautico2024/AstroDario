"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Save, ArrowLeft, X } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"

// Importar componentes actualizados
import BasicInfoSection from "../../../Components/AdminComponents/ProductosComponents/BasicInfoSection"
import AttributesAndSpecificationsSection from "../../../Components/AdminComponents/ProductosComponents/AttributesAndSpecificationsSection"
import VariantImageSection from "../../../Components/AdminComponents/ProductosComponents/VariantImageSection"
import AttributeTypeModal from "../../../Components/AdminComponents/ProductosComponents/AttributeTypeModal"
import AttributeValueModal from "../../../Components/AdminComponents/ProductosComponents/AttributeValueModal"
import VariantsSection from "../../../Components/AdminComponents/ProductosComponents/VariantsSection"
import VariantForm from "../../../Components/AdminComponents/ProductosComponents/VariantForm"
import DeleteConfirmModal from "../../../Components/AdminComponents/ProductosComponents/DeleteConfirmModal"

// Importar servicios
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
  PrecioVenta: "0", // <-- Nuevo
  MargenGanancia: "30", // <-- Nuevo
  UnidadMedida: "Unidad", // <-- Nuevo
  FactorConversion: "1", // <-- Nuevo
  PorcentajeIVA: "19",
  AplicaIVA: true,
  CodigoBarras: "",
  Referencia: "",
  FechaVencimiento: "",
  NoVence: false,
  Origen: "Catálogo", // <-- Nuevo
  Caracteristicas: [],
  Especificaciones: [],
  Variantes: []
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
    attributes: "",
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

  // Estado para atributos
  const [attributes, setAttributes] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [atributos, setAtributos] = useState([])

  // Estado para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Estados para modales de atributos
  const [showAttributeTypeModal, setShowAttributeTypeModal] = useState(false)
  const [showAttributeValueModal, setShowAttributeValueModal] = useState(false)
  const [selectedTipoAtributoId, setSelectedTipoAtributoId] = useState(null)
  const [attributeValueModalCallback, setAttributeValueModalCallback] = useState(null)

  // Hook para navegación
  const navigate = useNavigate()

  // Calcular precio con IVA usando useMemo para optimizar rendimiento
  const calculatedPrecioConIva = useMemo(() => {
    if (formData.Precio && formData.AplicaIVA) {
      const precio = Number.parseFloat(formData.Precio) || 0
      const iva = Number.parseFloat(formData.PorcentajeIVA) || 0
      const valorIva = precio * (iva / 100)
      const precioFinal = precio + valorIva

      return {
        valorIva: valorIva,
        precioFinal: precioFinal,
      }
    } else {
      return {
        valorIva: 0,
        precioFinal: Number.parseFloat(formData.Precio) || 0,
      }
    }
  }, [formData.Precio, formData.PorcentajeIVA, formData.AplicaIVA])

  // Actualizar el estado de precioConIva cuando cambia el cálculo
  useEffect(() => {
    setPrecioConIva(calculatedPrecioConIva)
  }, [calculatedPrecioConIva])

  // Función para formatear números con separadores de miles en formato colombiano
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

  // Mostrar el precio con IVA formateado en la interfaz
  const displayPrecioConIva = useCallback(() => {
    return (
      <div className="mt-2 text-info">
        <small>
          <strong>Valor IVA ({formData.PorcentajeIVA}%):</strong> ${formatNumber(precioConIva.valorIva)}
        </small>
        <br />
        <small>
          <strong>Precio final con IVA:</strong> ${formatNumber(precioConIva.precioFinal)}
        </small>
      </div>
    )
  }, [precioConIva, formData.PorcentajeIVA])

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

        // Cargar atributos disponibles
        try {
          const attributesData = await ProductosService.getTiposAtributos()
          console.log("Atributos obtenidos:", attributesData)
          setAttributes(attributesData)

          // Inicializar atributos para el componente AttributesAndSpecificationsSection
          setAtributos(
            attributesData.map((attr) => ({
              id: attr.id,
              nombre: attr.nombre,
              valores: attr.valores || [],
            })),
          )
        } catch (error) {
          console.error("Error al cargar atributos:", error)
          toast.error(`No se pudieron cargar los atributos. ${error.response?.data?.message || error.message}`)
        }

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
              const productoData = await ProductosService.getById(productId);
              console.log("Producto para edición obtenido:", productoData);

              // Depurar los datos recibidos para identificar problemas
              console.log("Datos completos del producto:", JSON.stringify(productoData, null, 2));

              // Formatear datos para el formulario con manejo mejorado de valores
              setFormData({
                NombreProducto: productoData.NombreProducto || "",
                Descripcion: productoData.Descripcion !== undefined ? productoData.Descripcion : "",
                IdCategoriaDeProducto: productoData.IdCategoriaDeProducto !== undefined 
                  ? productoData.IdCategoriaDeProducto.toString() 
                  : "",
                Foto: productoData.Foto || "",
                Stock: productoData.Stock !== undefined && productoData.Stock !== null 
                  ? productoData.Stock.toString() 
                  : "0",
                Precio: productoData.Precio !== undefined && productoData.Precio !== null 
                  ? productoData.Precio.toString() 
                  : "0",
                PorcentajeIVA: productoData.PorcentajeIVA !== undefined && productoData.PorcentajeIVA !== null 
                  ? productoData.PorcentajeIVA.toString() 
                  : "19",
                AplicaIVA: productoData.AplicaIVA === true || productoData.AplicaIVA === 1,
                CodigoBarras: productoData.CodigoBarras !== undefined ? productoData.CodigoBarras : "",
                Referencia: productoData.Referencia !== undefined ? productoData.Referencia : "",
                FechaVencimiento: productoData.FechaVencimiento
                  ? new Date(productoData.FechaVencimiento).toISOString().split("T")[0]
                  : "",
                NoVence: productoData.NoVence === true || productoData.NoVence === 1 || productoData.FechaVencimiento === null,
                Caracteristicas: productoData.Caracteristicas
                  ? (typeof productoData.Caracteristicas === 'string' 
                    ? productoData.Caracteristicas.split(", ").filter(c => c && c.trim() !== "")
                    : Array.isArray(productoData.Caracteristicas) 
                      ? productoData.Caracteristicas 
                      : [])
                  : [],
                Especificaciones: productoData.Especificaciones
                  ? (typeof productoData.Especificaciones === 'string'
                    ? productoData.Especificaciones.split(", ")
                        .filter(e => e && e.trim() !== "")
                        .map(e => {
                          const parts = e.split(": ");
                          return { 
                            nombre: parts[0] || "", 
                            valor: parts[1] || "" 
                          };
                        })
                    : Array.isArray(productoData.Especificaciones) 
                      ? productoData.Especificaciones 
                      : [])
                  : [],
                Variantes: productoData.Variantes || [],
              });

              // Cargar imágenes si el producto tiene fotos
              if (productoData.Foto) {
                console.log("Procesando fotos del producto:", productoData.Foto);
                
                // Asegurarse de que Foto sea una cadena antes de dividirla
                const fotosString = typeof productoData.Foto === 'string' ? productoData.Foto : '';
                const fotosArray = fotosString.split("|").filter(url => url && url.trim() !== '');
                
                console.log("Array de fotos procesado:", fotosArray);
                
                // Crear nuevos arrays para no mutar el estado directamente
                const newImagenesPreview = Array(4).fill(null);
                const newImagenes = Array(4).fill(null);

                fotosArray.forEach((url, index) => {
                  if (index < 4 && url && url.trim() !== '') {
                    console.log(`Asignando imagen ${index}:`, url);
                    newImagenesPreview[index] = url;
                    newImagenes[index] = url;
                  }
                });

                // Actualizar los estados de imágenes
                setImagenesPreview(newImagenesPreview);
                setImagenes(newImagenes);
              } else {
                console.log("El producto no tiene fotos o el campo Foto está vacío");
                // Resetear las imágenes para evitar mostrar datos de un producto anterior
                setImagenesPreview(Array(4).fill(null));
                setImagenes(Array(4).fill(null));
              }

              // Cargar atributos del producto
              try {
                const atributosProducto = await ProductosService.getAtributosProducto(productId);
                console.log("Atributos del producto obtenidos:", atributosProducto);
                
                if (atributosProducto && Array.isArray(atributosProducto)) {
                  const formattedAttributes = atributosProducto.map((attr) => ({
                    id: attr.IdProductoAtributo || Date.now() + Math.random(),
                    attributeId: attr.IdTipoAtributo || attr.idTipoAtributo,
                    attributeName: attr.NombreTipoAtributo || attr.nombreTipoAtributo || "Tipo de atributo",
                    valueId: attr.IdValorAtributo || attr.idValorAtributo,
                    valueName: attr.Valor || attr.valor || "Valor",
                  }));
                  
                  console.log("Atributos formateados:", formattedAttributes);
                  setSelectedAttributes(formattedAttributes);
                } else {
                  console.log("No se encontraron atributos o el formato es incorrecto");
                  setSelectedAttributes([]);
                }
              } catch (error) {
                console.error("Error al cargar atributos del producto:", error);
                toast.error(
                  `No se pudieron cargar los atributos del producto. ${error.response?.data?.message || error.message}`
                );
                setSelectedAttributes([]);
              }

              // Cargar variantes
              try {
                const variantesProducto = await ProductosService.getVariantes(productId);
                console.log("Variantes del producto obtenidas:", variantesProducto);
                
                if (variantesProducto && Array.isArray(variantesProducto)) {
                  setFormData((prev) => ({
                    ...prev,
                    Variantes: variantesProducto,
                  }));
                } else {
                  console.log("No se encontraron variantes o el formato es incorrecto");
                  setFormData((prev) => ({
                    ...prev,
                    Variantes: [],
                  }));
                }
              } catch (error) {
                console.error("Error al cargar variantes:", error);
                toast.error(`No se pudieron cargar las variantes. ${error.response?.data?.message || error.message}`);
                setFormData((prev) => ({
                  ...prev,
                  Variantes: [],
                }));
              }
            } catch (error) {
              console.error(`Error al cargar producto con ID ${productId}:`, error);
              toast.error(`No se pudo cargar el producto para edición. ${error.response?.data?.message || error.message}`);
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
      newImagenesPreview[index] = URL.createObjectURL(file)
      newImagenes[index] = file

      // Indicar que esta imagen está cargando
      newImagenesLoading[index] = true
      setImagenesLoading(newImagenesLoading)

      // Actualizar los estados con la vista previa local
      setImagenes(newImagenes)
      setImagenesPreview(newImagenesPreview)

      try {
        // Subir imagen a Cloudinary
        const imageUrl = await uploadImageToCloudinary(file, "productos")

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
    if (
      newImagenesPreview[index] &&
      typeof newImagenesPreview[index] === "string" &&
      newImagenesPreview[index].startsWith("blob:")
    ) {
      URL.revokeObjectURL(newImagenesPreview[index])
    }

    newImagenes[index] = null
    newImagenesPreview[index] = null

    // Actualizar los estados
    setImagenes(newImagenes)
    setImagenesPreview(newImagenesPreview)

    toast.info("Imagen eliminada correctamente")
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

    toast.success(`Código de barras generado: ${randomBarcode}`)
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

    toast.success(`Característica "${caracteristica.trim()}" agregada correctamente`)
  }

  /**
   * Manejador para eliminar una característica
   * @param {Number} index - Índice de la característica a eliminar
   */
  const handleRemoveCaracteristica = (index) => {
    const updatedCaracteristicas = [...formData.Caracteristicas]
    const caracteristicaEliminada = updatedCaracteristicas[index]
    updatedCaracteristicas.splice(index, 1)

    setFormData({
      ...formData,
      Caracteristicas: updatedCaracteristicas,
    })

    toast.info(`Característica "${caracteristicaEliminada}" eliminada`)
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

    toast.success(
      `Especificación "${especificacion.nombre.trim()}: ${especificacion.valor.trim()}" agregada correctamente`,
    )
  }

  /**
   * Manejador para eliminar una especificación
   * @param {Number} index - Índice de la especificación a eliminar
   */
  const handleRemoveEspecificacion = (index) => {
    const updatedEspecificaciones = [...formData.Especificaciones]
    const especificacionEliminada = updatedEspecificaciones[index]
    updatedEspecificaciones.splice(index, 1)

    setFormData({
      ...formData,
      Especificaciones: updatedEspecificaciones,
    })

    toast.info(`Especificación "${especificacionEliminada.nombre}: ${especificacionEliminada.valor}" eliminada`)
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
   * Manejador para editar una variante
   */
  const handleEditVariant = (variantId) => {
    // Implementar lógica para editar variante
    toast.info(`Editando variante con ID: ${variantId}`)
    // Aquí se podría navegar a una página de edición o mostrar un modal
  }

  /**
   * Manejador para confirmar eliminación de variante
   */
  const handleConfirmDeleteVariant = (variantId) => {
    setItemToDelete({ id: variantId, type: "variante" })
    setShowDeleteModal(true)
  }

  /**
   * Manejador para eliminar una variante
   */
  const handleDeleteVariant = () => {
    if (!itemToDelete || itemToDelete.type !== "variante") return

    const updatedVariantes = formData.Variantes.filter((v) => v.id !== itemToDelete.id)

    setFormData({
      ...formData,
      Variantes: updatedVariantes,
    })

    toast.success("Variante eliminada correctamente")
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  /**
   * Cancelar eliminación
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  /**
   * Manejador para la creación de un nuevo tipo de atributo
   */
  const handleAttributeTypeCreated = (nuevoTipo) => {
    setShowAttributeTypeModal(false)
    // Mostrar mensaje de éxito
    toast.success(`Tipo de atributo "${nuevoTipo.nombre}" creado correctamente`)

    // Recargar tipos de atributos
    const fetchAttributes = async () => {
      try {
        const attributesData = await ProductosService.getTiposAtributos()
        setAttributes(attributesData)

        // Actualizar también el estado atributos para mantener sincronizados ambos estados
        setAtributos(
          attributesData.map((attr) => ({
            id: attr.id,
            nombre: attr.nombre,
            valores: attr.valores || [],
          })),
        )
      } catch (error) {
        console.error("Error al recargar atributos:", error)
        toast.error("No se pudieron recargar los tipos de atributos")
      }
    }

    fetchAttributes()
  }

  /**
   * Manejador para la creación de nuevos valores de atributo
   */
  const handleAttributeValueCreated = (nuevosValores) => {
    setShowAttributeValueModal(false)
    setSelectedTipoAtributoId(null)

    // Mostrar mensaje de éxito
    if (Array.isArray(nuevosValores) && nuevosValores.length > 0) {
      toast.success(`Se han creado ${nuevosValores.length} nuevos valores de atributo`)

      // Actualizar la lista de atributos para incluir los nuevos valores
      if (selectedTipoAtributoId) {
        // Actualizar el estado de atributos
        const updatedAtributos = atributos.map((attr) => {
          if (attr.id === selectedTipoAtributoId) {
            return {
              ...attr,
              valores: [...(attr.valores || []), ...nuevosValores],
            }
          }
          return attr
        })

        setAtributos(updatedAtributos)

        // También actualizar el estado de attributes para mantener sincronizados ambos estados
        const updatedAttributes = attributes.map((attr) => {
          if (attr.id === selectedTipoAtributoId) {
            return {
              ...attr,
              valores: [...(attr.valores || []), ...nuevosValores],
            }
          }
          return attr
        })

        setAttributes(updatedAttributes)
      }
    }
  }

  /**
   * Abrir modal para crear nuevo valor de atributo
   */
  const handleOpenAttributeValueModal = (tipoAtributoId, callback) => {
    console.log("ID del tipo de atributo seleccionado:", tipoAtributoId)
    setSelectedTipoAtributoId(tipoAtributoId) // Asegúrate de que esto sea un número
    setAttributeValueModalCallback(callback)
    setShowAttributeValueModal(true)
  }

  /**
   * Validar el formulario completo
   * @returns {boolean} - True si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
  let isValid = true;
  const errors = {
    NombreProducto: "",
    Descripcion: "",
    IdCategoriaDeProducto: "",
    Stock: "",
    Precio: "",
    CodigoBarras: "",
    Referencia: "",
    FechaVencimiento: "",
    attributes: "",
  };

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
          errors.Stock = "El stock debe ser un nmero positivo"
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

    // Validar atributos
    if (selectedAttributes.length > 0) {
      const invalidAttributes = selectedAttributes.some((attr) => !attr.attributeId || !attr.valueId)
      if (invalidAttributes) {
        errors.attributes = "Todos los atributos deben tener un tipo y un valor seleccionados"
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
  CodigoBarras: formData.CodigoBarras || null,
  Referencia: formData.Referencia || null,
  FechaVencimiento: formData.NoVence ? null : formData.FechaVencimiento,
  Caracteristicas: formData.Caracteristicas?.join(", ") || "",
  Especificaciones: formData.Especificaciones?.map((item) => `${item.nombre}: ${item.valor}`)?.join(", ") || "",
  Estado: true,
  Variantes: formData.Variantes || [],
}

      console.log("Datos del producto a guardar:", productoData)

      let productoId

      // Guardar o actualizar el producto
      if (isEditing) {
        await ProductosService.update(productId, productoData)
        productoId = productId

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
        const nuevoProducto = await ProductosService.create(productoData)
        productoId = nuevoProducto.IdProducto || nuevoProducto.id

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

      // Guardar atributos si hay seleccionados
      if (selectedAttributes.length > 0) {
        try {
          const atributosData = selectedAttributes
            .filter((attr) => attr.attributeId && attr.valueId)
            .map((attr) => ({
              idTipoAtributo: attr.attributeId,
              idValorAtributo: attr.valueId,
            }))

          if (atributosData.length > 0) {
            await ProductosService.asignarAtributosMultiples(productoId, atributosData)
          }
        } catch (error) {
          console.error("Error al guardar atributos:", error)
          toast.error("Error al guardar los atributos del producto.")
        }
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
                  className={`nav-link ${activeTab === "atributos" ? "active" : ""}`}
                  onClick={() => setActiveTab("atributos")}
                  type="button"
                >
                  Atributos y Especificaciones
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
                    handleScanBarcode={handleScanBarcode}
                    isExistingProduct={isExistingProduct}
                    handleExistingProductChange={handleExistingProductChange}
                    displayPrecioConIva={displayPrecioConIva} // Añadir esta línea
                  />
                </div>

                {/* Pestaña de Atributos y Especificaciones */}
                <div className={`tab-pane fade ${activeTab === "atributos" ? "show active" : ""}`}>
                  <AttributesAndSpecificationsSection
                    selectedAttributes={selectedAttributes}
                    setSelectedAttributes={setSelectedAttributes}
                    isVariant={false}
                    onOpenAttributeTypeModal={() => setShowAttributeTypeModal(true)}
                    onOpenAttributeValueModal={handleOpenAttributeValueModal}
                    atributos={atributos}
                    caracteristicas={formData.Caracteristicas}
                    especificaciones={formData.Especificaciones}
                    onAddCaracteristica={handleAddCaracteristica}
                    onRemoveCaracteristica={handleRemoveCaracteristica}
                    onAddEspecificacion={handleAddEspecificacion}
                    onRemoveEspecificacion={handleRemoveEspecificacion}
                  />
                </div>

                {/* Pestaña de Imágenes */}
                <div className={`tab-pane fade ${activeTab === "imagenes" ? "show active" : ""}`}>
                  <VariantImageSection
                      images={imagenesPreview}
                      setImages={(newImages) => {
                        // Actualizar las imágenes con las nuevas
                        setImagenesPreview(newImages);
                        
                        // También actualizar el array de imagenes
                        const updatedImagenes = [...imagenes];
                        newImages.forEach((img, index) => {
                          updatedImagenes[index] = img;
                        });
                        setImagenes(updatedImagenes);
                      }} // Reemplazar la función vacía con esta implementación
                      errors={formErrors}
                      onUpload={handleImageUpload}
                      onRemove={handleRemoveImage}
                    />
                  {/* Indicador de carga de imágenes */}
                  {imagenesLoading.some((loading) => loading) && (
                    <div className="alert alert-info mt-2 py-2">
                      <small>Subiendo imágenes a Cloudinary...</small>
                    </div>
                  )}
                </div>

                {/* Pestaña de Variantes */}
                <div className={`tab-pane fade ${activeTab === "variantes" ? "show active" : ""}`}>
                  <VariantsSection
                    productId={productId}
                    variants={formData.Variantes}
                    onDeleteVariant={handleConfirmDeleteVariant}
                    onEditVariant={handleEditVariant}
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

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        show={showDeleteModal}
        item={itemToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleDeleteVariant}
        itemType={itemToDelete?.type === "variante" ? "variante" : "elemento"}
      />

      {/* Modales para atributos */}
      <AttributeTypeModal
        show={showAttributeTypeModal}
        onClose={() => setShowAttributeTypeModal(false)}
        onSuccess={handleAttributeTypeCreated}
      />

      <AttributeValueModal
        show={showAttributeValueModal}
        tipoAtributoId={selectedTipoAtributoId}
        onClose={() => {
          setShowAttributeValueModal(false);
          setAttributeValueModalCallback(null);
        }}
        onSuccess={(nuevosValores) => {
          handleAttributeValueCreated(nuevosValores); // Añadir esta línea
          if (attributeValueModalCallback) {
            attributeValueModalCallback(nuevosValores);
          }
        }}
      />

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
