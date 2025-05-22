import axios from "axios";

const getToken = () => localStorage.getItem("token");

const MascotasService = {
  /**
   * Obtiene todas las mascotas de un cliente específico
   * @param {number|string} idCliente
   * @returns {Promise<Array>} Mascotas del cliente
   */
  getMascotasByCliente: async (idCliente) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `/api/customers/clientes/${idCliente}/mascotas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener mascotas:", error);
      return [];
    }
  },

  /**
   * Crea una nueva mascota para un cliente
   * @param {number|string} idCliente
   * @param {Object} mascotaData
   * @returns {Promise<Object>} Mascota creada
   */
  createMascota: async (idCliente, mascotaData) => {

    try {
      const token = getToken();
      let dataToSend;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (mascotaData.Foto instanceof File) {
        dataToSend = new FormData();
        dataToSend.append("IdCliente", idCliente);
        dataToSend.append("Nombre", mascotaData.Nombre);
        dataToSend.append("IdEspecie", mascotaData.IdEspecie);
        dataToSend.append("Raza", mascotaData.Raza);
        dataToSend.append("Tamaño", mascotaData.Tamaño);
        dataToSend.append("FechaNacimiento", mascotaData.FechaNacimiento);
        dataToSend.append("foto", mascotaData.Foto);
        headers["Content-Type"] = "multipart/form-data";
      } else {
        dataToSend = {
          IdCliente: idCliente,
          Nombre: mascotaData.Nombre,
          IdEspecie: mascotaData.IdEspecie,
          Raza: mascotaData.Raza,
          Tamaño: mascotaData.Tamaño,
          FechaNacimiento: mascotaData.FechaNacimiento,
        };
      }

      // AJUSTA AQUÍ la ruta según tu backend
      const response = await axios.post(
        `/api/customers/mascotas`,
        dataToSend,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear mascota:", error);
      throw error;
    }
  },

  /**
   * Actualiza una mascota existente
   * @param {number|string} idMascota
   * @param {Object} mascotaData
   * @returns {Promise<Object>} Mascota actualizada
   */
  updateMascota: async (idMascota, mascotaData) => {
    try {
      const token = getToken();
      console.log("Token usado para actualizar mascota:", token); // <-- Agrega esto
      let dataToSend;
      let headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.put(`/api/customers/mascotas/${idMascota}`, mascotaData, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar mascota:", error);
      throw error?.response?.data || { message: "Error al actualizar mascota" };
    }
  },

  /**
   * Elimina una mascota
   * @param {number|string} idMascota
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  deleteMascota: async (idMascota) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `/api/customers/mascotas/${idMascota}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      throw error;
    }
  },
};

export default MascotasService;