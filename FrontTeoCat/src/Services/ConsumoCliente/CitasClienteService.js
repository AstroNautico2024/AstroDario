import axios from "./AxiosCliente";

const CitasClienteService = {
  getCitasPorCliente: async (idCliente) => {
    const { data } = await axios.get(`/appointments/citas/cliente/${idCliente}`);
    return data;
  },

  getCitaById: async (idCita) => {
    const { data } = await axios.get(`/appointments/citas/${idCita}`);
    return data;
  },

  crearCita: async ({ IdCliente, IdMascota, Fecha, NotasAdicionales, servicios }) => {
    const body = {
      cita: { IdCliente, IdMascota, Fecha, NotasAdicionales },
      servicios: servicios || [],
    };
    const { data } = await axios.post(`/appointments/citas`, body);
    return data;
  },

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