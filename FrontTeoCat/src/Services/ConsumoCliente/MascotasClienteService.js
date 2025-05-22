import axios from "axios";

const MascotasService = {
  /**
   * Obtiene todas las mascotas de un cliente específico
   * @param {number|string} idCliente
   * @returns {Promise<Array>} Mascotas del cliente
   */
  getMascotasByCliente: async (idCliente) => {
    try {
      const response = await axios.get(`/api/customers/clientes/${idCliente}/mascotas`);
      return response.data; // Debe ser un array de mascotas
    } catch (error) {
      console.error("Error al obtener mascotas:", error);
      return [];
    }
  },
};

export default MascotasService;