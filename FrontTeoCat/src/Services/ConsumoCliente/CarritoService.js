import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar el carrito de compras
 * Implementación basada principalmente en localStorage
 * con intentos de sincronización con la API cuando sea posible
 */
const CarritoService = {
  /**
   * Obtiene todos los productos del carrito
   * @returns {Promise<Array>} Lista de productos en el carrito
   */
  getAll: async () => {
    try {
      console.log("CarritoService: Obteniendo productos del carrito desde localStorage")
      const carritoLocal = JSON.parse(localStorage.getItem("cart") || "[]")
      return carritoLocal
    } catch (error) {
      console.error("Error al obtener productos del carrito:", error)
      return []
    }
  },

  /**
   * Añade un producto al carrito
   * @param {Object} producto - Datos del producto a añadir
   * @returns {Promise<Object>} Resultado de la operación
   */
  addItem: async (producto) => {
    try {
      console.log("CarritoService: Añadiendo producto al carrito:", producto)
      
      // Actualizar el localStorage
      const carritoLocal = JSON.parse(localStorage.getItem("cart") || "[]")
      const productoExistente = carritoLocal.findIndex(item => item.id === producto.id)
      
      if (productoExistente >= 0) {
        carritoLocal[productoExistente].quantity += producto.quantity || 1
      } else {
        carritoLocal.push({
          ...producto,
          quantity: producto.quantity || 1
        })
      }
      
      localStorage.setItem("cart", JSON.stringify(carritoLocal))
      return { success: true, message: "Producto añadido al carrito", data: carritoLocal }
    } catch (error) {
      console.error("Error al añadir producto al carrito:", error)
      throw error
    }
  },

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {string|number} id - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateQuantity: async (id, quantity) => {
    try {
      console.log(`CarritoService: Actualizando cantidad del producto ${id} a ${quantity}`)
      
      // Actualizar el localStorage
      const carritoLocal = JSON.parse(localStorage.getItem("cart") || "[]")
      const productoIndex = carritoLocal.findIndex(item => item.id === id)
      
      if (productoIndex >= 0) {
        carritoLocal[productoIndex].quantity = quantity
        localStorage.setItem("cart", JSON.stringify(carritoLocal))
        return { success: true, message: "Cantidad actualizada", data: carritoLocal }
      } else {
        throw new Error("Producto no encontrado en el carrito")
      }
    } catch (error) {
      console.error(`Error al actualizar cantidad del producto ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un producto del carrito
   * @param {string|number} id - ID del producto a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  removeItem: async (id) => {
    try {
      console.log(`CarritoService: Eliminando producto ${id} del carrito`)
      
      // Actualizar el localStorage
      const carritoLocal = JSON.parse(localStorage.getItem("cart") || "[]")
      const carritoActualizado = carritoLocal.filter(item => item.id !== id)
      localStorage.setItem("cart", JSON.stringify(carritoActualizado))
      
      return { success: true, message: "Producto eliminado del carrito", data: carritoActualizado }
    } catch (error) {
      console.error(`Error al eliminar producto ${id} del carrito:`, error)
      throw error
    }
  },

  /**
   * Vacía el carrito completamente
   * @returns {Promise<Object>} Resultado de la operación
   */
  clearCart: async () => {
    try {
      console.log("CarritoService: Vaciando carrito")
      
      // Limpiar el localStorage
      localStorage.setItem("cart", JSON.stringify([]))
      
      return { success: true, message: "Carrito vaciado", data: [] }
    } catch (error) {
      console.error("Error al vaciar carrito:", error)
      throw error
    }
  },

  /**
   * Aplica un código de descuento al carrito
   * @param {string} code - Código de descuento
   * @returns {Promise<Object>} Información del descuento aplicado
   */
  applyDiscount: async (code) => {
    try {
      console.log(`CarritoService: Aplicando código de descuento ${code}`)
      
      // Simular descuentos basados en códigos
      let discountAmount = 0;
      let discountMessage = "Código no válido";
      
      // Códigos de descuento de ejemplo
      if (code === "WELCOME10") {
        discountAmount = calculateSubtotal() * 0.1; // 10% de descuento
        discountMessage = "10% de descuento aplicado";
      } else if (code === "FREESHIP") {
        discountAmount = 12000; // Envío gratis
        discountMessage = "Envío gratis aplicado";
      }
      
      // Guardar el descuento en localStorage
      localStorage.setItem("cartDiscount", JSON.stringify({
        code,
        amount: discountAmount,
        message: discountMessage
      }));
      
      return {
        success: discountAmount > 0,
        message: discountMessage,
        discount: discountAmount,
        code: code
      }
    } catch (error) {
      console.error(`Error al aplicar código de descuento ${code}:`, error)
      throw error
    }
  },

  /**
   * Calcula los costos de envío basados en la dirección
   * @param {Object} addressData - Datos de la dirección
   * @returns {Promise<Object>} Costos de envío calculados
   */
  calculateShipping: async (addressData) => {
    try {
      console.log("CarritoService: Calculando costos de envío para:", addressData)
      
      const subtotal = calculateSubtotal();
      const freeShippingThreshold = 100000;
      
      // Lógica simple: envío gratis para compras mayores a 100.000
      const shippingCost = subtotal > freeShippingThreshold ? 0 : 12000;
      
      return {
        shipping: shippingCost,
        freeShippingThreshold: freeShippingThreshold,
        message: subtotal > freeShippingThreshold 
          ? "¡Envío gratis!" 
          : `Envío gratis en compras mayores a $${freeShippingThreshold.toLocaleString()}`
      }
    } catch (error) {
      console.error("Error al calcular costos de envío:", error)
      throw error
    }
  },

  /**
   * Realiza el checkout del carrito
   * @param {Object} checkoutData - Datos para el checkout (dirección, método de pago, etc.)
   * @returns {Promise<Object>} Resultado de la operación
   */
  checkout: async (checkoutData) => {
    try {
      console.log("CarritoService: Realizando checkout con datos:", checkoutData)
      
      // Preparar los datos para el checkout en el formato que espera la API
      const ventaData = {
        venta: {
          IdCliente: checkoutData.clientData.idCliente || 3, // 3 para Consumidor Final
          IdUsuario: 1, // Usuario por defecto
          FechaVenta: new Date().toISOString().split('T')[0],
          Estado: "Efectiva",
          Tipo: "Venta",
          Subtotal: checkoutData.subtotal,
          TotalIva: checkoutData.iva,
          TotalMonto: checkoutData.total,
          MetodoPago: "transferencia",
          NotasAdicionales: `Dirección: ${checkoutData.clientData.direccion}, Tel: ${checkoutData.clientData.telefono}`,
          ComprobantePago: "Pendiente de verificación"
        },
        detallesProductos: checkoutData.items.map(item => ({
          IdProducto: item.id,
          Cantidad: item.quantity,
          PrecioUnitario: item.price
        }))
      };
      
      // Intentar realizar el checkout a través de la API de ventas
      console.log("CarritoService: Enviando datos de venta a la API:", ventaData);
      const response = await axiosInstance.post("/sales/ventas", ventaData);
      console.log("CarritoService: Respuesta de la API:", response.data);
      
      // Crear objeto de pedido para almacenar localmente
      const orderData = {
        id: response.data.id || `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        clientData: checkoutData.clientData,
        items: checkoutData.items,
        subtotal: checkoutData.subtotal,
        iva: checkoutData.iva,
        shipping: checkoutData.shipping,
        discount: checkoutData.discount,
        total: checkoutData.total,
        status: "Pendiente",
        apiResponse: response.data // Guardar la respuesta de la API
      };
      
      // Guardar el pedido en el historial
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      orderHistory.push(orderData);
      localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
      
      // Limpiar el carrito después de un checkout exitoso
      localStorage.setItem("cart", JSON.stringify([]));
      
      // Limpiar el descuento aplicado
      localStorage.removeItem("cartDiscount");
      
      return {
        success: true,
        message: "Pedido procesado correctamente",
        data: orderData
      }
    } catch (error) {
      console.error("Error al realizar checkout:", error);
      console.error("Detalles del error:", error.response?.data || error.message);
      
      // Guardar el pedido fallido en localStorage para intentar sincronizar después
      try {
        const orderData = {
          id: `FAILED-${Date.now()}`,
          date: new Date().toISOString(),
          clientData: checkoutData.clientData,
          items: checkoutData.items,
          subtotal: checkoutData.subtotal,
          iva: checkoutData.iva,
          shipping: checkoutData.shipping,
          discount: checkoutData.discount,
          total: checkoutData.total,
          status: "Fallido",
          error: error.message
        };
        
        const pendingOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");
        pendingOrders.push(orderData);
        localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
        
        return {
          success: false,
          message: "Error al procesar el pedido. Se guardó localmente para intentar más tarde.",
          error: error.message,
          data: orderData
        }
      } catch (localError) {
        console.error("Error al guardar orden pendiente:", localError);
        throw error;
      }
    }
  },
  
  /**
   * Obtiene el historial de pedidos
   * @returns {Promise<Array>} Historial de pedidos
   */
  getOrderHistory: async () => {
    try {
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      return orderHistory;
    } catch (error) {
      console.error("Error al obtener historial de pedidos:", error);
      return [];
    }
  },
  
  /**
   * Obtiene el descuento aplicado actualmente
   * @returns {Object|null} Información del descuento o null si no hay descuento
   */
  getAppliedDiscount: () => {
    try {
      const discount = JSON.parse(localStorage.getItem("cartDiscount") || "null");
      return discount;
    } catch (error) {
      console.error("Error al obtener descuento aplicado:", error);
      return null;
    }
  },
  
  /**
   * Intenta sincronizar pedidos pendientes con el servidor
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  syncPendingOrders: async () => {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");
      
      if (pendingOrders.length === 0) {
        return { success: true, message: "No hay pedidos pendientes para sincronizar" };
      }
      
      const results = [];
      const remainingOrders = [];
      
      for (const order of pendingOrders) {
        try {
          // Preparar los datos para el checkout en el formato que espera la API
          const ventaData = {
            venta: {
              IdCliente: order.clientData.idCliente || 3,
              IdUsuario: 1,
              FechaVenta: new Date(order.date).toISOString().split('T')[0],
              Estado: "Efectiva",
              Tipo: "Venta",
              Subtotal: order.subtotal,
              TotalIva: order.iva,
              TotalMonto: order.total,
              MetodoPago: "transferencia",
              NotasAdicionales: `Dirección: ${order.clientData.direccion}, Tel: ${order.clientData.telefono}`,
              ComprobantePago: "Pendiente de verificación"
            },
            detallesProductos: order.items.map(item => ({
              IdProducto: item.id,
              Cantidad: item.quantity,
              PrecioUnitario: item.price
            }))
          };
          
          // Intentar enviar el pedido
          const response = await axiosInstance.post("/sales/ventas", ventaData);
          
          results.push({
            orderId: order.id,
            success: true,
            response: response.data
          });
          
          // Añadir al historial de pedidos exitosos
          const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
          orderHistory.push({
            ...order,
            status: "Sincronizado",
            apiResponse: response.data
          });
          localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
          
        } catch (error) {
          console.error(`Error al sincronizar pedido ${order.id}:`, error);
          results.push({
            orderId: order.id,
            success: false,
            error: error.message
          });
          
          // Mantener en la lista de pendientes
          remainingOrders.push(order);
        }
      }
      
      // Actualizar la lista de pedidos pendientes
      localStorage.setItem("pendingOrders", JSON.stringify(remainingOrders));
      
      return {
        success: true,
        message: `Sincronización completada. ${results.filter(r => r.success).length} de ${pendingOrders.length} pedidos sincronizados.`,
        results
      };
      
    } catch (error) {
      console.error("Error al sincronizar pedidos pendientes:", error);
      return {
        success: false,
        message: "Error al sincronizar pedidos pendientes",
        error: error.message
      };
    }
  }
}

/**
 * Función auxiliar para calcular el subtotal del carrito local
 * @returns {number} Subtotal calculado
 */
function calculateSubtotal() {
  try {
    const carritoLocal = JSON.parse(localStorage.getItem("cart") || "[]")
    return carritoLocal.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  } catch (error) {
    console.error("Error al calcular subtotal local:", error)
    return 0
  }
}

export default CarritoService