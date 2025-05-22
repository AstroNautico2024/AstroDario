import axios from "../ConsumoCliente/AxiosCliente";

const PerfilClienteService = {
  getPerfil: async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("userData"));
      const idUsuario = usuario?.IdUsuario || usuario?.id;
      if (!idUsuario) throw new Error("No hay usuario autenticado");

      // Trae el cliente por IdUsuario
      const clienteResponse = await axios.get(`/customers/clientes?IdUsuario=${idUsuario}`);
      const cliente = Array.isArray(clienteResponse.data)
        ? clienteResponse.data[0]
        : clienteResponse.data;

      // Combina los datos del usuario y del cliente
      return {
        ...usuario,
        IdCliente: cliente?.IdCliente,
        Telefono: cliente?.Telefono,
        Direccion: cliente?.Direccion,
        // Puedes agregar más campos si lo necesitas
      };
    } catch (error) {
      throw error?.response?.data || { message: "Error al obtener perfil de usuario" };
    }
  },

  updatePerfil: async (idCliente, data) => {
    try {
      // Actualiza los datos del cliente
      const response = await axios.put(`/customers/clientes/${idCliente}`, data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar perfil" };
    }
  },
};

export default PerfilClienteService;