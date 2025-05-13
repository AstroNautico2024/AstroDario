"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Save, ArrowLeft, Trash2, Plus, FileText } from "lucide-react"
import Select from "react-select"
import "../../../Styles/AdminStyles/RegistrarVenta.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"

// Importar los servicios para consumir las APIs
import VentasService from "../../../Services/ConsumoAdmin/VentasService.js"
import ProductosService from "../../../Services/ConsumoAdmin/ProductosService.js"
import ClientesService from "../../../Services/ConsumoAdmin/ClientesService.js"
import ServiciosService from "../../../Services/ConsumoAdmin/serviciosService.js"
import MascotasService from "../../../Services/ConsumoAdmin/MascotasService.js"

const RegistrarVenta = () => {
  const navigate = useNavigate()

  // Obtener el usuario actual del localStorage o de la sesión
  const [currentUser, setCurrentUser] = useState(null)

  // Estado para indicar carga
  const [loading, setLoading] = useState(false)

  // Estado para los productos disponibles
  const [productos, setProductos] = useState([])

  // Estado para los servicios disponibles
  const [servicios, setServicios] = useState([])

  // Estado para el tipo de ítem seleccionado (producto o servicio)
  const [tipoItem, setTipoItem] = useState("producto")

  // Estado para los clientes disponibles
  const [clientes, setClientes] = useState([])

  // Estados para el manejo de mascotas
  const [mascotas, setMascotas] = useState([])
  const [mascotasOptions, setMascotasOptions] = useState([])
  const [loadingMascotas, setLoadingMascotas] = useState(false)
  const [mascotaTemporal, setMascotaTemporal] = useState("")
  const [tipoMascotaTemporal, setTipoMascotaTemporal] = useState("Canino")

  // Estado para la mascota seleccionada
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null)

  // Estado para errores de validación
  const [errorMascota, setErrorMascota] = useState("")

  // Estado para el formulario
  const [formData, setFormData] = useState({
    codigoFactura: "",
    cliente: null,
    idUsuario: null,
    fechaVenta: new Date().toISOString().split("T")[0],
    productosAgregados: [],
    productoSeleccionado: null,
    cantidad: 1,
    notasAdicionales: "",
    comprobantePago: "",
    estado: "Efectiva",
    tipo: "Venta",
  })

  // Estado para el método de pago y monto recibido
  const [metodoPago, setMetodoPago] = useState("efectivo")
  // Cambiar la inicialización del estado montoRecibido de cadena vacía a 0
  const [montoRecibido, setMontoRecibido] = useState(0)

  // Referencias para las notificaciones
  const toastIds = useRef({})

  // Generar un código de factura único
  const generateInvoiceCode = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `VENT-${year}-${randomNum}`
  }

  // Función para verificar si un cliente es "Consumidor Final"
  const esConsumidorFinal = (cliente) => {
    if (!cliente) return false

    // Verificar por ID (debe ser 3 según lo indicado)
    if (cliente.idCliente === 3 || cliente.IdCliente === 3) {
      return true
    }

    // Verificar por documento (0000000000)
    if (cliente.documento === "0000000000" || cliente.Documento === "0000000000") {
      return true
    }

    // Verificar por nombre
    if (
      (cliente.nombre === "Consumidor" || cliente.Nombre === "Consumidor") &&
      (cliente.apellido === "Final" || cliente.Apellido === "Final")
    ) {
      return true
    }

    return false
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  // Función para cargar todos los datos iniciales
  const cargarDatosIniciales = async () => {
    setLoading(true)
    try {
      // Cargar el usuario actual
      const currentUserData = getUserFromStorage()
      setCurrentUser(currentUserData)

      // IMPORTANTE: Inicializar el formulario con cliente: null ANTES de cargar clientes
      setFormData({
        codigoFactura: generateInvoiceCode(),
        cliente: null, // Explícitamente null para evitar selección automática
        idUsuario: currentUserData,
        fechaVenta: new Date().toISOString().split("T")[0],
        productosAgregados: [],
        productoSeleccionado: null,
        cantidad: 1,
        notasAdicionales: "",
        comprobantePago: "",
        estado: "Efectiva",
        tipo: "Venta",
      })

      // Cargar clientes, productos y servicios en paralelo
      await Promise.all([cargarClientes(), cargarProductos(), cargarServicios()])

      console.log("Formulario inicializado con cliente: null")
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron cargar los datos iniciales. Por favor, recargue la página.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } finally {
      setLoading(false)
    }
  }

  // Obtener el usuario actual del localStorage
  const getUserFromStorage = () => {
    try {
      // Intentar obtener el usuario del localStorage usando la clave "userData"
      const userData = localStorage.getItem("userData")

      if (userData) {
        const parsedUser = JSON.parse(userData)
        console.log("Usuario logueado encontrado en localStorage:", parsedUser)

        // Asegurarse de que el usuario tenga las propiedades necesarias
        return {
          id: parsedUser.IdUsuario || parsedUser.id || 1,
          nombre:
            `${parsedUser.Nombre || parsedUser.nombre || ""} ${parsedUser.Apellido || parsedUser.apellido || ""}`.trim(),
          documento: parsedUser.Documento || parsedUser.documento || "1234567890",
        }
      }

      // Si no hay usuario en userData, intentar con currentUser
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log("Usuario encontrado en currentUser:", parsedUser)

        return {
          id: parsedUser.id || parsedUser.Id || parsedUser.idUsuario || parsedUser.IdUsuario || 1,
          nombre: parsedUser.nombre || parsedUser.Nombre || "Usuario Actual",
          documento: parsedUser.documento || parsedUser.Documento || parsedUser.identificacion || "1234567890",
        }
      }

      // Si no hay usuario en localStorage, crear un usuario por defecto
      console.warn("No se encontró información del usuario en localStorage, usando valores por defecto")
      return {
        id: 1,
        nombre: "Usuario Actual",
        documento: "1234567890",
      }
    } catch (error) {
      console.error("Error al obtener el usuario:", error)
      // Devolver un usuario por defecto en caso de error
      return {
        id: 1,
        nombre: "Usuario Actual",
        documento: "1234567890",
      }
    }
  }

  // Cargar clientes desde la API usando ClientesService
  const cargarClientes = async () => {
    try {
      // Cargar clientes regulares
      const clientesData = await ClientesService.getAll()
      console.log("Respuesta de clientes:", clientesData)

      // Verificar que data sea un array
      if (!Array.isArray(clientesData)) {
        console.error("La respuesta de clientes no es un array:", clientesData)
        setClientes([])
        return
      }

      // Crear un mapa para rastrear clientes por documento e identificar duplicados
      const clientesPorDocumento = new Map()

      // Primero, agregar todos los clientes regulares al mapa
      clientesData.forEach((cliente) => {
        const documento = cliente.documento || cliente.Documento || ""
        if (documento) {
          clientesPorDocumento.set(documento, cliente)
        }
      })

      // Buscar el cliente "Consumidor Final" en los datos recibidos
      const clienteConsumidorFinal = clientesData.find(
        (cliente) =>
          cliente.documento === "0000000000" ||
          cliente.Documento === "0000000000" ||
          ((cliente.nombre === "Consumidor" || cliente.Nombre === "Consumidor") &&
            (cliente.apellido === "Final" || cliente.Apellido === "Final")),
      )

      console.log("Cliente Consumidor Final encontrado:", clienteConsumidorFinal)

      // Preparar la lista final de clientes
      let listaFinalClientes = []

      // Agregar Consumidor Final al principio si existe
      if (clienteConsumidorFinal) {
        listaFinalClientes.push(clienteConsumidorFinal)
        // Remover Consumidor Final del mapa para evitar duplicados
        clientesPorDocumento.delete(clienteConsumidorFinal.documento || clienteConsumidorFinal.Documento)
      } else {
        // Si no existe, crear un cliente "Consumidor Final" por defecto
        const clienteDefault = {
          idCliente: 3,
          IdCliente: 3,
          nombre: "Consumidor",
          Nombre: "Consumidor",
          apellido: "Final",
          Apellido: "Final",
          documento: "0000000000",
          Documento: "0000000000",
          correo: "",
          Correo: "",
          telefono: "",
          Telefono: "",
          direccion: "",
          Direccion: "",
          estado: true,
          Estado: true,
        }
        listaFinalClientes.push(clienteDefault)
        console.log("Cliente Consumidor Final creado:", clienteDefault)
      }

      // Agregar el resto de clientes regulares
      listaFinalClientes = [...listaFinalClientes, ...Array.from(clientesPorDocumento.values())]

      // Establecer la lista final de clientes
      setClientes(listaFinalClientes)
      console.log("Lista final de clientes:", listaFinalClientes)
    } catch (error) {
      console.error("Error al cargar los clientes:", error)
      // Asegurar que al menos exista el cliente "Consumidor Final"
      const clienteDefault = {
        idCliente: 3,
        IdCliente: 3,
        nombre: "Consumidor",
        Nombre: "Consumidor",
        apellido: "Final",
        Apellido: "Final",
        documento: "0000000000",
        Documento: "0000000000",
        correo: "",
        Correo: "",
        telefono: "",
        Telefono: "",
        direccion: "",
        Direccion: "",
        estado: true,
        Estado: true,
      }
      setClientes([clienteDefault])
      console.log("Cliente Consumidor Final creado por error:", clienteDefault)
    }
  }

  // Cargar productos desde la API usando ProductosService
  const cargarProductos = async () => {
    try {
      const data = await ProductosService.getActivosParaCompras()
      setProductos(data)
    } catch (error) {
      console.error("Error al cargar los productos:", error)
      setProductos([])
    }
  }

  // Cargar servicios desde la API usando ServiciosService
  const cargarServicios = async () => {
    try {
      const data = await ServiciosService.obtenerTodos()
      // Filtrar solo servicios activos
      const serviciosActivos = data.filter((servicio) => servicio.Estado === true || servicio.Estado === 1)
      setServicios(serviciosActivos)
    } catch (error) {
      console.error("Error al cargar los servicios:", error)
      setServicios([])
    }
  }

  // Cargar mascotas del cliente usando MascotasService
  const cargarMascotas = async (idCliente) => {
    setLoadingMascotas(true)
    setMascotas([])
    setMascotasOptions([])

    try {
      console.log(`Cargando mascotas para cliente ID: ${idCliente}`)
      const mascotasData = await MascotasService.getMascotas(idCliente)

      if (mascotasData && mascotasData.length > 0) {
        setMascotas(mascotasData)

        // Normalizar los datos para manejar diferentes formatos de respuesta
        const newMascotasOptions = mascotasData.map((mascota) => ({
          value: {
            id: mascota.id || mascota.IdMascota,
            IdMascota: mascota.IdMascota || mascota.id,
            IdCliente: mascota.IdCliente || mascota.idCliente,
            Nombre: mascota.Nombre || mascota.nombre,
            nombre: mascota.nombre || mascota.Nombre,
            // Usar la información de especie enriquecida
            Tipo:
              mascota.Tipo ||
              mascota.tipo ||
              (mascota.especieInfo ? mascota.especieInfo.NombreEspecie : "No especificado"),
            tipo:
              mascota.tipo ||
              mascota.Tipo ||
              (mascota.especieInfo ? mascota.especieInfo.NombreEspecie : "No especificado"),
            Raza: mascota.Raza || mascota.raza,
            raza: mascota.raza || mascota.Raza,
          },
          label: `${mascota.Nombre || mascota.nombre} (${
            mascota.Tipo ||
            mascota.tipo ||
            (mascota.especieInfo ? mascota.especieInfo.NombreEspecie : "No especificado")
          })`,
        }))

        setMascotasOptions(newMascotasOptions)
        console.log("Opciones de mascotas actualizadas:", newMascotasOptions)
      } else {
        console.log("No se encontraron mascotas para este cliente")
        setMascotas([])
        setMascotasOptions([])
      }
    } catch (error) {
      console.error("Error general al cargar las mascotas:", error)
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se pudieron cargar las mascotas. Intente nuevamente.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } finally {
      setLoadingMascotas(false)
    }
  }

  // Cargar mascotas cuando cambia el cliente
  useEffect(() => {
    if (formData.cliente) {
      // Verificar si el cliente es Consumidor Final
      if (esConsumidorFinal(formData.cliente)) {
        console.log("Cliente es Consumidor Final, limpiando mascotas")
        setMascotas([])
        setMascotasOptions([])
      } else {
        // Para clientes regulares, cargar sus mascotas
        const idCliente = formData.cliente.idCliente || formData.cliente.IdCliente
        if (!idCliente) {
          console.error("ID de cliente no válido:", formData.cliente)
          return
        }

        console.log("Cliente regular seleccionado, cargando mascotas para ID:", idCliente)
        // Cargar mascotas inmediatamente sin retraso
        cargarMascotas(idCliente)
      }
    } else {
      console.log("No hay cliente seleccionado, limpiando mascotas")
      setMascotas([])
      setMascotasOptions([])
    }

    // Siempre limpiar la mascota seleccionada cuando cambia el cliente
    setMascotaSeleccionada(null)
    setErrorMascota("")
    setMascotaTemporal("")
  }, [formData.cliente])

  // Función para formatear números con separadores de miles
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Manejador para cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Manejador para cambiar entre productos y servicios
  const handleTipoItemChange = (tipo) => {
    setTipoItem(tipo)
    setFormData({
      ...formData,
      productoSeleccionado: null,
    })
    // Limpiar la mascota seleccionada si cambiamos a producto
    if (tipo === "producto") {
      setMascotaSeleccionada(null)
      setMascotaTemporal("")
      setErrorMascota("")
    }
  }

  // Manejador para seleccionar un producto o servicio
  const handleSelectProduct = (selectedOption) => {
    setFormData({
      ...formData,
      productoSeleccionado: selectedOption ? selectedOption.value : null,
    })
  }

  // Manejador para seleccionar un cliente
  const handleSelectCliente = (selectedOption) => {
    const clienteSeleccionado = selectedOption ? selectedOption.value : null
    console.log("Cliente seleccionado manualmente:", clienteSeleccionado)

    // Actualizar el estado con el cliente seleccionado
    setFormData({
      ...formData,
      cliente: clienteSeleccionado,
    })

    // Limpiar la mascota seleccionada cuando cambia el cliente
    setMascotaSeleccionada(null)
    setMascotaTemporal("")
    setErrorMascota("")
  }

  // Manejador para cambiar el método de pago
  const handleMetodoPagoChange = (metodo) => {
    setMetodoPago(metodo)
    // Reset monto recibido when changing payment method
    if (metodo === "transferencia") {
      setMontoRecibido(0)
    }
  }

  // Modificar la función handleMontoRecibidoChange para seleccionar todo el contenido al hacer focus
  const handleMontoRecibidoChange = (e) => {
    setMontoRecibido(Number.parseFloat(e.target.value) || 0)
  }

  // Añadir una función para seleccionar todo el contenido del campo al hacer focus
  const handleMontoRecibidoFocus = (e) => {
    e.target.select()
  }

  // Calcular totales
  const calcularTotales = () => {
    const productos = formData.productosAgregados

    const subtotal = productos.reduce((total, producto) => total + producto.subtotal, 0)
    const totalIVA = productos.reduce((total, producto) => {
      return total + producto.subtotal * (producto.iva / 100)
    }, 0)
    const total = subtotal + totalIVA

    return {
      subtotal,
      totalIVA,
      total,
    }
  }

  // Modificar la función calcularCambio para manejar correctamente cuando montoRecibido es una cadena vacía
  const calcularCambio = () => {
    const total = calcularTotales().total
    const montoNumerico = montoRecibido === "" ? 0 : Number(montoRecibido)
    return montoNumerico > total ? montoNumerico - total : 0
  }

  // Manejador para agregar un producto o servicio a la lista
  // Manejador para agregar un producto o servicio a la lista
  const handleAddProduct = () => {
    if (!formData.productoSeleccionado) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, seleccione un producto o servicio.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Validar que se haya seleccionado una mascota si es un servicio
    if (tipoItem === "servicio") {
      // Verificar si es Consumidor Final
      if (esConsumidorFinal(formData.cliente)) {
        // Para Consumidor Final, verificar que se haya ingresado un nombre de mascota
        if (!mascotaTemporal.trim()) {
          setErrorMascota("Por favor, ingrese un nombre para la mascota")
          toast.error(
            <div>
              <strong>Error</strong>
              <p>Por favor, ingrese un nombre para la mascota.</p>
            </div>,
            {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          )
          return
        }

        // Crear mascota temporal para Consumidor Final
        const mascotaTemp = {
          id: 1, // Usar ID 1 para mascota genérica
          IdMascota: 1, // Usar ID 1 para mascota genérica
          nombre: mascotaTemporal,
          Nombre: mascotaTemporal,
          tipo: tipoMascotaTemporal,
          Tipo: tipoMascotaTemporal,
          _temporal: true,
          _nombreMascota: mascotaTemporal, // Guardar el nombre para mostrar en la interfaz
          _tipoMascota: tipoMascotaTemporal, // Guardar el tipo para mostrar en la interfaz
        }

        // Establecer la mascota temporal como seleccionada
        setMascotaSeleccionada(mascotaTemp)
        console.log("Mascota temporal creada:", mascotaTemp)
      }
      // Para clientes regulares, verificar que se haya seleccionado una mascota
      else if (!mascotaSeleccionada) {
        setErrorMascota("Por favor, seleccione una mascota para este servicio")
        toast.error(
          <div>
            <strong>Error</strong>
            <p>Por favor, seleccione una mascota para este servicio.</p>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        )
        return
      }
    }

    const productoSeleccionado = formData.productoSeleccionado
    const cantidad = Number(formData.cantidad)

    if (cantidad <= 0) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>La cantidad debe ser mayor a cero.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    const precioUnitario = productoSeleccionado.precioUnitario || productoSeleccionado.Precio
    const iva = productoSeleccionado.iva || productoSeleccionado.PorcentajeIVA || 0 // Asegurarse de que el IVA sea 0 si no está definido
    const subtotal = precioUnitario * cantidad
    const totalConIVA = subtotal * (1 + iva / 100)

    // Determinar el ID correcto según el tipo de ítem
    let id
    if (tipoItem === "producto") {
      id = productoSeleccionado.id || productoSeleccionado.IdProducto || productoSeleccionado.idProducto
    } else {
      id = productoSeleccionado.id || productoSeleccionado.IdServicio || productoSeleccionado.idServicio
    }

    // Usar la mascota seleccionada o la mascota temporal que acabamos de crear
    const mascotaParaServicio = tipoItem === "servicio" ? mascotaSeleccionada : null

    if (tipoItem === "servicio") {
      console.log("Mascota para servicio:", mascotaParaServicio)
    }

    const nuevoProducto = {
      id: id,
      codigoBarras: productoSeleccionado.codigoBarras || productoSeleccionado.CodigoBarras || "",
      nombre: productoSeleccionado.nombre || productoSeleccionado.NombreProducto || productoSeleccionado.Nombre || "",
      tipo: tipoItem,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      iva: iva,
      subtotal: subtotal,
      totalConIVA: totalConIVA,
      // Guardar el objeto original para referencia
      original: productoSeleccionado,
      // Si es un servicio, guardar la mascota
      mascota: mascotaParaServicio,
    }

    setFormData({
      ...formData,
      productosAgregados: [...formData.productosAgregados, nuevoProducto],
      productoSeleccionado: null,
      cantidad: 1,
    })

    // Limpiar la mascota seleccionada después de agregar el servicio
    if (tipoItem === "servicio") {
      setMascotaSeleccionada(null)
      setMascotaTemporal("")
      setTipoMascotaTemporal("Canino")
    }
  }

  // Manejador para remover un producto de la lista
  const handleRemoveProduct = (index) => {
    const productosActualizados = [...formData.productosAgregados]
    productosActualizados.splice(index, 1)
    setFormData({
      ...formData,
      productosAgregados: productosActualizados,
    })
  }

  // Manejador para guardar la venta usando VentasService
  const handleSaveVenta = async () => {
    // Validaciones básicas
    // Verificar que haya un cliente seleccionado
    if (!formData.cliente) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, seleccione un cliente para la venta.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    if (!formData.idUsuario) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>No se ha podido identificar al vendedor. Por favor, inicie sesión nuevamente.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    if (formData.productosAgregados.length === 0) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, agregue al menos un producto o servicio a la venta.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    if (metodoPago === "transferencia" && !formData.comprobantePago.trim()) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Por favor, ingrese una referencia de transferencia.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Modificar la validación en handleSaveVenta para manejar correctamente cuando montoRecibido es una cadena vacía
    // En la validación dentro de handleSaveVenta, reemplazar:
    // if (metodoPago === "efectivo" && montoRecibido < calcularTotales().total) {
    // con:
    if (metodoPago === "efectivo" && (montoRecibido === "" || Number(montoRecibido) < calcularTotales().total)) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>El monto recibido debe ser igual o mayor al total de la venta.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Calcular totales
    const { subtotal, totalIVA, total } = calcularTotales()

    // Separar productos y servicios
    const detallesProductos = formData.productosAgregados
      .filter((item) => item.tipo === "producto")
      .map((item) => ({
        IdProducto: item.id,
        Cantidad: item.cantidad,
        PrecioUnitario: item.precioUnitario,
      }))

    // Asegurarse de que cada servicio tenga un IdServicio y un IdMascota válidos
    const detallesServicios = formData.productosAgregados
      .filter((item) => item.tipo === "servicio")
      .map((item) => {
        // Obtener el ID del servicio del objeto original si está disponible
        const original = item.original || {}
        const idServicio = item.id || original.IdServicio || original.idServicio || original.id

        // Obtener la información de la mascota
        const mascota = item.mascota || {}

        // Determinar el ID de mascota según el tipo de cliente
        let idMascota = null
        let nombreMascotaTemporal = null
        let tipoMascotaTemporal = null

        // Para clientes regulares con mascotas registradas
        if (!esConsumidorFinal(formData.cliente) && mascota.IdMascota) {
          idMascota = mascota.IdMascota || mascota.id
          // También guardar el nombre de la mascota registrada para mostrar en la factura
          nombreMascotaTemporal = mascota.nombre || mascota.Nombre || ""
          tipoMascotaTemporal = mascota.tipo || mascota.Tipo || "Canino"
        }
        // Para Consumidor Final, guardar información de la mascota temporal
        else if (esConsumidorFinal(formData.cliente) && mascota) {
          nombreMascotaTemporal = mascota.nombre || mascota.Nombre || mascota._nombreMascota || ""
          tipoMascotaTemporal = mascota.tipo || mascota.Tipo || mascota._tipoMascota || "Canino"
        }

        console.log("Detalle de servicio a enviar:", {
          IdServicio: idServicio,
          IdMascota: idMascota,
          NombreMascotaTemporal: nombreMascotaTemporal,
          TipoMascotaTemporal: tipoMascotaTemporal,
          Cantidad: item.cantidad,
          PrecioUnitario: item.precioUnitario,
        })

        return {
          IdServicio: idServicio,
          IdMascota: idMascota,
          Cantidad: item.cantidad,
          PrecioUnitario: item.precioUnitario,
          // Enviar los campos directamente en lugar de un objeto MascotaTemporal
          NombreMascotaTemporal: nombreMascotaTemporal,
          TipoMascotaTemporal: tipoMascotaTemporal,
        }
      })

    // Verificar que todos los servicios tengan un ID válido
    const serviciosSinId = detallesServicios.filter((servicio) => !servicio.IdServicio)
    if (serviciosSinId.length > 0) {
      toast.error(
        <div>
          <strong>Error</strong>
          <p>Hay servicios sin ID. Por favor, vuelva a seleccionar los servicios.</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
      return
    }

    // Crear la estructura de datos en formato anidado
    const ventaData = {
      venta: {
        IdCliente: formData.cliente ? formData.cliente.idCliente || formData.cliente.IdCliente || 3 : 3,
        IdUsuario: formData.idUsuario ? formData.idUsuario.id : currentUser ? currentUser.id : 1,
        FechaVenta: formData.fechaVenta,
        NotasAdicionales: formData.notasAdicionales,
        ComprobantePago: formData.comprobantePago,
        Estado: formData.estado,
        Tipo: formData.tipo,
        Subtotal: subtotal,
        TotalIva: totalIVA,
        TotalMonto: total,
        MetodoPago: metodoPago,
        MontoRecibido: metodoPago === "efectivo" ? montoRecibido : 0,
        Cambio: metodoPago === "efectivo" ? calcularCambio() : 0,
      },
      detallesProductos,
      detallesServicios,
    }

    console.log("Datos a enviar al servidor:", JSON.stringify(ventaData, null, 2))

    try {
      setLoading(true)
      // Llamar al servicio para guardar la venta
      const response = await VentasService.create(ventaData)

      toast.success(
        <div>
          <strong>Venta registrada</strong>
          <p>La venta con código "{formData.codigoFactura}" ha sido registrada correctamente.</p>
        </div>,
        {
          icon: "✅",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            // Redirigir a la lista de ventas después de que se cierre la notificación
            navigate("/ventas/ventas")
          },
        },
      )
    } catch (error) {
      console.error("Error al guardar la venta:", error)
      let errorMessage = "No se pudo registrar la venta. Por favor, intente nuevamente."

      // Verificar si hay un mensaje específico del servidor
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }

        // Mostrar detalles adicionales en la consola
        console.error("Detalles completos del error:", error.response.data)
      }

      toast.error(
        <div>
          <strong>Error</strong>
          <p>{errorMessage}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      )
    } finally {
      setLoading(false)
    }
  }

  // Manejador para cancelar y volver a la lista de ventas
  const handleCancel = () => {
    navigate("/ventas/ventas")
  }

  // Definición de columnas para la tabla de productos agregados
  const productosAgregadosColumns = [
    { field: "codigoBarras", header: "Código" },
    { field: "nombre", header: "Nombre" },
    {
      field: "tipo",
      header: "Tipo",
      render: (row) => (row.tipo === "producto" ? "Producto" : "Servicio"),
    },
    // Columna para mostrar la mascota (solo para servicios)
    // Columna para mostrar la mascota (solo para servicios)
    {
      field: "mascota",
      header: "Mascota",
      render: (row) => {
        if (row.tipo !== "servicio" || !row.mascota) return "-"
        // Asegurarse de mostrar el nombre de la mascota temporal o registrada
        const nombreMascota = row.mascota._nombreMascota || row.mascota.nombre || row.mascota.Nombre || "Sin nombre"
        const tipoMascota = row.mascota._tipoMascota || row.mascota.tipo || row.mascota.Tipo || "No especificado"
        return `${nombreMascota} (${tipoMascota})`
      },
    },
    { field: "cantidad", header: "Cantidad" },
    {
      field: "precioUnitario",
      header: "Precio Unitario",
      render: (row) => `${formatNumber(row.precioUnitario)}`,
    },
    {
      field: "iva",
      header: "IVA",
      render: (row) => `${row.iva}%`,
    },
    {
      field: "subtotal",
      header: "Subtotal",
      render: (row) => `${formatNumber(row.subtotal)}`,
    },
    {
      field: "totalConIVA",
      header: "Total con IVA",
      render: (row) => `${formatNumber(row.totalConIVA)}`,
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row, index) => (
        <button className="btn btn-sm btn-danger" onClick={() => handleRemoveProduct(index)}>
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  // Opciones para el select de productos
  const productosOptions = productos.map((producto) => ({
    value: producto,
    label: `${producto.NombreProducto || producto.nombre} - ${producto.CodigoBarras || producto.codigoBarras || "N/A"} - ${formatNumber(producto.Precio || producto.precioUnitario)}`,
  }))

  // Opciones para el select de servicios
  const serviciosOptions = servicios.map((servicio) => ({
    value: servicio,
    label: `${servicio.Nombre || servicio.nombre} - ${servicio.Codigo || servicio.codigo || ""} - ${formatNumber(servicio.Precio || servicio.precioUnitario)}`,
  }))

  // Opciones para el select de clientes
  const clientesOptions = clientes.map((cliente) => ({
    value: cliente,
    label:
      `${cliente.nombre || cliente.Nombre || ""} ${cliente.apellido || cliente.Apellido || ""} - ${cliente.documento || cliente.Documento || ""}`.trim(),
  }))

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0d6efd" : state.isFocused ? "#f8f9fa" : null,
      color: state.isSelected ? "white" : "black",
    }),
  }

  return (
    <div className="registrar-venta-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registrar Venta</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleCancel}>
          <ArrowLeft size={18} className="me-1" />
          Volver a Ventas
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form className="venta-form">
            <div className="row mb-3">
              <div className="col-md-3">
                <label htmlFor="codigoFactura" className="form-label">
                  Código de Factura
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="codigoFactura"
                  name="codigoFactura"
                  value={formData.codigoFactura}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="cliente" className="form-label">
                  Cliente <span className="text-danger">*</span>
                </label>
                <Select
                  id="cliente"
                  name="cliente"
                  options={clientesOptions}
                  value={
                    formData.cliente
                      ? clientesOptions.find(
                          (option) =>
                            (option.value.idCliente &&
                              formData.cliente.idCliente &&
                              option.value.idCliente === formData.cliente.idCliente) ||
                            (option.value.IdCliente &&
                              formData.cliente.IdCliente &&
                              option.value.IdCliente === formData.cliente.IdCliente),
                        )
                      : null
                  }
                  onChange={handleSelectCliente}
                  placeholder="Seleccione un cliente..."
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No se encontraron clientes"}
                />
                <small className="text-muted d-block mt-1">
                  Seleccione "Consumidor Final" para ventas sin registro de cliente.
                </small>
              </div>
              <div className="col-md-3">
                <label htmlFor="idUsuario" className="form-label">
                  Vendedor
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="idUsuario"
                  name="idUsuario"
                  value={
                    formData.idUsuario
                      ? `${formData.idUsuario.nombre || formData.idUsuario.Nombre || "Usuario"} - ${formData.idUsuario.documento || formData.idUsuario.Documento || ""}`
                      : ""
                  }
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="fechaVenta" className="form-label">
                  Fecha de Venta <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaVenta"
                  name="fechaVenta"
                  value={formData.fechaVenta}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <hr className="my-4" />

            <h5 className="mb-3">Agregar Productos y Servicios</h5>

            <div className="row mb-3">
              <div className="col-md-12 mb-3">
                <div className="btn-group" role="group" aria-label="Tipo de ítem">
                  <button
                    type="button"
                    className={`btn ${tipoItem === "producto" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleTipoItemChange("producto")}
                  >
                    <span className="me-1">📦</span>
                    Productos
                  </button>
                  <button
                    type="button"
                    className={`btn ${tipoItem === "servicio" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleTipoItemChange("servicio")}
                  >
                    <span className="me-1">🔧</span>
                    Servicios
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="producto" className="form-label">
                  {tipoItem === "producto" ? "Producto" : "Servicio"}
                </label>
                <Select
                  id="producto"
                  name="producto"
                  options={tipoItem === "producto" ? productosOptions : serviciosOptions}
                  value={
                    formData.productoSeleccionado
                      ? (tipoItem === "producto" ? productosOptions : serviciosOptions).find(
                          (option) =>
                            option.value.id === formData.productoSeleccionado.id ||
                            option.value.IdProducto === formData.productoSeleccionado.IdProducto,
                        )
                      : null
                  }
                  onChange={handleSelectProduct}
                  placeholder={`Seleccione un ${tipoItem === "producto" ? "producto" : "servicio"}...`}
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => `No se encontraron ${tipoItem === "producto" ? "productos" : "servicios"}`}
                />
              </div>

              {tipoItem === "servicio" && (
                <div className="col-md-4">
                  <label htmlFor="mascota" className="form-label">
                    Mascota <span className="text-danger">*</span>
                  </label>

                  {formData.cliente && esConsumidorFinal(formData.cliente) ? (
                    // Para "Consumidor Final", mostrar campos para mascota temporal
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="text"
                          className={`form-control ${errorMascota ? "is-invalid" : ""}`}
                          placeholder="Nombre de la mascota"
                          value={mascotaTemporal || ""}
                          onChange={(e) => {
                            setMascotaTemporal(e.target.value)
                            setErrorMascota("")

                            // No crear automáticamente la mascota temporal aquí,
                            // se creará cuando se agregue el servicio
                          }}
                          disabled={!formData.productoSeleccionado}
                        />
                      </div>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={tipoMascotaTemporal || "Canino"}
                          onChange={(e) => setTipoMascotaTemporal(e.target.value)}
                          disabled={!formData.productoSeleccionado}
                        >
                          <option value="Canino">Canino</option>
                          <option value="Felino">Felino</option>
                        </select>
                      </div>
                      {errorMascota && <div className="invalid-feedback d-block">{errorMascota}</div>}
                    </div>
                  ) : (
                    // Para clientes registrados, mostrar dropdown de mascotas
                    <>
                      <Select
                        id="mascota"
                        name="mascota"
                        options={mascotasOptions}
                        value={
                          mascotaSeleccionada
                            ? mascotasOptions.find(
                                (option) =>
                                  option.value.id === mascotaSeleccionada.id ||
                                  option.value.IdMascota === mascotaSeleccionada.IdMascota,
                              )
                            : null
                        }
                        onChange={(selected) => {
                          setMascotaSeleccionada(selected ? selected.value : null)
                          setErrorMascota("")
                          console.log("Mascota seleccionada:", selected ? selected.value : null)
                        }}
                        placeholder={loadingMascotas ? "Cargando mascotas..." : "Seleccione una mascota..."}
                        styles={customSelectStyles}
                        isClearable
                        isSearchable
                        isDisabled={!formData.productoSeleccionado || loadingMascotas}
                        noOptionsMessage={() => "No hay mascotas registradas para este cliente"}
                        className={errorMascota ? "is-invalid" : ""}
                      />
                      {errorMascota && <div className="invalid-feedback d-block">{errorMascota}</div>}
                    </>
                  )}

                  <small className="text-muted d-block mt-1">
                    {formData.cliente && esConsumidorFinal(formData.cliente)
                      ? "Ingrese el nombre de la mascota para este servicio"
                      : "Seleccione la mascota para este servicio"}
                  </small>
                </div>
              )}

              <div className="col-md-2">
                <label htmlFor="cantidad" className="form-label">
                  Cantidad
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className={`col-md-${tipoItem === "servicio" ? "2" : "4"} d-flex align-items-end`}>
                <button
                  type="button"
                  className="btn btn-success ms-auto w-100"
                  onClick={handleAddProduct}
                  disabled={
                    !formData.productoSeleccionado ||
                    (tipoItem === "servicio" && !mascotaSeleccionada && !mascotaTemporal.trim())
                  }
                >
                  <Plus size={18} className="me-1" />
                  Agregar
                </button>
              </div>
            </div>

            <div className="table-responsive mt-4">
              <table className="table table-striped table-bordered">
                <thead className="table-primary">
                  <tr>
                    {productosAgregadosColumns.map((column) => (
                      <th key={column.field}>{column.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.productosAgregados.length > 0 ? (
                    formData.productosAgregados.map((producto, index) => (
                      <tr key={`${producto.id}-${index}`}>
                        {productosAgregadosColumns.map((column) => (
                          <td key={`${producto.id}-${column.field}`}>
                            {column.render ? column.render(producto, index) : producto[column.field]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={productosAgregadosColumns.length} className="text-center py-3">
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 d-flex align-items-center">
                      <FileText size={18} className="me-2" />
                      Resumen de la Venta
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Subtotal:</strong>
                      <span>${formatNumber(calcularTotales().subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Total IVA:</strong>
                      <span>${formatNumber(calcularTotales().totalIVA)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <span className="text-primary fw-bold">${formatNumber(calcularTotales().total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Información Adicional</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Método de Pago <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="metodoPago"
                            id="pagoEfectivo"
                            checked={metodoPago === "efectivo"}
                            onChange={() => handleMetodoPagoChange("efectivo")}
                          />
                          <label className="form-check-label" htmlFor="pagoEfectivo">
                            Efectivo
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="metodoPago"
                            id="pagoTransferencia"
                            checked={metodoPago === "transferencia"}
                            onChange={() => handleMetodoPagoChange("transferencia")}
                          />
                          <label className="form-check-label" htmlFor="pagoTransferencia">
                            Transferencia
                          </label>
                        </div>
                      </div>

                      {metodoPago === "efectivo" && (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label htmlFor="montoRecibido" className="form-label">
                              Monto Recibido
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                className="form-control"
                                id="montoRecibido"
                                value={montoRecibido}
                                onChange={handleMontoRecibidoChange}
                                onFocus={handleMontoRecibidoFocus}
                                min={calcularTotales().total}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="cambio" className="form-label">
                              Cambio
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="text"
                                className="form-control bg-light"
                                id="cambio"
                                value={formatNumber(calcularCambio())}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {metodoPago === "transferencia" && (
                        <div className="mb-3">
                          <label htmlFor="comprobantePago" className="form-label">
                            Referencia de Transferencia <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="comprobantePago"
                            name="comprobantePago"
                            value={formData.comprobantePago}
                            onChange={handleInputChange}
                            placeholder="Ingrese el número o referencia de la transferencia"
                            required
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <label htmlFor="notasAdicionales" className="form-label">
                          Notas Adicionales
                        </label>
                        <textarea
                          className="form-control"
                          id="notasAdicionales"
                          name="notasAdicionales"
                          value={formData.notasAdicionales}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Ingrese notas adicionales sobre la venta"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
                onClick={handleSaveVenta}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-1" />
                    Registrar Venta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </div>
  )
}

export default RegistrarVenta
