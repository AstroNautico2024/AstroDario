import express from 'express';
import { categoriasController, productosController } from '../../Controllers/ProductService/products.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';
import { validatePermission } from '../../Middlewares/permission.middleware.js';
import { uploadMiddleware } from '../../Middlewares/upload.middleware.js';

const router = express.Router();

// Rutas para categorías de productos
router.get('/categorias', authMiddleware, validatePermission('Visualizar Categorías'), categoriasController.getAll);
router.get('/categorias/search', authMiddleware, validatePermission('Visualizar Categorías'), categoriasController.search);
router.get('/categorias/:id', authMiddleware, validatePermission('Visualizar Categorías'), categoriasController.getById);
router.get('/categorias/:id/productos', authMiddleware, validatePermission('Visualizar Categorias'), categoriasController.getProducts);
router.post('/categorias', authMiddleware, validatePermission('Crear Categorías'), categoriasController.create);
router.put('/categorias/:id', authMiddleware, validatePermission('Modificar Categorías'), categoriasController.update);
router.patch('/categorias/:id/status', authMiddleware, validatePermission('Cambiar Estado Categorías'), categoriasController.changeStatus);
router.delete('/categorias/:id', authMiddleware, validatePermission('Eliminar Categorías'), categoriasController.delete);


// Rutas para productos
router.get('/productos', authMiddleware, validatePermission('Visualizar Productos'), productosController.getAll);
router.get('/productos/search', authMiddleware, validatePermission('Visualizar Productos'), productosController.search);
router.get('/productos/low-stock', authMiddleware, validatePermission('Visualizar Productos'), productosController.getLowStock);
router.get('/productos/near-expiry', authMiddleware, validatePermission('Visualizar Productos'), productosController.getNearExpiry);
router.get('/productos/:id', authMiddleware, validatePermission('Visualizar Productos'), productosController.getById);
router.get('/productos/categoria/:id', authMiddleware, validatePermission('Visualizar Productos'), productosController.getByCategoria);
router.post('/productos', authMiddleware, validatePermission('Crear Productos'), uploadMiddleware.single('imagen'), productosController.create);
router.put('/productos/:id', authMiddleware, validatePermission('Modificar Productos'), uploadMiddleware.single('imagen'), productosController.update);
router.patch('/productos/:id/status', authMiddleware, validatePermission('Cambiar Estado Productos'), productosController.changeStatus);
router.patch('/productos/:id/stock', authMiddleware, validatePermission('Modificar Stock'), productosController.updateStock);
router.delete('/productos/:id', authMiddleware, validatePermission('Eliminar Productos'), productosController.delete);

export default router;