"use client"

import { AlertTriangle } from "lucide-react"

/**
 * Componente para modal de confirmación de eliminación
 */
const DeleteConfirmModal = ({ show, item, onCancel, onConfirm, itemType = "elemento" }) => {
  if (!show) return null

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-danger me-3" />
                <p className="mb-0">
                  ¿Está seguro de eliminar el {itemType} "{item?.nombre}"?
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmModal

