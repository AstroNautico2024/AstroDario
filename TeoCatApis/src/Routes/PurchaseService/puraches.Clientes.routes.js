import express from 'express';
import { clienteComprasController } from '../../Controllers/PurchaseService/client-purchases.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';
import { uploadMiddleware } from '../../Middlewares/upload.middleware.js';

const router = express.Router();

// Rutas para compras de clientes
router.get('/cliente/compras', authMiddleware, clienteComprasController.getMisCompras);
router.get('/cliente/compras/:id', authMiddleware, clienteComprasController.getCompraById);
router.post(
  '/cliente/compras',
  authMiddleware,
  uploadMiddleware.single('ComprobantePago'),
  clienteComprasController.createCompra
);
router.put(
  '/cliente/compras/:id/comprobante',
  authMiddleware,
  uploadMiddleware.single('ComprobantePago'),
  clienteComprasController.actualizarComprobante
);
router.get('/cliente/compras/:id/estado', authMiddleware, clienteComprasController.verificarEstadoCompra);

export default router;