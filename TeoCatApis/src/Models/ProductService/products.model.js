// src/Models/ProductService/products.model.js
import { query, getConnection } from "../../Config/Database.js";

// Modelo para la tabla CategoriaDeProductos
export const categoriasModel = {
  // Obtener todas las categorías
  getAll: async () => {
    return await query(
      `SELECT * FROM CategoriaDeProductos ORDER BY NombreCategoria`
    );
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    const categorias = await query(
      `SELECT * FROM CategoriaDeProductos WHERE IdCategoriaDeProductos = ?`,
      [id]
    );
    return categorias[0];
  },

  // Obtener una categoría por nombre
  getByName: async (nombre) => {
    const categorias = await query(
      `SELECT * FROM CategoriaDeProductos WHERE NombreCategoria = ?`,
      [nombre]
    );
    return categorias[0];
  },

  // Crear una nueva categoría
  create: async (categoriaData) => {
    const result = await query(
      `INSERT INTO CategoriaDeProductos (NombreCategoria, Descripcion, Estado) VALUES (?, ?, ?)`,
      [categoriaData.NombreCategoria, categoriaData.Descripcion, categoriaData.Estado || true]
    );
    return { id: result.insertId, ...categoriaData };
  },

  // Actualizar una categoría
  update: async (id, categoriaData) => {
    let query_str = `UPDATE CategoriaDeProductos SET `;
    const params = [];
    
    // Construir la consulta dinámicamente
    if (categoriaData.NombreCategoria) {
      query_str += `NombreCategoria = ?, `;
      params.push(categoriaData.NombreCategoria);
    }
    if (categoriaData.Descripcion !== undefined) {
      query_str += `Descripcion = ?, `;
      params.push(categoriaData.Descripcion);
    }
    if (categoriaData.Estado !== undefined) {
      query_str += `Estado = ?, `;
      params.push(categoriaData.Estado);
    }

    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ` WHERE IdCategoriaDeProductos = ?`;
    params.push(id);

    await query(query_str, params);
    return { id, ...categoriaData };
  },

  // Cambiar el estado de una categoría
  changeStatus: async (id, estado) => {
    await query(
      `UPDATE CategoriaDeProductos SET Estado = ? WHERE IdCategoriaDeProductos = ?`,
      [estado, id]
    );
    return { id, estado };
  },

  // Eliminar una categoría
  delete: async (id) => {
    await query(
      `DELETE FROM CategoriaDeProductos WHERE IdCategoriaDeProductos = ?`,
      [id]
    );
    return { id };
  },

  // Obtener productos de una categoría
  getProducts: async (id) => {
    return await query(
      `SELECT * FROM Productos WHERE IdCategoriaDeProducto = ? ORDER BY NombreProducto`,
      [id]
    );
  },

  // Buscar categorías por nombre o descripción
  search: async (searchTerm) => {
    return await query(
      `SELECT * FROM CategoriaDeProductos 
       WHERE NombreCategoria LIKE ? OR Descripcion LIKE ?
       ORDER BY NombreCategoria`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
  }
};

// Modelo para la tabla Productos
export const productosModel = {
  // Obtener todos los productos
  getAll: async (page = 1, limit = 20) => {
    try {
      // Convertir explícitamente a números enteros
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt((page - 1) * limitNum, 10);
      
      // Primero, obtener el total de registros
      const totalResult = await query(`SELECT COUNT(*) as count FROM Productos`);
      const total = totalResult[0].count;
      
      // Luego, obtener los productos con paginación usando valores directos en la consulta
      const productos = await query(
        `SELECT p.*, c.NombreCategoria 
        FROM Productos p
        JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
        ORDER BY p.NombreProducto
        LIMIT ${limitNum} OFFSET ${offsetNum}`
      );
      
      return {
        data: productos,
        pagination: {
          page: parseInt(page, 10),
          limit: limitNum,
          total: total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error("Error en la consulta SQL:", error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const productos = await query(
      `SELECT p.*, c.NombreCategoria 
      FROM Productos p
      JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
      WHERE p.IdProducto = ?`,
      [id]
    );
    return productos[0];
  },

  // Obtener un producto por código de barras
  getByBarcode: async (codigoBarras) => {
    const productos = await query(
      `SELECT * FROM Productos WHERE CodigoBarras = ?`,
      [codigoBarras]
    );
    return productos[0];
  },

  // Obtener un producto por referencia
  getByReference: async (referencia) => {
    const productos = await query(
      `SELECT * FROM Productos WHERE Referencia = ?`,
      [referencia]
    );
    return productos[0];
  },

  // Obtener productos por categoría
  getByCategoria: async (idCategoria) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.IdCategoriaDeProducto = ?
       ORDER BY p.NombreProducto`,
      [idCategoria]
    );
  },

  // Crear un nuevo producto
  create: async (productoData) => {
    const result = await query(
      `INSERT INTO Productos 
      (IdCategoriaDeProducto, NombreProducto, Foto, Descripcion, Caracteristicas, 
      Especificaciones, Stock, Precio, AplicaIVA, PorcentajeIVA, FechaVencimiento, 
      CodigoBarras, Referencia, Estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productoData.IdCategoriaDeProducto,
        productoData.NombreProducto,
        productoData.Foto || null,
        productoData.Descripcion || null,
        productoData.Caracteristicas || '',
        productoData.Especificaciones || '',
        productoData.Stock || 0,
        productoData.Precio,
        productoData.AplicaIVA || false,
        productoData.PorcentajeIVA || 0,
        productoData.FechaVencimiento || null,
        productoData.CodigoBarras || null,
        productoData.Referencia || null,
        productoData.Estado || true
      ]
    );
    return { id: result.insertId, ...productoData };
  },

  // Actualizar un producto
  update: async (id, productoData) => {
    let query_str = `UPDATE Productos SET `;
    const params = [];
    
    // Construir la consulta dinámicamente
    if (productoData.IdCategoriaDeProducto) {
      query_str += `IdCategoriaDeProducto = ?, `;
      params.push(productoData.IdCategoriaDeProducto);
    }
    if (productoData.NombreProducto) {
      query_str += `NombreProducto = ?, `;
      params.push(productoData.NombreProducto);
    }
    if (productoData.Foto !== undefined) {
      query_str += `Foto = ?, `;
      params.push(productoData.Foto);
    }
    if (productoData.Descripcion !== undefined) {
      query_str += `Descripcion = ?, `;
      params.push(productoData.Descripcion);
    }
    if (productoData.Caracteristicas !== undefined) {
      query_str += `Caracteristicas = ?, `;
      params.push(productoData.Caracteristicas);
    }
    if (productoData.Especificaciones !== undefined) {
      query_str += `Especificaciones = ?, `;
      params.push(productoData.Especificaciones);
    }
    if (productoData.Stock !== undefined) {
      query_str += `Stock = ?, `;
      params.push(productoData.Stock);
    }
    if (productoData.Precio !== undefined) {
      query_str += `Precio = ?, `;
      params.push(productoData.Precio);
    }
    if (productoData.AplicaIVA !== undefined) {
      query_str += `AplicaIVA = ?, `;
      params.push(productoData.AplicaIVA);
    }
    if (productoData.PorcentajeIVA !== undefined) {
      query_str += `PorcentajeIVA = ?, `;
      params.push(productoData.PorcentajeIVA);
    }
    if (productoData.FechaVencimiento !== undefined) {
      query_str += `FechaVencimiento = ?, `;
      params.push(productoData.FechaVencimiento);
    }
    if (productoData.CodigoBarras !== undefined) {
      query_str += `CodigoBarras = ?, `;
      params.push(productoData.CodigoBarras);
    }
    if (productoData.Referencia !== undefined) {
      query_str += `Referencia = ?, `;
      params.push(productoData.Referencia);
    }
    if (productoData.Estado !== undefined) {
      query_str += `Estado = ?, `;
      params.push(productoData.Estado);
    }

    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ` WHERE IdProducto = ?`;
    params.push(id);

    await query(query_str, params);
    return { id, ...productoData };
  },

  // Cambiar el estado de un producto
  changeStatus: async (id, estado) => {
    await query(
      `UPDATE Productos SET Estado = ? WHERE IdProducto = ?`,
      [estado, id]
    );
    return { id, estado };
  },

  // Actualizar el stock de un producto
  updateStock: async (id, cantidad) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Obtener el stock actual
      const [productos] = await connection.query(
        `SELECT Stock FROM Productos WHERE IdProducto = ?`,
        [id]
      );
      
      if (productos.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      const nuevoStock = productos[0].Stock + cantidad;
      if (nuevoStock < 0) {
        throw new Error('No hay suficiente stock disponible');
      }
      
      // Actualizar el stock
      await connection.query(
        `UPDATE Productos SET Stock = ? WHERE IdProducto = ?`,
        [nuevoStock, id]
      );
      
      await connection.commit();
      return { id, stock: nuevoStock };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Eliminar un producto
  delete: async (id) => {
    await query(
      `DELETE FROM Productos WHERE IdProducto = ?`,
      [id]
    );
    return { id };
  },

  // Buscar productos por nombre, descripción, código de barras o referencia
  search: async (searchTerm) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
      FROM Productos p
      JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
      WHERE p.NombreProducto LIKE ? OR p.Descripcion LIKE ? OR p.CodigoBarras LIKE ? OR p.Referencia LIKE ?
      ORDER BY p.NombreProducto`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
  },

  // Obtener productos con stock bajo
  getLowStock: async (limit = 5) => {
    // Convertir limit a entero para evitar problemas
    const limitNum = parseInt(limit, 10);
    return await query(
      `SELECT p.*, c.NombreCategoria 
      FROM Productos p
      JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
      WHERE p.Stock <= ${limitNum}
      ORDER BY p.Stock ASC`
    );
  },

  // Obtener productos próximos a vencer
  getNearExpiry: async (days = 30) => {
    // Convertir days a entero para evitar problemas
    const daysNum = parseInt(days, 10);
    return await query(
      `SELECT p.*, c.NombreCategoria 
      FROM Productos p
      JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
      WHERE p.FechaVencimiento IS NOT NULL 
      AND p.FechaVencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ${daysNum} DAY)
      ORDER BY p.FechaVencimiento ASC`
    );
  }
};

export default {
  categorias: categoriasModel,
  productos: productosModel
};