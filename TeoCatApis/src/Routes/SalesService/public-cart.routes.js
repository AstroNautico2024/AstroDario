import express from 'express';
import { ventasController } from '../../Controllers/SalesService/sales.controller.js';

const router = express.Router();

// Rutas públicas para el carrito
router.get('/carrito', ventasController.getCarrito);
router.post('/carrito', ventasController.addToCarrito);
router.put('/carrito/:id', ventasController.updateCarritoItem);
router.delete('/carrito/:id', ventasController.removeFromCarrito);
router.delete('/carrito', ventasController.clearCarrito);

// Ruta para checkout (debe llamarse igual que en el controller: "create")
router.post('/ventas', ventasController.create);

export default router;