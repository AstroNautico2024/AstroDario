// Importar los modelos
import { proveedoresModel, comprasModel, detalleComprasModel } from "../../Models/PurchaseService/purchases.model.js"
import { productosModel } from "../../Models/ProductService/products.model.js"
import { query, getConnection } from "../../Config/Database.js" // Añadida la importación de getConnection

// Controlador para proveedores
export const proveedoresController = {
  // Obtener todos los proveedores
  getAll: async (req, res) => {
    try {
      const proveedores = await proveedoresModel.getAll()
      res.status(200).json(proveedores)
    } catch (error) {
      console.error("Error al obtener proveedores:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener un proveedor por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const proveedor = await proveedoresModel.getById(id)

      if (!proveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      res.status(200).json(proveedor)
    } catch (error) {
      console.error("Error al obtener proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear un nuevo proveedor
  create: async (req, res) => {
    try {
      const proveedorData = req.body

      // Verificar si el Documento ya existe en lugar de NIT
      if (proveedorData.Documento) {
        const existingDocumento = await proveedoresModel.getByDocumento(proveedorData.Documento)
        if (existingDocumento) {
          return res.status(400).json({ message: "Ya existe un proveedor con ese Documento" })
        }
      }

      // Crear el proveedor
      const newProveedor = await proveedoresModel.create(proveedorData)

      res.status(201).json(newProveedor)
    } catch (error) {
      console.error("Error al crear proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un proveedor
  update: async (req, res) => {
    try {
      const { id } = req.params
      const proveedorData = req.body

      // Verificar si el proveedor existe
      const existingProveedor = await proveedoresModel.getById(id)
      if (!existingProveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      // Verificar si el Documento ya existe en lugar de NIT
      if (proveedorData.Documento && proveedorData.Documento !== existingProveedor.Documento) {
        const proveedorWithDocumento = await proveedoresModel.getByDocumento(proveedorData.Documento)
        if (proveedorWithDocumento) {
          return res.status(400).json({ message: "Ya existe un proveedor con ese Documento" })
        }
      }

      // Actualizar el proveedor
      const updatedProveedor = await proveedoresModel.update(id, proveedorData)

      res.status(200).json(updatedProveedor)
    } catch (error) {
      console.error("Error al actualizar proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Cambiar el estado de un proveedor
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si el proveedor existe
      const existingProveedor = await proveedoresModel.getById(id)
      if (!existingProveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      // Cambiar el estado
      const result = await proveedoresModel.changeStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar un proveedor
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el proveedor existe
      const existingProveedor = await proveedoresModel.getById(id)
      if (!existingProveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      // Verificar si hay compras asociadas
      const compras = await comprasModel.getByProveedor(id)
      if (compras.length > 0) {
        return res.status(400).json({
          message: "No se puede eliminar el proveedor porque tiene compras asociadas",
          compras,
        })
      }

      // Eliminar el proveedor
      await proveedoresModel.delete(id)

      res.status(200).json({ message: "Proveedor eliminado correctamente" })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Buscar proveedores
  search: async (req, res) => {
    try {
      const { term } = req.query

      if (!term) {
        return res.status(400).json({ message: "Término de búsqueda no proporcionado" })
      }

      const proveedores = await proveedoresModel.search(term)

      res.status(200).json(proveedores)
    } catch (error) {
      console.error("Error al buscar proveedores:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // NUEVAS FUNCIONES PARA CATÁLOGO DE PROVEEDORES
  
  // Obtener catálogo de un proveedor
  getCatalogo: async (req, res) => {
    try {
      const { id } = req.params
      
      // Verificar si el proveedor existe
      const proveedor = await proveedoresModel.getById(id)
      if (!proveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }
      
      // Consultar el catálogo del proveedor
      // Asumiendo que existe una tabla CatalogoProveedores o similar
      const [catalogo] = await query(`
        SELECT cp.*, p.NombreProducto, p.Descripcion, p.CodigoBarras, p.Stock, 
               p.PrecioVenta, p.Imagen, c.NombreCategoria
        FROM CatalogoProveedores cp
        JOIN Productos p ON cp.IdProducto = p.IdProducto
        LEFT JOIN CategoriasDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProducto
        WHERE cp.IdProveedor = ?
        AND cp.Estado = 1
      `, [id])
      
      // Si no existe la tabla, intentar con una consulta alternativa
      if (catalogo === undefined) {
        // Consulta alternativa: productos que han sido comprados a este proveedor
        const [productosComprados] = await query(`
          SELECT DISTINCT p.*, c.NombreCategoria,
                 MAX(dc.PrecioUnitario) as UltimoPrecioCompra
          FROM DetalleCompras dc
          JOIN Compras co ON dc.IdCompra = co.IdCompra
          JOIN Productos p ON dc.IdProducto = p.IdProducto
          LEFT JOIN CategoriasDeProductos c ON p.IdCategoriaDeProducto = c.IdCategoriaDeProducto
          WHERE co.IdProveedor = ?
          GROUP BY p.IdProducto, p.Estado, p.NombreProducto, p.Descripcion, p.CodigoBarras, 
                   p.Stock, p.PrecioVenta, p.Imagen, c.NombreCategoria
        `, [id])
        
        return res.status(200).json({
          proveedor: proveedor,
          productos: productosComprados || [],
          mensaje: "Catálogo generado a partir del historial de compras"
        })
      }
      
      res.status(200).json({
        proveedor: proveedor,
        productos: catalogo
      })
    } catch (error) {
      console.error("Error al obtener catálogo del proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
  
  // Agregar producto al catálogo de un proveedor
  addToCatalogo: async (req, res) => {
    let connection
    try {
      connection = await getConnection()
      await connection.beginTransaction()
      
      const { id } = req.params
      const { IdProducto, PrecioReferencia, Notas } = req.body
      
      // Verificar si el proveedor existe
      const [proveedores] = await connection.query(`SELECT * FROM Proveedores WHERE IdProveedor = ?`, [id])
      if (proveedores.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }
      
      // Verificar si el producto existe
      const [productos] = await connection.query(`SELECT * FROM Productos WHERE IdProducto = ?`, [IdProducto])
      if (productos.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Producto no encontrado" })
      }
      
      // Verificar si ya existe en el catálogo
      const [catalogoExistente] = await connection.query(`
        SELECT * FROM CatalogoProveedores 
        WHERE IdProveedor = ? AND IdProducto = ?
      `, [id, IdProducto])
      
      let resultado
      
      if (catalogoExistente.length > 0) {
        // Actualizar entrada existente
        await connection.query(`
          UPDATE CatalogoProveedores 
          SET PrecioReferencia = ?, Notas = ?, Estado = 1, FechaActualizacion = NOW()
          WHERE IdProveedor = ? AND IdProducto = ?
        `, [PrecioReferencia, Notas, id, IdProducto])
        
        resultado = {
          message: "Producto actualizado en el catálogo",
          IdProveedor: id,
          IdProducto: IdProducto,
          PrecioReferencia,
          Notas
        }
      } else {
        // Crear nueva entrada
        // Primero verificar si existe la tabla
        try {
          await connection.query(`
            INSERT INTO CatalogoProveedores 
            (IdProveedor, IdProducto, PrecioReferencia, Notas, Estado, FechaCreacion, FechaActualizacion)
            VALUES (?, ?, ?, ?, 1, NOW(), NOW())
          `, [id, IdProducto, PrecioReferencia, Notas])
          
          resultado = {
            message: "Producto agregado al catálogo",
            IdProveedor: id,
            IdProducto: IdProducto,
            PrecioReferencia,
            Notas
          }
        } catch (error) {
          // Si la tabla no existe, crear una relación alternativa
          if (error.code === 'ER_NO_SUCH_TABLE') {
            // Actualizar el producto para indicar que este proveedor lo suministra
            await connection.query(`
              UPDATE Productos 
              SET Origen = 'Proveedor', IdProveedorPrincipal = ?
              WHERE IdProducto = ?
            `, [id, IdProducto])
            
            resultado = {
              message: "Producto asociado al proveedor (método alternativo)",
              IdProveedor: id,
              IdProducto: IdProducto,
              PrecioReferencia,
              Notas
            }
          } else {
            throw error
          }
        }
      }
      
      await connection.commit()
      res.status(200).json(resultado)
    } catch (error) {
      if (connection) await connection.rollback()
      console.error("Error al agregar producto al catálogo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    } finally {
      if (connection) connection.release()
    }
  },
  
  // Eliminar producto del catálogo
  removeFromCatalogo: async (req, res) => {
    let connection
    try {
      connection = await getConnection()
      await connection.beginTransaction()
      
      const { id, productoId } = req.params
      
      // Verificar si el proveedor existe
      const [proveedores] = await connection.query(`SELECT * FROM Proveedores WHERE IdProveedor = ?`, [id])
      if (proveedores.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }
      
      // Verificar si el producto existe
      const [productos] = await connection.query(`SELECT * FROM Productos WHERE IdProducto = ?`, [productoId])
      if (productos.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Producto no encontrado" })
      }
      
      // Intentar eliminar de la tabla de catálogo
      try {
        await connection.query(`
          UPDATE CatalogoProveedores 
          SET Estado = 0, FechaActualizacion = NOW()
          WHERE IdProveedor = ? AND IdProducto = ?
        `, [id, productoId])
      } catch (error) {
        // Si la tabla no existe, usar método alternativo
        if (error.code === 'ER_NO_SUCH_TABLE') {
          // Verificar si este proveedor es el principal para este producto
          const [producto] = await connection.query(`
            SELECT * FROM Productos 
            WHERE IdProducto = ? AND IdProveedorPrincipal = ?
          `, [productoId, id])
          
          if (producto.length > 0) {
            // Quitar la asociación
            await connection.query(`
              UPDATE Productos 
              SET IdProveedorPrincipal = NULL
              WHERE IdProducto = ? AND IdProveedorPrincipal = ?
            `, [productoId, id])
          }
        } else {
          throw error
        }
      }
      
      await connection.commit()
      res.status(200).json({ 
        message: "Producto eliminado del catálogo",
        IdProveedor: id,
        IdProducto: productoId
      })
    } catch (error) {
      if (connection) await connection.rollback()
      console.error("Error al eliminar producto del catálogo:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    } finally {
      if (connection) connection.release()
    }
  }
}

// Controlador para compras
export const comprasController = {
  // Obtener todas las compras
  getAll: async (req, res) => {
    try {
      const compras = await comprasModel.getAll()
      res.status(200).json(compras)
    } catch (error) {
      console.error("Error al obtener compras:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener una compra por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const compra = await comprasModel.getById(id)

      if (!compra) {
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Obtener detalles de la compra
      const detalles = await detalleComprasModel.getByCompraId(id)

      // Combinar todo en un solo objeto
      const compraCompleta = {
        ...compra,
        detalles,
      }

      res.status(200).json(compraCompleta)
    } catch (error) {
      console.error("Error al obtener compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear una nueva compra
  create: async (req, res) => {
    let connection // Declarar la conexión fuera del try para poder acceder en catch/finally
    try {
      // Primero, desactivar temporalmente el modo only_full_group_by
      await query(`SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`)
      
      connection = await getConnection() // Usar la función importada
      await connection.beginTransaction()

      const { compra, detalles } = req.body

      // Verificar si el proveedor existe
      const [proveedores] = await connection.query(`SELECT * FROM Proveedores WHERE IdProveedor = ?`, [
        compra.IdProveedor,
      ])

      if (proveedores.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      // Crear la compra
      const [resultCompra] = await connection.query(
        `INSERT INTO Compras 
        (IdProveedor, FechaCompra, TotalMonto, TotalIva, TotalMontoConIva, Estado) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          compra.IdProveedor,
          compra.FechaCompra || new Date(),
          compra.TotalMonto || 0,
          compra.TotalIva || 0,
          compra.TotalMontoConIva || 0,
          compra.Estado || "Efectiva",
        ],
      )

      const idCompra = resultCompra.insertId

      // Crear detalles de la compra
      const detallesCreados = []
      let subtotal = 0
      let totalIva = 0

      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          // Verificar si el producto existe - MODIFICADO para evitar el error de GROUP BY
          const [productosResult] = await connection.query(`
            SELECT p.*, 
                  COALESCE(p.UnidadMedida, 'Unidad') as UnidadMedida,
                  COALESCE(p.FactorConversion, 1) as FactorConversion,
                  COALESCE(p.MargenGanancia, 30) as MargenGanancia,
                  COALESCE(p.PorcentajeIVA, 19) as PorcentajeIVA,
                  COALESCE(p.AplicaIVA, 1) as AplicaIVA
            FROM Productos p
            WHERE p.IdProducto = ?
          `, [detalle.IdProducto])

          if (productosResult.length === 0) {
            await connection.rollback()
            return res.status(404).json({ message: `Producto con ID ${detalle.IdProducto} no encontrado` })
          }

          const producto = productosResult[0]

          // Calcular subtotal e IVA
          const precioUnitario = detalle.PrecioUnitario
          const subtotalDetalle = precioUnitario * detalle.Cantidad
          let ivaUnitario = 0

          if (producto.AplicaIVA) {
            ivaUnitario = precioUnitario * (producto.PorcentajeIVA / 100)
          }

          const subtotalConIva = subtotalDetalle + ivaUnitario * detalle.Cantidad

          // Crear detalle
          const [resultDetalle] = await connection.query(
            `INSERT INTO DetalleCompras 
            (IdCompra, IdProducto, Cantidad, PrecioUnitario, Subtotal, IvaUnitario, SubtotalConIva, UnidadMedida, FactorConversion, CantidadConvertida, PrecioVentaSugerido) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              idCompra,
              detalle.IdProducto,
              detalle.Cantidad,
              precioUnitario,
              subtotalDetalle,
              ivaUnitario,
              subtotalConIva,
              producto.UnidadMedida,
              producto.FactorConversion,
              detalle.Cantidad * producto.FactorConversion,
              precioUnitario * (1 + producto.MargenGanancia / 100)
            ],
          )

          detallesCreados.push({
            id: resultDetalle.insertId,
            IdCompra: idCompra,
            IdProducto: detalle.IdProducto,
            Cantidad: detalle.Cantidad,
            PrecioUnitario: precioUnitario,
            Subtotal: subtotalDetalle,
            IvaUnitario: ivaUnitario,
            SubtotalConIva: subtotalConIva,
          })

          // Actualizar stock del producto
          await connection.query(`UPDATE Productos SET Stock = Stock + ? WHERE IdProducto = ?`, [
            detalle.Cantidad,
            detalle.IdProducto,
          ])

          // Acumular totales
          subtotal += subtotalDetalle
          totalIva += ivaUnitario * detalle.Cantidad
        }
      }

      const totalMonto = subtotal + totalIva

      // Actualizar totales de la compra
      await connection.query(
        `UPDATE Compras SET TotalMonto = ?, TotalIva = ?, TotalMontoConIva = ? WHERE IdCompra = ?`,
        [subtotal, totalIva, totalMonto, idCompra],
      )

      // Obtener la compra completa actualizada
      const [comprasActualizadas] = await connection.query(
        `SELECT c.*, p.NombreEmpresa
        FROM Compras c
        JOIN Proveedores p ON c.IdProveedor = p.IdProveedor
        WHERE c.IdCompra = ?`,
        [idCompra],
      )

      await connection.commit()

      // Responder con la compra completa
      res.status(201).json({
        compra: comprasActualizadas[0],
        detalles: detallesCreados,
      })
    } catch (error) {
      if (connection) await connection.rollback() // Verificar que connection existe antes de hacer rollback
      console.error("Error al crear compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    } finally {
      if (connection) connection.release() // Verificar que connection existe antes de liberarla
      
      // Restaurar el modo SQL original
      try {
        await query(`SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'))`)
      } catch (error) {
        console.error("Error al restaurar el modo SQL:", error)
      }
    }
  },

  // Actualizar una compra
  update: async (req, res) => {
    let connection
    try {
      // Desactivar temporalmente el modo only_full_group_by
      await query(`SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`)
      
      connection = await getConnection()
      await connection.beginTransaction()

      const { id } = req.params
      const { IdProveedor, FechaCompra, TotalMonto, TotalIva, TotalMontoConIva, Estado, detalles } = req.body

      // Verificar si la compra existe
      const [compras] = await connection.query(`SELECT * FROM Compras WHERE IdCompra = ?`, [id])

      if (compras.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Si se está actualizando el proveedor, verificar que exista
      if (IdProveedor) {
        const [proveedores] = await connection.query(`SELECT * FROM Proveedores WHERE IdProveedor = ?`, [IdProveedor])

        if (proveedores.length === 0) {
          await connection.rollback()
          return res.status(404).json({ message: "Proveedor no encontrado" })
        }
      }

      // Actualizar la compra
      await connection.query(
        `UPDATE Compras SET 
        IdProveedor = COALESCE(?, IdProveedor),
        FechaCompra = COALESCE(?, FechaCompra),
        TotalMonto = COALESCE(?, TotalMonto),
        TotalIva = COALESCE(?, TotalIva),
        TotalMontoConIva = COALESCE(?, TotalMontoConIva),
        Estado = COALESCE(?, Estado)
        WHERE IdCompra = ?`,
        [IdProveedor, FechaCompra, TotalMonto, TotalIva, TotalMontoConIva, Estado, id],
      )

      // Eliminar los detalles existentes
      await connection.query(`DELETE FROM DetalleCompras WHERE IdCompra = ?`, [id])

      // Insertar los nuevos detalles
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          // Verificar si el producto existe - MODIFICADO para evitar el error de GROUP BY
          const [productosResult] = await connection.query(`
            SELECT p.*, 
                  COALESCE(p.UnidadMedida, 'Unidad') as UnidadMedida,
                  COALESCE(p.FactorConversion, 1) as FactorConversion,
                  COALESCE(p.MargenGanancia, 30) as MargenGanancia,
                  COALESCE(p.PorcentajeIVA, 19) as PorcentajeIVA,
                  COALESCE(p.AplicaIVA, 1) as AplicaIVA
            FROM Productos p
            WHERE p.IdProducto = ?
          `, [detalle.IdProducto])

          if (productosResult.length === 0) {
            await connection.rollback()
            return res.status(404).json({ message: `Producto con ID ${detalle.IdProducto} no encontrado` })
          }

          const producto = productosResult[0]

          // Calcular IVA y subtotal con IVA
          const precioUnitario = detalle.PrecioUnitario
          const subtotal = precioUnitario * detalle.Cantidad
          let ivaUnitario = 0

          if (producto.AplicaIVA || detalle.iva > 0) {
            const porcentajeIva = detalle.iva !== undefined ? detalle.iva : producto.PorcentajeIVA
            ivaUnitario = precioUnitario * (porcentajeIva / 100)
          }

          const subtotalConIva = subtotal + ivaUnitario * detalle.Cantidad

          // Insertar el detalle
          await connection.query(
            `INSERT INTO DetalleCompras 
            (IdCompra, IdProducto, Cantidad, PrecioUnitario, Subtotal, IvaUnitario, SubtotalConIva, UnidadMedida, FactorConversion, CantidadConvertida, PrecioVentaSugerido) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              detalle.IdProducto,
              detalle.Cantidad,
              precioUnitario,
              subtotal,
              ivaUnitario,
              subtotalConIva,
              producto.UnidadMedida,
              producto.FactorConversion,
              detalle.Cantidad * producto.FactorConversion,
              precioUnitario * (1 + producto.MargenGanancia / 100)
            ],
          )

          // Actualizar stock del producto si es necesario
          // Nota: Esto depende de la lógica de negocio, si al actualizar una compra
          // se debe ajustar el stock o no
        }
      }

      await connection.commit()

      // Obtener la compra actualizada con sus detalles
      const compraActualizada = await comprasModel.getById(id)

      res.status(200).json(compraActualizada)
    } catch (error) {
      if (connection) await connection.rollback()
      console.error("Error al actualizar compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    } finally {
      if (connection) connection.release()
      
      // Restaurar el modo SQL original
      try {
        await query(`SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'))`)
      } catch (error) {
        console.error("Error al restaurar el modo SQL:", error)
      }
    }
  },

  // Cambiar el estado de una compra
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { Estado } = req.body

      // Verificar si la compra existe
      const existingCompra = await comprasModel.getById(id)
      if (!existingCompra) {
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Validar estado
      if (Estado !== "Efectiva" && Estado !== "Cancelada") {
        return res.status(400).json({ message: 'Estado no válido. Debe ser "Efectiva" o "Cancelada"' })
      }

      // Si se está cancelando una compra que estaba efectiva, revertir el stock
      if (Estado === "Cancelada" && existingCompra.Estado === "Efectiva") {
        // Obtener detalles de la compra
        const detalles = await detalleComprasModel.getByCompraId(id)

        // Revertir stock de cada producto
        for (const detalle of detalles) {
          await productosModel.updateStock(detalle.IdProducto, -detalle.Cantidad)
        }
      }

      // Cambiar el estado - CORREGIDO: usar updateStatus en lugar de changeStatus
      const result = await comprasModel.updateStatus(id, Estado)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error al cambiar estado de compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar una compra
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si la compra existe
      const existingCompra = await comprasModel.getById(id)
      if (!existingCompra) {
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Si la compra está efectiva, revertir el stock
      if (existingCompra.Estado === "Efectiva") {
        // Obtener detalles de la compra
        const detalles = await detalleComprasModel.getByCompraId(id)

        // Revertir stock de cada producto
        for (const detalle of detalles) {
          await productosModel.updateStock(detalle.IdProducto, -detalle.Cantidad)
        }
      }

      // Eliminar la compra (los detalles se eliminarán en cascada)
      await comprasModel.delete(id)

      res.status(200).json({ message: "Compra eliminada correctamente" })
    } catch (error) {
      console.error("Error al eliminar compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener compras por proveedor
  getByProveedor: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el proveedor existe
      const proveedor = await proveedoresModel.getById(id)
      if (!proveedor) {
        return res.status(404).json({ message: "Proveedor no encontrado" })
      }

      // Obtener compras
      const compras = await comprasModel.getByProveedor(id)

      res.status(200).json(compras)
    } catch (error) {
      console.error("Error al obtener compras del proveedor:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener compras por usuario (modificada para evitar errores)
  getByUsuario: async (req, res) => {
    try {
      const { id } = req.params

      // CORREGIDO: Eliminar la validación de usuario

      // Obtener todas las compras (ya que no hay relación con usuarios)
      const compras = await comprasModel.getByUsuario(id)

      res.status(200).json(compras)
    } catch (error) {
      console.error("Error al obtener compras del usuario:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener compras por fecha
  getByFecha: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query

      // Validar fechas
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: "Se requieren fechaInicio y fechaFin" })
      }

      // Obtener compras
      const compras = await comprasModel.getByFecha(fechaInicio, fechaFin)

      res.status(200).json(compras)
    } catch (error) {
      console.error("Error al obtener compras por fecha:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener compras por estado
  getByEstado: async (req, res) => {
    try {
      const { estado } = req.params

      // Validar estado
      if (estado !== "Efectiva" && estado !== "Cancelada") {
        return res.status(400).json({ message: 'Estado no válido. Debe ser "Efectiva" o "Cancelada"' })
      }

      // Obtener compras
      const compras = await comprasModel.getByEstado(estado)

      res.status(200).json(compras)
    } catch (error) {
      console.error("Error al obtener compras por estado:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

// Controlador para detalles de compras
export const detalleComprasController = {
  // Obtener detalles de una compra
  getByCompra: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si la compra existe
      const compra = await comprasModel.getById(id)
      if (!compra) {
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Obtener detalles
      const detalles = await detalleComprasModel.getByCompraId(id)

      res.status(200).json(detalles)
    } catch (error) {
      console.error("Error al obtener detalles de compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear un nuevo detalle de compra
  create: async (req, res) => {
    try {
      // Desactivar temporalmente el modo only_full_group_by
      await query(`SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`)
      
      const detalleData = req.body

      // Verificar si la compra existe
      const compra = await comprasModel.getById(detalleData.IdCompra)
      if (!compra) {
        return res.status(404).json({ message: "Compra no encontrada" })
      }

      // Verificar si el producto existe - MODIFICADO para evitar el error de GROUP BY
      const [productosResult] = await query(`
        SELECT p.*, 
              COALESCE(p.UnidadMedida, 'Unidad') as UnidadMedida,
              COALESCE(p.FactorConversion, 1) as FactorConversion,
              COALESCE(p.MargenGanancia, 30) as MargenGanancia,
              COALESCE(p.PorcentajeIVA, 19) as PorcentajeIVA,
              COALESCE(p.AplicaIVA, 1) as AplicaIVA
        FROM Productos p
        WHERE p.IdProducto = ?
      `, [detalleData.IdProducto])

      if (productosResult.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      const producto = productosResult[0]

      // Calcular subtotal e IVA
      const precioUnitario = detalleData.PrecioUnitario
      const subtotal = precioUnitario * detalleData.Cantidad
      let ivaUnitario = 0

      if (producto.AplicaIVA) {
        ivaUnitario = precioUnitario * (producto.PorcentajeIVA / 100)
      }

      const subtotalConIva = subtotal + ivaUnitario * detalleData.Cantidad
      const factorConversion = producto.FactorConversion || 1
      const cantidadConvertida = detalleData.Cantidad * factorConversion
      const precioVentaSugerido = precioUnitario * (1 + (producto.MargenGanancia || 30) / 100)

      // Crear detalle con los campos correctos
      const detalleCreado = await detalleComprasModel.create(detalleData.IdCompra, {
        IdProducto: detalleData.IdProducto,
        Cantidad: detalleData.Cantidad,
        PrecioUnitario: precioUnitario,
        Subtotal: subtotal,
        IvaUnitario: ivaUnitario,
        SubtotalConIva: subtotalConIva,
        UnidadMedida: producto.UnidadMedida || 'Unidad',
        FactorConversion: factorConversion,
        CantidadConvertida: cantidadConvertida,
        PrecioVentaSugerido: precioVentaSugerido
      })

      // Actualizar stock del producto
      await productosModel.updateStock(detalleData.IdProducto, detalleData.Cantidad)

      // Actualizar totales de la compra
      const detalles = await detalleComprasModel.getByCompraId(detalleData.IdCompra)

      let subtotalCompra = 0
      let totalIva = 0

      // Sumar totales de detalles
      for (const detalle of detalles) {
        subtotalCompra += detalle.Subtotal || 0
        totalIva += (detalle.IvaUnitario || 0) * detalle.Cantidad
      }

      const totalMontoConIva = subtotalCompra + totalIva

      // Actualizar compra
      await comprasModel.update(detalleData.IdCompra, {
        TotalMonto: subtotalCompra,
        TotalIva: totalIva,
        TotalMontoConIva: totalMontoConIva
      })

      res.status(201).json(detalleCreado)
      
      // Restaurar el modo SQL original
      await query(`SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'))`)
    } catch (error) {
      console.error("Error al crear detalle de compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un detalle de compra
  update: async (req, res) => {
    let connection // Declarar la conexión fuera del try para poder acceder en catch/finally
    try {
      // Desactivar temporalmente el modo only_full_group_by
      await query(`SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`)
      
      connection = await getConnection() // Usar la función importada
      await connection.beginTransaction()

      const { id } = req.params
      const detalleData = req.body

      // Obtener el detalle actual
      const [detallesActuales] = await connection.query(`SELECT * FROM DetalleCompras WHERE IdDetalleCompras = ?`, [id])

      if (detallesActuales.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Detalle de compra no encontrado" })
      }

      const detalleActual = detallesActuales[0]

      // Verificar si el producto existe - MODIFICADO para evitar el error de GROUP BY
      const [productosResult] = await connection.query(`
        SELECT p.*, 
              COALESCE(p.UnidadMedida, 'Unidad') as UnidadMedida,
              COALESCE(p.FactorConversion, 1) as FactorConversion,
              COALESCE(p.MargenGanancia, 30) as MargenGanancia,
              COALESCE(p.PorcentajeIVA, 19) as PorcentajeIVA,
              COALESCE(p.AplicaIVA, 1) as AplicaIVA
        FROM Productos p
        WHERE p.IdProducto = ?
      `, [detalleData.IdProducto || detalleActual.IdProducto])

      if (productosResult.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      const producto = productosResult[0]

      // Calcular diferencia de cantidad para actualizar stock
      const diferenciaCantidad = (detalleData.Cantidad || detalleActual.Cantidad) - detalleActual.Cantidad

      // Calcular subtotal e IVA
      const precioUnitario = detalleData.PrecioUnitario || detalleActual.PrecioUnitario
      const cantidad = detalleData.Cantidad || detalleActual.Cantidad
      const subtotal = precioUnitario * cantidad
      let ivaUnitario = 0

      if (producto.AplicaIVA) {
        ivaUnitario = precioUnitario * (producto.PorcentajeIVA / 100)
      }

      const subtotalConIva = subtotal + ivaUnitario * cantidad

      // Actualizar detalle
      await connection.query(
        `UPDATE DetalleCompras SET 
        IdProducto = ?, Cantidad = ?, PrecioUnitario = ?, Subtotal = ?, IvaUnitario = ?, SubtotalConIva = ?,
        UnidadMedida = ?, FactorConversion = ?, CantidadConvertida = ?, PrecioVentaSugerido = ?
        WHERE IdDetalleCompras = ?`,
        [
          detalleData.IdProducto || detalleActual.IdProducto,
          cantidad,
          precioUnitario,
          subtotal,
          ivaUnitario,
          subtotalConIva,
          producto.UnidadMedida,
          producto.FactorConversion,
          cantidad * producto.FactorConversion,
          precioUnitario * (1 + producto.MargenGanancia / 100),
          id,
        ],
      )

      // Actualizar stock del producto
      if (diferenciaCantidad !== 0) {
        await connection.query(`UPDATE Productos SET Stock = Stock + ? WHERE IdProducto = ?`, [
          diferenciaCantidad,
          detalleActual.IdProducto,
        ])
      }

      // Actualizar totales de la compra
      const [detallesActualizados] = await connection.query(`SELECT * FROM DetalleCompras WHERE IdCompra = ?`, [
        detalleActual.IdCompra,
      ])

      let subtotalCompra = 0
      let totalIva = 0

      // Sumar totales de detalles
      for (const detalle of detallesActualizados) {
        subtotalCompra += detalle.Subtotal || 0
        totalIva += (detalle.IvaUnitario || 0) * detalle.Cantidad
      }

      const totalMontoConIva = subtotalCompra + totalIva

      // Actualizar compra
      await connection.query(
        `UPDATE Compras SET TotalMonto = ?, TotalIva = ?, TotalMontoConIva = ? WHERE IdCompra = ?`,
        [subtotalCompra, totalIva, totalMontoConIva, detalleActual.IdCompra],
      )

      await connection.commit()

      res.status(200).json({
        id,
        IdCompra: detalleActual.IdCompra,
        IdProducto: detalleData.IdProducto || detalleActual.IdProducto,
        Cantidad: cantidad,
        PrecioUnitario: precioUnitario,
        Subtotal: subtotal,
        IvaUnitario: ivaUnitario,
        SubtotalConIva: subtotalConIva,
        UnidadMedida: producto.UnidadMedida,
        FactorConversion: producto.FactorConversion,
        CantidadConvertida: cantidad * producto.FactorConversion,
        PrecioVentaSugerido: precioUnitario * (1 + producto.MargenGanancia / 100)
      })
    } catch (error) {
      if (connection) await connection.rollback() // Verificar que connection existe antes de hacer rollback
      console.error("Error al actualizar detalle de compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    } finally {
      if (connection) connection.release() // Verificar que connection existe antes de liberarla
      
      // Restaurar el modo SQL original
      try {
        await query(`SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'))`)
      } catch (error) {
        console.error("Error al restaurar el modo SQL:", error)
      }
    }
  },

  // Eliminar un detalle de compra
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Obtener el detalle actual
      const detalles = await query(`SELECT * FROM DetalleCompras WHERE IdDetalleCompras = ?`, [id])

      if (detalles.length === 0) {
        return res.status(404).json({ message: "Detalle de compra no encontrado" })
      }

      const detalleActual = detalles[0]

      // Actualizar stock del producto (restar)
      await productosModel.updateStock(detalleActual.IdProducto, -detalleActual.Cantidad)

      // Eliminar el detalle
      await detalleComprasModel.delete(id)

      // Actualizar totales de la compra
      const detallesActualizados = await detalleComprasModel.getByCompraId(detalleActual.IdCompra)

      let subtotalCompra = 0
      let totalIva = 0

      // Sumar totales de detalles
      for (const detalle of detallesActualizados) {
        subtotalCompra += detalle.Subtotal || 0
        totalIva += (detalle.IvaUnitario || 0) * detalle.Cantidad
      }

      const totalMontoConIva = subtotalCompra + totalIva

      // Actualizar compra
      await comprasModel.update(detalleActual.IdCompra, {
        TotalMonto: subtotalCompra,
        TotalIva: totalIva,
        TotalMontoConIva: totalMontoConIva
      })

      res.status(200).json({ message: "Detalle de compra eliminado correctamente" })
    } catch (error) {
      console.error("Error al eliminar detalle de compra:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

export default {
  proveedores: proveedoresController,
  compras: comprasController,
  detalleCompras: detalleComprasController,
}