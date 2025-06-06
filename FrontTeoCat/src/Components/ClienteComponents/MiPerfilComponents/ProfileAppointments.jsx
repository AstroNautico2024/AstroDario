import { Link } from "react-router-dom";
import { Card, Badge, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CitasClienteService from "../../../Services/ConsumoCliente/CitasClienteService";
import "../MiPerfilComponents/ProfileAppointments.scss";

const ProfileAppointments = ({ appointments, fetchAppointments }) => {
  // Manejar la eliminación de una cita
  const handleRemoveAppointment = async (idCita) => {
    try {
      await CitasClienteService.cancelarCita(idCita);
      toast.success("Cita cancelada correctamente");
      // Refrescar la lista de citas después de cancelar
      if (fetchAppointments) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
      toast.error("No se pudo cancelar la cita. Inténtalo de nuevo.");
    }
  };

  return (
    <>
      <ToastContainer />
      <Card className="border-0 shadow">
        <Card.Header className="tc-profile-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Mis Citas</h4>
            <Link to="/agendar-cita" className="btn btn-success btn-sm">
              <i className="bi bi-plus-circle me-1"></i> Agendar Cita
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {appointments.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-calendar-x fs-1 mb-3" style={{ color: "#7ab51d" }}></i>
              <h5>No tienes citas programadas</h5>
              <p className="mb-4">¡Agenda una cita para alguno de nuestros servicios!</p>
              <Link to="/servicios" className="btn btn-success">
                Ver Servicios
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table tc-appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Mascota</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="tc-appointment-row">
                      <td>{appointment.id}</td>
                      <td>
                        {appointment.servicios
                          .map((servicio) => servicio.NombreServicio)
                          .join(", ")}
                      </td>
                      <td>{appointment.NombreMascota}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <Badge
                          bg={appointment.status === "Completada" ? "success" : "primary"}
                          className="tc-appointment-status"
                        >
                          {appointment.status}
                        </Badge>
                      </td>
                      <td>
                        {appointment.status !== "Completada" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveAppointment(appointment.id)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ProfileAppointments;
