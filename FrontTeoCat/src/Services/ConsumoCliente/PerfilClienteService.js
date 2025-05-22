import axios from "../ConsumoCliente/AxiosCliente";

const PerfilClienteService = {
  getPerfil: async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("userData"));
      const idCliente = usuario.cliente?.id || usuario.IdCliente;
      if (!idCliente) throw new Error("El usuario no tiene cliente asociado");

      // Trae los datos del cliente por su ID
      const clienteResponse = await axios.get(`/customers/clientes/${idCliente}`);
      const cliente = clienteResponse.data;

      return {
        ...usuario,
        IdCliente: cliente?.IdCliente,
        nombre: cliente?.Nombre,
        apellido: cliente?.Apellido,
        correo: cliente?.Correo,
        documento: cliente?.Documento,
        telefono: cliente?.Telefono,
        direccion: cliente?.Direccion,
        // Otros campos si los necesitas
      };
    } catch (error) {
      throw error?.response?.data || { message: "Error al obtener perfil de usuario" };
    }
  },

  updatePerfil: async (idCliente, data) => {
    try {
      // Usa la ruta correcta y el id del cliente
      const response = await axios.put(`/customers/clientes/${idCliente}`, data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar perfil" };
    }
  },

  updateUsuario: async (idUsuario, data) => {
    try {
      const response = await axios.put(`/usuarios/${idUsuario}`, data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: "Error al actualizar usuario" };
    }
  },
};

export default PerfilClienteService;