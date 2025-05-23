import axiosInstance from "../ConsumoAdmin/axios.js";

const API_BASE_URL = "/sales/ventas";

const ComprasFinalizadasCliente = {
  getAll: async () => {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};

export default ComprasFinalizadasCliente;