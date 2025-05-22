import { query } from "../../Config/Database.js";

export const CarritoModel = {
  async getOrCreateCarritoByCliente(IdCliente) {
    const [carritos] = await query(
      "SELECT * FROM Carritos WHERE IdCliente = ? AND Estado = 'Activo' LIMIT 1",
      [IdCliente]
    );
    if (!carritos) {
      const result = await query(
        "INSERT INTO Carritos (IdCliente) VALUES (?)",
        [IdCliente]
      );
      const [nuevo] = await query("SELECT * FROM Carritos WHERE IdCarrito = ?", [result.insertId]);
      // Retornar como array para mantener compatibilidad
      return [nuevo];
    }
    // Retornar como array para mantener compatibilidad
    return [carritos];
  },

  async getItemsByCliente(IdCliente) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    if (!carrito) return [];
    return await query(
      `SELECT ci.*, p.NombreProducto, p.FotosProductoBase, p.PrecioVenta
       FROM CarritoItems ci
       JOIN Productos p ON ci.IdProducto = p.IdProducto
       WHERE ci.IdCarrito = ?`,
      [carrito.IdCarrito]
    );
  },

  async addItem(IdCliente, IdProducto, Cantidad, PrecioUnitario) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    const [item] = await query(
      "SELECT * FROM CarritoItems WHERE IdCarrito = ? AND IdProducto = ?",
      [carrito.IdCarrito, IdProducto]
    );
    if (item) {
      await query(
        "UPDATE CarritoItems SET Cantidad = Cantidad + ? WHERE IdCarrito = ? AND IdProducto = ?",
        [Cantidad, carrito.IdCarrito, IdProducto]
      );
    } else {
      await query(
        "INSERT INTO CarritoItems (IdCarrito, IdProducto, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)",
        [carrito.IdCarrito, IdProducto, Cantidad, PrecioUnitario]
      );
    }
    return true;
  },

  async updateItem(IdCliente, IdProducto, Cantidad) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "UPDATE CarritoItems SET Cantidad = ? WHERE IdCarrito = ? AND IdProducto = ?",
      [Cantidad, carrito.IdCarrito, IdProducto]
    );
    return true;
  },

  async removeItem(IdCliente, IdProducto) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "DELETE FROM CarritoItems WHERE IdCarrito = ? AND IdProducto = ?",
      [carrito.IdCarrito, IdProducto]
    );
    return true;
  },

  async clearCarrito(IdCliente) {
    const [carrito] = await this.getOrCreateCarritoByCliente(IdCliente);
    await query(
      "DELETE FROM CarritoItems WHERE IdCarrito = ?",
      [carrito.IdCarrito]
    );
    return true;
  }
};

export const CarritoController = {
  // Obtener el carrito del cliente
  getCarrito: async (req, res) => {
    try {
      const { idCliente } = req.params;
      const items = await CarritoModel.getItemsByCliente(idCliente);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el carrito", error: error.message });
    }
  },

  // Agregar producto al carrito
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

  // Actualizar cantidad de un producto
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

  // Eliminar producto del carrito
  removeItem: async (req, res) => {
    try {
      const { idCliente, IdProducto } = req.params;
      await CarritoModel.removeItem(idCliente, IdProducto);
      res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar producto", error: error.message });
    }
  },

  // Vaciar carrito
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