"use client"
import { Calendar } from "react-calendar"
import { Badge } from "react-bootstrap"
import "react-calendar/dist/Calendar.css"

/**
 * @param {Object} props
 * @param {Date} props.selectedDate
 * @param {Function} props.setSelectedDate
 * @param {Array} props.allCitas - Array de todas las citas reales [{ Fecha: ... }]
 * @param {number} [props.maxCitasPorDia=12] - Máximo de citas por día para marcar como "Lleno"
 * @param {number} [props.thresholdPocas=3] - Umbral para mostrar "Pocas citas"
 */
const CalendarWithAvailability = ({
  selectedDate,
  setSelectedDate,
  allCitas = [],
  maxCitasPorDia = 12,
  thresholdPocas = 3,
}) => {
  // Deshabilitar fechas pasadas y domingos
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today || date.getDay() === 0
    }
    return false
  }

  // Cuenta cuántas citas hay para una fecha dada
  const getCitasCountForDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const fechaStr = `${year}-${month}-${day}`
    return allCitas.filter(cita => cita.Fecha.startsWith(fechaStr)).length
  }

  // Muestra el badge de disponibilidad real
  const tileContent = ({ date, view }) => {
    if (view !== "month" || date.getDay() === 0) return null

    const citasCount = getCitasCountForDate(date)

    if (citasCount >= maxCitasPorDia) {
      return (
        <Badge bg="danger" className="availability-badge">
          Lleno
        </Badge>
      )
    }

    if (maxCitasPorDia - citasCount <= thresholdPocas && citasCount > 0) {
      return (
        <Badge bg="warning" text="dark" className="availability-badge">
          Pocas
        </Badge>
      )
    }

    return null // Disponible (sin badge)
  }

  return (
    <div className="calendar-container mb-4 mb-md-0">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
        className="appointment-calendar"
      />
      <div className="calendar-legend mt-2">
        <div className="d-flex align-items-center justify-content-center gap-3">
          <div className="d-flex align-items-center">
            <div className="legend-color bg-success"></div>
            <span className="legend-text">Disponible</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-warning"></div>
            <span className="legend-text">Pocas citas</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-danger"></div>
            <span className="legend-text">Lleno</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarWithAvailability
