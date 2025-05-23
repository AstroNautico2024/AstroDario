import { query, getConnection } from "../../Config/Database.js";

export const categoriasModel = {
  getAll: async () => {
    return await query(
      `SELECT * FROM CategoriaDeProductos ORDER BY NombreCategoria`
    );
  },

  getById: async (id) => {
    const categorias = await query(
      `SELECT * FROM CategoriaDeProductos WHERE IdCategoriaDeProductos = ?`,
      [id]
    );
    return categorias[0];
  },

  getProducts: async (id) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.IdCategoriaDeProducto = ? AND p.Estado = TRUE
       ORDER BY p.NombreProducto`,
      [id]
    );
  },

  search: async (term) => {
  const searchTerm = `%${term}%`;
  return await query(
    `SELECT * FROM CategoriaDeProductos 
     WHERE NombreCategoria LIKE ? AND Estado = TRUE
     ORDER BY NombreCategoria`,
    [searchTerm]
  );
},

  create: async (categoriaData) => {
  const result = await query(
    `INSERT INTO CategoriaDeProductos (NombreCategoria, Estado) VALUES (?, ?)`,
    [categoriaData.NombreCategoria, categoriaData.Estado || true]
  );
  return { id: result.insertId, ...categoriaData };
},

  update: async (id, categoriaData) => {
  let query_str = `UPDATE CategoriaDeProductos SET `;
  const params = [];
  
  if (categoriaData.NombreCategoria) {
    query_str += `NombreCategoria = ?, `;
    params.push(categoriaData.NombreCategoria);
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

  changeStatus: async (id, estado) => {
    await query(
      `UPDATE CategoriaDeProductos SET Estado = ? WHERE IdCategoriaDeProductos = ?`,
      [estado, id]
    );
    return { id, estado };
  },

  delete: async (id) => {
    // Verificar si hay productos asociados
    const productos = await query(
      `SELECT COUNT(*) as count FROM Productos WHERE IdCategoriaDeProducto = ?`,
      [id]
    );
    
    if (productos[0].count > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
    }
    
    await query(
      `DELETE FROM CategoriaDeProductos WHERE IdCategoriaDeProductos = ?`,
      [id]
    );
    return { id };
  }
};

export const productosModel = {
  getAll: async () => {
  return await query(
    `SELECT p.*, c.NombreCategoria 
     FROM Productos p
     JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
     ORDER BY p.NombreProducto`
  );
},

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

  getByCategoria: async (idCategoria) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.IdCategoriaDeProducto = ? AND p.Estado = TRUE
       ORDER BY p.NombreProducto`,
      [idCategoria]
    );
  },

  search: async (term) => {
    const searchTerm = `%${term}%`;
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE (p.NombreProducto LIKE ? OR p.Descripcion LIKE ? OR p.CodigoBarras LIKE ? OR p.Referencia LIKE ?) AND p.Estado = TRUE
       ORDER BY p.NombreProducto`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
  },

  getLowStock: async (threshold = 10) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.Stock <= ? AND p.Estado = TRUE
       ORDER BY p.Stock ASC, p.NombreProducto`,
      [threshold]
    );
  },

  getNearExpiry: async (days = 30) => {
    return await query(
      `SELECT p.*, c.NombreCategoria, DATEDIFF(p.FechaVencimiento, CURDATE()) as DiasParaVencer
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.FechaVencimiento IS NOT NULL 
       AND p.FechaVencimiento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND p.FechaVencimiento >= CURDATE()
       AND p.Estado = TRUE
       ORDER BY p.FechaVencimiento ASC, p.NombreProducto`,
      [days]
    );
  },

  getByBarcode: async (barcode) => {
    const productos = await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.CodigoBarras = ?`,
      [barcode]
    );
    return productos[0];
  },

  getByReference: async (reference) => {
    const productos = await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.Referencia = ?`,
      [reference]
    );
    return productos[0];
  },

  create: async (productoData) => {
    const result = await query(
      `INSERT INTO Productos 
      (IdCategoriaDeProducto, NombreProducto, Descripcion, Caracteristicas, 
      Especificaciones, Stock, UnidadMedida, FactorConversion, Precio, 
      PrecioVenta, MargenGanancia, AplicaIVA, PorcentajeIVA, FechaVencimiento, 
      CodigoBarras, Referencia, Estado, Origen, EsVariante, ProductoBaseId,
      FotosProductoBase, FotosVariantes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productoData.IdCategoriaDeProducto,
        productoData.NombreProducto,
        productoData.Descripcion || null,
        productoData.Caracteristicas || '',
        productoData.Especificaciones || '',
        productoData.Stock || 0,
        productoData.UnidadMedida || 'Unidad',
        productoData.FactorConversion || 1,
        productoData.Precio,
        productoData.PrecioVenta || (productoData.Precio * (1 + (productoData.MargenGanancia || 30) / 100)),
        productoData.MargenGanancia || 30,
        productoData.AplicaIVA || false,
        productoData.PorcentajeIVA || 0,
        productoData.FechaVencimiento || null,
        productoData.CodigoBarras || null,
        productoData.Referencia || null,
        productoData.Estado || true,
        productoData.Origen || 'Catálogo',
        productoData.EsVariante || false,
        productoData.ProductoBaseId || null,
        productoData.FotosProductoBase || null,
        productoData.FotosVariantes || null
      ]
    );
    return { id: result.insertId, ...productoData };
  },

  update: async (id, productoData) => {
    let query_str = `UPDATE Productos SET `;
    const params = [];
    
    // Construir la consulta dinámicamente con todos los campos
    if (productoData.IdCategoriaDeProducto) {
      query_str += `IdCategoriaDeProducto = ?, `;
      params.push(productoData.IdCategoriaDeProducto);
    }
    if (productoData.NombreProducto) {
      query_str += `NombreProducto = ?, `;
      params.push(productoData.NombreProducto);
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
    if (productoData.UnidadMedida !== undefined) {
      query_str += `UnidadMedida = ?, `;
      params.push(productoData.UnidadMedida);
    }
    if (productoData.FactorConversion !== undefined) {
      query_str += `FactorConversion = ?, `;
      params.push(productoData.FactorConversion);
    }
    if (productoData.Precio !== undefined) {
      query_str += `Precio = ?, `;
      params.push(productoData.Precio);
    }
    if (productoData.PrecioVenta !== undefined) {
      query_str += `PrecioVenta = ?, `;
      params.push(productoData.PrecioVenta);
    }
    if (productoData.MargenGanancia !== undefined) {
      query_str += `MargenGanancia = ?, `;
      params.push(productoData.MargenGanancia);
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
    if (productoData.Origen !== undefined) {
      query_str += `Origen = ?, `;
      params.push(productoData.Origen);
    }
    if (productoData.EsVariante !== undefined) {
      query_str += `EsVariante = ?, `;
      params.push(productoData.EsVariante);
    }
    if (productoData.ProductoBaseId !== undefined) {
      query_str += `ProductoBaseId = ?, `;
      params.push(productoData.ProductoBaseId);
    }
    if (productoData.FotosProductoBase !== undefined) {
      query_str += `FotosProductoBase = ?, `;
      params.push(productoData.FotosProductoBase);
    }
    if (productoData.FotosVariantes !== undefined) {
      query_str += `FotosVariantes = ?, `;
      params.push(productoData.FotosVariantes);
    }

    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ` WHERE IdProducto = ?`;
    params.push(id);

    await query(query_str, params);
    return { id, ...productoData };
  },

  changeStatus: async (id, estado) => {
    await query(
      `UPDATE Productos SET Estado = ? WHERE IdProducto = ?`,
      [estado, id]
    );
    return { id, estado };
  },

  updateStock: async (connection, id, cantidad) => {
    await connection.query(
      `UPDATE Productos SET Stock = Stock + ? WHERE IdProducto = ?`,
      [cantidad, id]
    );
    return { id, cantidad };
  },

  delete: async (id) => {
    // Verificar si hay variantes asociadas
    const variantes = await query(
      `SELECT COUNT(*) as count FROM Productos WHERE ProductoBaseId = ?`,
      [id]
    );
    
    if (variantes[0].count > 0) {
      throw new Error('No se puede eliminar el producto porque tiene variantes asociadas');
    }
    
    // Verificar si hay atributos asociados y eliminarlos
    await query(
      `DELETE FROM ProductoAtributos WHERE IdProducto = ?`,
      [id]
    );
    
    // Eliminar el producto
    await query(
      `DELETE FROM Productos WHERE IdProducto = ?`,
      [id]
    );
    return { id };
  },
  
  // Métodos para manejar fotos directamente en la tabla Productos
  updateProductPhotos: async (id, fotosProductoBase) => {
    await query(
      `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
      [JSON.stringify(fotosProductoBase), id]
    );
    return { id, fotosProductoBase };
  },
  
  updateVariantPhotos: async (id, fotosVariantes) => {
    await query(
      `UPDATE Productos SET FotosVariantes = ? WHERE IdProducto = ?`,
      [JSON.stringify(fotosVariantes), id]
    );
    return { id, fotosVariantes };
  },
  
  getProductPhotos: async (id) => {
    const producto = await query(
      `SELECT FotosProductoBase FROM Productos WHERE IdProducto = ?`,
      [id]
    );
    
    if (producto.length === 0) {
      return null;
    }
    
    return producto[0].FotosProductoBase ? JSON.parse(producto[0].FotosProductoBase) : [];
  },
  
  getVariantPhotos: async (id) => {
    const producto = await query(
      `SELECT FotosVariantes FROM Productos WHERE IdProducto = ?`,
      [id]
    );
    
    if (producto.length === 0) {
      return null;
    }
    
    return producto[0].FotosVariantes ? JSON.parse(producto[0].FotosVariantes) : [];
  },
  
  // Nuevos métodos para variantes
  getVariants: async (idProductoBase) => {
    return await query(
      `SELECT p.*, c.NombreCategoria 
       FROM Productos p
       JOIN CategoriaDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProductos
       WHERE p.ProductoBaseId = ? AND p.EsVariante = TRUE
       ORDER BY p.NombreProducto`,
      [idProductoBase]
    );
  },

  createVariant: async (idProductoBase, varianteData) => {
  // Obtener datos del producto base
  const productos = await query(
    `SELECT * FROM Productos WHERE IdProducto = ?`,
    [idProductoBase]
  );
  
  if (productos.length === 0) {
    throw new Error('Producto base no encontrado');
  }
  
  const productoBase = productos[0];
  
  // Crear la variante con datos heredados del producto base
  const result = await query(
    `INSERT INTO Productos 
    (IdCategoriaDeProducto, NombreProducto, Descripcion, Caracteristicas, 
    Especificaciones, Stock, UnidadMedida, FactorConversion, Precio, 
    PrecioVenta, MargenGanancia, AplicaIVA, PorcentajeIVA, FechaVencimiento, 
    CodigoBarras, Referencia, Estado, Origen, EsVariante, ProductoBaseId, FotosVariantes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
    [
      productoBase.IdCategoriaDeProducto,
      varianteData.NombreProducto || `${productoBase.NombreProducto} - Variante`,
      varianteData.Descripcion || productoBase.Descripcion,
      varianteData.Caracteristicas || productoBase.Caracteristicas,
      varianteData.Especificaciones || productoBase.Especificaciones,
      varianteData.Stock || 0,
      varianteData.UnidadMedida || productoBase.UnidadMedida,
      varianteData.FactorConversion || productoBase.FactorConversion,
      varianteData.Precio || productoBase.Precio,
      varianteData.PrecioVenta || productoBase.PrecioVenta,
      varianteData.MargenGanancia || productoBase.MargenGanancia,
      varianteData.AplicaIVA !== undefined ? varianteData.AplicaIVA : productoBase.AplicaIVA,
      varianteData.PorcentajeIVA !== undefined ? varianteData.PorcentajeIVA : productoBase.PorcentajeIVA,
      varianteData.FechaVencimiento || productoBase.FechaVencimiento,
      varianteData.CodigoBarras || null,
      varianteData.Referencia || null,
      varianteData.Estado !== undefined ? varianteData.Estado : true,
      varianteData.Origen || productoBase.Origen,
      idProductoBase,
      varianteData.FotosVariantes || null
    ]
  );
  
  return { id: result.insertId, ...varianteData, EsVariante: true, ProductoBaseId: idProductoBase };
},

  // Método para calcular precio de venta basado en margen
  calcularPrecioVenta: async (id) => {
    const [producto] = await query(
      `SELECT Precio, MargenGanancia, AplicaIVA, PorcentajeIVA FROM Productos WHERE IdProducto = ?`,
      [id]
    );
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    // Calcular precio de venta
    let precioVenta = producto.Precio * (1 + (producto.MargenGanancia / 100));
    
    // Añadir IVA si aplica
    if (producto.AplicaIVA) {
      precioVenta = precioVenta * (1 + (producto.PorcentajeIVA / 100));
    }
    
    // Actualizar el precio de venta
    await query(
      `UPDATE Productos SET PrecioVenta = ? WHERE IdProducto = ?`,
      [precioVenta, id]
    );
    
    return { id, precioVenta };
  },

  updateVariant: async (variantId, baseProductId, updateData) => {
  try {
    // Verificar que la variante existe y pertenece al producto base
    const variant = await query(
      `SELECT * FROM Productos WHERE IdProducto = ? AND EsVariante = TRUE AND ProductoBaseId = ?`,
      [variantId, baseProductId]
    );
    
    if (variant.length === 0) {
      throw new Error('La variante no existe o no pertenece al producto base especificado');
    }
    
    // Preparar los campos a actualizar
    const fields = [];
    const values = [];
    
    if (updateData.NombreProducto) {
      fields.push('NombreProducto = ?');
      values.push(updateData.NombreProducto);
    }
    
    if (updateData.Descripcion !== undefined) {
      fields.push('Descripcion = ?');
      values.push(updateData.Descripcion);
    }
    
    if (updateData.Caracteristicas !== undefined) {
      fields.push('Caracteristicas = ?');
      values.push(updateData.Caracteristicas);
    }
    
    if (updateData.Especificaciones !== undefined) {
      fields.push('Especificaciones = ?');
      values.push(updateData.Especificaciones);
    }
    
    if (updateData.Stock !== undefined) {
      fields.push('Stock = ?');
      values.push(updateData.Stock);
    }
    
    if (updateData.UnidadMedida) {
      fields.push('UnidadMedida = ?');
      values.push(updateData.UnidadMedida);
    }
    
    if (updateData.FactorConversion) {
      fields.push('FactorConversion = ?');
      values.push(updateData.FactorConversion);
    }
    
    if (updateData.Precio !== undefined) {
      fields.push('Precio = ?');
      values.push(updateData.Precio);
    }
    
    if (updateData.MargenGanancia !== undefined) {
      fields.push('MargenGanancia = ?');
      values.push(updateData.MargenGanancia);
    }
    
    if (updateData.AplicaIVA !== undefined) {
      fields.push('AplicaIVA = ?');
      values.push(updateData.AplicaIVA);
    }
    
    if (updateData.PorcentajeIVA !== undefined) {
      fields.push('PorcentajeIVA = ?');
      values.push(updateData.PorcentajeIVA);
    }
    
    if (updateData.FechaVencimiento) {
      fields.push('FechaVencimiento = ?');
      values.push(updateData.FechaVencimiento);
    }
    
    if (updateData.CodigoBarras) {
      fields.push('CodigoBarras = ?');
      values.push(updateData.CodigoBarras);
    }
    
    if (updateData.Referencia) {
      fields.push('Referencia = ?');
      values.push(updateData.Referencia);
    }
    
    if (updateData.Estado !== undefined) {
      fields.push('Estado = ?');
      values.push(updateData.Estado);
    }
    
    if (updateData.FotosVariantes !== undefined) {
      fields.push('FotosVariantes = ?');
      values.push(updateData.FotosVariantes);
    }
    
    // Si no hay campos para actualizar, retornar
    if (fields.length === 0) {
      return variant[0];
    }
    
    // Construir y ejecutar la consulta de actualización
    const updateQuery = `
      UPDATE Productos 
      SET ${fields.join(', ')} 
      WHERE IdProducto = ? AND EsVariante = TRUE AND ProductoBaseId = ?
    `;
    
    values.push(variantId);
    values.push(baseProductId);
    
    await query(updateQuery, values);
    
    // Recalcular el precio de venta si se actualizó el precio o el margen
    if (updateData.Precio !== undefined || updateData.MargenGanancia !== undefined) {
      await productosModel.calcularPrecioVenta(variantId);
    }
    
    // Obtener y retornar la variante actualizada
    const updatedVariant = await query(
      `SELECT * FROM Productos WHERE IdProducto = ?`,
      [variantId]
    );
    
    return updatedVariant[0];
  } catch (error) {
    console.error('Error al actualizar variante:', error);
    throw error;
  }
},

  deleteVariant: async (idProductoBase, idVariante) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    
    // Verificar que la variante existe y pertenece al producto base
    const [variantes] = await connection.query(
      `SELECT * FROM Productos WHERE IdProducto = ? AND ProductoBaseId = ? AND EsVariante = TRUE`,
      [idVariante, idProductoBase]
    );
    
    if (variantes.length === 0) {
      throw new Error('Variante no encontrada o no pertenece al producto base');
    }
    
    // Eliminar atributos asociados
    await connection.query(
      `DELETE FROM ProductoAtributos WHERE IdProducto = ?`,
      [idVariante]
    );
    
    // Eliminar la variante
    await connection.query(
      `DELETE FROM Productos WHERE IdProducto = ?`,
      [idVariante]
    );
    
    await connection.commit();
    return { idProductoBase, idVariante };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
};

// Modelo para fotos de productos
export const fotosProductoModel = {
  // Obtener todas las fotos de un producto
  getByProducto: async (idProducto) => {
    // Primero intentamos obtener las fotos del campo FotosProductoBase
    const producto = await query(
      `SELECT FotosProductoBase FROM Productos WHERE IdProducto = ?`,
      [idProducto]
    );
    
    if (producto.length > 0 && producto[0].FotosProductoBase) {
      try {
        return JSON.parse(producto[0].FotosProductoBase);
      } catch (error) {
        console.error('Error al parsear FotosProductoBase:', error);
      }
    }
    
    // Si no hay fotos en FotosProductoBase o hay un error, buscamos en la tabla FotosProducto
    return await query(
      `SELECT * FROM FotosProducto WHERE IdProducto = ? ORDER BY Orden, IdFoto`,
      [idProducto]
    );
  },
  
  // Obtener una foto por ID
  getById: async (id) => {
    const fotos = await query(
      `SELECT * FROM FotosProducto WHERE IdFoto = ?`,
      [id]
    );
    return fotos[0];
  },
  
  // Añadir una foto a un producto
  create: async (fotoData) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Verificar si el producto existe
      const [producto] = await connection.query(
        `SELECT * FROM Productos WHERE IdProducto = ?`,
        [fotoData.IdProducto]
      );
      
      if (producto.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      // Obtener las fotos actuales del producto
      let fotosActuales = [];
      if (producto[0].FotosProductoBase) {
        try {
          fotosActuales = JSON.parse(producto[0].FotosProductoBase);
        } catch (error) {
          console.error('Error al parsear FotosProductoBase:', error);
        }
      }
      
      // Generar un ID único para la nueva foto
      const nuevoId = Date.now();
      
      // Determinar el orden de la nueva foto
      const orden = fotoData.Orden || (fotosActuales.length > 0 ? Math.max(...fotosActuales.map(f => f.Orden || 0)) + 1 : 1);
      
      // Si es la primera foto o se marca como principal, actualizar las demás
      if (fotoData.EsPrincipal) {
        fotosActuales = fotosActuales.map(foto => ({
          ...foto,
          EsPrincipal: false
        }));
      }
      
      // Crear el objeto de la nueva foto
      const nuevaFoto = {
        IdFoto: nuevoId,
        IdProducto: fotoData.IdProducto,
        Url: fotoData.Url,
        EsPrincipal: fotoData.EsPrincipal || (fotosActuales.length === 0), // Si es la primera foto, es principal por defecto
        Orden: orden,
        Estado: fotoData.Estado || true
      };
      
      // Añadir la nueva foto al array
      fotosActuales.push(nuevaFoto);
      
      // Actualizar el campo FotosProductoBase en la tabla Productos
      await connection.query(
        `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
        [JSON.stringify(fotosActuales), fotoData.IdProducto]
      );
      
      await connection.commit();
      return nuevaFoto;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Actualizar una foto
  update: async (id, fotoData) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Buscar el producto que contiene la foto
      const productos = await connection.query(
        `SELECT * FROM Productos WHERE FotosProductoBase LIKE ?`,
        [`%"IdFoto":${id}%`]
      );
      
      if (productos.length === 0) {
        throw new Error('Foto no encontrada en ningún producto');
      }
      
      const producto = productos[0];
      let fotosProducto = [];
      
      try {
        fotosProducto = JSON.parse(producto.FotosProductoBase);
      } catch (error) {
        throw new Error('Error al parsear las fotos del producto');
      }
      
      // Encontrar la foto a actualizar
      const fotoIndex = fotosProducto.findIndex(foto => foto.IdFoto === id);
      
      if (fotoIndex === -1) {
        throw new Error('Foto no encontrada en el producto');
      }
      
      const fotoActual = fotosProducto[fotoIndex];
      
      // Si se está marcando como principal, actualizar las demás
      if (fotoData.EsPrincipal && !fotoActual.EsPrincipal) {
        fotosProducto = fotosProducto.map(foto => ({
          ...foto,
          EsPrincipal: foto.IdFoto === id
        }));
      } else {
        // Actualizar los campos de la foto
        fotosProducto[fotoIndex] = {
          ...fotoActual,
          Url: fotoData.Url !== undefined ? fotoData.Url : fotoActual.Url,
          EsPrincipal: fotoData.EsPrincipal !== undefined ? fotoData.EsPrincipal : fotoActual.EsPrincipal,
          Orden: fotoData.Orden !== undefined ? fotoData.Orden : fotoActual.Orden,
          Estado: fotoData.Estado !== undefined ? fotoData.Estado : fotoActual.Estado
        };
      }
      
      // Actualizar el campo FotosProductoBase en la tabla Productos
      await connection.query(
        `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
        [JSON.stringify(fotosProducto), producto.IdProducto]
      );
      
      await connection.commit();
      return { id, ...fotoData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Eliminar una foto
  delete: async (id) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Buscar el producto que contiene la foto
      const productos = await connection.query(
        `SELECT * FROM Productos WHERE FotosProductoBase LIKE ?`,
        [`%"IdFoto":${id}%`]
      );
      
      if (productos.length === 0) {
        throw new Error('Foto no encontrada en ningún producto');
      }
      
      const producto = productos[0];
      let fotosProducto = [];
      
      try {
        fotosProducto = JSON.parse(producto.FotosProductoBase);
      } catch (error) {
        throw new Error('Error al parsear las fotos del producto');
      }
      
      // Encontrar la foto a eliminar
      const fotoIndex = fotosProducto.findIndex(foto => foto.IdFoto === id);
      
      if (fotoIndex === -1) {
        throw new Error('Foto no encontrada en el producto');
      }
      
      const fotoAEliminar = fotosProducto[fotoIndex];
      const eraPrincipal = fotoAEliminar.EsPrincipal;
      
      // Eliminar la foto del array
      fotosProducto.splice(fotoIndex, 1);
      
      // Si era la principal y hay más fotos, establecer otra como principal
      if (eraPrincipal && fotosProducto.length > 0) {
        fotosProducto[0].EsPrincipal = true;
      }
      
      // Actualizar el campo FotosProductoBase en la tabla Productos
      await connection.query(
        `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
        [JSON.stringify(fotosProducto), producto.IdProducto]
      );
      
      await connection.commit();
      return { id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Establecer una foto como principal
  setPrincipal: async (idProducto, idFoto) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Obtener el producto
      const [productos] = await connection.query(
        `SELECT * FROM Productos WHERE IdProducto = ?`,
        [idProducto]
      );
      
      if (productos.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      const producto = productos[0];
      let fotosProducto = [];
      
      try {
        fotosProducto = JSON.parse(producto.FotosProductoBase || '[]');
      } catch (error) {
        throw new Error('Error al parsear las fotos del producto');
      }
      
      // Verificar que la foto existe
      const fotoIndex = fotosProducto.findIndex(foto => foto.IdFoto === idFoto);
      
      if (fotoIndex === -1) {
        throw new Error('Foto no encontrada en el producto');
      }
      
      // Actualizar todas las fotos para quitar el estado principal
      fotosProducto = fotosProducto.map(foto => ({
        ...foto,
        EsPrincipal: foto.IdFoto === idFoto
      }));
      
      // Actualizar el campo FotosProductoBase en la tabla Productos
      await connection.query(
        `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
        [JSON.stringify(fotosProducto), idProducto]
      );
      
      await connection.commit();
      return { idProducto, idFoto };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Reordenar fotos
  reordenar: async (idProducto, ordenFotos) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Obtener el producto
      const [productos] = await connection.query(
        `SELECT * FROM Productos WHERE IdProducto = ?`,
        [idProducto]
      );
      
      if (productos.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      const producto = productos[0];
      let fotosProducto = [];
      
      try {
        fotosProducto = JSON.parse(producto.FotosProductoBase || '[]');
      } catch (error) {
        throw new Error('Error al parsear las fotos del producto');
      }
      
      // Crear un mapa para actualizar los órdenes
      const ordenMap = new Map();
      ordenFotos.forEach(item => {
        ordenMap.set(item.IdFoto, item.Orden);
      });
      
      // Actualizar el orden de cada foto
      fotosProducto = fotosProducto.map(foto => {
        if (ordenMap.has(foto.IdFoto)) {
          return {
            ...foto,
            Orden: ordenMap.get(foto.IdFoto)
          };
        }
        return foto;
      });
      
      // Ordenar el array por el campo Orden
      fotosProducto.sort((a, b) => (a.Orden || 0) - (b.Orden || 0));
      
      // Actualizar el campo FotosProductoBase en la tabla Productos
      await connection.query(
        `UPDATE Productos SET FotosProductoBase = ? WHERE IdProducto = ?`,
        [JSON.stringify(fotosProducto), idProducto]
      );
      
      await connection.commit();
      return { idProducto, ordenFotos };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

// Modelo para atributos de productos
export const tiposAtributosModel = {
  // Obtener todos los tipos de atributos
  getAll: async () => {
    return await query(
      `SELECT * FROM TiposAtributos WHERE Estado = TRUE ORDER BY Nombre`
    );
  },
  
  // Obtener un tipo de atributo por ID
  getById: async (id) => {
    const tipos = await query(
      `SELECT * FROM TiposAtributos WHERE IdTipoAtributo = ?`,
      [id]
    );
    return tipos[0];
  },
  
  // Crear un nuevo tipo de atributo
  create: async (tipoData) => {
    const result = await query(
      `INSERT INTO TiposAtributos (Nombre, Descripcion, Estado) VALUES (?, ?, ?)`,
      [tipoData.Nombre, tipoData.Descripcion || null, tipoData.Estado || true]
    );
    return { id: result.insertId, ...tipoData };
  },
  
  // Actualizar un tipo de atributo
  update: async (id, tipoData) => {
    let query_str = `UPDATE TiposAtributos SET `;
    const params = [];
    
    if (tipoData.Nombre) {
      query_str += `Nombre = ?, `;
      params.push(tipoData.Nombre);
    }
    if (tipoData.Descripcion !== undefined) {
      query_str += `Descripcion = ?, `;
      params.push(tipoData.Descripcion);
    }
    if (tipoData.Estado !== undefined) {
      query_str += `Estado = ?, `;
      params.push(tipoData.Estado);
    }
    
    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ` WHERE IdTipoAtributo = ?`;
    params.push(id);
    
    await query(query_str, params);
    return { id, ...tipoData };
  },
  
  // Eliminar un tipo de atributo
  delete: async (id) => {
    // Verificar si hay valores asociados
    const valores = await query(
      `SELECT COUNT(*) as count FROM ValoresAtributos WHERE IdTipoAtributo = ?`,
      [id]
    );
    
    if (valores[0].count > 0) {
      throw new Error('No se puede eliminar el tipo de atributo porque tiene valores asociados');
    }
    
    await query(
      `DELETE FROM TiposAtributos WHERE IdTipoAtributo = ?`,
      [id]
    );
    return { id };
  },
  
  // Cambiar el estado de un tipo de atributo
  changeStatus: async (id, estado) => {
    await query(
      `UPDATE TiposAtributos SET Estado = ? WHERE IdTipoAtributo = ?`,
      [estado, id]
    );
    return { id, estado };
  }
};

export const valoresAtributosModel = {
  // Obtener todos los valores de atributos
  getAll: async () => {
    return await query(
      `SELECT v.*, t.Nombre as NombreTipoAtributo 
       FROM ValoresAtributos v
       JOIN TiposAtributos t ON v.IdTipoAtributo = t.IdTipoAtributo
       WHERE v.Estado = TRUE
       ORDER BY t.Nombre, v.Valor`
    );
  },
  
  // Obtener valores por tipo de atributo
  getByTipo: async (idTipoAtributo) => {
    return await query(
      `SELECT * FROM ValoresAtributos WHERE IdTipoAtributo = ? AND Estado = TRUE ORDER BY Valor`,
      [idTipoAtributo]
    );
  },
  
  // Obtener un valor de atributo por ID
  getById: async (id) => {
    const valores = await query(
      `SELECT v.*, t.Nombre as NombreTipoAtributo 
       FROM ValoresAtributos v
       JOIN TiposAtributos t ON v.IdTipoAtributo = t.IdTipoAtributo
       WHERE v.IdValorAtributo = ?`,
      [id]
    );
    return valores[0];
  },
  
  // Crear un nuevo valor de atributo
  create: async (valorData) => {
    // Verificar que el tipo de atributo existe
    const tipo = await query(
      `SELECT * FROM TiposAtributos WHERE IdTipoAtributo = ?`,
      [valorData.IdTipoAtributo]
    );
    
    if (tipo.length === 0) {
      throw new Error('Tipo de atributo no encontrado');
    }
    
    const result = await query(
      `INSERT INTO ValoresAtributos (IdTipoAtributo, Valor, Estado) VALUES (?, ?, ?)`,
      [valorData.IdTipoAtributo, valorData.Valor, valorData.Estado || true]
    );
    return { id: result.insertId, ...valorData };
  },
  
  // Actualizar un valor de atributo
  update: async (id, valorData) => {
    let query_str = `UPDATE ValoresAtributos SET `;
    const params = [];
    
    if (valorData.IdTipoAtributo) {
      // Verificar que el tipo de atributo existe
      const tipo = await query(
        `SELECT * FROM TiposAtributos WHERE IdTipoAtributo = ?`,
        [valorData.IdTipoAtributo]
      );
      
      if (tipo.length === 0) {
        throw new Error('Tipo de atributo no encontrado');
      }
      
      query_str += `IdTipoAtributo = ?, `;
      params.push(valorData.IdTipoAtributo);
    }
    if (valorData.Valor) {
      query_str += `Valor = ?, `;
      params.push(valorData.Valor);
    }
    if (valorData.Estado !== undefined) {
      query_str += `Estado = ?, `;
      params.push(valorData.Estado);
    }
    
    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ` WHERE IdValorAtributo = ?`;
    params.push(id);
    
    await query(query_str, params);
    return { id, ...valorData };
  },
  
  // Eliminar un valor de atributo
  delete: async (id) => {
    // Verificar si hay productos asociados
    const productos = await query(
      `SELECT COUNT(*) as count FROM ProductoAtributos WHERE IdValorAtributo = ?`,
      [id]
    );
    
    if (productos[0].count > 0) {
      throw new Error('No se puede eliminar el valor de atributo porque está asociado a productos');
    }
    
    await query(
      `DELETE FROM ValoresAtributos WHERE IdValorAtributo = ?`,
      [id]
    );
    return { id };
  },
  
  // Cambiar el estado de un valor de atributo
  changeStatus: async (id, estado) => {
    await query(
      `UPDATE ValoresAtributos SET Estado = ? WHERE IdValorAtributo = ?`,
      [estado, id]
    );
    return { id, estado };
  }
};

export const productoAtributosModel = {
  // Obtener atributos de un producto
  getByProducto: async (idProducto) => {
    return await query(
      `SELECT pa.*, ta.Nombre as NombreTipoAtributo, va.Valor
       FROM ProductoAtributos pa
       JOIN TiposAtributos ta ON pa.IdTipoAtributo = ta.IdTipoAtributo
       JOIN ValoresAtributos va ON pa.IdValorAtributo = va.IdValorAtributo
       WHERE pa.IdProducto = ?
       ORDER BY ta.Nombre`,
      [idProducto]
    );
  },
  
  // Asignar un atributo a un producto
  create: async (atributoData) => {
    // Verificar que no exista ya una asignación para este tipo de atributo
    const existente = await query(
      `SELECT * FROM ProductoAtributos 
       WHERE IdProducto = ? AND IdTipoAtributo = ?`,
      [atributoData.IdProducto, atributoData.IdTipoAtributo]
    );
    
    if (existente.length > 0) {
      throw new Error('El producto ya tiene un valor asignado para este tipo de atributo');
    }
    
    const result = await query(
      `INSERT INTO ProductoAtributos (IdProducto, IdTipoAtributo, IdValorAtributo) 
       VALUES (?, ?, ?)`,
      [atributoData.IdProducto, atributoData.IdTipoAtributo, atributoData.IdValorAtributo]
    );
    return { id: result.insertId, ...atributoData };
  },
  
  // Actualizar un atributo de producto
  update: async (id, atributoData) => {
    // Solo se permite actualizar el valor del atributo
    if (!atributoData.IdValorAtributo) {
      throw new Error('Se debe proporcionar el nuevo valor del atributo');
    }
    
    // Verificar que el valor pertenece al mismo tipo de atributo
    const [atributo] = await query(
      `SELECT pa.*, va.IdTipoAtributo as TipoActual
       FROM ProductoAtributos pa
       JOIN ValoresAtributos va ON pa.IdValorAtributo = va.IdValorAtributo
       WHERE pa.IdProductoAtributo = ?`,
      [id]
    );
    
    if (!atributo) {
      throw new Error('Atributo de producto no encontrado');
    }
    
    const [nuevoValor] = await query(
      `SELECT IdTipoAtributo FROM ValoresAtributos WHERE IdValorAtributo = ?`,
      [atributoData.IdValorAtributo]
    );
    
    if (!nuevoValor) {
      throw new Error('Valor de atributo no encontrado');
    }
    
    if (nuevoValor.IdTipoAtributo !== atributo.TipoActual) {
      throw new Error('El nuevo valor debe pertenecer al mismo tipo de atributo');
    }
    
    await query(
      `UPDATE ProductoAtributos SET IdValorAtributo = ? WHERE IdProductoAtributo = ?`,
      [atributoData.IdValorAtributo, id]
    );
    return { id, ...atributoData };
  },
  
  // Eliminar un atributo de producto
  delete: async (id) => {
    await query(
      `DELETE FROM ProductoAtributos WHERE IdProductoAtributo = ?`,
      [id]
    );
    return { id };
  },
  
  // Asignar múltiples atributos a un producto
  assignMultiple: async (idProducto, atributos) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      
      // Eliminar atributos existentes
      await connection.query(
        `DELETE FROM ProductoAtributos WHERE IdProducto = ?`,
        [idProducto]
      );
      
      // Insertar nuevos atributos
      for (const atributo of atributos) {
        await connection.query(
          `INSERT INTO ProductoAtributos (IdProducto, IdTipoAtributo, IdValorAtributo) 
           VALUES (?, ?, ?)`,
          [idProducto, atributo.IdTipoAtributo, atributo.IdValorAtributo]
        );
      }
      
      await connection.commit();
      return { idProducto, atributos };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};