import { Router } from "express";
import { CarritoController } from "../../Controllers/CarritoService/Carrito.controller.js";

const router = Router();

// Obtener carrito de un cliente
router.get("/:idCliente", CarritoController.getCarrito);

// Agregar producto al carrito
router.post("/:idCliente", CarritoController.addItem);

// Actualizar cantidad de un producto
router.put("/:idCliente/:IdProducto", CarritoController.updateItem);

// Eliminar producto del carrito
router.delete("/:idCliente/:IdProducto", CarritoController.removeItem);

// Vaciar carrito
router.delete("/:idCliente", CarritoController.clearCarrito);

export default router;