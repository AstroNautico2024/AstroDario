import axios from "./AxiosCliente";

const CitasClienteService = {
  /**
   * Obtiene todas las citas de un cliente, incluyendo info de cliente, mascota y servicios.
   * @param {number|string} idCliente
   * @returns {Promise<Array>} Citas completas
   */
  getCitasPorCliente: async (idCliente) => {
    const { data } = await axios.get(`/appointments/citas/cliente/${idCliente}`);
    // Se espera que cada cita tenga Cliente, Mascota y Servicios anidados
    return data;
  },

  /**
   * Obtiene una cita por ID, incluyendo info de cliente, mascota y servicios.
   * @param {number|string} idCita
   * @returns {Promise<Object>} Cita completa
   */
  getCitaById: async (idCita) => {
    const { data } = await axios.get(`/appointments/citas/${idCita}`);
    // Se espera que data tenga Cliente, Mascota y Servicios anidados
    return data;
  },

    /**
   * Obtiene todas las citas (para consultar horarios ocupados)
   * @returns {Promise<Array>} Lista de citas
   */
  getAllCitas: async () => {
    const { data } = await axios.get(`/appointments/citas`);
    return data;
  },

  /**
   * Crea una nueva cita
   */
  crearCita: async ({ IdCliente, IdMascota, Fecha, NotasAdicionales, servicios }) => {
    const body = {
      cita: { IdCliente, IdMascota, Fecha, NotasAdicionales },
      servicios: servicios || [],
    };
    const { data } = await axios.post(`/appointments/citas`, body);
    return data;
  },

  /**
   * Edita una cita existente
   */
  editarCita: async (idCita, { IdCliente, IdMascota, Fecha, NotasAdicionales, servicios }) => {
    const body = {
      cita: { IdCliente, IdMascota, Fecha, NotasAdicionales },
      servicios: servicios || [],
    };
    const { data } = await axios.put(`/appointments/citas/${idCita}`, body);
    return data;
  },

  cancelarCita: async (idCita) => {
    const { data } = await axios.delete(`/appointments/citas/${idCita}`);
    return data;
  },

  cambiarEstadoCita: async (idCita, Estado) => {
    const { data } = await axios.patch(`/appointments/citas/${idCita}/status`, { Estado });
    return data;
  },

  checkDisponibilidad: async ({ fecha, hora, duracion }) => {
    const { data } = await axios.post(`/appointments/citas/disponibilidad`, { fecha, hora, duracion });
    return data;
  },

  // Métodos para servicios asociados a la cita
  getServiciosByCita: async (idCita) => {
    const { data } = await axios.get(`/appointments/citas/${idCita}/servicios`);
    return data;
  },

  addServicioToCita: async (idCita, idServicio) => {
    const { data } = await axios.post(`/appointments/citas/${idCita}/servicios/${idServicio}`);
    return data;
  },

  updateServicioCita: async (idCita, idServicio) => {
    const { data } = await axios.put(`/appointments/citas/${idCita}/servicios/${idServicio}`);
    return data;
  },

  removeServicioFromCita: async (idCita, idServicio) => {
    const { data } = await axios.delete(`/appointments/citas/${idCita}/servicios/${idServicio}`);
    return data;
  },
};

export default CitasClienteService;