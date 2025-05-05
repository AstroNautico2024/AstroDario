import express from 'express';
import { categoriasController, productosController } from '../../Controllers/ProductService/products.controller.js';

const router = express.Router();

// Rutas públicas para categorías
router.get('/categorias', categoriasController.getAll);
router.get('/categorias/:id', categoriasController.getById);

// Importante: El orden de las rutas es crucial
// Las rutas más específicas deben ir primero
router.get('/productos/search', productosController.search);
router.get('/productos/categoria/:id', productosController.getByCategoria);
router.get('/productos/:id', productosController.getById);
router.get('/productos', productosController.getAll);

export default router;