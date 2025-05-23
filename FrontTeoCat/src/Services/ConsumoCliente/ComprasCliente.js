import axiosInstance from "../ConsumoAdmin/axios.js";

const API_BASE_URL = "/compras"; // Base URL para las rutas de compras

const ComprasCliente = {
  // Obtener todas las compras
  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener las compras:", error);
      throw error;
    }
  },

  // Obtener una compra por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva compra
  create: async (compraData) => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, compraData, {
        headers: {
          "Content-Type": "multipart/form-data", // Si estás enviando un archivo como ComprobantePago
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear la compra:", error);
      throw error;
    }
  },

  // Actualizar una compra existente
  update: async (id, compraData) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, compraData, {
        headers: {
          "Content-Type": "multipart/form-data", // Si estás enviando un archivo como ComprobantePago
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Cambiar el estado de una compra
  changeStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar el estado de la compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una compra
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar la compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener los detalles de una compra
  getDetallesByCompra: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${id}/detalles`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los detalles de la compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un detalle de compra
  createDetalle: async (detalleData) => {
    try {
      const response = await axiosInstance.post("/detalles-compras", detalleData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el detalle de compra:", error);
      throw error;
    }
  },

  // Actualizar un detalle de compra
  updateDetalle: async (id, detalleData) => {
    try {
      const response = await axiosInstance.put(`/detalles-compras/${id}`, detalleData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el detalle de compra con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un detalle de compra
  deleteDetalle: async (id) => {
    try {
      const response = await axiosInstance.delete(`/detalles-compras/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el detalle de compra con ID ${id}:`, error);
      throw error;
    }
  },
};

export default ComprasCliente;