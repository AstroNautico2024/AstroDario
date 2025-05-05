"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import "./ServiceCard.scss"

const ServiceCard = ({ service }) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!service) {
    return null
  }

  return (
    <div
      className="service-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="service-card h-100 border-0 shadow-sm">
        <div className="card-img-container">
          <Card.Img
            variant="top"
            src={service.image || "/placeholder.svg"}
            alt={service.name}
            className={`service-image ${isHovered ? "zoomed" : ""}`}
            onError={(e) => {
              e.target.src = "/placeholder.svg"
            }}
          />
          <div className="service-overlay">
            <h3 className="service-name">{service.name}</h3>
          </div>
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Text className="service-description flex-grow-1">
            {service.description ? service.description : "Sin descripción disponible"}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="service-price">Desde ${service.price ? service.price.toLocaleString() : "0"}</span>

            <div className="service-button-container">
              <Button as={Link} to={`/servicio/${service.id}`} variant="brown">
                Ver Detalles
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ServiceCard
