import axiosInstance from "../ConsumoAdmin/axios.js";

const API_BASE_URL = "/sales/ventas";

const VentasService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  },
  getPendientes: async () => {
    const response = await axiosInstance.get(`${API_BASE_URL}?estado=pendiente`);
    return response.data;
  },
  aprobarVenta: async (id) => {
    const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/aprobar`);
    return response.data;
  },
  rechazarVenta: async (id) => {
    const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/rechazar`);
    return response.data;
  },
};

export default VentasService;
