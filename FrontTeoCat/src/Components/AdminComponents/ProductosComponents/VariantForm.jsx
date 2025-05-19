"use client"

import { useState, useEffect } from "react"
import { Save, ArrowLeft, AlertCircle } from 'lucide-react'
import { useNavigate } from "react-router-dom" // Cambiado de next/navigation a react-router-dom
import BasicInfoSection from "./BasicInfoSection"
import AttributesAndSpecificationsSection from "./AttributesAndSpecificationsSection"
import VariantImageSection from "./VariantImageSection"
import AttributeTypeModal from "./AttributeTypeModal"
import AttributeValueModal from "./AttributeValueModal"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

/**
 * Formulario para crear o editar una variante de producto
 */
const VariantForm = ({ 
  productoBaseId, 
  varianteId = null, 
  isEditing = false,
  baseProduct = null,
  onSave = null,
  onCancel = null
}) => {
  const navigate = useNavigate() // Cambiado de useRouter a useNavigate
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    sku: "",
    precio: "",
    precioOferta: "",
    stock: "",
    estado: true
  })
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [images, setImages] = useState([])
  const [productoBase, setProductoBase] = useState(baseProduct)
  const [showAttributeTypeModal, setShowAttributeTypeModal] = useState(false)
  const [showAttributeValueModal, setShowAttributeValueModal] = useState(false)
  const [selectedTipoAtributoId, setSelectedTipoAtributoId] = useState(null)

  // Cargar datos del producto base y de la variante si estamos editando
  useEffect(() => {
    // Si ya tenemos el producto base desde props, no necesitamos cargarlo
    if (baseProduct) {
      setProductoBase(baseProduct)
      return;
    }
    
    const cargarDatos = async () => {
      try {
        setLoadingData(true)
        setError(null)
        
        // Cargar datos del producto base
        if (productoBaseId) {
          const productoBaseData = await ProductosService.getProductoById(productoBaseId)
          setProductoBase(productoBaseData)
        }
        
        // Si estamos editando, cargar datos de la variante
        if (isEditing && varianteId) {
          const varianteData = await ProductosService.getVarianteById(varianteId)
          
          // Establecer datos del formulario
          setFormData({
            sku: varianteData.sku || "",
            precio: varianteData.precio || "",
            precioOferta: varianteData.precioOferta || "",
            stock: varianteData.stock || "",
            estado: varianteData.estado !== false
          })
          
          // Establecer atributos seleccionados
          if (Array.isArray(varianteData.atributos)) {
            setSelectedAttributes(varianteData.atributos.map(attr => ({
              id: attr.id,
              tipoId: attr.tipoId,
              tipoNombre: attr.tipoNombre,
              valorId: attr.valorId,
              valorNombre: attr.valorNombre
            })))
          }
          
          // Establecer imágenes
          if (Array.isArray(varianteData.imagenes)) {
            setImages(varianteData.imagenes.map(img => ({
              id: img.id,
              url: img.url,
              name: img.nombre || "Imagen",
              isPrincipal: img.esPrincipal,
              isExisting: true // Marcar como existente para no volver a subirla
            })))
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.")
      } finally {
        setLoadingData(false)
      }
    }
    
    cargarDatos()
  }, [productoBaseId, varianteId, isEditing, baseProduct])

  // Validar el formulario
  const validateForm = () => {
    const errors = {}
    
    if (!formData.sku.trim()) {
      errors.sku = "El SKU es obligatorio"
    }
    
    if (!formData.precio || formData.precio <= 0) {
      errors.precio = "El precio debe ser mayor que cero"
    }
    
    if (formData.precioOferta && (parseFloat(formData.precioOferta) >= parseFloat(formData.precio))) {
      errors.precioOferta = "El precio de oferta debe ser menor que el precio regular"
    }
    
    if (!formData.stock || formData.stock < 0) {
      errors.stock = "El stock debe ser un número positivo"
    }
    
    if (selectedAttributes.length === 0) {
      errors.attributes = "Debe seleccionar al menos un atributo para la variante"
    }
    
    if (images.length === 0) {
      errors.images = "Debe agregar al menos una imagen para la variante"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Preparar datos para enviar
      const varianteData = {
        sku: formData.sku.trim(),
        precio: parseFloat(formData.precio),
        precioOferta: formData.precioOferta ? parseFloat(formData.precioOferta) : null,
        stock: parseInt(formData.stock),
        estado: formData.estado,
        atributos: selectedAttributes.map(attr => ({
          tipoId: attr.tipoId,
          valorId: attr.valorId
        }))
      }
      
      // Si tenemos una función onSave en las props, usarla en lugar de hacer la llamada API directamente
      if (onSave) {
        onSave(varianteData);
        return;
      }
      
      let response
      
      if (isEditing) {
        // Actualizar variante existente
        response = await ProductosService.updateVariante(varianteId, varianteData)
      } else {
        // Crear nueva variante
        response = await ProductosService.createVariante(productoBaseId, varianteData)
      }
      
      // Subir imágenes nuevas
      const nuevasImagenes = images.filter(img => !img.isExisting)
      
      if (nuevasImagenes.length > 0) {
        // Determinar la imagen principal
        const imagenPrincipal = images.find(img => img.isPrincipal)
        
        // Subir cada imagen
        for (const imagen of nuevasImagenes) {
          const formDataImg = new FormData()
          formDataImg.append("file", imagen.file)
          formDataImg.append("EsPrincipal", imagen.id === imagenPrincipal?.id ? "true" : "false")
          
          await ProductosService.uploadVarianteImage(
            isEditing ? varianteId : response.id, 
            formDataImg
          )
        }
      }
      
      // Actualizar imágenes existentes (solo para edición)
      if (isEditing) {
        const imagenesExistentes = images.filter(img => img.isExisting)
        
        for (const imagen of imagenesExistentes) {
          await ProductosService.updateVarianteImage(imagen.id, {
            EsPrincipal: imagen.isPrincipal
          })
        }
      }
      
      // Redirigir a la página del producto base
      navigate(`/admin/productos/editar/${productoBaseId}`)
      
    } catch (err) {
      console.error("Error al guardar la variante:", err)
      setError(err.response?.data?.message || "No se pudo guardar la variante. Por favor, intente nuevamente.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setLoading(false)
    }
  }

  // Manejar la creación de un nuevo tipo de atributo
  const handleAttributeTypeCreated = (nuevoTipo) => {
    setShowAttributeTypeModal(false)
    // Recargar tipos de atributos
    // Esto se manejará automáticamente en el componente AttributesAndSpecificationsSection
    
    // Usar nuevoTipo para mostrar información en la consola
    console.log("Nuevo tipo de atributo creado:", nuevoTipo)
    
    // También podríamos actualizar la UI con información del nuevo tipo
    if (nuevoTipo && nuevoTipo.nombre) {
      // Mostrar mensaje temporal de éxito
      const mensajeExito = `Tipo de atributo "${nuevoTipo.nombre}" creado correctamente`;
      console.log(mensajeExito);
      // Opcionalmente, actualizar algún estado para mostrar este mensaje en la UI
    }
  }

  // Manejar la creación de nuevos valores de atributo
  const handleAttributeValueCreated = (nuevosValores) => {
    setShowAttributeValueModal(false)
    setSelectedTipoAtributoId(null)
    // Recargar valores de atributos
    // Esto se manejará automáticamente en el componente AttributesAndSpecificationsSection
    
    // Usar nuevosValores para mostrar información en la consola
    console.log("Nuevos valores de atributo creados:", nuevosValores)
    
    // También podríamos actualizar la UI con información de los nuevos valores
    if (Array.isArray(nuevosValores) && nuevosValores.length > 0) {
      // Mostrar mensaje temporal de éxito
      const mensajeExito = `Se han creado ${nuevosValores.length} nuevos valores de atributo`;
      console.log(mensajeExito);
      // Opcionalmente, actualizar algún estado para mostrar este mensaje en la UI
    }
  }

  // Abrir modal para crear nuevo valor de atributo
  const handleOpenAttributeValueModal = (tipoId) => {
    setSelectedTipoAtributoId(tipoId)
    setShowAttributeValueModal(true)
  }

  // Función para manejar la cancelación
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    navigate(`/admin/productos/editar/${productoBaseId}`);
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">
          {isEditing ? "Editar Variante" : "Crear Nueva Variante"}
        </h2>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
        >
          <ArrowLeft size={18} className="me-1" />
          Volver al Producto
        </button>
      </div>
      
      {loadingData ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos, por favor espere...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <AlertCircle size={18} className="me-2" />
              <div>{error}</div>
              <button 
                className="btn-close ms-auto" 
                onClick={() => setError(null)}
                aria-label="Cerrar"
              ></button>
            </div>
          )}
          
          {productoBase && (
            <div className="alert alert-info mb-4">
              <h6 className="alert-heading">Producto Base: {productoBase.nombre}</h6>
              <p className="mb-0">
                Está creando una variante para el producto "{productoBase.nombre}". 
                Las variantes comparten la información básica del producto base, pero pueden tener 
                diferentes atributos, precios y stock.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-body">
                {/* Información básica */}
                <BasicInfoSection 
                  formData={formData} 
                  setFormData={setFormData} 
                  errors={formErrors}
                  isVariant={true}
                />
                
                <hr className="my-4" />
                
                {/* Atributos y especificaciones */}
                <AttributesAndSpecificationsSection 
                  selectedAttributes={selectedAttributes}
                  setSelectedAttributes={setSelectedAttributes}
                  isVariant={true}
                  parentProductAttributes={productoBase?.atributos}
                  onOpenAttributeTypeModal={() => setShowAttributeTypeModal(true)}
                  onOpenAttributeValueModal={handleOpenAttributeValueModal}
                />
                
                <hr className="my-4" />
                
                {/* Imágenes */}
                <VariantImageSection 
                  images={images}
                  setImages={setImages}
                  errors={formErrors}
                />
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2 mb-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-1" />
                    {isEditing ? "Actualizar Variante" : "Crear Variante"}
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Modales */}
          <AttributeTypeModal 
            show={showAttributeTypeModal}
            onClose={() => setShowAttributeTypeModal(false)}
            onSuccess={handleAttributeTypeCreated}
          />
          
          <AttributeValueModal 
            show={showAttributeValueModal}
            tipoAtributoId={selectedTipoAtributoId}
            onClose={() => {
              setShowAttributeValueModal(false)
              setSelectedTipoAtributoId(null)
            }}
            onSuccess={handleAttributeValueCreated}
          />
        </>
      )}
    </div>
  )
}

export default VariantForm