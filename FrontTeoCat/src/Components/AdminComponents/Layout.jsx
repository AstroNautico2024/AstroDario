"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../../Components/AdminComponents/Sidebar"
import UserProfile from "../../Components/AdminComponents/UserProfile"
import { motion } from "framer-motion"
import "./Layout.scss"

const Layout = ({ footerComponent }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Cerrar sidebar en dispositivos móviles al cambiar de ruta
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay para dispositivos móviles */}
      {sidebarOpen && (
        <motion.div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <motion.div
        className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}
        animate={{
          marginLeft: sidebarOpen ? (window.innerWidth < 768 ? "0" : "280px") : "0",
          width: sidebarOpen && window.innerWidth >= 768 ? "calc(100% - 280px)" : "100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <header className="header">
          <div className="header-content">
            <motion.button
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Abrir/Cerrar menú"
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>

            <UserProfile />
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        {/* Usar el componente de footer pasado como prop o el Footer por defecto */}
        {footerComponent}
      </motion.div>
    </div>
  )
}

export default Layout

