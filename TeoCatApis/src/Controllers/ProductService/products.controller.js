// src/Controllers/ProductService/products.controller.js
import { categoriasModel, productosModel } from '../../Models/ProductService/products.model.js';
import { uploadToCloudinary } from '../../Utils/Cloudinary.js';
import { deleteFromCloudinary } from '../../Utils/Cloudinary.js';


// Controlador para categorías de productos
export const categoriasController = {
  // Obtener todas las categorías
  getAll: async (req, res) => {
    try {
      const categorias = await categoriasModel.getAll();
      res.status(200).json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener una categoría por ID
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

  // Crear una nueva categoría
  create: async (req, res) => {
    try {
      const categoriaData = req.body;

      // Verificar si el nombre ya existe
      const existingName = await categoriasModel.getByName(categoriaData.NombreCategoria);
      if (existingName) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      }

      // Crear la categoría
      const newCategoria = await categoriasModel.create(categoriaData);

      res.status(201).json(newCategoria);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Actualizar una categoría
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const categoriaData = req.body;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Si se está actualizando el nombre, verificar que no exista
      if (categoriaData.NombreCategoria && categoriaData.NombreCategoria !== existingCategoria.NombreCategoria) {
        const categoriaWithName = await categoriasModel.getByName(categoriaData.NombreCategoria);
        if (categoriaWithName) {
          return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
        }
      }
      
      // Actualizar la categoría
      const updatedCategoria = await categoriasModel.update(id, categoriaData);
      
      res.status(200).json(updatedCategoria);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Cambiar el estado de una categoría
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Cambiar el estado
      const result = await categoriasModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Eliminar una categoría
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si hay productos asociados
      const productos = await categoriasModel.getProducts(id);
      if (productos.length > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la categoría porque tiene productos asociados',
          productos
        });
      }
      
      // Eliminar la categoría
      await categoriasModel.delete(id);
      
      res.status(200).json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Buscar categorías
  search: async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ message: 'Término de búsqueda no proporcionado' });
      }
      
      const categorias = await categoriasModel.search(term);
      
      res.status(200).json(categorias);
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener productos de una categoría
  getProducts: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la categoría existe
      const existingCategoria = await categoriasModel.getById(id);
      if (!existingCategoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Obtener productos
      const productos = await categoriasModel.getProducts(id);
      
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos de la categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

// Controlador para productos
export const productosController = {
  // Obtener todos los productos
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      // Convertir explícitamente a números enteros
      const pageNum = Number.parseInt(page, 10);
      const limitNum = Number.parseInt(limit, 10);
      
      const productos = await productosModel.getAll(pageNum, limitNum);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener un producto por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await productosModel.getById(id);
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      res.status(200).json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener productos por categoría
  getByCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la categoría existe
      const categoria = await categoriasModel.getById(id);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Obtener productos de la categoría
      const productos = await productosModel.getByCategoria(id);
      
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Crear un nuevo producto
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
      
      // Procesar la imagen si existe
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path);
        productoData.Foto = result.secure_url; // Cambiado de imagen a Foto
      }
      
      // Crear el producto
      const newProducto = await productosModel.create(productoData);
      
      res.status(201).json(newProducto);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Actualizar un producto
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
      
      // Procesar la imagen si existe
      if (req.file) {
        // Eliminar imagen anterior si existe
        if (existingProducto.Foto) {
          try {
            const publicId = existingProducto.Foto.split('/').pop().split('.')[0];
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error('Error al eliminar imagen anterior:', error);
          }
        }
        
        // Subir nueva imagen
        const result = await uploadToCloudinary(req.file.path);
        productoData.Foto = result.secure_url;
      }
      
      // Actualizar el producto
      const updatedProducto = await productosModel.update(id, productoData);
      
      res.status(200).json(updatedProducto);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Cambiar el estado de un producto
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { Estado } = req.body;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Cambiar el estado
      const result = await productosModel.changeStatus(id, Estado);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al cambiar estado de producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Actualizar el stock de un producto
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Actualizar el stock
      const result = await productosModel.updateStock(id, cantidad);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Eliminar un producto
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el producto existe
      const existingProducto = await productosModel.getById(id);
      if (!existingProducto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Eliminar el producto
      await productosModel.delete(id);
      
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Buscar productos
  search: async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ message: 'Término de búsqueda no proporcionado' });
      }
      
      const productos = await productosModel.search(term);
      
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener productos con stock bajo
  getLowStock: async (req, res) => {
    try {
      const { limit } = req.query;
      const productos = await productosModel.getLowStock(limit || 5);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Obtener productos próximos a vencer
  getNearExpiry: async (req, res) => {
    try {
      const { days } = req.query;
      const productos = await productosModel.getNearExpiry(days || 30);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos próximos a vencer:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  }
};

export default {
  categoriasController,
  productosController
};