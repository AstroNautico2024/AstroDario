import express from "express"
import { serviciosController } from "../../Controllers/ServiceManagement/service.controller.js"

const router = express.Router()

// Rutas públicas para servicios
router.get("/servicios", serviciosController.getAll)
router.get("/servicios/:id", serviciosController.getById)

export default router
