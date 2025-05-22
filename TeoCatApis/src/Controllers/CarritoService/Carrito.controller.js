import { query } from "../../Config/Database.js";
import { CarritoModel } from "../../Models/CarritoService/Carrito.model.js";

export const CarritoController = {
  // ==== RUTAS PARA EL CLIENTE AUTENTICADO (usa el idCliente del token) ====
  getCarritoAuth: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      // Busca el IdCliente real
      const [cliente] = await query("SELECT IdCliente FROM clientes WHERE IdUsuario = ?", [idUsuario]);
      if (!cliente) {
        return res.status(400).json({ message: "No se encontró cliente para este usuario" });
      }
      const idCliente = cliente.IdCliente;
      const items = await CarritoModel.getItemsByCliente(idCliente);
      res.json(items);
    } catch (error) {
      console.error("Error en getCarritoAuth:", error);
      res.status(500).json({ message: "Error al obtener el carrito", error: error.message });
    }
  },
  addItemAuth: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      // Busca el IdCliente real
      const [cliente] = await query("SELECT IdCliente FROM clientes WHERE IdUsuario = ?", [idUsuario]);
      if (!cliente) {
        return res.status(400).json({ message: "No se encontró cliente para este usuario" });
      }
      const idCliente = cliente.IdCliente;
      const { IdProducto, Cantidad, PrecioUnitario } = req.body;
      await CarritoModel.addItem(idCliente, IdProducto, Cantidad, PrecioUnitario);
      res.json({ message: "Producto agregado al carrito" });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar producto", error: error.message });
    }
  },
  updateItemAuth: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      // Busca el IdCliente real
      const [cliente] = await query("SELECT IdCliente FROM clientes WHERE IdUsuario = ?", [idUsuario]);
      if (!cliente) {
        return res.status(400).json({ message: "No se encontró cliente para este usuario" });
      }
      const idCliente = cliente.IdCliente;
      const { IdProducto } = req.params;
      const { Cantidad } = req.body;
      await CarritoModel.updateItem(idCliente, IdProducto, Cantidad);
      res.json({ message: "Cantidad actualizada" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar cantidad", error: error.message });
    }
  },
  removeItemAuth: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      // Busca el IdCliente real
      const [cliente] = await query("SELECT IdCliente FROM clientes WHERE IdUsuario = ?", [idUsuario]);
      if (!cliente) {
        return res.status(400).json({ message: "No se encontró cliente para este usuario" });
      }
      const idCliente = cliente.IdCliente;
      const { IdProducto } = req.params;
      await CarritoModel.removeItem(idCliente, IdProducto);
      res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar producto", error: error.message });
    }
  },
  clearCarritoAuth: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      // Busca el IdCliente real
      const [cliente] = await query("SELECT IdCliente FROM clientes WHERE IdUsuario = ?", [idUsuario]);
      if (!cliente) {
        return res.status(400).json({ message: "No se encontró cliente para este usuario" });
      }
      const idCliente = cliente.IdCliente;
      await CarritoModel.clearCarrito(idCliente);
      res.json({ message: "Carrito vaciado" });
    } catch (error) {
      res.status(500).json({ message: "Error al vaciar carrito", error: error.message });
    }
  },

  // ==== RUTAS ADMINISTRATIVAS (con idCliente explícito) ====
  getCarrito: async (req, res) => {
    try {
      const { idCliente } = req.params;
      const items = await CarritoModel.getItemsByCliente(idCliente);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el carrito", error: error.message });
    }
  },
  addItem: async (req, res) => {
    try {
      const { idCliente } = req.params;
      const { IdProducto, Cantidad, PrecioUnitario } = req.body;
      await CarritoModel.addItem(idCliente, IdProducto, Cantidad, PrecioUnitario);
      res.json({ message: "Producto agregado al carrito" });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar producto", error: error.message });
    }
  },
  updateItem: async (req, res) => {
    try {
      const { idCliente, IdProducto } = req.params;
      const { Cantidad } = req.body;
      await CarritoModel.updateItem(idCliente, IdProducto, Cantidad);
      res.json({ message: "Cantidad actualizada" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar cantidad", error: error.message });
    }
  },
  removeItem: async (req, res) => {
    try {
      const { idCliente, IdProducto } = req.params;
      await CarritoModel.removeItem(idCliente, IdProducto);
      res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar producto", error: error.message });
    }
  },
  clearCarrito: async (req, res) => {
    try {
      const { idCliente } = req.params;
      await CarritoModel.clearCarrito(idCliente);
      res.json({ message: "Carrito vaciado" });
    } catch (error) {
      res.status(500).json({ message: "Error al vaciar carrito", error: error.message });
    }
  }
};