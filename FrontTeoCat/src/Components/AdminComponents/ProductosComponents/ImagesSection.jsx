"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, X, Check } from 'lucide-react'
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"

const ImagesSection = ({ productId, imagenes, setImagenes, isEditing }) => {
  const [imagenesPreview, setImagenesPreview] = useState([null, null, null, null])
  const [imagenesLoading, setImagenesLoading] = useState([false, false, false, false])
  const [fotoPrincipal, setFotoPrincipal] = useState(0) // Índice de la foto principal (0-3)

  // Función para cargar fotos de un producto existente (usando useCallback)
  const cargarFotosProducto = useCallback(async () => {
    try {
      const fotos = await ProductosService.getFotosProducto(productId)
      
      if (fotos && fotos.length > 0) {
        // Actualizar el estado de las imágenes con las fotos cargadas
        const newImagenes = [...imagenes]
        const newImagenesPreview = [...imagenesPreview]
        
        fotos.forEach((foto, index) => {
          if (index < 4) {
            newImagenes[index] = {
              id: foto.id,
              url: foto.url,
              esPrincipal: foto.esPrincipal
            }
            newImagenesPreview[index] = foto.url
            
            // Actualizar el índice de la foto principal
            if (foto.esPrincipal) {
              setFotoPrincipal(index)
            }
          }
        })
        
        setImagenes(newImagenes)
        setImagenesPreview(newImagenesPreview)
      }
    } catch (error) {
      console.error("Error al cargar fotos del producto:", error)
    }
  }, [productId, imagenes, imagenesPreview, setImagenes])

  // Cargar fotos existentes si estamos editando un producto
  useEffect(() => {
    if (isEditing && productId) {
      cargarFotosProducto()
    }
  }, [isEditing, productId, cargarFotosProducto])

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
        alert("Por favor, seleccione un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. El tamaño máximo es 5MB.")
        return
      }

      // Crear una copia de los arrays
      const newImagenes = [...imagenes]
      const newImagenesPreview = [...imagenesPreview]
      const newImagenesLoading = [...imagenesLoading]

      // Actualizar la imagen y su vista previa local temporal
      newImagenesPreview[index] = URL.createObjectURL(file)

      // Indicar que esta imagen está cargando
      newImagenesLoading[index] = true
      setImagenesLoading(newImagenesLoading)

      // Actualizar los estados con la vista previa local
      setImagenesPreview(newImagenesPreview)

      try {
        // Preparar FormData para la subida
        const formData = new FormData()
        formData.append('imagen', file)
        formData.append('esPrincipal', index === 0 && !imagenes.some(img => img !== null) ? 'true' : 'false')
        
        // Si estamos editando un producto existente, subir la imagen directamente
        if (isEditing && productId) {
          const response = await ProductosService.addFotoProducto(productId, formData)
          
          // Actualizar el array de imágenes con la respuesta del servidor
          newImagenes[index] = {
            id: response.id,
            url: response.url,
            esPrincipal: response.esPrincipal
          }
          
          // Si es la primera imagen y no hay otras, establecerla como principal
          if (response.esPrincipal) {
            setFotoPrincipal(index)
          }
        } else {
          // Si estamos creando un nuevo producto, guardar el archivo para subirlo después
          newImagenes[index] = {
            file,
            esPrincipal: index === 0 && !imagenes.some(img => img !== null)
          }
          
          // Si es la primera imagen y no hay otras, establecerla como principal
          if (index === 0 && !imagenes.some(img => img !== null)) {
            setFotoPrincipal(index)
          }
        }
        
        setImagenes(newImagenes)
      } catch (error) {
        console.error("Error al subir la imagen:", error)
        alert("Error al subir la imagen. Intente nuevamente.")
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
  const handleRemoveImage = async (index) => {
    // Crear una copia de los arrays
    const newImagenes = [...imagenes]
    const newImagenesPreview = [...imagenesPreview]

    // Si la imagen tiene un ID y estamos editando, eliminarla del servidor
    if (isEditing && newImagenes[index] && newImagenes[index].id) {
      try {
        await ProductosService.deleteFoto(newImagenes[index].id)
        
        // Si era la foto principal, actualizar el estado
        if (fotoPrincipal === index) {
          setFotoPrincipal(-1) // No hay foto principal
        }
      } catch (error) {
        console.error("Error al eliminar la imagen:", error)
        alert("Error al eliminar la imagen. Intente nuevamente.")
        return
      }
    }

    // Limpiar la imagen y su vista previa
    newImagenes[index] = null

    // Revocar la URL para liberar memoria
    if (imagenesPreview[index] && typeof imagenesPreview[index] === "string" && imagenesPreview[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagenesPreview[index])
    }
    newImagenesPreview[index] = null

    // Actualizar los estados
    setImagenes(newImagenes)
    setImagenesPreview(newImagenesPreview)
  }

  /**
   * Manejador para establecer una imagen como principal
   * @param {Number} index - Índice de la imagen a establecer como principal (0-3)
   */
  const handleSetPrincipal = async (index) => {
    // Verificar que la imagen exista
    if (!imagenes[index]) return
    
    // Si estamos editando un producto existente
    if (isEditing && productId && imagenes[index].id) {
      try {
        await ProductosService.setFotoPrincipal(productId, imagenes[index].id)
        
        // Actualizar el estado local
        const newImagenes = imagenes.map((img, i) => {
          if (!img) return null
          return {
            ...img,
            esPrincipal: i === index
          }
        })
        
        setImagenes(newImagenes)
        setFotoPrincipal(index)
      } catch (error) {
        console.error("Error al establecer la imagen como principal:", error)
        alert("Error al establecer la imagen como principal. Intente nuevamente.")
      }
    } else {
      // Si estamos creando un nuevo producto, solo actualizar el estado local
      const newImagenes = imagenes.map((img, i) => {
        if (!img) return null
        return {
          ...img,
          esPrincipal: i === index
        }
      })
      
      setImagenes(newImagenes)
      setFotoPrincipal(index)
    }
  }

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">Imágenes del Producto</h5>
      <div className="row g-3">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="col-md-3 col-6">
              <div
                className={`border rounded position-relative d-flex flex-column justify-content-center align-items-center ${
                  fotoPrincipal === index ? 'border-primary' : ''
                }`}
                style={{ height: "150px", overflow: "hidden" }}
              >
                {imagenesPreview[index] ? (
                  <>
                    <img
                      src={imagenesPreview[index] || "/placeholder.svg"}
                      alt={`Vista previa ${index + 1}`}
                      className="img-fluid"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                    <div className="position-absolute top-0 end-0 d-flex">
                      {fotoPrincipal !== index && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary m-1"
                          onClick={() => handleSetPrincipal(index)}
                          title="Establecer como principal"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger m-1"
                        onClick={() => handleRemoveImage(index)}
                        title="Eliminar imagen"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {fotoPrincipal === index && (
                      <span className="position-absolute bottom-0 start-0 badge bg-primary m-1">
                        Principal
                      </span>
                    )}
                    {imagenesLoading[index] && (
                      <div className="position-absolute inset-0 bg-light bg-opacity-75 d-flex justify-content-center align-items-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="text-muted mb-2" size={24} />
                    <span className="text-muted small">Imagen {index + 1}</span>
                    <input
                      type="file"
                      className="position-absolute inset-0 opacity-0 cursor-pointer"
                      style={{ cursor: "pointer", width: "100%", height: "100%" }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="form-text mt-2">
        Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.
        <br />
        Haga clic en <Check size={14} className="text-primary" /> para establecer una imagen como principal.
      </div>
    </div>
  )
}

export default ImagesSection