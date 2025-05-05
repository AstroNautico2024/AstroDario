import express from 'express';
import { reseñasProductosController } from '../../Controllers/ReviewService/reviews.controller.js';
import { uploadMiddleware } from '../../Middlewares/upload.middleware.js';

const router = express.Router();

// Rutas públicas para reseñas de productos
router.get('/productos', reseñasProductosController.getAll);
router.get('/productos/producto/:id', reseñasProductosController.getByProducto);
router.get('/productos/promedio/:id', reseñasProductosController.getPromedioByProducto);
router.get('/productos/:id', reseñasProductosController.getById);

// Para la creación y actualización, usar uploadMiddleware para manejar la subida de archivos
router.post('/productos', uploadMiddleware.single('Foto'), reseñasProductosController.create);
router.put('/productos/:id', uploadMiddleware.single('Foto'), reseñasProductosController.update);
router.delete('/productos/:id', reseñasProductosController.delete);

export default router;