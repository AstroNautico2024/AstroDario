import axiosInstance from "../ConsumoAdmin/axios.js"
import EspeciesClienteService from "./EspeciesClienteService.js"

const MascotasService = {
  /**
   * Obtiene todas las mascotas de un cliente específico
   * @param {number|string} idCliente
   * @returns {Promise<Array>} Mascotas enriquecidas del cliente
   */
  getMascotasByCliente: async (idCliente) => {
    try {
      const response = await axiosInstance.get("/customers/mascotas")
      console.log("Mascotas recibidas:", response.data)
      console.log("idCliente usado:", idCliente)
      const especies = await EspeciesClienteService.getAll().catch(() => [])
      return response.data
        .filter((mascota) => Number(mascota.IdCliente) === Number(idCliente))
        .map((mascota) => {
          const especie = especies.find(
            (e) => e.IdEspecie === mascota.IdEspecie
          )
          return {
            id: mascota.IdMascota,
            idCliente: mascota.IdCliente,
            idEspecie: mascota.IdEspecie,
            nombre: mascota.Nombre,
            especie: especie ? especie.NombreEspecie : "No especificado",
            raza: mascota.Raza,
            tamaño: mascota.Tamaño,
            fechaNacimiento: mascota.FechaNacimiento,
            image: mascota.Foto || "/placeholder.svg",
            especieInfo: especie || null,
          }
        })
    } catch (error) {
      console.error("Error al obtener mascotas del cliente:", error)
      return []
    }
  },
}

export default MascotasService