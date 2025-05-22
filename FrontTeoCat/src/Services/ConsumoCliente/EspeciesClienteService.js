import axiosInstance from "../ConsumoAdmin/axios.js"

const EspeciesClienteService = {
  /**
   * Obtiene todas las especies disponibles para el cliente
   * @returns {Promise<Array>} Lista de especies
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/customers/especies")
      return response.data
    } catch (error) {
      console.error("Error al obtener especies:", error)
      return []
    }
  },
}

export default EspeciesClienteService