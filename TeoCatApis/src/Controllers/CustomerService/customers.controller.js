import { clientesModel, mascotasModel } from "../../Models/CustomerService/customers.model.js"
import { usuariosModel, tokensRecuperacionModel } from "../../Models/AuthService/auth.model.js"
import { uploadToCloudinary, deleteFromCloudinary, uploadImage } from "../../Utils/Cloudinary.js"
import { query } from "../../Config/Database.js"
import { sendEmail } from "../../Utils/Email.js"
import crypto from "crypto"

// Función para generar contraseña temporal
function generateTemporaryPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  // Asegurar al menos un carácter de cada tipo
  password += charset.substring(0, 26).charAt(Math.floor(Math.random() * 26)) // minúscula
  password += charset.substring(26, 52).charAt(Math.floor(Math.random() * 26)) // mayúscula
  password += charset.substring(52, 62).charAt(Math.floor(Math.random() * 10)) // número
  password += charset.substring(62).charAt(Math.floor(Math.random() * (charset.length - 62))) // especial

  // Completar con caracteres aleatorios
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Mezclar los caracteres
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

// Función para enviar correo de bienvenida
async function sendWelcomeEmail(email, nombre, password) {
  try {
    const loginUrl = `${process.env.FRONTEND_URL}/login`

    await sendEmail({
      to: email,
      subject: "Bienvenido a TeoCat - Información de acceso",
      text: `Hola ${nombre},\n\nSe ha creado una cuenta para ti en TeoCat. Tus credenciales de acceso son:\n\nCorreo: ${email}\nContraseña temporal: ${password}\n\nPor seguridad, deberás cambiar esta contraseña en las próximas 24 horas.\n\nPuedes iniciar sesión aquí: ${loginUrl}\n\nSaludos,\nEquipo TeoCat`,
      html: `
        <h2>Bienvenido a TeoCat</h2>
        <p>Hola ${nombre},</p>
        <p>Se ha creado una cuenta para ti en TeoCat. Tus credenciales de acceso son:</p>
        <p><strong>Correo:</strong> ${email}<br>
        <strong>Contraseña temporal:</strong> ${password}</p>
        <p><strong>Por seguridad, deberás cambiar esta contraseña en las próximas 24 horas.</strong></p>
        <p><a href="${loginUrl}" target="_blank">Iniciar sesión</a></p>
        <p>Saludos,<br>Equipo TeoCat</p>
      `,
    })

    console.log(`Correo de bienvenida enviado a ${email}`)
    return true
  } catch (error) {
    console.error("Error al enviar correo de bienvenida:", error)
    throw error
  }
}

// Función para crear token de recuperación que expira en 24 horas
async function createPasswordResetToken(userId) {
  try {
    // Generar token
    const token = crypto.randomBytes(32).toString("hex")

    // Establecer expiración (24 horas)
    const expiracion = new Date()
    expiracion.setHours(expiracion.getHours() + 24)

    // Guardar token
    await tokensRecuperacionModel.create({
      IdUsuario: userId,
      Token: token,
      FechaCreacion: new Date(),
      FechaExpiracion: expiracion,
      Utilizado: false,
    })

    return token
  } catch (error) {
    console.error("Error al crear token de recuperación:", error)
    throw error
  }
}

