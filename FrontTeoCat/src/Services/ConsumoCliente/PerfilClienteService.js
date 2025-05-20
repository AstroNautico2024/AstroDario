import axios from "../ConsumoCliente/AxiosCliente"

const USUARIOS_URL = "/auth/usuarios"

const PerfilClienteService = {




getPerfil: async () => {
  try {
    const response = await axios.get(`${USUARIOS_URL}?t=${Date.now()}`)
    const userId = Number(JSON.parse(localStorage.getItem("userData"))?.id)
    const usuario = Array.isArray(response.data)
      ? response.data.find(u => Number(u.IdUsuario) === userId)
      : null

    // Unifica la propiedad de la foto
    if (usuario) {
      usuario.foto = usuario.foto || usuario.Foto || usuario.FotoURL || "";
    }

    return usuario
  } catch (error) {
    throw error?.response?.data || { message: "Error al obtener perfil de usuario" }
  }
},


  updatePerfil: async (userId, updatedData) => {
    try {
      const response = await axios.put(`${USUARIOS_URL}/${userId}`, updatedData)
      return response.data
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar perfil de usuario" }
    }


    
  },
  updateDirecciones: async (userId, updatedDirecciones) => {
    try {
      const response = await axios.put(`${USUARIOS_URL}/${userId}/direcciones`, updatedDirecciones)
      return response.data
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar direcciones de usuario" }
    }
  },
  updateTelefonos: async (userId, updatedTelefonos) => {
    try {
      const response = await axios.put(`${USUARIOS_URL}/${userId}/telefonos`, updatedTelefonos)
      return response.data
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar teléfonos de usuario" }
    }
  },
  updateMascotas: async (userId, updatedMascotas) => {
    try {
      const response = await axios.put(`${USUARIOS_URL}/${userId}/mascotas`, updatedMascotas)
      return response.data
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar mascotas de usuario" }
    }
  },
  updateResenas: async (userId, updatedResenas) => {
    try {
      const response = await axios.put(`${USUARIOS_URL}/${userId}/resenas`, updatedResenas)
      return response.data
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar reseñas de usuario" }
    }
  },



 updateFoto: async (userId, archivoFoto) => {
  try {
    const formData = new FormData();
    formData.append("foto", archivoFoto); // archivoFoto debe ser un objeto File

    const response = await axios.put(
      `${USUARIOS_URL}/${userId}/foto`,
      formData,
      {
        headers: {
          // No pongas 'Content-Type', axios lo gestiona automáticamente para FormData
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: "Error al actualizar la foto de perfil" };
  }
},




}

export default PerfilClienteService