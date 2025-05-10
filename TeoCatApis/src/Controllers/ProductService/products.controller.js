import { categoriasModel, productosModel, fotosProductoModel, tiposAtributosModel, valoresAtributosModel, productoAtributosModel } from '../../Models/ProductService/products.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../Utils/Cloudinary.js';

export const categoriasController = {
  getAll: async (req, res) => {
    try {
      const categorias = await categoriasModel.getAll();
      res.status(200).json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await categoriasModel.getById(id);
      
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      res.status(200).json(categoria);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getProducts: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await categoriasModel.getById(id);
      
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      const productos = await categoriasModel.getProducts(id);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos de la categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ message: 'Se debe proporcionar un término de búsqueda' });
      }
      
      const categorias = await categoriasModel.search(term);
      res.status(200).json(categorias);
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const categoriaData = req.body;
      
      // Validar datos
      if (!categoriaData.NombreCategoria) {
        return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
      }
      
      const newCategoria = await categoriasModel.create(categoriaData);
      
      res.status(201).json(newCategoria);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const categoriaData = req.body;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      const updatedCategoria = await categoriasModel.update(id, categoriaData);
      
      res.status(200).json(updatedCategoria);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      const result = await categoriasModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      try {
        await categoriasModel.delete(id);
        res.status(200).json({ message: 'Categoría eliminada correctamente' });
      } catch (error) {
        if (error.message.includes('tiene productos asociados')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

export const productosController = {
  getAll: async (req, res) => {
    try {
      const productos = await productosModel.getAll();
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await productosModel.getById(id);
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Obtener fotos y atributos
      const fotos = await fotosProductoModel.getByProducto(id);
      const atributos = await productoAtributosModel.getByProducto(id);
      
      res.status(200).json({
        ...producto,
        fotos,
        atributos
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getByCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await categoriasModel.getById(id);
      
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      const productos = await productosModel.getByCategoria(id);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ message: 'Se debe proporcionar un término de búsqueda' });
      }
      
      const productos = await productosModel.search(term);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getLowStock: async (req, res) => {
    try {
      const { threshold } = req.query;
      const productos = await productosModel.getLowStock(threshold || 10);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  getNearExpiry: async (req, res) => {
    try {
      const { days } = req.query;
      const productos = await productosModel.getNearExpiry(days || 30);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos próximos a vencer:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      let productoData = req.body;
      
      // Verificar si la categoría existe
      const categoria = await categoriasModel.getById(productoData.IdCategoriaDeProducto);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si el código de barras ya existe
      if (productoData.CodigoBarras) {
        const existingBarcode = await productosModel.getByBarcode(productoData.CodigoBarras);
        if (existingBarcode) {
          return res.status(400).json({ message: 'Ya existe un producto con ese código de barras' });
        }
      }
      
      // Verificar si la referencia ya existe
      if (productoData.Referencia) {
        const existingReference = await productosModel.getByReference(productoData.Referencia);
        if (existingReference) {
          return res.status(400).json({ message: 'Ya existe un producto con esa referencia' });
        }
      }
      
      // Validar unidad de medida
      const unidadesMedida = ['Unidad', 'Kilogramo', 'Libra', 'Bulto', 'Gramo', 'Litro', 'Mililitro', 'Metro', 'Centimetro'];
      if (productoData.UnidadMedida && !unidadesMedida.includes(productoData.UnidadMedida)) {
        return res.status(400).json({ 
          message: 'Unidad de medida no válida',
          unidadesPermitidas: unidadesMedida
        });
      }
      
      // Validar origen
      const origenes = ['Catálogo', 'Stock'];
      if (productoData.Origen && !origenes.includes(productoData.Origen)) {
        return res.status(400).json({ 
          message: 'Origen no válido',
          origenesPermitidos: origenes
        });
      }
      
      // Calcular precio de venta si no se proporciona
      if (!productoData.PrecioVenta && productoData.Precio) {
        const margen = productoData.MargenGanancia || 30;
        let precioVenta = productoData.Precio * (1 + (margen / 100));
        
        // Añadir IVA si aplica
        if (productoData.AplicaIVA) {
          precioVenta = precioVenta * (1 + (productoData.PorcentajeIVA || 0) / 100);
        }
        
        productoData.PrecioVenta = precioVenta;
      }
      
      // Crear el producto
      const newProducto = await productosModel.create(productoData);
      
      // Procesar la imagen si existe y guardarla como foto principal
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path);
        
        // Crear la foto en la tabla FotosProducto
        await fotosProductoModel.create({
          IdProducto: newProducto.id,
          Url: result.secure_url,
          EsPrincipal: true,
          Orden: 1,
          Estado: true
        });
      }
      
      // Procesar atributos si se proporcionan
      if (productoData.atributos && Array.isArray(productoData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(newProducto.id, productoData.atributos);
        } catch (error) {
          console.error('Error al asignar atributos:', error);
          // No fallamos la creación del producto si hay error en los atributos
        }
      }
      
      // Obtener el producto completo con sus relaciones
      const productoCompleto = await productosModel.getById(newProducto.id);
      const fotos = await fotosProductoModel.getByProducto(newProducto.id);
      const atributos = await productoAtributosModel.getByProducto(newProducto.id);
      
      res.status(201).json({
        ...productoCompleto,
        fotos,
        atributos
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      let productoData = req.body;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Si se está actualizando la categoría, verificar que exista
      if (productoData.IdCategoriaDeProducto) {
        const categoria = await categoriasModel.getById(productoData.IdCategoriaDeProducto);
        if (!categoria) {
          return res.status(404).json({ message: 'Categoría no encontrada' });
        }
      }
      
      // Si se está actualizando el código de barras, verificar que no exista
      if (productoData.CodigoBarras && productoData.CodigoBarras !== existingProducto.CodigoBarras) {
        const productoWithBarcode = await productosModel.getByBarcode(productoData.CodigoBarras);
        if (productoWithBarcode) {
          return res.status(400).json({ message: 'Ya existe un producto con ese código de barras' });
        }
      }
      
      // Si se está actualizando la referencia, verificar que no exista
      if (productoData.Referencia && productoData.Referencia !== existingProducto.Referencia) {
        const productoWithReference = await productosModel.getByReference(productoData.Referencia);
        if (productoWithReference) {
          return res.status(400).json({ message: 'Ya existe un producto con esa referencia' });
        }
      }
      
      // Validar unidad de medida
      const unidadesMedida = ['Unidad', 'Kilogramo', 'Libra', 'Bulto', 'Gramo', 'Litro', 'Mililitro', 'Metro', 'Centimetro'];
      if (productoData.UnidadMedida && !unidadesMedida.includes(productoData.UnidadMedida)) {
        return res.status(400).json({ 
          message: 'Unidad de medida no válida',
          unidadesPermitidas: unidadesMedida
        });
      }
      
      // Validar origen
      const origenes = ['Catálogo', 'Stock'];
      if (productoData.Origen && !origenes.includes(productoData.Origen)) {
        return res.status(400).json({ 
          message: 'Origen no válido',
          origenesPermitidos: origenes
        });
      }
      
      // Recalcular precio de venta si cambia el precio o el margen
      if ((productoData.Precio !== undefined && productoData.Precio !== existingProducto.Precio) || 
          (productoData.MargenGanancia !== undefined && productoData.MargenGanancia !== existingProducto.MargenGanancia) ||
          (productoData.AplicaIVA !== undefined && productoData.AplicaIVA !== existingProducto.AplicaIVA) ||
          (productoData.PorcentajeIVA !== undefined && productoData.PorcentajeIVA !== existingProducto.PorcentajeIVA)) {
        
        const precio = productoData.Precio !== undefined ? productoData.Precio : existingProducto.Precio;
        const margen = productoData.MargenGanancia !== undefined ? productoData.MargenGanancia : existingProducto.MargenGanancia;
        const aplicaIVA = productoData.AplicaIVA !== undefined ? productoData.AplicaIVA : existingProducto.AplicaIVA;
        const porcentajeIVA = productoData.PorcentajeIVA !== undefined ? productoData.PorcentajeIVA : existingProducto.PorcentajeIVA;
        
        let precioVenta = precio * (1 + (margen / 100));
        
        // Añadir IVA si aplica
        if (aplicaIVA) {
          precioVenta = precioVenta * (1 + (porcentajeIVA / 100));
        }
        
        productoData.PrecioVenta = precioVenta;
      }
      
      // Actualizar el producto
      const updatedProducto = await productosModel.update(id, productoData);
      
      // Procesar la imagen si existe
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path);
        
        // Buscar si ya tiene una foto principal
        const fotos = await fotosProductoModel.getByProducto(id);
        const fotoPrincipal = fotos.find(f => f.EsPrincipal);
        
        if (fotoPrincipal) {
          // Actualizar la foto principal
          await fotosProductoModel.update(fotoPrincipal.IdFoto, {
            Url: result.secure_url
          });
          
          // Intentar eliminar la imagen anterior de Cloudinary
          try {
            const publicId = fotoPrincipal.Url.split('/').pop().split('.')[0];
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error('Error al eliminar imagen anterior:', error);
          }
        } else {
          // Crear una nueva foto principal
          await fotosProductoModel.create({
            IdProducto: id,
            Url: result.secure_url,
            EsPrincipal: true,
            Orden: 1,
            Estado: true
          });
        }
      }
      
      // Procesar atributos si se proporcionan
      if (productoData.atributos && Array.isArray(productoData.atributos)) {
        try {
          await productoAtributosModel.assignMultiple(id, productoData.atributos);
        } catch (error) {
          console.error('Error al asignar atributos:', error);
          // No fallamos la actualización del producto si hay error en los atributos
        }
      }
      
      // Obtener el producto completo con sus relaciones
      const productoCompleto = await productosModel.getById(id);
      const fotos = await fotosProductoModel.getByProducto(id);
      const atributos = await productoAtributosModel.getByProducto(id);
      
      res.status(200).json({
        ...productoCompleto,
        fotos,
        atributos
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      const result = await productosModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      const result = await productosModel.updateStock(id, cantidad);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      try {
        await productosModel.delete(id);
        res.status(200).json({ message: 'Producto eliminado correctamente' });
      } catch (error) {
        if (error.message.includes('tiene variantes asociadas')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Nuevos métodos para variantes
  getVariants: async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el producto existe
    const existingProducto = await productosModel.getById(id);
    if (!existingProducto) {
      return res.status(404).json({ message: 'Producto base no encontrado' });
    }
    
    // Obtener variantes
    const variantes = await productosModel.getVariants(id);
    
    // Para cada variante, obtener sus atributos
    const variantesConAtributos = await Promise.all(
      variantes.map(async (variante) => {
        const atributos = await productoAtributosModel.getByProducto(variante.IdProducto);
        const fotos = await fotosProductoModel.getByProducto(variante.IdProducto);
        return {
          ...variante,
          atributos,
          fotos
        };
      })
    );
    
    res.status(200).json(variantesConAtributos);
  } catch (error) {
    console.error('Error al obtener variantes:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

  createVariant: async (req, res) => {
  try {
    const { id } = req.params;
    let varianteData = req.body;
    
    // Verificar si el producto base existe
    const productoBase = await productosModel.getById(id);
    if (!productoBase) {
      return res.status(404).json({ message: 'Producto base no encontrado' });
    }
    
    // Verificar si el código de barras ya existe
    if (varianteData.CodigoBarras) {
      const existingBarcode = await productosModel.getByBarcode(varianteData.CodigoBarras);
      if (existingBarcode) {
        return res.status(400).json({ message: 'Ya existe un producto con ese código de barras' });
      }
    }
    
    // Verificar si la referencia ya existe
    if (varianteData.Referencia) {
      const existingReference = await productosModel.getByReference(varianteData.Referencia);
      if (existingReference) {
        return res.status(400).json({ message: 'Ya existe un producto con esa referencia' });
      }
    }
    
    // Crear la variante
    const newVariante = await productosModel.createVariant(id, varianteData);
    
    // Procesar la imagen si existe
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      
      // Crear la foto en la tabla FotosProducto
      await fotosProductoModel.create({
        IdProducto: newVariante.id,
        Url: result.secure_url,
        EsPrincipal: true,
        Orden: 1,
        Estado: true
      });
    }
    
    // Procesar atributos si se proporcionan
    if (varianteData.atributos && Array.isArray(varianteData.atributos)) {
      try {
        await productoAtributosModel.assignMultiple(newVariante.id, varianteData.atributos);
      } catch (error) {
        console.error('Error al asignar atributos:', error);
        // No fallamos la creación de la variante si hay error en los atributos
      }
    }
    
    // Obtener la variante completa con sus relaciones
    const varianteCompleta = await productosModel.getById(newVariante.id);
    const fotos = await fotosProductoModel.getByProducto(newVariante.id);
    const atributos = await productoAtributosModel.getByProducto(newVariante.id);
    
    res.status(201).json({
      ...varianteCompleta,
      fotos,
      atributos
    });
  } catch (error) {
    console.error('Error al crear variante:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

  calcularPrecioVenta: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Calcular precio de venta
      const result = await productosModel.calcularPrecioVenta(id);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al calcular precio de venta:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  updateVariant: async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { 
      NombreProducto, 
      Descripcion, 
      Stock, 
      Precio, 
      CodigoBarras, 
      Referencia,
      MargenGanancia,
      AplicaIVA,
      PorcentajeIVA,
      atributos
    } = req.body;
    
    // Verificar si el producto base existe
    const baseProduct = await productosModel.getById(id);
    if (!baseProduct) {
      return res.status(404).json({ message: 'Producto base no encontrado' });
    }
    
    // Preparar datos para actualización
    const updateData = {
      NombreProducto,
      Descripcion,
      Stock,
      Precio,
      CodigoBarras,
      Referencia,
      MargenGanancia,
      AplicaIVA,
      PorcentajeIVA
    };
    
    // Actualizar la variante usando el método específico del modelo
    try {
      await productosModel.updateVariant(variantId, id, updateData);
    } catch (error) {
      if (error.message.includes('no existe o no pertenece')) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
    
    // Actualizar atributos si se proporcionaron
    if (atributos && atributos.length > 0) {
      // Primero eliminar atributos existentes
      const existingAttributes = await productoAtributosModel.getByProducto(variantId);
      for (const attr of existingAttributes) {
        await productoAtributosModel.delete(attr.IdProductoAtributo);
      }
      
      // Luego asignar los nuevos atributos
      await productoAtributosModel.assignMultiple(variantId, atributos);
    }
    
    // Procesar imagen si se proporcionó
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Verificar si ya tiene una foto principal
      const mainPhoto = await fotosProductoModel.getMainByProducto(variantId);
      
      if (mainPhoto) {
        // Actualizar la foto existente
        await fotosProductoModel.update(mainPhoto.IdFoto, {
          Url: imageUrl,
          EsPrincipal: true
        });
      } else {
        // Crear una nueva foto
        await fotosProductoModel.create({
          IdProducto: variantId,
          Url: imageUrl,
          EsPrincipal: true,
          Orden: 1
        });
      }
    }
    
    // Obtener la variante actualizada con sus atributos y fotos
    const updatedVariant = await productosModel.getById(variantId);
    const updatedAttributes = await productoAtributosModel.getByProducto(variantId);
    const updatedPhotos = await fotosProductoModel.getByProducto(variantId);
    
    res.status(200).json({
      message: 'Variante actualizada correctamente',
      data: {
        ...updatedVariant,
        atributos: updatedAttributes,
        fotos: updatedPhotos
      }
    });
  } catch (error) {
    console.error('Error al actualizar variante:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

  deleteVariant: async (req, res) => {
  try {
    const { id, variantId } = req.params;
    
    // Verificar si el producto base existe
    const productoBase = await productosModel.getById(id);
    if (!productoBase) {
      return res.status(404).json({ message: 'Producto base no encontrado' });
    }
    
    // Verificar si la variante existe
    const variante = await productosModel.getById(variantId);
    if (!variante) {
      return res.status(404).json({ message: 'Variante no encontrada' });
    }
    
    // Verificar que la variante pertenece al producto base
    if (variante.ProductoBaseId != id || !variante.EsVariante) {
      return res.status(400).json({ message: 'La variante no pertenece al producto base especificado' });
    }
    
    // Eliminar fotos de Cloudinary
    const fotos = await fotosProductoModel.getByProducto(variantId);
    for (const foto of fotos) {
      try {
        const publicId = foto.Url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
      }
    }
    
    // Eliminar la variante usando el modelo
    await productosModel.deleteVariant(id, variantId);
    
    res.status(200).json({ message: 'Variante eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar variante:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}
};


// Controlador para fotos de productos
export const fotosProductoController = {
  // Obtener todas las fotos de un producto
  getByProducto: async (req, res) => {
    try {
      const { idProducto } = req.params;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      const fotos = await fotosProductoModel.getByProducto(idProducto);
      res.status(200).json(fotos);
    } catch (error) {
      console.error('Error al obtener fotos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Obtener una foto por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const foto = await fotosProductoModel.getById(id);
      
      if (!foto) {
        return res.status(404).json({ message: 'Foto no encontrada' });
      }
      
      res.status(200).json(foto);
    } catch (error) {
      console.error('Error al obtener foto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Añadir una foto a un producto
  create: async (req, res) => {
    try {
      const { idProducto } = req.params;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Verificar si se subió una imagen
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen' });
      }
      
      // Subir la imagen a Cloudinary
      const result = await uploadToCloudinary(req.file.path);
      
      // Crear la foto en la base de datos
      const fotoData = {
        IdProducto: idProducto,
        Url: result.secure_url,
        EsPrincipal: req.body.EsPrincipal === 'true',
        Orden: req.body.Orden ? parseInt(req.body.Orden) : undefined,
        Estado: req.body.Estado === 'false' ? false : true
      };
      
      const newFoto = await fotosProductoModel.create(fotoData);
      
      res.status(201).json(newFoto);
    } catch (error) {
      console.error('Error al crear foto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Actualizar una foto
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la foto existe
      const existingFoto = await fotosProductoModel.getById(id);
      if (!existingFoto) {
        return res.status(404).json({ message: 'Foto no encontrada' });
      }
      
      let fotoData = {};
      
      // Procesar la imagen si existe
      if (req.file) {
        // Subir la nueva imagen
        const result = await uploadToCloudinary(req.file.path);
        fotoData.Url = result.secure_url;
        
        // Eliminar la imagen anterior de Cloudinary
        try {
          const publicId = existingFoto.Url.split('/').pop().split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }
      
      // Actualizar otros campos
      if (req.body.EsPrincipal !== undefined) {
        fotoData.EsPrincipal = req.body.EsPrincipal === 'true';
      }
      if (req.body.Orden !== undefined) {
        fotoData.Orden = parseInt(req.body.Orden);
      }
      if (req.body.Estado !== undefined) {
        fotoData.Estado = req.body.Estado === 'true';
      }
      
      // Actualizar la foto
      const updatedFoto = await fotosProductoModel.update(id, fotoData);
      
      res.status(200).json(updatedFoto);
    } catch (error) {
      console.error('Error al actualizar foto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Eliminar una foto
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la foto existe
      const existingFoto = await fotosProductoModel.getById(id);
      if (!existingFoto) {
        return res.status(404).json({ message: 'Foto no encontrada' });
      }
      
      // Eliminar la foto de Cloudinary
      try {
        const publicId = existingFoto.Url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
      }
      
      // Eliminar la foto de la base de datos
      await fotosProductoModel.delete(id);
      
      res.status(200).json({ message: 'Foto eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Establecer una foto como principal
  setPrincipal: async (req, res) => {
    try {
      const { idProducto, idFoto } = req.params;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Verificar si la foto existe
      const foto = await fotosProductoModel.getById(idFoto);
      if (!foto) {
        return res.status(404).json({ message: 'Foto no encontrada' });
      }
      
      // Verificar que la foto pertenece al producto
      if (foto.IdProducto != idProducto) {
        return res.status(400).json({ message: 'La foto no pertenece al producto' });
      }
      
      // Establecer como principal
      const result = await fotosProductoModel.setPrincipal(idProducto, idFoto);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al establecer foto principal:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Reordenar fotos
  reordenar: async (req, res) => {
    try {
      const { idProducto } = req.params;
      const { ordenFotos } = req.body;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Verificar que se proporcionó el orden
      if (!ordenFotos || !Array.isArray(ordenFotos)) {
        return res.status(400).json({ message: 'Se debe proporcionar un array con el orden de las fotos' });
      }
      
      // Reordenar las fotos
      const result = await fotosProductoModel.reordenar(idProducto, ordenFotos);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al reordenar fotos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

// Controladores para atributos de productos
export const tiposAtributosController = {
  // Obtener todos los tipos de atributos
  getAll: async (req, res) => {
    try {
      const tipos = await tiposAtributosModel.getAll();
      res.status(200).json(tipos);
    } catch (error) {
      console.error('Error al obtener tipos de atributos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Obtener un tipo de atributo por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const tipo = await tiposAtributosModel.getById(id);
      
      if (!tipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      res.status(200).json(tipo);
    } catch (error) {
      console.error('Error al obtener tipo de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Crear un nuevo tipo de atributo
  create: async (req, res) => {
    try {
      const tipoData = req.body;
      
      // Validar datos
      if (!tipoData.Nombre) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
      }
      
      const newTipo = await tiposAtributosModel.create(tipoData);
      
      res.status(201).json(newTipo);
    } catch (error) {
      console.error('Error al crear tipo de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Actualizar un tipo de atributo
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const tipoData = req.body;
      
      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id);
      if (!existingTipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      const updatedTipo = await tiposAtributosModel.update(id, tipoData);
      
      res.status(200).json(updatedTipo);
    } catch (error) {
      console.error('Error al actualizar tipo de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Eliminar un tipo de atributo
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id);
      if (!existingTipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      try {
        await tiposAtributosModel.delete(id);
        res.status(200).json({ message: 'Tipo de atributo eliminado correctamente' });
      } catch (error) {
        if (error.message.includes('tiene valores asociados')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar tipo de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Cambiar el estado de un tipo de atributo
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si el tipo existe
      const existingTipo = await tiposAtributosModel.getById(id);
      if (!existingTipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      const result = await tiposAtributosModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de tipo de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

export const valoresAtributosController = {
  // Obtener todos los valores de atributos
  getAll: async (req, res) => {
    try {
      const valores = await valoresAtributosModel.getAll();
      res.status(200).json(valores);
    } catch (error) {
      console.error('Error al obtener valores de atributos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Obtener valores por tipo de atributo
  getByTipo: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el tipo existe
      const tipo = await tiposAtributosModel.getById(id);
      if (!tipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      const valores = await valoresAtributosModel.getByTipo(id);
      
      res.status(200).json(valores);
    } catch (error) {
      console.error('Error al obtener valores por tipo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Obtener un valor de atributo por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const valor = await valoresAtributosModel.getById(id);
      
      if (!valor) {
        return res.status(404).json({ message: 'Valor de atributo no encontrado' });
      }
      
      res.status(200).json(valor);
    } catch (error) {
      console.error('Error al obtener valor de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Crear un nuevo valor de atributo
  create: async (req, res) => {
    try {
      const valorData = req.body;
      
      // Validar datos
      if (!valorData.IdTipoAtributo) {
        return res.status(400).json({ message: 'El tipo de atributo es obligatorio' });
      }
      if (!valorData.Valor) {
        return res.status(400).json({ message: 'El valor es obligatorio' });
      }
      
      // Verificar si el tipo existe
      const tipo = await tiposAtributosModel.getById(valorData.IdTipoAtributo);
      if (!tipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      const newValor = await valoresAtributosModel.create(valorData);
      
      res.status(201).json(newValor);
    } catch (error) {
      console.error('Error al crear valor de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Actualizar un valor de atributo
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const valorData = req.body;
      
      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id);
      if (!existingValor) {
        return res.status(404).json({ message: 'Valor de atributo no encontrado' });
      }
      
      const updatedValor = await valoresAtributosModel.update(id, valorData);
      
      res.status(200).json(updatedValor);
    } catch (error) {
      console.error('Error al actualizar valor de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Eliminar un valor de atributo
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id);
      if (!existingValor) {
        return res.status(404).json({ message: 'Valor de atributo no encontrado' });
      }
      
      try {
        await valoresAtributosModel.delete(id);
        res.status(200).json({ message: 'Valor de atributo eliminado correctamente' });
      } catch (error) {
        if (error.message.includes('está asociado a productos')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar valor de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Cambiar el estado de un valor de atributo
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si el valor existe
      const existingValor = await valoresAtributosModel.getById(id);
      if (!existingValor) {
        return res.status(404).json({ message: 'Valor de atributo no encontrado' });
      }
      
      const result = await valoresAtributosModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de valor de atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

export const productoAtributosController = {
  // Obtener atributos de un producto
  getByProducto: async (req, res) => {
    try {
      const { idProducto } = req.params;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      const atributos = await productoAtributosModel.getByProducto(idProducto);
      
      res.status(200).json(atributos);
    } catch (error) {
      console.error('Error al obtener atributos del producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Asignar un atributo a un producto
  create: async (req, res) => {
    try {
      const { idProducto } = req.params;
      const atributoData = req.body;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Validar datos
      if (!atributoData.IdTipoAtributo) {
        return res.status(400).json({ message: 'El tipo de atributo es obligatorio' });
      }
      if (!atributoData.IdValorAtributo) {
        return res.status(400).json({ message: 'El valor del atributo es obligatorio' });
      }
      
      // Verificar si el tipo de atributo existe
      const tipo = await tiposAtributosModel.getById(atributoData.IdTipoAtributo);
      if (!tipo) {
        return res.status(404).json({ message: 'Tipo de atributo no encontrado' });
      }
      
      // Verificar si el valor de atributo existe
      const valor = await valoresAtributosModel.getById(atributoData.IdValorAtributo);
      if (!valor) {
        return res.status(404).json({ message: 'Valor de atributo no encontrado' });
      }
      
      // Verificar que el valor pertenece al tipo
      if (valor.IdTipoAtributo != atributoData.IdTipoAtributo) {
        return res.status(400).json({ message: 'El valor no pertenece al tipo de atributo especificado' });
      }
      
      // Asignar el atributo al producto
      atributoData.IdProducto = idProducto;
      
      try {
        const newAtributo = await productoAtributosModel.create(atributoData);
        res.status(201).json(newAtributo);
      } catch (error) {
        if (error.message.includes('ya tiene un valor asignado')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al asignar atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Actualizar un atributo de producto
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const atributoData = req.body;
      
      // Validar datos
      if (!atributoData.IdValorAtributo) {
        return res.status(400).json({ message: 'El valor del atributo es obligatorio' });
      }
      
      try {
        const updatedAtributo = await productoAtributosModel.update(id, atributoData);
        res.status(200).json(updatedAtributo);
      } catch (error) {
        if (error.message.includes('debe pertenecer al mismo tipo')) {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al actualizar atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Eliminar un atributo de producto
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      await productoAtributosModel.delete(id);
      
      res.status(200).json({ message: 'Atributo eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar atributo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },
  
  // Asignar múltiples atributos a un producto
  assignMultiple: async (req, res) => {
    try {
      const { idProducto } = req.params;
      const { atributos } = req.body;
      
      // Verificar si el producto existe
      const producto = await productosModel.getById(idProducto);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Validar datos
      if (!atributos || !Array.isArray(atributos)) {
        return res.status(400).json({ message: 'Se debe proporcionar un array de atributos' });
      }
      
      // Validar cada atributo
      for (const atributo of atributos) {
        if (!atributo.IdTipoAtributo) {
          return res.status(400).json({ message: 'Todos los atributos deben tener un tipo' });
        }
        if (!atributo.IdValorAtributo) {
          return res.status(400).json({ message: 'Todos los atributos deben tener un valor' });
        }
      }
      
      const result = await productoAtributosModel.assignMultiple(idProducto, atributos);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al asignar atributos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};