// Controlador para clientes
export const clientesController = {
  // Obtener todos los clientes
  getAll: async (req, res) => {
    try {
      const clientes = await clientesModel.getAll()
      res.status(200).json(clientes)
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener un cliente por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const cliente = await clientesModel.getById(id)

      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" })
      }

      res.status(200).json(cliente)
    } catch (error) {
      console.error("Error al obtener cliente:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear un nuevo cliente
  create: async (req, res) => {
    try {
      const clienteData = req.body

      // Validar datos
      if (!clienteData.Nombre || !clienteData.Apellido || !clienteData.Correo) {
        return res.status(400).json({ message: "Nombre, Apellido y Correo son campos requeridos" })
      }

      // Verificar si el correo ya está registrado en clientes
      const existingClient = await clientesModel.getByEmail(clienteData.Correo)
      if (existingClient) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" })
      }

      // Verificar si el correo ya está registrado en usuarios
      const existingUser = await usuariosModel.getByEmail(clienteData.Correo)
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado como usuario" })
      }

      // Generar una contraseña temporal aleatoria
      const tempPassword = generateTemporaryPassword(10) // Función para generar contraseña

      // Crear usuario con rol de cliente (IdRol = 2)
      const usuarioData = {
        Nombre: clienteData.Nombre,
        Apellido: clienteData.Apellido,
        Correo: clienteData.Correo,
        Password: tempPassword,
        Telefono: clienteData.Telefono || "",
        Direccion: clienteData.Direccion || "",
        IdRol: 2, // Rol de cliente
        Documento: clienteData.Documento || "",
        Estado: true,
      }

      // Procesar imagen si se proporciona
      if (req.file) {
        try {
          const result = await uploadImage(req.file.path, "usuarios")
          usuarioData.Foto = result.secure_url
        } catch (uploadError) {
          console.error("Error al subir imagen a Cloudinary:", uploadError)
        }
      }

      // Crear usuario
      const nuevoUsuario = await usuariosModel.create(usuarioData)

      // El trigger se encargará de crear el cliente automáticamente
      // Pero necesitamos obtener el ID del cliente para devolverlo
      const nuevoCliente = await clientesModel.getByUsuario(nuevoUsuario.id)

      // Enviar correo con credenciales temporales
      await sendWelcomeEmail(clienteData.Correo, clienteData.Nombre, tempPassword)

      // Crear token de recuperación que expira en 24 horas para forzar cambio de contraseña
      await createPasswordResetToken(nuevoUsuario.id)

      res.status(201).json(nuevoCliente)
    } catch (error) {
      console.error("Error al crear cliente:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar un cliente
  update: async (req, res) => {
    try {
      const { id } = req.params
      const clienteData = req.body

      // Verificar si el cliente existe
      const cliente = await clientesModel.getById(id)
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" })
      }

      // Si se está actualizando el correo, verificar que no esté en uso
      if (clienteData.Correo && clienteData.Correo !== cliente.Correo) {
        const existingClient = await clientesModel.getByEmail(clienteData.Correo)
        if (existingClient && existingClient.IdCliente !== Number.parseInt(id)) {
          return res.status(400).json({ message: "El correo electrónico ya está registrado" })
        }
      }

      // Si se está actualizando el IdUsuario, verificar que exista y no esté en uso
      if (clienteData.IdUsuario && clienteData.IdUsuario !== cliente.IdUsuario) {
        const usuario = await usuariosModel.getById(clienteData.IdUsuario)
        if (!usuario) {
          return res.status(404).json({ message: "El usuario especificado no existe" })
        }

        // Verificar si el usuario ya está asociado a otro cliente
        const clienteExistente = await clientesModel.getByUsuario(clienteData.IdUsuario)
        if (clienteExistente && clienteExistente.IdCliente !== Number.parseInt(id)) {
          return res.status(400).json({
            message: "El usuario ya está asociado a otro cliente",
            cliente: clienteExistente,
          })
        }
      }

      // Procesar imagen si se proporciona
      if (req.file) {
        try {
          // Eliminar imagen anterior si existe
          if (cliente.Foto) {
            const publicId = cliente.Foto.split("/").pop().split(".")[0]
            await deleteFromCloudinary(publicId)
          }

          // Subir nueva imagen
          const result = await uploadImage(req.file.path, "clientes")
          clienteData.Foto = result.secure_url
        } catch (uploadError) {
          console.error("Error al procesar imagen:", uploadError)
          // Continuar sin actualizar imagen si hay error
        }
      }

      // Actualizar cliente
      const updatedCliente = await clientesModel.update(id, clienteData)

      // Si se actualizaron datos que también están en el usuario, actualizar el usuario
      if (
        cliente.IdUsuario &&
        (clienteData.Nombre ||
          clienteData.Apellido ||
          clienteData.Correo ||
          clienteData.Telefono ||
          clienteData.Direccion ||
          clienteData.Estado)
      ) {
        const usuarioData = {}
        if (clienteData.Nombre) usuarioData.Nombre = clienteData.Nombre
        if (clienteData.Apellido) usuarioData.Apellido = clienteData.Apellido
        if (clienteData.Correo) usuarioData.Correo = clienteData.Correo
        if (clienteData.Telefono) usuarioData.Telefono = clienteData.Telefono
        if (clienteData.Direccion) usuarioData.Direccion = clienteData.Direccion
        if (clienteData.Estado !== undefined) usuarioData.Estado = clienteData.Estado

        // Solo actualizar si hay datos para actualizar
        if (Object.keys(usuarioData).length > 0) {
          await usuariosModel.update(cliente.IdUsuario, usuarioData)
        }
      }

      res.status(200).json(updatedCliente)
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar un cliente
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el cliente existe
      const cliente = await clientesModel.getById(id)
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" })
      }

      // Verificar si tiene mascotas asociadas
      const mascotas = await mascotasModel.getByCliente(id)
      if (mascotas.length > 0) {
        return res.status(400).json({
          message: "No se puede eliminar el cliente porque tiene mascotas asociadas",
          mascotas,
        })
      }

      // Eliminar imagen si existe
      if (cliente.Foto) {
        try {
          const publicId = cliente.Foto.split("/").pop().split(".")[0]
          await deleteFromCloudinary(publicId)
        } catch (deleteError) {
          console.error("Error al eliminar imagen de Cloudinary:", deleteError)
          // Continuar con la eliminación del cliente
        }
      }

      // Eliminar cliente
      await clientesModel.delete(id)

      res.status(200).json({ message: "Cliente eliminado correctamente" })
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Buscar clientes
  search: async (req, res) => {
    try {
      const { term } = req.query

      if (!term) {
        return res.status(400).json({ message: "El término de búsqueda es requerido" })
      }

      const clientes = await clientesModel.search(term)

      res.status(200).json(clientes)
    } catch (error) {
      console.error("Error al buscar clientes:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

// Controlador para mascotas
export const mascotasController = {
  // Obtener todas las mascotas
  getAll: async (req, res) => {
    try {
      const mascotas = await mascotasModel.getAll()
      res.status(200).json(mascotas)
    } catch (error) {
      console.error("Error al obtener mascotas:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener una mascota por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const mascota = await mascotasModel.getById(id)

      if (!mascota) {
        return res.status(404).json({ message: "Mascota no encontrada" })
      }

      res.status(200).json(mascota)
    } catch (error) {
      console.error("Error al obtener mascota:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Crear una nueva mascota
  create: async (req, res) => {
    try {
      const mascotaData = req.body

      // Validar datos básicos
      if (!mascotaData.Nombre || !mascotaData.Especie || !mascotaData.IdCliente) {
        return res.status(400).json({ message: "Nombre, Especie e IdCliente son campos requeridos" })
      }

      // Validar enumeraciones
      const tamañosValidos = ["Pequeño", "Mediano", "Grande"]
      if (mascotaData.Tamaño && !tamañosValidos.includes(mascotaData.Tamaño)) {
        return res.status(400).json({
          message: "Tamaño no válido. Debe ser uno de: " + tamañosValidos.join(", "),
        })
      }

      const pelajesValidos = ["Corto", "Medio", "Largo"]
      if (mascotaData.Pelaje && !pelajesValidos.includes(mascotaData.Pelaje)) {
        return res.status(400).json({
          message: "Pelaje no válido. Debe ser uno de: " + pelajesValidos.join(", "),
        })
      }

      // Validar fecha de nacimiento
      if (mascotaData.FechaNacimiento) {
        const fechaNacimiento = new Date(mascotaData.FechaNacimiento)
        const hoy = new Date()

        // Verificar que no sea futura
        if (fechaNacimiento > hoy) {
          return res.status(400).json({ message: "La fecha de nacimiento no puede ser futura" })
        }

        // Verificar que no sea extremadamente antigua (más de 30 años)
        const treintaAñosAtras = new Date()
        treintaAñosAtras.setFullYear(hoy.getFullYear() - 30)
        if (fechaNacimiento < treintaAñosAtras) {
          return res.status(400).json({ message: "La fecha de nacimiento no puede ser anterior a hace 30 años" })
        }
      }

      // Procesar imagen si se proporciona
      if (req.file) {
        try {
          // Subir imagen a Cloudinary
          const result = await uploadToCloudinary(req.file.path)
          mascotaData.Foto = result.secure_url
        } catch (uploadError) {
          console.error("Error al subir imagen a Cloudinary:", uploadError)
          // Continuar sin imagen si hay error
        }
      }

      // Crear mascota
      const nuevaMascota = await mascotasModel.create(mascotaData)

      res.status(201).json(nuevaMascota)
    } catch (error) {
      console.error("Error al crear mascota:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Actualizar una mascota
  update: async (req, res) => {
    try {
      const { id } = req.params
      const mascotaData = req.body

      // Verificar si la mascota existe
      const mascota = await mascotasModel.getById(id)
      if (!mascota) {
        return res.status(404).json({ message: "Mascota no encontrada" })
      }

      // Verificar si se está actualizando el estado
      if (mascotaData.Estado !== undefined) {
        // Asegurar que el estado sea un número
        const estado =
          typeof mascotaData.Estado === "number" ? mascotaData.Estado : mascotaData.Estado === "Activo" ? 1 : 0

        console.log(`Actualizando estado de mascota ${id} a ${estado}`)

        // Actualizar solo el estado si es lo único que se está cambiando
        if (Object.keys(mascotaData).length === 1) {
          await query("UPDATE Mascotas SET Estado = ? WHERE IdMascota = ?", [estado, id])

          // Obtener la mascota actualizada
          const mascotaActualizada = await mascotasModel.getById(id)
          return res.status(200).json(mascotaActualizada)
        }

        // Si se están actualizando más campos, asegurar que el estado se incluya
        mascotaData.Estado = estado
      }

      // Procesar imagen si se proporciona
      if (req.file) {
        try {
          // Eliminar imagen anterior si existe
          if (mascota.Foto) {
            const publicId = mascota.Foto.split("/").pop().split(".")[0]
            await deleteFromCloudinary(publicId)
          }

          // Subir nueva imagen
          const result = await uploadImage(req.file.path, "mascotas")
          mascotaData.Foto = result.secure_url
        } catch (uploadError) {
          console.error("Error al procesar imagen:", uploadError)
          // Continuar sin actualizar imagen si hay error
        }
      }

      // Actualizar mascota
      const updatedMascota = await mascotasModel.update(id, mascotaData)

      res.status(200).json(updatedMascota)
    } catch (error) {
      console.error(`Error al actualizar mascota con ID ${req.params.id}:`, error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Eliminar una mascota
  delete: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si la mascota existe
      const mascota = await mascotasModel.getById(id)
      if (!mascota) {
        return res.status(404).json({ message: "Mascota no encontrada" })
      }

      // Verificar si tiene citas asociadas
      const citas = await query(`SELECT * FROM AgendamientoDeCitas WHERE IdMascota = ?`, [id])

      if (citas.length > 0) {
        return res.status(400).json({
          message: "No se puede eliminar la mascota porque tiene citas asociadas",
          citas,
        })
      }

      // Verificar si tiene servicios asociados
      const servicios = await query(`SELECT * FROM DetalleVentasServicios WHERE IdMascota = ?`, [id])

      if (servicios.length > 0) {
        return res.status(400).json({
          message: "No se puede eliminar la mascota porque tiene servicios asociados",
          servicios,
        })
      }

      // Eliminar imagen si existe
      if (mascota.Foto) {
        try {
          const publicId = mascota.Foto.split("/").pop().split(".")[0]
          await deleteFromCloudinary(publicId)
        } catch (deleteError) {
          console.error("Error al eliminar imagen de Cloudinary:", deleteError)
        }
      }

      // Eliminar mascota
      await mascotasModel.delete(id)

      res.status(200).json({ message: "Mascota eliminada correctamente" })
    } catch (error) {
      console.error("Error al eliminar mascota:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Obtener mascotas por cliente
  getByCliente: async (req, res) => {
    try {
      const { id } = req.params

      // Verificar si el cliente existe
      const cliente = await clientesModel.getById(id)
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" })
      }

      const mascotas = await mascotasModel.getByCliente(id)

      res.status(200).json(mascotas)
    } catch (error) {
      console.error("Error al obtener mascotas del cliente:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },

  // Buscar mascotas
  search: async (req, res) => {
    try {
      const { term } = req.query

      if (!term) {
        return res.status(400).json({ message: "El término de búsqueda es requerido" })
      }

      const mascotas = await mascotasModel.search(term)

      res.status(200).json(mascotas)
    } catch (error) {
      console.error("Error al buscar mascotas:", error)
      res.status(500).json({ message: "Error en el servidor", error: error.message })
    }
  },
}

export default {
  clientes: clientesController,
  mascotas: mascotasController,
}
