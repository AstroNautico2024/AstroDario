import express from "express"
import { reseñasServiciosController } from "../../Controllers/ReviewService/reviews.controller.js"
import { uploadMiddleware } from "../../Middlewares/upload.middleware.js"

const router = express.Router()

// Rutas públicas para reseñas de servicios
router.get("/servicios", reseñasServiciosController.getAll)
router.get("/servicios/servicio/:id", reseñasServiciosController.getByServicio)
router.get("/servicios/promedio/:id", reseñasServiciosController.getPromedioByServicio)
router.get("/servicios/:id", reseñasServiciosController.getById)

// Para la creación y actualización, usar uploadMiddleware para manejar la subida de archivos
router.post("/servicios", uploadMiddleware.single("Foto"), reseñasServiciosController.create)
router.put("/servicios/:id", uploadMiddleware.single("Foto"), reseñasServiciosController.update)
router.delete("/servicios/:id", reseñasServiciosController.delete)

export default router
