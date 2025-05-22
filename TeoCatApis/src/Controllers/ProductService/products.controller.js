import {
  categoriasModel,
  productosModel,
  fotosProductoModel,
  tiposAtributosModel,
  valoresAtributosModel,
  productoAtributosModel,
} from "../../Models/ProductService/products.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../../Utils/Cloudinary.js"

export const categoriasController = {
  getAll: async (req, res) => {
    try {
      const categorias = await categoriasModel.getAll()
      res.status(200).json(categorias)
    } catch (error) {
      console.error("Error al obtener categorías:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params
      const categoria = await categoriasModel.getById(id)

      if (!categoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      res.status(200).json(categoria)
    } catch (error) {
      console.error("Error al obtener categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getProducts: async (req, res) => {
    try {
      const { id } = req.params
      const categoria = await categoriasModel.getById(id)

      if (!categoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      const productos = await categoriasModel.getProducts(id)
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al obtener productos de la categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  search: async (req, res) => {
    try {
      const { term } = req.query

      if (!term) {
        return res.status(400).json({ message: "Se debe proporcionar un término de búsqueda" })
      }

      const categorias = await categoriasModel.search(term)
      res.status(200).json(categorias)
    } catch (error) {
      console.error("Error al buscar categorías:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  create: async (req, res) => {
    try {
      const categoriaData = req.body

      // Validar datos
      if (!categoriaData.NombreCategoria) {
        return res.status(400).json({ message: "El nombre de la categoría es obligatorio" })
      }

      const newCategoria = await categoriasModel.create(categoriaData)

      res.status(201).json(newCategoria)
    } catch (error) {
      console.error("Error al crear categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params
      const categoriaData = req.body

      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id)
      if (!existingCategoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      const updatedCategoria = await categoriasModel.update(id, categoriaData)

      res.status(200).json(updatedCategoria)
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id)
      if (!existingCategoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      const result = await categoriasModel.changeStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id)
      if (!existingCategoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      try {
        await categoriasModel.delete(id)
        res.status(200).json({ message: "Categoría eliminada correctamente" })
      } catch (error) {
        if (error.message.includes("tiene productos asociados")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

export const productosController = {
  getAll: async (req, res) => {
    try {
      const productos = await productosModel.getAll()
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al obtener productos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params
      const producto = await productosModel.getById(id)

      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Obtener fotos y atributos
      const fotos = await fotosProductoModel.getByProducto(id)
      const atributos = await productoAtributosModel.getByProducto(id)

      // Procesar fotos almacenadas en JSON
      let fotosProducto = [];
      if (producto.FotosProductoBase) {
        try {
          fotosProducto = typeof producto.FotosProductoBase === 'string' 
            ? JSON.parse(producto.FotosProductoBase) 
            : producto.FotosProductoBase;
        } catch (error) {
          console.error("Error al parsear FotosProductoBase:", error);
        }
      }

      res.status(200).json({
        ...producto,
        fotos: fotosProducto.length > 0 ? fotosProducto : fotos,
        atributos,
      })
    } catch (error) {
      console.error("Error al obtener producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getByCategoria: async (req, res) => {
    try {
      const { id } = req.params
      const categoria = await categoriasModel.getById(id)

      if (!categoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      const productos = await productosModel.getByCategoria(id)
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  search: async (req, res) => {
    try {
      const { term } = req.query

      if (!term) {
        return res.status(400).json({ message: "Se debe proporcionar un término de búsqueda" })
      }

      const productos = await productosModel.search(term)
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al buscar productos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getLowStock: async (req, res) => {
    try {
      const { threshold } = req.query
      const productos = await productosModel.getLowStock(threshold || 10)
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al obtener productos con bajo stock:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getNearExpiry: async (req, res) => {
    try {
      const { days } = req.query
      const productos = await productosModel.getNearExpiry(days || 30)
      res.status(200).json(productos)
    } catch (error) {
      console.error("Error al obtener productos próximos a vencer:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  getByBarcode: async (req, res) => {
    try {
      const { codigo } = req.params

      if (!codigo) {
        return res.status(400).json({ message: "Se debe proporcionar un código de barras" })
      }

      const producto = await productosModel.getByBarcode(codigo)

      if (!producto) {
        return res.status(404).json({ message: "No se encontró ningún producto con ese código de barras" })
      }

      // Obtener fotos y atributos
      const fotos = await fotosProductoModel.getByProducto(producto.IdProducto)
      const atributos = await productoAtributosModel.getByProducto(producto.IdProducto)

      // Procesar fotos almacenadas en JSON
      let fotosProducto = [];
      if (producto.FotosProductoBase) {
        try {
          fotosProducto = typeof producto.FotosProductoBase === 'string' 
            ? JSON.parse(producto.FotosProductoBase) 
            : producto.FotosProductoBase;
        } catch (error) {
          console.error("Error al parsear FotosProductoBase:", error);
        }
      }

      res.status(200).json({
        ...producto,
        fotos: fotosProducto.length > 0 ? fotosProducto : fotos,
        atributos,
      })
    } catch (error) {
      console.error("Error al obtener producto por código de barras:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  create: async (req, res) => {
    try {
      const productoData = req.body

      // Verificar si la categoría existe
      const categoria = await categoriasModel.getById(productoData.IdCategoriaDeProducto)
      if (!categoria) {
        return res.status(404).json({ message: "Categoría no encontrada" })
      }

      // Verificar si el código de barras ya existe
      if (productoData.CodigoBarras) {
        const existingBarcode = await productosModel.getByBarcode(productoData.CodigoBarras)
        if (existingBarcode) {
          return res.status(400).json({ message: "Ya existe un producto con ese código de barras" })
        }
      }

      // Verificar si la referencia ya existe
      if (productoData.Referencia) {
        const existingReference = await productosModel.getByReference(productoData.Referencia)
        if (existingReference) {
          return res.status(400).json({ message: "Ya existe un producto con esa referencia" })
        }
      }

      // Validar unidad de medida
      const unidadesMedida = [
        "Unidad",
        "Kilogramo",
        "Libra",
        "Bulto",
        "Gramo",
        "Litro",
        "Mililitro",
        "Metro",
        "Centimetro",
      ]
      if (productoData.UnidadMedida && !unidadesMedida.includes(productoData.UnidadMedida)) {
        return res.status(400).json({
          message: "Unidad de medida no válida",
          unidadesPermitidas: unidadesMedida,
        })
      }

      // Validar origen
      const origenes = ["Catálogo", "Stock"]
      if (productoData.Origen && !origenes.includes(productoData.Origen)) {
        return res.status(400).json({
          message: "Origen no válido",
          origenesPermitidos: origenes,
        })
      }

      // Calcular precio de venta si no se proporciona
      if (!productoData.PrecioVenta && productoData.Precio) {
        const margen = productoData.MargenGanancia || 30
        let precioVenta = productoData.Precio * (1 + margen / 100)

        // Añadir IVA si aplica
        if (productoData.AplicaIVA) {
          precioVenta = precioVenta * (1 + (productoData.PorcentajeIVA || 0) / 100)
        }

        productoData.PrecioVenta = precioVenta
      }

      // Procesar la imagen si existe y prepararla para guardar en FotosProductoBase
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path)
        
        // Crear estructura para FotosProductoBase
        const fotoObj = {
          IdFoto: Date.now(),
          IdProducto: 0, // Se actualizará después de crear el producto
          Url: result.secure_url,
          EsPrincipal: true,
          Orden: 1,
          Estado: true
        };
        
        productoData.FotosProductoBase = JSON.stringify([fotoObj]);
      }

      // Crear el producto
      const newProducto = await productosModel.create(productoData)

      // Actualizar el IdProducto en las fotos si existen
      if (productoData.FotosProductoBase) {
        try {
          let fotos = JSON.parse(productoData.FotosProductoBase);
          fotos = fotos.map(foto => ({
            ...foto,
            IdProducto: newProducto.id
          }));
          
          await productosModel.update(newProducto.id, {
            FotosProductoBase: JSON.stringify(fotos)
          });
        } catch (error) {
          console.error("Error al actualizar IdProducto en fotos:", error);
        }
      }

      // Procesar atributos si se proporcionan
      if (productoData.atributos && Array.isArray(productoData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(newProducto.id, productoData.atributos)
        } catch (error) {
          console.error("Error al asignar atributos:", error)
          // No fallamos la creación del producto si hay error en los atributos
        }
      }

      // Obtener el producto completo con sus relaciones
      const productoCompleto = await productosModel.getById(newProducto.id)
      
      // Procesar fotos almacenadas en JSON
      let fotosProducto = [];
      if (productoCompleto.FotosProductoBase) {
        try {
          fotosProducto = typeof productoCompleto.FotosProductoBase === 'string' 
            ? JSON.parse(productoCompleto.FotosProductoBase) 
            : productoCompleto.FotosProductoBase;
        } catch (error) {
          console.error("Error al parsear FotosProductoBase:", error);
        }
      }
      
      const atributos = await productoAtributosModel.getByProducto(newProducto.id)

      res.status(201).json({
        ...productoCompleto,
        fotos: fotosProducto,
        atributos,
      })
    } catch (error) {
      console.error("Error al crear producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params
      const productoData = req.body

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Si se está actualizando la categoría, verificar que exista
      if (productoData.IdCategoriaDeProducto) {
        const categoria = await categoriasModel.getById(productoData.IdCategoriaDeProducto)
        if (!categoria) {
          return res.status(404).json({ message: "Categoría no encontrada" })
        }
      }

      // Si se está actualizando el código de barras, verificar que no exista
      if (productoData.CodigoBarras && productoData.CodigoBarras !== existingProducto.CodigoBarras) {
        const productoWithBarcode = await productosModel.getByBarcode(productoData.CodigoBarras)
        if (productoWithBarcode) {
          return res.status(400).json({ message: "Ya existe un producto con ese código de barras" })
        }
      }

      // Si se está actualizando la referencia, verificar que no exista
      if (productoData.Referencia && productoData.Referencia !== existingProducto.Referencia) {
        const productoWithReference = await productosModel.getByReference(productoData.Referencia)
        if (productoWithReference) {
          return res.status(400).json({ message: "Ya existe un producto con esa referencia" })
        }
      }

      // Validar unidad de medida
      const unidadesMedida = [
        "Unidad",
        "Kilogramo",
        "Libra",
        "Bulto",
        "Gramo",
        "Litro",
        "Mililitro",
        "Metro",
        "Centimetro",
      ]
      if (productoData.UnidadMedida && !unidadesMedida.includes(productoData.UnidadMedida)) {
        return res.status(400).json({
          message: "Unidad de medida no válida",
          unidadesPermitidas: unidadesMedida,
        })
      }

      // Validar origen
      const origenes = ["Catálogo", "Stock"]
      if (productoData.Origen && !origenes.includes(productoData.Origen)) {
        return res.status(400).json({
          message: "Origen no válido",
          origenesPermitidos: origenes,
        })
      }

      // Recalcular precio de venta si cambia el precio o el margen
      if (
        (productoData.Precio !== undefined && productoData.Precio !== existingProducto.Precio) ||
        (productoData.MargenGanancia !== undefined &&
          productoData.MargenGanancia !== existingProducto.MargenGanancia) ||
        (productoData.AplicaIVA !== undefined && productoData.AplicaIVA !== existingProducto.AplicaIVA) ||
        (productoData.PorcentajeIVA !== undefined && productoData.PorcentajeIVA !== existingProducto.PorcentajeIVA)
      ) {
        const precio = productoData.Precio !== undefined ? productoData.Precio : existingProducto.Precio
        const margen =
          productoData.MargenGanancia !== undefined ? productoData.MargenGanancia : existingProducto.MargenGanancia
        const aplicaIVA = productoData.AplicaIVA !== undefined ? productoData.AplicaIVA : existingProducto.AplicaIVA
        const porcentajeIVA =
          productoData.PorcentajeIVA !== undefined ? productoData.PorcentajeIVA : existingProducto.PorcentajeIVA

        let precioVenta = precio * (1 + margen / 100)

        // Añadir IVA si aplica
        if (aplicaIVA) {
          precioVenta = precioVenta * (1 + porcentajeIVA / 100)
        }

        productoData.PrecioVenta = precioVenta
      }

      // Procesar la imagen si existe
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path)
        
        // Obtener fotos actuales
        let fotosActuales = [];
        if (existingProducto.FotosProductoBase) {
          try {
            fotosActuales = typeof existingProducto.FotosProductoBase === 'string' 
              ? JSON.parse(existingProducto.FotosProductoBase) 
              : existingProducto.FotosProductoBase;
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
            fotosActuales = [];
          }
        }
        
        // Buscar si ya tiene una foto principal
        const fotoPrincipal = fotosActuales.find(f => f.EsPrincipal);
        
        if (fotoPrincipal) {
          // Actualizar la foto principal
          fotosActuales = fotosActuales.map(foto => {
            if (foto.EsPrincipal) {
              return {
                ...foto,
                Url: result.secure_url
              };
            }
            return foto;
          });
          
          // Intentar eliminar la imagen anterior de Cloudinary
          try {
            const publicId = fotoPrincipal.Url.split("/").pop().split(".")[0]
            await deleteFromCloudinary(publicId)
          } catch (error) {
            console.error("Error al eliminar imagen anterior:", error)
          }
        } else {
          // Crear una nueva foto principal
          const nuevaFoto = {
            IdFoto: Date.now(),
            IdProducto: id,
            Url: result.secure_url,
            EsPrincipal: true,
            Orden: fotosActuales.length > 0 ? Math.max(...fotosActuales.map(f => f.Orden || 0)) + 1 : 1,
            Estado: true
          };
          
          fotosActuales.push(nuevaFoto);
        }
        
        // Actualizar FotosProductoBase
        productoData.FotosProductoBase = JSON.stringify(fotosActuales);
      }

      // Actualizar el producto
      const updatedProducto = await productosModel.update(id, productoData)

      // Procesar atributos si se proporcionan
      if (productoData.atributos && Array.isArray(productoData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(id, productoData.atributos)
        } catch (error) {
          console.error("Error al asignar atributos:", error)
          // No fallamos la actualización del producto si hay error en los atributos
        }
      }

      // Obtener el producto completo con sus relaciones
      const productoCompleto = await productosModel.getById(id)
      
      // Procesar fotos almacenadas en JSON
      let fotosProducto = [];
      if (productoCompleto.FotosProductoBase) {
        try {
          fotosProducto = typeof productoCompleto.FotosProductoBase === 'string' 
            ? JSON.parse(productoCompleto.FotosProductoBase) 
            : productoCompleto.FotosProductoBase;
        } catch (error) {
          console.error("Error al parsear FotosProductoBase:", error);
        }
      }
      
      const atributos = await productoAtributosModel.getByProducto(id)

      res.status(200).json({
        ...productoCompleto,
        fotos: fotosProducto,
        atributos,
      })
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      const result = await productosModel.changeStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  updateStock: async (req, res) => {
    try {
      const { id } = req.params
      const { cantidad } = req.body

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      const result = await productosModel.updateStock(id, cantidad)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al actualizar stock:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Eliminar fotos de Cloudinary si existen
      if (existingProducto.FotosProductoBase) {
        try {
          const fotos = typeof existingProducto.FotosProductoBase === 'string'
            ? JSON.parse(existingProducto.FotosProductoBase)
            : existingProducto.FotosProductoBase;
            
          for (const foto of fotos) {
            try {
              const publicId = foto.Url.split("/").pop().split(".")[0];
              await deleteFromCloudinary(publicId);
            } catch (error) {
              console.error("Error al eliminar imagen de Cloudinary:", error);
            }
          }
        } catch (error) {
          console.error("Error al parsear FotosProductoBase:", error);
        }
      }

      try {
        await productosModel.delete(id)
        res.status(200).json({ message: "Producto eliminado correctamente" })
      } catch (error) {
        if (error.message.includes("tiene variantes asociadas")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Nuevos métodos para variantes
  getVariants: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto base no encontrado" })
      }

      // Obtener variantes
      const variantes = await productosModel.getVariants(id)

      // Para cada variante, obtener sus atributos y procesar fotos
      const variantesConAtributos = await Promise.all(
        variantes.map(async (variante) => {
          const atributos = await productoAtributosModel.getByProducto(variante.IdProducto)
          
          // Procesar fotos almacenadas en JSON
          let fotosVariante = [];
          if (variante.FotosVariantes) {
            try {
              fotosVariante = typeof variante.FotosVariantes === 'string' 
                ? JSON.parse(variante.FotosVariantes) 
                : variante.FotosVariantes;
            } catch (error) {
              console.error("Error al parsear FotosVariantes:", error);
            }
          }
          
          return {
            ...variante,
            atributos,
            fotos: fotosVariante,
          }
        }),
      )

      res.status(200).json(variantesConAtributos)
    } catch (error) {
      console.error("Error al obtener variantes:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  createVariant: async (req, res) => {
    try {
      const { id } = req.params
      const varianteData = req.body

      // Verificar si el producto base existe
      const productoBase = await productosModel.getById(id)
      if (!productoBase) {
        return res.status(404).json({ message: "Producto base no encontrado" })
      }

      // Verificar si el código de barras ya existe
      if (varianteData.CodigoBarras) {
        const existingBarcode = await productosModel.getByBarcode(varianteData.CodigoBarras)
        if (existingBarcode) {
          return res.status(400).json({ message: "Ya existe un producto con ese código de barras" })
        }
      }

      // Verificar si la referencia ya existe
      if (varianteData.Referencia) {
        const existingReference = await productosModel.getByReference(varianteData.Referencia)
        if (existingReference) {
          return res.status(400).json({ message: "Ya existe un producto con esa referencia" })
        }
      }

      // Procesar la imagen si existe y prepararla para guardar en FotosVariantes
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path)
        
        // Crear estructura para FotosVariantes
        const fotoObj = {
          IdFoto: Date.now(),
          IdProducto: 0, // Se actualizará después de crear la variante
          Url: result.secure_url,
          EsPrincipal: true,
          Orden: 1,
          Estado: true
        };
        
        varianteData.FotosVariantes = JSON.stringify([fotoObj]);
      }

      // Crear la variante
      const newVariante = await productosModel.createVariant(id, varianteData)

      // Actualizar el IdProducto en las fotos si existen
      if (varianteData.FotosVariantes) {
        try {
          let fotos = JSON.parse(varianteData.FotosVariantes);
          fotos = fotos.map(foto => ({
            ...foto,
            IdProducto: newVariante.id
          }));
          
          await productosModel.update(newVariante.id, {
            FotosVariantes: JSON.stringify(fotos)
          });
        } catch (error) {
          console.error("Error al actualizar IdProducto en fotos de variante:", error);
        }
      }

      // Procesar atributos si se proporcionan
      if (varianteData.atributos && Array.isArray(varianteData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(newVariante.id, varianteData.atributos)
        } catch (error) {
          console.error("Error al asignar atributos:", error)
          // No fallamos la creación de la variante si hay error en los atributos
        }
      }

      // Obtener la variante completa con sus relaciones
      const varianteCompleta = await productosModel.getById(newVariante.id)
      
      // Procesar fotos almacenadas en JSON
      let fotosVariante = [];
      if (varianteCompleta.FotosVariantes) {
        try {
          fotosVariante = typeof varianteCompleta.FotosVariantes === 'string' 
            ? JSON.parse(varianteCompleta.FotosVariantes) 
            : varianteCompleta.FotosVariantes;
        } catch (error) {
          console.error("Error al parsear FotosVariantes:", error);
        }
      }
      
      const atributos = await productoAtributosModel.getByProducto(newVariante.id)

      res.status(201).json({
        ...varianteCompleta,
        fotos: fotosVariante,
        atributos,
      })
    } catch (error) {
      console.error("Error al crear variante:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  calcularPrecioVenta: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id)
      if (!existingProducto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Calcular precio de venta
      const result = await productosModel.calcularPrecioVenta(id)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al calcular precio de venta:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  updateVariant: async (req, res) => {
    try {
      const { id, variantId } = req.params
      const varianteData = req.body

      // Verificar si el producto base existe
      const baseProduct = await productosModel.getById(id)
      if (!baseProduct) {
        return res.status(404).json({ message: "Producto base no encontrado" })
      }

      // Verificar si la variante existe
      const variante = await productosModel.getById(variantId)
      if (!variante) {
        return res.status(404).json({ message: "Variante no encontrada" })
      }

      // Verificar que la variante pertenece al producto base
      if (variante.ProductoBaseId != id || !variante.EsVariante) {
        return res.status(400).json({ message: "La variante no pertenece al producto base especificado" })
      }

      // Procesar la imagen si existe
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path)
        
        // Obtener fotos actuales
        let fotosActuales = [];
        if (variante.FotosVariantes) {
          try {
            fotosActuales = typeof variante.FotosVariantes === 'string' 
              ? JSON.parse(variante.FotosVariantes) 
              : variante.FotosVariantes;
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
            fotosActuales = [];
          }
        }
        
        // Buscar si ya tiene una foto principal
        const fotoPrincipal = fotosActuales.find(f => f.EsPrincipal);
        
        if (fotoPrincipal) {
          // Actualizar la foto principal
          fotosActuales = fotosActuales.map(foto => {
            if (foto.EsPrincipal) {
              return {
                ...foto,
                Url: result.secure_url
              };
            }
            return foto;
          });
          
          // Intentar eliminar la imagen anterior de Cloudinary
          try {
            const publicId = fotoPrincipal.Url.split("/").pop().split(".")[0]
            await deleteFromCloudinary(publicId)
          } catch (error) {
            console.error("Error al eliminar imagen anterior:", error)
          }
        } else {
          // Crear una nueva foto principal
          const nuevaFoto = {
            IdFoto: Date.now(),
            IdProducto: variantId,
            Url: result.secure_url,
            EsPrincipal: true,
            Orden: fotosActuales.length > 0 ? Math.max(...fotosActuales.map(f => f.Orden || 0)) + 1 : 1,
            Estado: true
          };
          
          fotosActuales.push(nuevaFoto);
        }
        
        // Actualizar FotosVariantes
        varianteData.FotosVariantes = JSON.stringify(fotosActuales);
      }

      // Actualizar la variante
      await productosModel.updateVariant(variantId, id, varianteData)

      // Procesar atributos si se proporcionan
      if (varianteData.atributos && Array.isArray(varianteData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(variantId, varianteData.atributos)
        } catch (error) {
          console.error("Error al asignar atributos:", error)
          // No fallamos la actualización de la variante si hay error en los atributos
        }
      }

      // Obtener la variante actualizada con sus relaciones
      const varianteActualizada = await productosModel.getById(variantId)
      
      // Procesar fotos almacenadas en JSON
      let fotosVariante = [];
      if (varianteActualizada.FotosVariantes) {
        try {
          fotosVariante = typeof varianteActualizada.FotosVariantes === 'string' 
            ? JSON.parse(varianteActualizada.FotosVariantes) 
            : varianteActualizada.FotosVariantes;
        } catch (error) {
          console.error("Error al parsear FotosVariantes:", error);
        }
      }
      
      const atributos = await productoAtributosModel.getByProducto(variantId)

      res.status(200).json({
        ...varianteActualizada,
        fotos: fotosVariante,
        atributos,
      })
    } catch (error) {
      console.error("Error al actualizar variante:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  deleteVariant: async (req, res) => {
    try {
      const { id, variantId } = req.params

      // Verificar si el producto base existe
      const productoBase = await productosModel.getById(id)
      if (!productoBase) {
        return res.status(404).json({ message: "Producto base no encontrado" })
      }

      // Verificar si la variante existe
      const variante = await productosModel.getById(variantId)
      if (!variante) {
        return res.status(404).json({ message: "Variante no encontrada" })
      }

      // Verificar que la variante pertenece al producto base
      if (variante.ProductoBaseId != id || !variante.EsVariante) {
        return res.status(400).json({ message: "La variante no pertenece al producto base especificado" })
      }

      // Eliminar fotos de Cloudinary si existen
      if (variante.FotosVariantes) {
        try {
          const fotos = typeof variante.FotosVariantes === 'string'
            ? JSON.parse(variante.FotosVariantes)
            : variante.FotosVariantes;
            
          for (const foto of fotos) {
            try {
              const publicId = foto.Url.split("/").pop().split(".")[0];
              await deleteFromCloudinary(publicId);
            } catch (error) {
              console.error("Error al eliminar imagen de Cloudinary:", error);
            }
          }
        } catch (error) {
          console.error("Error al parsear FotosVariantes:", error);
        }
      }

      // Eliminar la variante
      await productosModel.deleteVariant(id, variantId)

      res.status(200).json({ message: "Variante eliminada correctamente" })
    } catch (error) {
      console.error("Error al eliminar variante:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  }
}

// Controlador para fotos de productos
export const fotosProductoController = {
  // Obtener todas las fotos de un producto
  getByProducto: async (req, res) => {
    try {
      const { idProducto } = req.params

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Obtener fotos del campo JSON
      let fotos = [];
      
      // Determinar si es producto base o variante
      if (producto.EsVariante) {
        if (producto.FotosVariantes) {
          try {
            fotos = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
          }
        }
      } else {
        if (producto.FotosProductoBase) {
          try {
            fotos = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
          }
        }
      }
      
      // Si no hay fotos en el campo JSON, intentar obtener de la tabla FotosProducto
      if (fotos.length === 0) {
        fotos = await fotosProductoModel.getByProducto(idProducto);
      }

      res.status(200).json(fotos)
    } catch (error) {
      console.error("Error al obtener fotos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener una foto por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      
      // Buscar en todos los productos
      const productos = await productosModel.getAll();
      
      let fotoEncontrada = null;
      
      // Buscar en FotosProductoBase y FotosVariantes
      for (const producto of productos) {
        // Buscar en FotosProductoBase
        if (producto.FotosProductoBase) {
          try {
            const fotos = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
              
            const foto = fotos.find(f => f.IdFoto == id);
            if (foto) {
              fotoEncontrada = foto;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
          }
        }
        
        // Buscar en FotosVariantes
        if (producto.FotosVariantes) {
          try {
            const fotos = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
              
            const foto = fotos.find(f => f.IdFoto == id);
            if (foto) {
              fotoEncontrada = foto;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
          }
        }
      }
      
      // Si no se encuentra en los campos JSON, buscar en la tabla FotosProducto
      if (!fotoEncontrada) {
        fotoEncontrada = await fotosProductoModel.getById(id);
      }

      if (!fotoEncontrada) {
        return res.status(404).json({ message: "Foto no encontrada" })
      }

      res.status(200).json(fotoEncontrada)
    } catch (error) {
      console.error("Error al obtener foto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Añadir una foto a un producto
  create: async (req, res) => {
    try {
      const { idProducto } = req.params

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Verificar si se subió una imagen
      if (!req.file) {
        return res.status(400).json({ message: "No se ha proporcionado ninguna imagen" })
      }

      // Subir la imagen a Cloudinary
      const result = await uploadToCloudinary(req.file.path)

      // Crear la foto
      const fotoData = {
        IdProducto: idProducto,
        Url: result.secure_url,
        EsPrincipal: req.body.EsPrincipal === "true",
        Orden: req.body.Orden ? Number.parseInt(req.body.Orden) : undefined,
        Estado: req.body.Estado === "false" ? false : true,
      }

      // Determinar si es producto base o variante
      if (producto.EsVariante) {
        // Es una variante, actualizar FotosVariantes
        let fotosActuales = [];
        if (producto.FotosVariantes) {
          try {
            fotosActuales = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
            fotosActuales = [];
          }
        }
        
        // Si es principal, actualizar las demás
        if (fotoData.EsPrincipal) {
          fotosActuales = fotosActuales.map(foto => ({
            ...foto,
            EsPrincipal: false
          }));
        }
        
        // Crear nueva foto
        const nuevaFoto = {
          IdFoto: Date.now(),
          IdProducto: idProducto,
          Url: fotoData.Url,
          EsPrincipal: fotoData.EsPrincipal,
          Orden: fotoData.Orden || (fotosActuales.length > 0 ? Math.max(...fotosActuales.map(f => f.Orden || 0)) + 1 : 1),
          Estado: fotoData.Estado
        };
        
        fotosActuales.push(nuevaFoto);
        
        // Actualizar el producto
        await productosModel.update(idProducto, {
          FotosVariantes: JSON.stringify(fotosActuales)
        });
        
        res.status(201).json(nuevaFoto);
      } else {
        // Es un producto base, actualizar FotosProductoBase
        let fotosActuales = [];
        if (producto.FotosProductoBase) {
          try {
            fotosActuales = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
            fotosActuales = [];
          }
        }
        
        // Si es principal, actualizar las demás
        if (fotoData.EsPrincipal) {
          fotosActuales = fotosActuales.map(foto => ({
            ...foto,
            EsPrincipal: false
          }));
        }
        
        // Crear nueva foto
        const nuevaFoto = {
          IdFoto: Date.now(),
          IdProducto: idProducto,
          Url: fotoData.Url,
          EsPrincipal: fotoData.EsPrincipal,
          Orden: fotoData.Orden || (fotosActuales.length > 0 ? Math.max(...fotosActuales.map(f => f.Orden || 0)) + 1 : 1),
          Estado: fotoData.Estado
        };
        
        fotosActuales.push(nuevaFoto);
        
        // Actualizar el producto
        await productosModel.update(idProducto, {
          FotosProductoBase: JSON.stringify(fotosActuales)
        });
        
        res.status(201).json(nuevaFoto);
      }
    } catch (error) {
      console.error("Error al crear foto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar una foto
  update: async (req, res) => {
    try {
      const { id } = req.params
      
      // Buscar la foto en todos los productos
      const productos = await productosModel.getAll();
      
      let productoEncontrado = null;
      let esFotosProductoBase = false;
      let fotosActuales = [];
      let fotoIndex = -1;
      
      // Buscar en FotosProductoBase y FotosVariantes
      for (const producto of productos) {
        // Buscar en FotosProductoBase
        if (producto.FotosProductoBase) {
          try {
            const fotos = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
              
            const index = fotos.findIndex(f => f.IdFoto == id);
            if (index !== -1) {
              productoEncontrado = producto;
              esFotosProductoBase = true;
              fotosActuales = fotos;
              fotoIndex = index;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
          }
        }
        
        // Buscar en FotosVariantes
        if (producto.FotosVariantes) {
          try {
            const fotos = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
              
            const index = fotos.findIndex(f => f.IdFoto == id);
            if (index !== -1) {
              productoEncontrado = producto;
              esFotosProductoBase = false;
              fotosActuales = fotos;
              fotoIndex = index;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
          }
        }
      }
      
      if (!productoEncontrado || fotoIndex === -1) {
        return res.status(404).json({ message: "Foto no encontrada" });
      }
      
      const fotoActual = fotosActuales[fotoIndex];
      const fotoData = {};

      // Procesar la imagen si existe
      if (req.file) {
        // Subir la nueva imagen
        const result = await uploadToCloudinary(req.file.path)
        fotoData.Url = result.secure_url

        // Eliminar la imagen anterior de Cloudinary
        try {
          const publicId = fotoActual.Url.split("/").pop().split(".")[0]
          await deleteFromCloudinary(publicId)
        } catch (error) {
          console.error("Error al eliminar imagen anterior:", error)
        }
      }

      // Actualizar otros campos
      if (req.body.EsPrincipal !== undefined) {
        fotoData.EsPrincipal = req.body.EsPrincipal === "true"
      }
      if (req.body.Orden !== undefined) {
        fotoData.Orden = Number.parseInt(req.body.Orden)
      }
      if (req.body.Estado !== undefined) {
        fotoData.Estado = req.body.Estado === "true"
      }
      
      // Si se está marcando como principal, actualizar las demás
      if (fotoData.EsPrincipal && !fotoActual.EsPrincipal) {
        fotosActuales = fotosActuales.map(foto => ({
          ...foto,
          EsPrincipal: foto.IdFoto == id
        }));
      } else {
        // Actualizar solo la foto específica
        fotosActuales[fotoIndex] = {
          ...fotoActual,
          ...fotoData
        };
      }
      
      // Actualizar el producto
      if (esFotosProductoBase) {
        await productosModel.update(productoEncontrado.IdProducto, {
          FotosProductoBase: JSON.stringify(fotosActuales)
        });
      } else {
        await productosModel.update(productoEncontrado.IdProducto, {
          FotosVariantes: JSON.stringify(fotosActuales)
        });
      }
      
      res.status(200).json({
        ...fotoActual,
        ...fotoData
      });
    } catch (error) {
      console.error("Error al actualizar foto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar una foto
  delete: async (req, res) => {
    try {
      const { id } = req.params
      
      // Buscar la foto en todos los productos
      const productos = await productosModel.getAll();
      
      let productoEncontrado = null;
      let esFotosProductoBase = false;
      let fotosActuales = [];
      let fotoIndex = -1;
      
      // Buscar en FotosProductoBase y FotosVariantes
      for (const producto of productos) {
        // Buscar en FotosProductoBase
        if (producto.FotosProductoBase) {
          try {
            const fotos = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
              
            const index = fotos.findIndex(f => f.IdFoto == id);
            if (index !== -1) {
              productoEncontrado = producto;
              esFotosProductoBase = true;
              fotosActuales = fotos;
              fotoIndex = index;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
          }
        }
        
        // Buscar en FotosVariantes
        if (producto.FotosVariantes) {
          try {
            const fotos = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
              
            const index = fotos.findIndex(f => f.IdFoto == id);
            if (index !== -1) {
              productoEncontrado = producto;
              esFotosProductoBase = false;
              fotosActuales = fotos;
              fotoIndex = index;
              break;
            }
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
          }
        }
      }
      
      if (!productoEncontrado || fotoIndex === -1) {
        return res.status(404).json({ message: "Foto no encontrada" });
      }
      
      const fotoAEliminar = fotosActuales[fotoIndex];
      const eraPrincipal = fotoAEliminar.EsPrincipal;
      
      // Eliminar la foto de Cloudinary
      try {
        const publicId = fotoAEliminar.Url.split("/").pop().split(".")[0]
        await deleteFromCloudinary(publicId)
      } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error)
      }
      
      // Eliminar la foto del array
      fotosActuales.splice(fotoIndex, 1);
      
      // Si era la principal y hay más fotos, establecer otra como principal
      if (eraPrincipal && fotosActuales.length > 0) {
        fotosActuales[0].EsPrincipal = true;
      }
      
      // Actualizar el producto
      if (esFotosProductoBase) {
        await productosModel.update(productoEncontrado.IdProducto, {
          FotosProductoBase: JSON.stringify(fotosActuales)
        });
      } else {
        await productosModel.update(productoEncontrado.IdProducto, {
          FotosVariantes: JSON.stringify(fotosActuales)
        });
      }
      
      res.status(200).json({ message: "Foto eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar foto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Establecer una foto como principal
  setPrincipal: async (req, res) => {
    try {
      const { idProducto, idFoto } = req.params

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }
      
      // Determinar si es producto base o variante
      let fotosActuales = [];
      let campoFotos = '';
      
      if (producto.EsVariante) {
        // Es una variante, usar FotosVariantes
        if (producto.FotosVariantes) {
          try {
            fotosActuales = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
            fotosActuales = [];
          }
        }
        campoFotos = 'FotosVariantes';
      } else {
        // Es un producto base, usar FotosProductoBase
        if (producto.FotosProductoBase) {
          try {
            fotosActuales = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
            fotosActuales = [];
          }
        }
        campoFotos = 'FotosProductoBase';
      }
      
      // Verificar que la foto existe
      const fotoIndex = fotosActuales.findIndex(foto => foto.IdFoto == idFoto);
      
      if (fotoIndex === -1) {
        return res.status(404).json({ message: "Foto no encontrada en el producto" });
      }
      
      // Actualizar todas las fotos para quitar el estado principal
      fotosActuales = fotosActuales.map(foto => ({
        ...foto,
        EsPrincipal: foto.IdFoto == idFoto
      }));
      
      // Actualizar el producto
      const updateData = {};
      updateData[campoFotos] = JSON.stringify(fotosActuales);
      
      await productosModel.update(idProducto, updateData);
      
      res.status(200).json({ message: "Foto establecida como principal correctamente" });
    } catch (error) {
      console.error("Error al establecer foto principal:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Reordenar fotos
  reordenar: async (req, res) => {
    try {
      const { idProducto } = req.params
      const { ordenFotos } = req.body

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Verificar que se proporcionó el orden
      if (!ordenFotos || !Array.isArray(ordenFotos)) {
        return res.status(400).json({ message: "Se debe proporcionar un array con el orden de las fotos" })
      }
      
      // Determinar si es producto base o variante
      let fotosActuales = [];
      let campoFotos = '';
      
      if (producto.EsVariante) {
        // Es una variante, usar FotosVariantes
        if (producto.FotosVariantes) {
          try {
            fotosActuales = typeof producto.FotosVariantes === 'string'
              ? JSON.parse(producto.FotosVariantes)
              : producto.FotosVariantes;
          } catch (error) {
            console.error("Error al parsear FotosVariantes:", error);
            fotosActuales = [];
          }
        }
        campoFotos = 'FotosVariantes';
      } else {
        // Es un producto base, usar FotosProductoBase
        if (producto.FotosProductoBase) {
          try {
            fotosActuales = typeof producto.FotosProductoBase === 'string'
              ? JSON.parse(producto.FotosProductoBase)
              : producto.FotosProductoBase;
          } catch (error) {
            console.error("Error al parsear FotosProductoBase:", error);
            fotosActuales = [];
          }
        }
        campoFotos = 'FotosProductoBase';
      }
      
      // Crear un mapa para actualizar los órdenes
      const ordenMap = new Map();
      ordenFotos.forEach(item => {
        ordenMap.set(item.IdFoto, item.Orden);
      });
      
      // Actualizar el orden de cada foto
      fotosActuales = fotosActuales.map(foto => {
        if (ordenMap.has(foto.IdFoto)) {
          return {
            ...foto,
            Orden: ordenMap.get(foto.IdFoto)
          };
        }
        return foto;
      });
      
      // Ordenar el array por el campo Orden
      fotosActuales.sort((a, b) => (a.Orden || 0) - (b.Orden || 0));
      
      // Actualizar el producto
      const updateData = {};
      updateData[campoFotos] = JSON.stringify(fotosActuales);
      
      await productosModel.update(idProducto, updateData);
      
      res.status(200).json({ 
        message: "Fotos reordenadas correctamente",
        fotos: fotosActuales
      });
    } catch (error) {
      console.error("Error al reordenar fotos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

// Controladores para atributos de productos
export const tiposAtributosController = {
  // Obtener todos los tipos de atributos
  getAll: async (req, res) => {
    try {
      const tipos = await tiposAtributosModel.getAll()
      res.status(200).json(tipos)
    } catch (error) {
      console.error("Error al obtener tipos de atributos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener un tipo de atributo por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const tipo = await tiposAtributosModel.getById(id)

      if (!tipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      res.status(200).json(tipo)
    } catch (error) {
      console.error("Error al obtener tipo de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear un nuevo tipo de atributo
  create: async (req, res) => {
    try {
      const tipoData = req.body

      // Validar datos
      if (!tipoData.Nombre) {
        return res.status(400).json({ message: "El nombre es obligatorio" })
      }

      const newTipo = await tiposAtributosModel.create(tipoData)

      res.status(201).json(newTipo)
    } catch (error) {
      console.error("Error al crear tipo de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un tipo de atributo
  update: async (req, res) => {
    try {
      const { id } = req.params
      const tipoData = req.body

      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id)
      if (!existingTipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      const updatedTipo = await tiposAtributosModel.update(id, tipoData)

      res.status(200).json(updatedTipo)
    } catch (error) {
      console.error("Error al actualizar tipo de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar un tipo de atributo
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id)
      if (!existingTipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      try {
        await tiposAtributosModel.delete(id)
        res.status(200).json({ message: "Tipo de atributo eliminado correctamente" })
      } catch (error) {
        if (error.message.includes("tiene valores asociados")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al eliminar tipo de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Cambiar el estado de un tipo de atributo
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id)
      if (!existingTipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      const result = await tiposAtributosModel.changeStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de tipo de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

export const valoresAtributosController = {
  // Obtener todos los valores de atributos
  getAll: async (req, res) => {
    try {
      const valores = await valoresAtributosModel.getAll()
      res.status(200).json(valores)
    } catch (error) {
      console.error("Error al obtener valores de atributos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener valores por tipo de atributo
  getByTipo: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el tipo existe
      const tipo = await tiposAtributosModel.getById(id)
      if (!tipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      const valores = await valoresAtributosModel.getByTipo(id)

      res.status(200).json(valores)
    } catch (error) {
      console.error("Error al obtener valores por tipo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener un valor de atributo por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const valor = await valoresAtributosModel.getById(id)

      if (!valor) {
        return res.status(404).json({ message: "Valor de atributo no encontrado" })
      }

      res.status(200).json(valor)
    } catch (error) {
      console.error("Error al obtener valor de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear un nuevo valor de atributo
  create: async (req, res) => {
    try {
      const valorData = req.body

      // Validar datos
      if (!valorData.IdTipoAtributo) {
        return res.status(400).json({ message: "El tipo de atributo es obligatorio" })
      }
      if (!valorData.Valor) {
        return res.status(400).json({ message: "El valor es obligatorio" })
      }

      // Verificar si el tipo existe
      const tipo = await tiposAtributosModel.getById(valorData.IdTipoAtributo)
      if (!tipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      const newValor = await valoresAtributosModel.create(valorData)

      res.status(201).json(newValor)
    } catch (error) {
      console.error("Error al crear valor de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un valor de atributo
  update: async (req, res) => {
    try {
      const { id } = req.params
      const valorData = req.body

      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id)
      if (!existingValor) {
        return res.status(404).json({ message: "Valor de atributo no encontrado" })
      }

      const updatedValor = await valoresAtributosModel.update(id, valorData)

      res.status(200).json(updatedValor)
    } catch (error) {
      console.error("Error al actualizar valor de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar un valor de atributo
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id)
      if (!existingValor) {
        return res.status(404).json({ message: "Valor de atributo no encontrado" })
      }

      try {
        await valoresAtributosModel.delete(id)
        res.status(200).json({ message: "Valor de atributo eliminado correctamente" })
      } catch (error) {
        if (error.message.includes("está asociado a productos")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al eliminar valor de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Cambiar el estado de un valor de atributo
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id)
      if (!existingValor) {
        return res.status(404).json({ message: "Valor de atributo no encontrado" })
      }

      const result = await valoresAtributosModel.changeStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de valor de atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

export const productoAtributosController = {
  // Obtener atributos de un producto
  getByProducto: async (req, res) => {
    try {
      const { idProducto } = req.params

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      const atributos = await productoAtributosModel.getByProducto(idProducto)

      res.status(200).json(atributos)
    } catch (error) {
      console.error("Error al obtener atributos del producto:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Asignar un atributo a un producto
  create: async (req, res) => {
    try {
      const { idProducto } = req.params
      const atributoData = req.body

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Validar datos
      if (!atributoData.IdTipoAtributo) {
        return res.status(400).json({ message: "El tipo de atributo es obligatorio" })
      }
      if (!atributoData.IdValorAtributo) {
        return res.status(400).json({ message: "El valor del atributo es obligatorio" })
      }

      // Verificar si el tipo de atributo existe
      const tipo = await tiposAtributosModel.getById(atributoData.IdTipoAtributo)
      if (!tipo) {
        return res.status(404).json({ message: "Tipo de atributo no encontrado" })
      }

      // Verificar si el valor de atributo existe
      const valor = await valoresAtributosModel.getById(atributoData.IdValorAtributo)
      if (!valor) {
        return res.status(404).json({ message: "Valor de atributo no encontrado" })
      }

      // Verificar que el valor pertenece al tipo
      if (valor.IdTipoAtributo != atributoData.IdTipoAtributo) {
        return res.status(400).json({ message: "El valor no pertenece al tipo de atributo especificado" })
      }

      // Asignar el atributo al producto
      atributoData.IdProducto = idProducto

      try {
        const newAtributo = await productoAtributosModel.create(atributoData)
        res.status(201).json(newAtributo)
      } catch (error) {
        if (error.message.includes("ya tiene un valor asignado")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al asignar atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un atributo de producto
  update: async (req, res) => {
    try {
      const { id } = req.params
      const atributoData = req.body

      // Validar datos
      if (!atributoData.IdValorAtributo) {
        return res.status(400).json({ message: "El valor del atributo es obligatorio" })
      }

      try {
        const updatedAtributo = await productoAtributosModel.update(id, atributoData)
        res.status(200).json(updatedAtributo)
      } catch (error) {
        if (error.message.includes("debe pertenecer al mismo tipo")) {
          return res.status(400).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error al actualizar atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar un atributo de producto
  delete: async (req, res) => {
    try {
      const { id } = req.params

      await productoAtributosModel.delete(id)

      res.status(200).json({ message: "Atributo eliminado correctamente" })
    } catch (error) {
      console.error("Error al eliminar atributo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Asignar múltiples atributos a un producto
  assignMultiple: async (req, res) => {
    try {
      const { idProducto } = req.params
      const { atributos } = req.body

      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto)
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      // Validar datos
      if (!atributos || !Array.isArray(atributos)) {
        return res.status(400).json({ message: "Se debe proporcionar un array de atributos" })
      }

      // Validar cada atributo
      for (const atributo of atributos) {
        if (!atributo.IdTipoAtributo) {
          return res.status(400).json({ message: "Todos los atributos deben tener un tipo" })
        }
        if (!atributo.IdValorAtributo) {
          return res.status(400).json({ message: "Todos los atributos deben tener un valor" })
        }
      }

      const result = await productoAtributosModel.assignMultiple(idProducto, atributos)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al asignar atributos:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}