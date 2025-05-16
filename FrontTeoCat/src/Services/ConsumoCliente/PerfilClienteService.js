import axios from "../ConsumoCliente/AxiosCliente"

const USUARIOS_URL = "/auth/usuarios"

const PerfilClienteService = {
  getPerfil: async () => {
    try {
      const response = await axios.get(`${USUARIOS_URL}?t=${Date.now()}`)
      const userId = Number(JSON.parse(localStorage.getItem("userData"))?.id)
      console.log("userId:", userId)
      console.log("usuarios:", response.data)
      const usuario = Array.isArray(response.data)
        ? response.data.find(u => Number(u.IdUsuario) === userId)
        : null
      console.log("usuario encontrado:", usuario)
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
  updateFoto: async (userId, fotoData) => {
  try {
    // fotoData puede ser un objeto { foto: "url_o_base64" }
    const response = await axios.put(`${USUARIOS_URL}/${userId}/foto`, fotoData)
    return response.data
  } catch (error) {
    throw error?.response?.data || { message: "Error al actualizar la foto de perfil" }
  }
},
}

export default PerfilClienteService