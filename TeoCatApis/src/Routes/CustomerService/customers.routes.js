// customers.routes.js - Versión actualizada
import express from 'express';
import { clientesController, mascotasController, especiesController } from '../../Controllers/CustomerService/customers.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';
import { validatePermission } from '../../Middlewares/permission.middleware.js';
import { uploadMiddleware, handleMulterError } from '../../Middlewares/upload.middleware.js';

const router = express.Router();

// Rutas para clientes
router.get('/clientes', authMiddleware, validatePermission('Visualizar Clientes'), clientesController.getAll);
router.get('/clientes/search', authMiddleware, validatePermission('Visualizar Clientes'), clientesController.search);
router.get('/clientes/:id', authMiddleware, validatePermission('Visualizar Clientes'), clientesController.getById);
router.get(
  '/clientes/byUsuario/:idUsuario',
  authMiddleware,
  validatePermission('Visualizar Clientes'),
  clientesController.getByUsuario // <-- asegúrate de tener este método en tu controlador
);
router.post('/clientes', authMiddleware, validatePermission('Crear Clientes'), uploadMiddleware.single('foto'), handleMulterError, clientesController.create);
router.put('/clientes/:id', authMiddleware, validatePermission('Modificar Clientes'), uploadMiddleware.single('foto'), handleMulterError, clientesController.update);
router.delete('/clientes/:id', authMiddleware, validatePermission('Eliminar Clientes'), clientesController.delete);

// Rutas para mascotas
router.get('/mascotas', authMiddleware, validatePermission('Visualizar Mascotas'), mascotasController.getAll);
router.get('/mascotas/search', authMiddleware, validatePermission('Visualizar Mascotas'), mascotasController.search);
router.get('/mascotas/:id', authMiddleware, validatePermission('Visualizar Mascotas'), mascotasController.getById);
router.post('/mascotas', authMiddleware, validatePermission('Crear Mascotas'), uploadMiddleware.single('foto'), handleMulterError, mascotasController.create);
router.put('/mascotas/:id', authMiddleware, validatePermission('Modificar Mascotas'), uploadMiddleware.single('foto'), handleMulterError, mascotasController.update);
router.delete('/mascotas/:id', authMiddleware, validatePermission('Eliminar Mascotas'), mascotasController.delete);
router.get('/clientes/:id/mascotas', authMiddleware, validatePermission('Visualizar Mascotas'), mascotasController.getByCliente);

// Rutas para especies
router.get('/especies', authMiddleware, validatePermission('Visualizar Mascotas'), especiesController.getAll);
router.get('/especies/:id', authMiddleware, validatePermission('Visualizar Mascotas'), especiesController.getById);
router.post('/especies', authMiddleware, validatePermission('Crear Mascotas'), especiesController.create);
router.put('/especies/:id', authMiddleware, validatePermission('Modificar Mascotas'), especiesController.update);
router.delete('/especies/:id', authMiddleware, validatePermission('Eliminar Mascotas'), especiesController.delete);

export default router;