import { query } from "../../Config/Database.js";

export const CarritoModel = {
  // Obtiene el carrito activo de un cliente (crea uno si no existe)
  async getOrCreateCarritoByCliente(IdCliente) {
    let [carritos] = await query(
      "SELECT * FROM Carritos WHERE IdCliente = ? AND Estado = 'Activo' LIMIT 1",
      [IdCliente]
    );
    if (!carritos) {
      const result = await query(
        "INSERT INTO Carritos (IdCliente) VALUES (?)",
        [IdCliente]
      );
      const [nuevo] = await query("SELECT * FROM Carritos WHERE IdCarrito = ?", [result.insertId]);
      return nuevo;
    }
    return carritos;
  },

  // Obtiene los items del carrito activo de un cliente
  async getItemsByCliente(IdCliente) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    if (!carrito) return [];
    return await query(
      `SELECT ci.*, p.NombreProducto, p.FotosProductoBase, p.PrecioVenta
       FROM CarritoItems ci
       JOIN Productos p ON ci.IdProducto = p.IdProducto
       WHERE ci.IdCarrito = ?`,
      [carrito.IdCarrito]
    );
  },

  // Agrega un producto al carrito (si ya existe, suma cantidad)
  async addItem(IdCliente, IdProducto, Cantidad, PrecioUnitario) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    // ¿Ya existe ese producto en el carrito?
    const [item] = await query(
      "SELECT * FROM CarritoItems WHERE IdCarrito = ? AND IdProducto = ?",
      [carrito.IdCarrito, IdProducto]
    );
    if (item) {
      // Sumar cantidad
      await query(
        "UPDATE CarritoItems SET Cantidad = Cantidad + ? WHERE IdCarrito = ? AND IdProducto = ?",
        [Cantidad, carrito.IdCarrito, IdProducto]
      );
    } else {
      // Insertar nuevo
      await query(
        "INSERT INTO CarritoItems (IdCarrito, IdProducto, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)",
        [carrito.IdCarrito, IdProducto, Cantidad, PrecioUnitario]
      );
    }
    return true;
  },

  // Actualiza la cantidad de un item
  async updateItem(IdCliente, IdProducto, Cantidad) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "UPDATE CarritoItems SET Cantidad = ? WHERE IdCarrito = ? AND IdProducto = ?",
      [Cantidad, carrito.IdCarrito, IdProducto]
    );
    return true;
  },

  // Elimina un item del carrito
  async removeItem(IdCliente, IdProducto) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "DELETE FROM CarritoItems WHERE IdCarrito = ? AND IdProducto = ?",
      [carrito.IdCarrito, IdProducto]
    );
    return true;
  },

  // Vacía el carrito
  async clearCarrito(IdCliente) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "DELETE FROM CarritoItems WHERE IdCarrito = ?",
      [carrito.IdCarrito]
    );
    return true;
  }
};

import express from "express";
import { CarritoController } from "../../Controllers/CarritoService/Carrito.controller.js";
import { authMiddleware } from "../../Middlewares/auth.middleware.js";
import { validatePermission } from "../../Middlewares/permission.middleware.js";

const router = express.Router();

// ==== RUTAS PARA EL CLIENTE AUTENTICADO (usa el idCliente del token) ====

// Obtener todos los items del carrito del usuario autenticado
router.get(
  "/",
  authMiddleware,
  CarritoController.getCarritoAuth
);

// Agregar un producto al carrito del usuario autenticado
router.post(
  "/",
  authMiddleware,
  CarritoController.addItemAuth
);

// Actualizar cantidad de un producto en el carrito del usuario autenticado
router.put(
  "/:IdProducto",
  authMiddleware,
  CarritoController.updateItemAuth
);

// Eliminar un producto del carrito del usuario autenticado
router.delete(
  "/:IdProducto",
  authMiddleware,
  CarritoController.removeItemAuth
);

// Vaciar el carrito del usuario autenticado
router.delete(
  "/",
  authMiddleware,
  CarritoController.clearCarritoAuth
);

// ==== RUTAS ADMINISTRATIVAS (requieren permisos y el idCliente explícito) ====

// Obtener el carrito de un cliente específico
router.get(
  "/admin/:idCliente",
  authMiddleware,
  validatePermission("Visualizar Carritos"),
  CarritoController.getCarrito
);

// Agregar producto al carrito de un cliente específico
router.post(
  "/admin/:idCliente",
  authMiddleware,
  validatePermission("Modificar Carritos"),
  CarritoController.addItem
);

// Actualizar cantidad de un producto en el carrito de un cliente específico
router.put(
  "/admin/:idCliente/:IdProducto",
  authMiddleware,
  validatePermission("Modificar Carritos"),
  CarritoController.updateItem
);

// Eliminar un producto del carrito de un cliente específico
router.delete(
  "/admin/:idCliente/:IdProducto",
  authMiddleware,
  validatePermission("Modificar Carritos"),
  CarritoController.removeItem
);

// Vaciar el carrito de un cliente específico
router.delete(
  "/admin/:idCliente",
  authMiddleware,
  validatePermission("Modificar Carritos"),
  CarritoController.clearCarrito
);

export default router;