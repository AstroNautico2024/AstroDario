import express from 'express';
import { ventasController, detalleVentasController, detalleVentasServiciosController } from '../../Controllers/SalesService/sales.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';
import { validatePermission } from '../../Middlewares/permission.middleware.js';
import { uploadMiddleware, handleMulterError } from '../../Middlewares/upload.middleware.js';
import { validateSaleData, validateReceiptFile } from '../../Middlewares/sales.middleware.js';


const router = express.Router();

// Rutas de ventas
router.get('/ventas', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getAll);
router.get('/ventas/cliente/:id', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getByCliente);
router.get('/ventas/usuario/:id', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getByUsuario);
router.get('/ventas/fecha', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getByFecha);
router.get('/ventas/estado/:estado', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getByEstado);
router.get('/ventas/tipo/:tipo', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getByTipo);
router.get('/ventas/:id', authMiddleware, validatePermission('Visualizar Ventas'), ventasController.getById);
router.post('/ventas', authMiddleware, validatePermission('Crear Ventas'), uploadMiddleware.single('ComprobantePago'), validateReceiptFile, validateSaleData, ventasController.create);
router.put('/ventas/:id', authMiddleware, validatePermission('Modificar Ventas'), uploadMiddleware.single('ComprobantePago'), validateReceiptFile, ventasController.update);
router.patch('/ventas/:id/status', authMiddleware, validatePermission('Cambiar Estado Ventas'), ventasController.changeStatus);
router.delete('/ventas/:id', authMiddleware, validatePermission('Eliminar Ventas'), ventasController.delete);

// Rutas de detalles de ventas (productos)
router.get('/ventas/:id/detalles', authMiddleware, validatePermission('Visualizar Ventas'), detalleVentasController.getByVenta);
router.post('/detalles-ventas', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasController.create);
router.put('/detalles-ventas/:id', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasController.update);
router.delete('/detalles-ventas/:id', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasController.delete);

// Rutas de detalles de ventas de servicios
router.get('/ventas/:id/detalles-servicios', authMiddleware, validatePermission('Visualizar Ventas'), detalleVentasServiciosController.getByVenta);
router.post('/detalles-ventas-servicios', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasServiciosController.create);
router.put('/detalles-ventas-servicios/:id', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasServiciosController.update);
router.delete('/detalles-ventas-servicios/:id', authMiddleware, validatePermission('Modificar Ventas'), detalleVentasServiciosController.delete);

// Rutas para Consumidor Final y Mascota Genérica
router.get('/consumidor-final', authMiddleware, ventasController.getConsumidorFinal);
router.get('/mascota-generica', authMiddleware, ventasController.getMascotaGenerica);

// Ruta para registrar devoluciones
router.post('/devoluciones', authMiddleware, validatePermission('Crear Ventas'), ventasController.registrarDevolucion);


export default router;