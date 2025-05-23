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

    </div>
  )
}

export default ServiceCard
