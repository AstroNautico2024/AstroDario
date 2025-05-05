"use client"

import { useState, useEffect } from "react"
import DataTable from "../../../Components/AdminComponents/DataTable"
import TableActions from "../../../Components/AdminComponents/TableActions"
import { AlertTriangle } from "lucide-react"
import "../../../Styles/AdminStyles/Roles.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../Styles/AdminStyles/ToastStyles.css"
import RoleForm from "../../../Components/AdminComponents/RolesComponents/RoleForm"
import rolesService from "../../../Services/ConsumoAdmin/rolesService"
import permisosService from "../../../Services/ConsumoAdmin/permisosService"
import rolPermisoService from "../../../Services/ConsumoAdmin/rolPermisoService"

/**
 * Componente para la gestión de roles y permisos
 * Permite crear, ver, editar, activar/desactivar y eliminar roles
 * Incluye una matriz de permisos para diferentes módulos del sistema
 */
const Roles = () => {
  // Estado para los roles
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado para el modal
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("Agregar Rol")
  const [currentRole, setCurrentRole] = useState(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    permisos: [],
    esAdmin: false,
  })

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)

  // Cargar roles y permisos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar roles
        const rolesData = await rolesService.getAll()

        // Ordenar roles para que el Super Administrador (ID 1) aparezca primero
        const sortedRoles = rolesData.sort((a, b) => {
          if (a.IdRol === 1) return -1
          if (b.IdRol === 1) return 1
          return a.NombreRol.localeCompare(b.NombreRol)
        })

        setRoles(sortedRoles)

        // Cargar permisos
        const permisosData = await permisosService.getAll()
        setPermisos(permisosData)

        setError(null)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos. Por favor, intente nuevamente.")
        toast.error("Error al cargar los datos", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Definición de columnas para la tabla
  const columns = [
    { field: "NombreRol", header: "Nombre del Rol" },
    {
      field: "Estado",
      header: "Estado",
      render: (row) => (
        <span className={`badge ${row.Estado ? "bg-success" : "bg-danger"}`}>{row.Estado ? "Activo" : "Inactivo"}</span>
      ),
    },
    {
      field: "acciones",
      header: "Acciones",
      render: (row) => (
        <TableActions
          actions={["view", "edit", "toggleStatus", "delete"]}
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          disableDelete={row.IdRol === 1 || row.IdRol === 2} // Deshabilitar eliminar para Super Admin y Cliente
          disableToggle={row.IdRol === 1 || row.IdRol === 2} // Deshabilitar cambio de estado para Super Admin y Cliente
          disableEdit={row.IdRol === 1} // Deshabilitar edición para Super Admin
        />
      ),
    },
  ]

  /**
   * Manejador para ver detalles de un rol
   */
  const handleView = async (role) => {
    try {
      setCurrentRole(role)
      setModalTitle("Ver Detalles del Rol")

      // Obtener permisos del rol
      const permisosDelRol = await rolesService.getPermisos(role.IdRol)

      // Extraer los IDs de los permisos
      const permisosIds = permisosDelRol.map((p) => p.IdPermiso)

      // Cargar datos del rol en el formulario
      setFormData({
        nombre: role.NombreRol,
        permisos: permisosIds,
        esAdmin: role.IdRol === 1,
      })

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar detalles del rol:", err)
      toast.error("Error al cargar los detalles del rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Manejador para editar un rol
   */
  const handleEdit = async (role) => {
    // No permitir editar el Super Administrador
    if (role.IdRol === 1) {
      toast.error("No se puede editar el rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    try {
      setCurrentRole(role)
      setModalTitle("Editar Rol")

      // Obtener permisos del rol
      const permisosDelRol = await rolesService.getPermisos(role.IdRol)

      // Extraer los IDs de los permisos
      const permisosIds = permisosDelRol.map((p) => p.IdPermiso)

      // Cargar datos del rol en el formulario
      setFormData({
        nombre: role.NombreRol,
        permisos: permisosIds,
        esAdmin: false,
        esCliente: role.IdRol === 2
      })

      setShowModal(true)
    } catch (err) {
      console.error("Error al cargar datos para editar rol:", err)
      toast.error("Error al cargar los datos para editar el rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Manejador para iniciar el proceso de eliminación
   */
  const handleDelete = (role) => {
    if (role.IdRol === 1) {
      toast.error("No se puede eliminar el rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // No permitir eliminar el rol de Cliente (ID 2)
  if (role.IdRol === 2) {
    toast.error("No se puede eliminar el rol de Cliente", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    return
  }

    setRoleToDelete(role)
    setShowDeleteConfirm(true)
  }

  /**
   * Función para confirmar la eliminación
   */
  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        await rolesService.delete(roleToDelete.IdRol)

        // Actualizar la lista de roles
        setRoles(roles.filter((r) => r.IdRol !== roleToDelete.IdRol))

        toast.success(`El rol "${roleToDelete.NombreRol}" ha sido eliminado correctamente`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } catch (err) {
        console.error("Error al eliminar rol:", err)
        toast.error("Error al eliminar el rol", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      }
    }
    setShowDeleteConfirm(false)
    setRoleToDelete(null)
  }

  /**
   * Función para cancelar el proceso de eliminación
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setRoleToDelete(null)
  }

  /**
   * Manejador para cambiar el estado de un rol
   */
  const handleToggleStatus = async (role) => {
    if (role.IdRol === 1) {
      toast.error("No se puede cambiar el estado del rol de Super Administrador", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

  // No permitir cambiar el estado del rol de Cliente (ID 2)
  if (role.IdRol === 2) {
    toast.error("No se puede cambiar el estado del rol de Cliente", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    return
  }

    try {
      // Cambiar el estado del rol
      const nuevoEstado = !role.Estado

      await rolesService.update(role.IdRol, {
        NombreRol: role.NombreRol,
        Estado: nuevoEstado,
      })

      // Actualizar la lista de roles
      const updatedRoles = roles.map((r) => {
        if (r.IdRol === role.IdRol) {
          return { ...r, Estado: nuevoEstado }
        }
        return r
      })

      setRoles(updatedRoles)

      toast.success(`El rol "${role.NombreRol}" ahora está ${nuevoEstado ? "activo" : "inactivo"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch (err) {
      console.error("Error al cambiar estado del rol:", err)
      toast.error("Error al cambiar el estado del rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Manejador para abrir el modal de agregar rol
   */
  const handleAddRole = () => {
    setCurrentRole(null)
    setModalTitle("Agregar Rol")

    // Resetear el formulario
    setFormData({
      nombre: "",
      permisos: [],
      esAdmin: false,
    })

    setShowModal(true)
  }

  /**
   * Manejador para cerrar el modal
   */
  const handleCloseModal = () => {
    setShowModal(false)
  }

  /**
   * Manejador para guardar el rol
   */
  const handleSaveRole = async () => {
    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      toast.error("Por favor, ingrese un nombre para el rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    try {
      if (currentRole) {
        // Añadir esta verificación para el rol Cliente
        if (currentRole.IdRol === 2 && formData.nombre !== currentRole.NombreRol) {
          toast.error("No se puede cambiar el nombre del rol de Cliente", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
          return
        }

        // Actualizar rol existente
        await rolesService.update(currentRole.IdRol, {
          NombreRol: formData.nombre,
          Estado: currentRole.Estado,
        })

        // Asignar permisos al rol
        await rolPermisoService.assignMultiplePermisos(currentRole.IdRol, formData.permisos)

        // Actualizar la lista de roles
        const updatedRoles = roles.map((r) => {
          if (r.IdRol === currentRole.IdRol) {
            return {
              ...r,
              NombreRol: formData.nombre,
            }
          }
          return r
        })

        setRoles(updatedRoles)

        toast.success(`El rol "${formData.nombre}" ha sido actualizado correctamente`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } else {
        // Crear nuevo rol
        const nuevoRol = await rolesService.create({
          NombreRol: formData.nombre,
          Estado: true,
        })

        // Asignar permisos al rol
        if (formData.permisos.length > 0) {
          await rolPermisoService.assignMultiplePermisos(nuevoRol.id, formData.permisos)
        }

        // Recargar la lista de roles
        const rolesActualizados = await rolesService.getAll()

        // Ordenar roles para que el Super Administrador (ID 1) aparezca primero
        const sortedRoles = rolesActualizados.sort((a, b) => {
          if (a.IdRol === 1) return -1
          if (b.IdRol === 1) return 1
          return a.NombreRol.localeCompare(b.NombreRol)
        })

        setRoles(sortedRoles)

        toast.success(`El rol "${formData.nombre}" ha sido creado correctamente`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      }

      // Cerrar el modal
      handleCloseModal()
    } catch (err) {
      console.error("Error al guardar rol:", err)
      toast.error("Error al guardar el rol", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  /**
   * Efecto para inicializar el modal de Bootstrap
   */
  useEffect(() => {
    let modalInstance = null
    const modalElement = document.getElementById("roleModal")

    if (showModal) {
      import("bootstrap").then((bootstrap) => {
        modalInstance = new bootstrap.Modal(modalElement)
        modalInstance.show()
      })
    } else {
      if (modalElement && modalElement.classList.contains("show")) {
        import("bootstrap").then((bootstrap) => {
          modalInstance = bootstrap.Modal.getInstance(modalElement)
          if (modalInstance) {
            modalInstance.hide()
          }
        })
      }
    }

    const handleHidden = () => {
      setShowModal(false)
    }

    modalElement?.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalElement?.removeEventListener("hidden.bs.modal", handleHidden)
      // Asegurarse de que se elimine cualquier backdrop residual al desmontar
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) {
        backdrop.remove()
      }
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [showModal])

  return (
    <div className="roles-container">
      <h2 className="mb-4">Gestión de Roles</h2>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={roles}
          onAdd={handleAddRole}
          addButtonLabel="Agregar Rol"
          searchPlaceholder="Buscar roles..."
        />
      )}

      {/* Modal para Agregar/Editar/Ver Rol */}
      <div className="modal fade" id="roleModal" tabIndex="-1" aria-labelledby="roleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="roleModalLabel">
                {modalTitle}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              <RoleForm
                formData={formData}
                setFormData={setFormData}
                modalTitle={modalTitle}
                handleCloseModal={handleCloseModal}
                handleSaveRole={handleSaveRole}
                permisos={permisos}
                disableNombre={currentRole?.IdRol === 2} // Deshabilitar el campo de nombre si es Cliente
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${showDeleteConfirm ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button type="button" className="btn-close btn-close-white" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">¿Está seguro de eliminar el rol "{roleToDelete?.NombreRol}"?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
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

export default Roles
