import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar las citas y servicios relacionados
 */
const CitasService = {
  // ==================== CITAS ====================
  /**
   * Obtiene todas las citas
   * @returns {Promise} Promesa con los datos de las citas
   */
  obtenerCitas: async () => {
    try {
      const response = await axiosInstance.get("/appointments/citas")
      console.log("Respuesta de obtenerCitas:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener citas:", error)
      throw error
    }
  },

  /**
   * Crea una nueva cita
   * @param {Object} citaData - Datos de la cita a crear
   * @returns {Promise} Promesa con la respuesta de la creación
   */
  crearCita: async (citaData) => {
    try {
      // Formatear los datos según lo que espera el controlador
      // El controlador espera un objeto con propiedades "cita" y "servicios"
      
      // Formatear fecha y hora en el formato correcto: YYYY-MM-DD HH:MM:SS
      // Asegurarse de que la fecha esté en formato YYYY-MM-DD
      let fecha = citaData.Fecha || citaData.fecha;
      if (fecha.includes('T')) {
        fecha = fecha.split('T')[0];
      }
      
      // Asegurarse de que la hora esté en formato HH:MM
      let hora = citaData.hora;
      if (hora.length > 5) {
        hora = hora.substring(0, 5);
      }
      
      const fechaHora = `${fecha} ${hora}:00`; // Formato: YYYY-MM-DD HH:MM:SS
      
      const datosFormateados = {
        cita: {
          IdCliente: citaData.IdCliente,
          IdMascota: citaData.IdMascota,
          Fecha: fechaHora,
          NotasAdicionales: citaData.NotasAdicionales || "",
          Estado: citaData.Estado || "Programada"
        },
        servicios: citaData.servicios ? citaData.servicios.map(servicio => ({
          IdServicio: servicio.IdServicio || servicio.id
        })) : []
      };
      
      console.log("Datos enviados al crear cita:", datosFormateados);
      const response = await axiosInstance.post("/appointments/citas", datosFormateados);
      console.log("Respuesta al crear cita:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear la cita:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  },

  /**
   * Actualiza una cita existente
   * @param {number} id - ID de la cita a actualizar
   * @param {Object} citaData - Nuevos datos de la cita
   * @returns {Promise} Promesa con la respuesta de la actualización
   */
  actualizarCita: async (id, citaData) => {
    try {
      // Formatear los datos según lo que espera el controlador
      // Formatear fecha y hora en el formato correcto: YYYY-MM-DD HH:MM:SS
      let fecha = citaData.Fecha || citaData.fecha;
      if (fecha.includes('T')) {
        fecha = fecha.split('T')[0];
      }
      
      // Asegurarse de que la hora esté en formato HH:MM
      let hora = citaData.hora;
      if (hora.length > 5) {
        hora = hora.substring(0, 5);
      }
      
      const fechaHora = `${fecha} ${hora}:00`; // Formato: YYYY-MM-DD HH:MM:SS
      
      const datosFormateados = {
        cita: {
          IdCliente: citaData.IdCliente,
          IdMascota: citaData.IdMascota,
          Fecha: fechaHora,
          NotasAdicionales: citaData.NotasAdicionales || "",
          Estado: citaData.Estado || "Programada"
        },
        servicios: citaData.servicios ? citaData.servicios.map(servicio => ({
          IdServicio: servicio.IdServicio || servicio.id
        })) : []
      };
      
      console.log(`Actualizando cita ID ${id} con datos:`, datosFormateados);
      const response = await axiosInstance.put(`/appointments/citas/${id}`, datosFormateados);
      console.log("Respuesta al actualizar cita:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la cita ${id}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  },

  /**
   * Cambia el estado de una cita
   * @param {number} id - ID de la cita
   * @param {string} estado - Nuevo estado ('Programada', 'Completada', 'Cancelada')
   * @returns {Promise} Promesa con la respuesta del cambio de estado
   */
  cambiarEstadoCita: async (id, estado) => {
    try {
      console.log(`Cambiando estado de cita ID ${id} a ${estado}`);
      const response = await axiosInstance.patch(`/appointments/citas/${id}/status`, { Estado: estado });
      console.log("Respuesta al cambiar estado:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar el estado de la cita ${id}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      throw error;
    }
  },

  // ==================== CITAS SERVICIO ====================
  /**
   * Agrega un servicio a una cita
   * @param {number} idCita - ID de la cita
   * @param {number} idServicio - ID del servicio a agregar
   * @returns {Promise} Promesa con la respuesta de la adición
   */
  agregarServicioACita: async (idCita, idServicio) => {
    try {
      console.log(`Agregando servicio ${idServicio} a cita ${idCita}`);
      const response = await axiosInstance.post(`/appointments/citas/${idCita}/servicios/${idServicio}`);
      console.log("Respuesta al agregar servicio a cita:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al agregar servicio a la cita ${idCita}:`, error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      throw error;
    }
  },

  // ==================== CLIENTES ====================
  /**
   * Obtiene todos los clientes
   * @returns {Promise} Promesa con los datos de los clientes
   */
  obtenerClientes: async () => {
    try {
      const response = await axiosInstance.get("/customers/clientes");
      console.log("Respuesta de obtenerClientes:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      throw error;
    }
  },

  // ==================== MASCOTAS ====================
  /**
   * Obtiene las mascotas de un cliente específico
   * @param {number} idCliente - ID del cliente
   * @returns {Promise} Promesa con los datos de las mascotas
   */
  obtenerMascotasPorCliente: async (idCliente) => {
    console.log(`Intentando obtener mascotas para cliente ID: ${idCliente}`);
    
    try {
      // Primer intento: ruta directa para mascotas por cliente
      console.log("Usando ruta /customers/clientes/:id/mascotas");
      const response = await axiosInstance.get(`/customers/clientes/${idCliente}/mascotas`);
      console.log("Mascotas obtenidas correctamente:", response.data);
      return response.data;
    } catch (error1) {
      console.log("Error en primer intento:", error1.message);

      try {
        // Segundo intento: ruta alternativa
        console.log("Intento alternativo: Usando ruta /customers/mascotas/cliente/");
        const response = await axiosInstance.get(`/customers/mascotas/cliente/${idCliente}`);
        console.log("Mascotas obtenidas correctamente (Intento alternativo):", response.data);
        return response.data;
      } catch (error2) {
        console.error(`Error al obtener mascotas del cliente ${idCliente}:`, error2);
        // Devolver array vacío en caso de error para evitar errores en la UI
        return [];
      }
    }
  },

  // ==================== SERVICIOS ====================
  /**
   * Obtiene todos los servicios disponibles
   * @returns {Promise} Promesa con los datos de los servicios
   */
  obtenerServicios: async () => {
    try {
      // Usar la ruta correcta como en serviciosService.js
      const response = await axiosInstance.get("/services/servicios");
      
      // Manejar diferentes estructuras de respuesta
      if (response.data && Array.isArray(response.data)) {
        console.log("Servicios obtenidos correctamente:", response.data);
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log("Servicios obtenidos correctamente (en data.data):", response.data.data);
        return response.data.data;
      } else {
        console.log("No se encontraron servicios, devolviendo array vacío");
        return [];
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
      }
      throw error;
    }
  }
};

export default CitasService;
