import express from 'express';
import { categoriasController, productosController, fotosProductoController, tiposAtributosController, valoresAtributosController, productoAtributosController } from '../../Controllers/ProductService/products.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';
import { validatePermission } from '../../Middlewares/permission.middleware.js';
import { uploadMiddleware } from '../../Middlewares/upload.middleware.js';

const router = express.Router();

// Rutas para categorías de productos (existentes)
router.get('/categorias', authMiddleware, validatePermission('Visualizar Categorias'), categoriasController.getAll);
router.get('/categorias/search', authMiddleware, validatePermission('Visualizar Categorias'), categoriasController.search);
router.get('/categorias/:id', authMiddleware, validatePermission('Visualizar Categorias'), categoriasController.getById);
router.get('/categorias/:id/productos', authMiddleware, validatePermission('Visualizar Categorias'), categoriasController.getProducts);
router.post('/categorias', authMiddleware, validatePermission('Crear Categorias'), categoriasController.create);
router.put('/categorias/:id', authMiddleware, validatePermission('Modificar Categorias'), categoriasController.update);
router.patch('/categorias/:id/status', authMiddleware, validatePermission('Cambiar Estado Categorias'), categoriasController.changeStatus);
router.delete('/categorias/:id', authMiddleware, validatePermission('Eliminar Categorias'), categoriasController.delete);

// Nuevas rutas para tipos de atributos
router.get('/atributos/tipos', authMiddleware, validatePermission('Visualizar Productos'), tiposAtributosController.getAll);
router.get('/atributos/tipos/:id', authMiddleware, validatePermission('Visualizar Productos'), tiposAtributosController.getById);
router.post('/atributos/tipos', authMiddleware, validatePermission('Crear Productos'), tiposAtributosController.create);
router.put('/atributos/tipos/:id', authMiddleware, validatePermission('Modificar Productos'), tiposAtributosController.update);
router.delete('/atributos/tipos/:id', authMiddleware, validatePermission('Eliminar Productos'), tiposAtributosController.delete);
router.patch('/atributos/tipos/:id/status', authMiddleware, validatePermission('Cambiar Estado Productos'), tiposAtributosController.changeStatus);

// Nuevas rutas para valores de atributos
router.get('/atributos/valores', authMiddleware, validatePermission('Visualizar Productos'), valoresAtributosController.getAll);
router.get('/atributos/tipos/:id/valores', authMiddleware, validatePermission('Visualizar Productos'), valoresAtributosController.getByTipo);
router.get('/atributos/valores/:id', authMiddleware, validatePermission('Visualizar Productos'), valoresAtributosController.getById);
router.post('/atributos/valores', authMiddleware, validatePermission('Crear Productos'), valoresAtributosController.create);
router.put('/atributos/valores/:id', authMiddleware, validatePermission('Modificar Productos'), valoresAtributosController.update);
router.delete('/atributos/valores/:id', authMiddleware, validatePermission('Eliminar Productos'), valoresAtributosController.delete);
router.patch('/atributos/valores/:id/status', authMiddleware, validatePermission('Cambiar Estado Productos'), valoresAtributosController.changeStatus);

// Rutas para productos (existentes y actualizadas)
router.get('/productos', authMiddleware, validatePermission('Visualizar Productos'), productosController.getAll);
router.get('/productos/search', authMiddleware, validatePermission('Visualizar Productos'), productosController.search);
router.get('/productos/low-stock', authMiddleware, validatePermission('Visualizar Productos'), productosController.getLowStock);
router.get('/productos/near-expiry', authMiddleware, validatePermission('Visualizar Productos'), productosController.getNearExpiry);
router.get('/productos/:id', authMiddleware, validatePermission('Visualizar Productos'), productosController.getById);
router.get('/productos/categoria/:id', authMiddleware, validatePermission('Visualizar Productos'), productosController.getByCategoria);
router.post('/productos', authMiddleware, validatePermission('Crear Productos'), uploadMiddleware.single('imagen'), productosController.create);
router.put('/productos/:id', authMiddleware, validatePermission('Modificar Productos'), uploadMiddleware.single('imagen'), productosController.update);
router.patch('/productos/:id/status', authMiddleware, validatePermission('Cambiar Estado Productos'), productosController.changeStatus);
router.patch('/productos/:id/stock', authMiddleware, validatePermission('Modificar Productos'), productosController.updateStock);
router.delete('/productos/:id', authMiddleware, validatePermission('Eliminar Productos'), productosController.delete);

// Nuevas rutas para fotos de productos
router.get('/productos/:idProducto/fotos', authMiddleware, validatePermission('Visualizar Productos'), fotosProductoController.getByProducto);
router.post('/productos/:idProducto/fotos', authMiddleware, validatePermission('Modificar Productos'), uploadMiddleware.single('imagen'), fotosProductoController.create);
router.get('/fotos/:id', authMiddleware, validatePermission('Visualizar Productos'), fotosProductoController.getById);
router.put('/fotos/:id', authMiddleware, validatePermission('Modificar Productos'), uploadMiddleware.single('imagen'), fotosProductoController.update);
router.delete('/fotos/:id', authMiddleware, validatePermission('Modificar Productos'), fotosProductoController.delete);
router.patch('/productos/:idProducto/fotos/:idFoto/principal', authMiddleware, validatePermission('Modificar Productos'), fotosProductoController.setPrincipal);
router.patch('/productos/:idProducto/fotos/reordenar', authMiddleware, validatePermission('Modificar Productos'), fotosProductoController.reordenar);

// Nuevas rutas para atributos de productos
router.get('/productos/:idProducto/atributos', authMiddleware, validatePermission('Visualizar Productos'), productoAtributosController.getByProducto);
router.post('/productos/:idProducto/atributos', authMiddleware, validatePermission('Modificar Productos'), productoAtributosController.create);
router.put('/atributos/:id', authMiddleware, validatePermission('Modificar Productos'), productoAtributosController.update);
router.delete('/atributos/:id', authMiddleware, validatePermission('Modificar Productos'), productoAtributosController.delete);
router.post('/productos/:idProducto/atributos/multiple', authMiddleware, validatePermission('Modificar Productos'), productoAtributosController.assignMultiple);

// Nuevas rutas para variantes de productos
router.get('/productos/:id/variantes', authMiddleware, validatePermission('Visualizar Productos'), productosController.getVariants);
router.post('/productos/:id/variantes', authMiddleware, validatePermission('Crear Productos'), uploadMiddleware.single('imagen'), productosController.createVariant);
router.patch('/productos/:id/precio-venta', authMiddleware, validatePermission('Modificar Productos'), productosController.calcularPrecioVenta);
router.put('/productos/:id/variantes/:variantId', authMiddleware, validatePermission('Modificar Productos'), uploadMiddleware.single('imagen'), productosController.updateVariant);
router.delete('/productos/:id/variantes/:variantId', authMiddleware, validatePermission('Eliminar Productos'), productosController.deleteVariant);


export default router;