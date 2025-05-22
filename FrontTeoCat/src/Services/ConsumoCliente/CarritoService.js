import axiosInstance from "../ConsumoAdmin/axios.js";

const CarritoApiService = {
  // Obtener todos los productos del carrito del usuario autenticado
  getCart: async () => {
    const response = await fetch("http://localhost:3000/api/carrito", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await response.json();
  },

  // Agregar producto al carrito
  addItem: async (producto) => {
    const response = await axiosInstance.post("/sales/carrito", producto);
    return response.data;
  },

  // Actualizar cantidad de un producto en el carrito
  updateQuantity: async (id, quantity) => {
    const response = await axiosInstance.put(`/sales/carrito/${id}`, { quantity });
    return response.data;
  },

  // Eliminar producto del carrito
  removeItem: async (id) => {
    const response = await axiosInstance.delete(`/sales/carrito/${id}`);
    return response.data;
  },

  // Vaciar carrito
  clearCart: async () => {
    const response = await axiosInstance.delete("/sales/carrito");
    return response.data;
  },

  // Checkout (realizar pedido)
  checkout: async (checkoutData) => {
    const response = await axiosInstance.post("/sales/ventas", checkoutData);
    return response.data;
  }
};

export default CarritoApiService;