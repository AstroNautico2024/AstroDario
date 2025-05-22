import axios from "axios";
import imageCompression from "browser-image-compression";

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

      // Si la foto es un archivo, comprímela y conviértela a base64
      let fotoBase64 = mascotaData.Foto;
      if (mascotaData.Foto instanceof File) {
        // Opciones para la compresión
        const options = {
          maxSizeMB: 0.1, // Reducir el tamaño máximo a 0.5 MB
          maxWidthOrHeight: 400, // Reducir las dimensiones máximas
          useWebWorker: true, // Usar Web Workers para mejorar el rendimiento
        };

        // Comprimir la imagen
        const compressedFile = await imageCompression(mascotaData.Foto, options);

        // Convertir la imagen comprimida a base64
        const reader = new FileReader();
        fotoBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(",")[1]); // Solo el contenido base64
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      }

      // Crear el objeto de datos para enviar
      dataToSend = {
        IdCliente: idCliente,
        Nombre: mascotaData.Nombre,
        IdEspecie: mascotaData.IdEspecie,
        Raza: mascotaData.Raza,
        Tamaño: mascotaData.Tamaño,
        FechaNacimiento: mascotaData.FechaNacimiento,
        Foto: fotoBase64, // Foto comprimida en base64
      };

      // Enviar la solicitud al backend
      const response = await axios.post(`/api/customers/mascotas`, dataToSend, {
        headers,
      });

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
      let dataToSend;
      let headers = {
        Authorization: `Bearer ${token}`,
      };
  
      // Si la foto es un archivo, comprímela y conviértela a base64
      let fotoBase64 = mascotaData.Foto;
      if (mascotaData.Foto instanceof File) {
        // Opciones para la compresión
        const options = {
          maxSizeMB: 0.1, // Reducir el tamaño máximo a 0.1 MB
          maxWidthOrHeight: 400, // Reducir las dimensiones máximas
          useWebWorker: true, // Usar Web Workers para mejorar el rendimiento
        };
  
        // Comprimir la imagen
        const compressedFile = await imageCompression(mascotaData.Foto, options);
  
        // Convertir la imagen comprimida a base64
        const reader = new FileReader();
        fotoBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(",")[1]); // Solo el contenido base64
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      }
  
      // Crear el objeto de datos para enviar
      dataToSend = {
        Nombre: mascotaData.Nombre,
        IdEspecie: mascotaData.IdEspecie,
        Raza: mascotaData.Raza,
        Tamaño: mascotaData.Tamaño,
        FechaNacimiento: mascotaData.FechaNacimiento,
        Foto: fotoBase64, // Foto comprimida en base64
      };
  
      // Enviar la solicitud al backend
      const response = await axios.put(`/api/customers/mascotas/${idMascota}`, dataToSend, { headers });
  
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