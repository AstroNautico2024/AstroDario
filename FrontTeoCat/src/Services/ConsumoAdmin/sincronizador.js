/**
 * Servicio de sincronización entre usuarios y clientes.
 * Solo se encarga de mantener sincronizados los datos de clientes
 * relacionados a usuarios con rol de cliente.
 * NO realiza CRUD de usuarios, solo sincroniza clientes.
 */

import axios from "axios"

// Importar utilidades de sincronización visual (si las usas)
import { sincronizarVisualUsuarioCliente } from "../ConsumoAdmin/sincronizacion-visual.js"

// Normalizadores (puedes dejar solo los que uses)
import {
  normalizarEstado as normalizarEstadoCliente,
} from "../ConsumoAdmin/normalizador.js"

// Instancia de axios para peticiones a la API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error al obtener token:", error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Sincroniza los datos de cliente relacionados a un usuario con rol de cliente.
 * Solo crea, actualiza o elimina el cliente correspondiente, NO el usuario.
 * @param {Object} usuario - Objeto usuario
 * @param {string} operacion - "crear" | "actualizar" | "eliminar" | "cambiarEstado"
 */
export async function sincronizarUsuarioACliente(usuario, operacion) {
  try {
    const esCliente =
      usuario.IdRol === 2 || usuario.IdRol === "2" || usuario.Rol?.IdRol === 2 || usuario.Rol?.IdRol === "2"
    const idUsuario = usuario.IdUsuario || usuario.id
    if (!idUsuario) return false

    // Buscar cliente existente
    let clienteExistente = null
    try {
      const todosClientes = await api.get("/customers/clientes")
      if (todosClientes.data && todosClientes.data.length > 0) {
        clienteExistente = todosClientes.data.find(
          (c) => String(c.IdUsuario) === String(idUsuario)
        )
      }
    } catch (error) {
      // No es crítico si no encuentra cliente
    }

    // Si el usuario ya no es cliente pero tiene un cliente asociado, eliminar el cliente
    if (!esCliente && clienteExistente && operacion === "actualizar") {
      try {
        await api.delete(`/customers/clientes/${clienteExistente.IdCliente}`)
        return true
      } catch {
        return false
      }
    }

    // Si no es cliente y no estamos actualizando, no continuar
    if (!esCliente && operacion !== "actualizar") return false
    if (!esCliente) return false

    // Preparar datos del cliente
    const clienteData = {
      Documento: usuario.Documento || "",
      Nombre: usuario.Nombre || "",
      Apellido: usuario.Apellido || "",
      Correo: usuario.Correo || "",
      Telefono: usuario.Telefono || "",
      Direccion: usuario.Direccion || "",
      Estado: normalizarEstadoCliente(usuario.Estado),
      IdUsuario: idUsuario,
    }

    let resultado = null
    switch (operacion) {
      case "crear":
        if (clienteExistente) {
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteData)
        } else {
          resultado = await api.post("/customers/clientes", clienteData)
        }
        break
      case "actualizar":
        if (clienteExistente) {
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, clienteData)
        } else {
          resultado = await api.post("/customers/clientes", clienteData)
        }
        break
      case "eliminar":
        if (clienteExistente) {
          resultado = await api.delete(`/customers/clientes/${clienteExistente.IdCliente}`)
        }
        break
      case "cambiarEstado":
        if (clienteExistente) {
          resultado = await api.put(`/customers/clientes/${clienteExistente.IdCliente}`, {
            ...clienteExistente,
            Estado: normalizarEstadoCliente(usuario.Estado),
          })
        } else {
          resultado = await api.post("/customers/clientes", clienteData)
        }
        break
      default:
        return false
    }

    // Sincronización visual (opcional)
    sincronizarVisualUsuarioCliente(usuario, operacion)

    return true
  } catch (error) {
    console.error("[SINCRONIZADOR] Error en sincronizarUsuarioACliente:", error)
    return false
  }
}

// Exporta solo la función principal
export default {
  sincronizarUsuarioACliente,
}
