import axios from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar el catálogo de productos
 * Implementa el patrón SOA (Service-Oriented Architecture)
 */
class CatalogoService {
  /**
   * Obtiene todas las categorías de productos
   * @returns {Promise<Array>} Lista de categorías
   */
  async getCategorias() {
    try {
      console.log("Intentando obtener categorías")
      const response = await axios.get("/public/products/categorias")
      console.log("Categorías obtenidas:", response.data)
      
      // La API puede devolver directamente un array o un objeto con data
      return response.data;
    } catch (error) {
      console.error("Error al obtener categorías:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  async getProductos() {
    try {
      console.log("Intentando obtener productos")
      const response = await axios.get("/public/products/productos")
      console.log("Productos obtenidos:", response.data)
      
      // Verificar la estructura de la respuesta y extraer los productos
      let productos = [];
      
      if (response.data && response.data.data) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        productos = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        productos = response.data;
      }
      
      console.log("Array de productos extraído:", productos);
      return productos;
    } catch (error) {
      console.error("Error al obtener productos:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  async getProductoById(id) {
    try {
      console.log(`Intentando obtener producto con ID ${id}`)
      const response = await axios.get(`/public/products/productos/${id}`)
      console.log(`Producto ${id} obtenido:`, response.data)
      
      // Manejar diferentes estructuras de respuesta
      let producto = null;
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        producto = response.data.data[0];
      } else if (response.data && !Array.isArray(response.data)) {
        // Si la respuesta es directamente un objeto
        producto = response.data;
      }
      
      return producto;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Busca productos por término de búsqueda
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de productos que coinciden con la búsqueda
   */
  async searchProductos(query) {
    try {
      console.log(`Intentando buscar productos con término: ${query}`)
      const response = await axios.get(`/public/products/productos/search?term=${encodeURIComponent(query)}`)
      console.log("Resultados de búsqueda:", response.data)
      
      // Manejar diferentes estructuras de respuesta
      let productos = [];
      
      if (response.data && response.data.data) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        productos = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        productos = response.data;
      }
      
      return productos;
    } catch (error) {
      console.error(`Error al buscar productos con término "${query}":`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Obtiene productos por categoría
   * @param {number|string} categoriaId - ID de la categoría
   * @returns {Promise<Array>} Lista de productos de la categoría
   */
  async getProductosByCategoria(categoriaId) {
    try {
      // Asegurarse de que categoriaId sea un número válido
      if (!categoriaId || isNaN(Number(categoriaId))) {
        console.error(`ID de categoría inválido: ${categoriaId}`);
        return [];
      }
      
      console.log(`Intentando obtener productos de categoría ${categoriaId}`)
      const response = await axios.get(`/public/products/productos/categoria/${categoriaId}`)
      console.log(`Productos de categoría ${categoriaId} obtenidos:`, response.data)
      
      // Manejar diferentes estructuras de respuesta
      let productos = [];
      
      if (response.data && response.data.data) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        productos = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        productos = response.data;
      }
      
      return productos;
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${categoriaId}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      // En caso de error, devolver un array vacío en lugar de lanzar una excepción
      return [];
    }
  }

  /**
   * Formatea la lista de categorías para su uso en componentes React
   * @param {Array} categorias - Lista de categorías de la API
   * @returns {Array} Lista formateada de categorías
   */
  formatCategoriasList(categorias) {
    console.log("Formateando categorías:", categorias);
    if (!categorias || !Array.isArray(categorias)) {
      return []
    }

    return categorias.map((categoria) => ({
      id: categoria.IdCategoriaDeProductos || categoria.IdCategoriaDeProducto || categoria.id || 0,
      name: categoria.NombreCategoria || categoria.nombre || "Sin nombre",
      description: categoria.Descripcion || categoria.descripcion || "",
      image: categoria.ImagenURL || categoria.imagen || null,
    }))
  }

  /**
   * Formatea la lista de productos para su uso en componentes React
   * @param {Array} productos - Lista de productos de la API
   * @returns {Array} Lista formateada de productos
   */
  formatProductosList(productos) {
    console.log("Formateando productos:", productos);
    if (!productos || !Array.isArray(productos)) {
      console.warn("No se recibió un array de productos válido:", productos);
      return []
    }

    return productos.map((producto) => this.formatProductoData(producto))
  }

  /**
 * Formatea los datos de un producto para su uso en componentes React
 * @param {Object} producto - Datos del producto de la API
 * @returns {Object} Datos formateados del producto
 */
formatProductoData(producto) {
  if (!producto) {
    console.warn("Se intentó formatear un producto nulo o indefinido");
    return null;
  }
  
  console.log("Formateando producto individual:", producto);

  // Procesar imágenes (pueden venir separadas por |)
  let images = [];
  const imageField = producto.Foto || producto.ImagenURL || producto.imagen || null;
  if (imageField) {
    if (typeof imageField === 'string' && imageField.includes('|')) {
      images = imageField.split('|');
    } else {
      images = [imageField];
    }
  }

  // Procesar características (pueden venir como string)
  let features = [];
  const caracteristicasField = producto.Caracteristicas || producto.caracteristicas || '';
  if (caracteristicasField) {
    if (typeof caracteristicasField === 'string') {
      // Si es un string, dividir por líneas o comas
      if (caracteristicasField.includes('\n')) {
        features = caracteristicasField.split('\n').filter(item => item.trim() !== '');
      } else if (caracteristicasField.includes(',')) {
        features = caracteristicasField.split(',').filter(item => item.trim() !== '');
      } else {
        features = [caracteristicasField];
      }
    } else if (Array.isArray(caracteristicasField)) {
      features = caracteristicasField;
    }
  }

  // Procesar especificaciones (pueden venir como string con formato "clave: valor")
  let specs = {};
  const especificacionesField = producto.Especificaciones || producto.especificaciones || '';
  if (especificacionesField) {
    if (typeof especificacionesField === 'string') {
      // Intentar parsear como JSON primero
      try {
        specs = JSON.parse(especificacionesField);
      } catch (error) {
        // Si no es JSON válido, intentar dividir por líneas y luego por ":"
        if (especificacionesField.includes('\n')) {
          const lines = especificacionesField.split('\n');
          lines.forEach(line => {
            if (line.includes(':')) {
              const [key, value] = line.split(':').map(item => item.trim());
              if (key && value) {
                specs[key] = value;
              }
            }
          });
        } else if (especificacionesField.includes(':')) {
          const [key, value] = especificacionesField.split(':').map(item => item.trim());
          if (key && value) {
            specs[key] = value;
          }
        } else {
          specs = { "Especificación": especificacionesField };
        }
      }
    } else if (typeof especificacionesField === 'object') {
      specs = especificacionesField;
    }
  }

  return {
    id: producto.IdProducto || producto.id || 0,
    name: producto.NombreProducto || producto.nombre || "Sin nombre",
    description: producto.Descripcion || producto.descripcion || "",
    price: parseFloat(producto.Precio || producto.precio || 0),
    stock: producto.Stock || producto.stock || 0,
    images: images, // Ahora devolvemos un array de imágenes
    image: images.length > 0 ? images[0] : null, // Para compatibilidad con código existente
    category: producto.NombreCategoria || producto.categoria || "Sin categoría",
    categoryId: producto.IdCategoriaDeProducto || producto.IdCategoriaDeProductos || producto.categoriaId || 0,
    rating: producto.Valoracion || producto.rating || 0,
    specifications: specs, // Ahora es un objeto con pares clave-valor
    features: features, // Ahora es un array de características
  };
}
}

export default new CatalogoService()