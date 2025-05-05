import axiosInstance from "../ConsumoAdmin/axios.js"
import { uploadImageToCloudinary } from "../uploadImageToCloudinary.js"

const UserProfileService = {
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/auth/usuarios/${id}`)
      console.log("Respuesta de getUserById:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      throw error
    }
  },

  updateProfile: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/auth/usuarios/${id}`, userData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      throw error
    }
  },

  changePassword: async (id, passwordData) => {
    try {
      const response = await axiosInstance.patch(`/auth/usuarios/${id}/password`, {
        currentPassword: passwordData.passwordOld,
        newPassword: passwordData.passwordNew,
      })
      return response.data
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      throw error
    }
  },

  // Método para emitir evento de cambio de foto de perfil
  emitProfilePhotoChange: (photoUrl) => {
    try {
      // Guardar en localStorage para persistencia
      localStorage.setItem("userProfilePhoto", photoUrl)

      // Guardar también en userData para asegurar persistencia
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.Foto = photoUrl
      localStorage.setItem("userData", JSON.stringify(userData))

      // Emitir evento personalizado para notificar a otros componentes
      const event = new CustomEvent("profilePhotoChange", {
        detail: { photoUrl },
      })
      window.dispatchEvent(event)

      console.log("Evento de cambio de foto emitido:", photoUrl)
    } catch (error) {
      console.error("Error al emitir evento de cambio de foto:", error)
    }
  },

  // Método para actualizar la imagen de perfil - USANDO EL SERVICIO CENTRALIZADO
  updateProfileImage: async (id, file) => {
    try {
      // Validar el archivo antes de enviarlo
      if (!file || !(file instanceof File)) {
        throw new Error("Archivo no válido")
      }

      // Validar el tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen es demasiado grande. El tamaño máximo permitido es 5MB.")
      }

      // Validar el tipo
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Formato de imagen no válido. Por favor, sube una imagen en formato JPG, PNG, GIF o WebP.")
      }

      // Usar el servicio centralizado para subir la imagen a Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(file, "usuarios")

      console.log("Imagen subida exitosamente a Cloudinary:", cloudinaryUrl)

      // Guardar en localStorage para persistencia local (antes de intentar actualizar el perfil)
      localStorage.setItem("userProfilePhoto", cloudinaryUrl)

      // Actualizar también en userData para asegurar persistencia
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.Foto = cloudinaryUrl
      localStorage.setItem("userData", JSON.stringify(userData))

      // Emitir evento con la URL de Cloudinary
      UserProfileService.emitProfilePhotoChange(cloudinaryUrl)

      try {
        // Intentar actualizar el perfil del usuario con la URL de Cloudinary
        const updateResponse = await axiosInstance.put(`/auth/usuarios/${id}`, {
          Foto: cloudinaryUrl,
        })
        console.log("Respuesta de actualización de perfil:", updateResponse.data)
      } catch (updateError) {
        console.error("Error al actualizar perfil en el servidor:", updateError)
        console.log("La imagen se guardó localmente pero no se pudo actualizar en el servidor")
        // No lanzamos el error para que la función continúe y devuelva éxito
        // ya que la imagen ya está guardada localmente
      }

      return {
        success: true,
        message: "Imagen subida exitosamente",
        foto: cloudinaryUrl,
      }
    } catch (error) {
      console.error("Error al actualizar foto de perfil:", error)
      throw error
    }
  },

  // Método para obtener la imagen de perfil
  getProfileImage: async (id) => {
    try {
      // Primero intentamos obtener del localStorage
      const localImage = localStorage.getItem("userProfilePhoto")
      if (localImage) {
        console.log("Imagen recuperada de localStorage")
        return localImage
      }

      // Luego intentamos obtener de userData
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      if (userData && userData.Foto) {
        console.log("Imagen recuperada de userData")
        // Guardar en localStorage para futuras referencias
        localStorage.setItem("userProfilePhoto", userData.Foto)
        return userData.Foto
      }

      // Si no hay imagen en localStorage ni userData, intentamos obtener del servidor
      const profileData = await UserProfileService.getUserById(id)

      if (profileData && profileData.Foto) {
        console.log("Imagen obtenida del servidor")
        // Guardar en localStorage para futuras referencias
        localStorage.setItem("userProfilePhoto", profileData.Foto)
        // Actualizar también en userData
        if (userData) {
          userData.Foto = profileData.Foto
          localStorage.setItem("userData", JSON.stringify(userData))
        }
        return profileData.Foto
      }

      // Si no hay imagen en ningún lado, devolvemos null
      return null
    } catch (error) {
      console.error("Error al obtener imagen de perfil:", error)
      return null
    }
  },
}

export default UserProfileService
