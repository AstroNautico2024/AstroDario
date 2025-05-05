import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rutas
import authRoutes from '../src/Routes/AuthService/auth.routes.js';
import customersRoutes from '../src/Routes/CustomerService/customers.routes.js';
import productsRoutes from '../src/Routes/ProductService/products.routes.js';
import publicCatalogRoutes from '../src/Routes/ProductService/public-catalog.routes.js'; // Nueva importación
import publicReviewsRoutes from '../src/Routes/ReviewService/public-reviews.routes.js'; // Nueva importación
import publicServicesRoutes from '../src/Routes/ServiceManagement/public-services.routes.js'; // Nueva importación
import publicServicesReviewsRoutes from '../src/Routes/ReviewService/public-reviews.routes.js';// Nueva importación
import servicesRoutes from '../src/Routes/ServiceManagement/service.routes.js';
import salesRoutes from '../src/Routes/SalesService/sales.routes.js';
import purchasesRoutes from '../src/Routes/PurchaseService/purchases.routes.js';
import appointmentsRoutes from '../src/Routes/AppointmentService/appointment.routes.js';
import reviewsRoutes from '../src/Routes/ReviewService/reviews.routes.js';
import notificationsRoutes from '../src/Routes/NotificationService/notifications.routes.js';

// Configurar variables de entorno
dotenv.config();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar la aplicación
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (si es necesario)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API TeoCat',
      version: '1.0.0',
      description: 'Documentación de la API TeoCat',
      contact: {
        name: 'Equipo TeoCat',
        email: process.env.EMAIL_USER
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: process.env.PRODUCTION_URL || 'https://api.teocat.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/**/*.js', './src/docs/**/*.yaml']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de TeoCat funcionando correctamente',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});


// Rutas públicas (sin autenticación)
app.use('/api/public/products', publicCatalogRoutes); // Nueva ruta pública para catálogo de productos
app.use('/api/public/reviews', publicReviewsRoutes); // Nueva ruta pública para reseñas productos
app.use('/api/public/services', publicServicesRoutes); // Nueva ruta pública para servicios
app.use('/api/public/reviews', publicServicesReviewsRoutes); // Nueva ruta pública para reseñas de servicios


// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err.stack);
  
  // Determinar el código de estado
  const statusCode = err.statusCode || 500;
  
  // Preparar la respuesta de error
  const errorResponse = {
    message: err.message || 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  };
  
  // Si hay detalles adicionales y estamos en desarrollo, incluirlos
  if (process.env.NODE_ENV === 'development' && err.details) {
    errorResponse.details = err.details;
  }
  
  res.status(statusCode).json(errorResponse);
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Consulta la documentación en /api-docs para ver las rutas disponibles'
  });
});

export default app;