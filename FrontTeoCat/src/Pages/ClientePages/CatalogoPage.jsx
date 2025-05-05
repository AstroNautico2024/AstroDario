"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Container, Row, Col, Form, Button, InputGroup, Card, Pagination } from "react-bootstrap"
import ProductCard from "../../Components/ClienteComponents/CatalogoComponents/ProductCard"
import CatalogoService from "../../Services/ConsumoCliente/CatalogoService.js"
import "./CatalogoPage.scss"

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaParam = searchParams.get("categoria")

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState(null)

  // Paginación (implementada en el cliente)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedProducts, setPaginatedProducts] = useState([])

  // Filtros - Modificar los valores iniciales
const [selectedCategory, setSelectedCategory] = useState(categoriaParam || "todos");
const [priceRange, setPriceRange] = useState([0, 1000000]); // Aumentar el rango máximo de precio
const [sortBy, setSortBy] = useState("featured");
const [searchTerm, setSearchTerm] = useState("");
const [selectedRating, setSelectedRating] = useState(0); // Asegurarse de que comience en 0

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorias = await CatalogoService.getCategorias()
        setCategories(CatalogoService.formatCategoriasList(categorias))
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        setError("No se pudieron cargar las categorías. Por favor, intenta de nuevo más tarde.")
      }
    }

    fetchCategories()
  }, [])

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
    
      try {
        let productosData = [];
    
        // Si hay una categoría seleccionada, obtener productos de esa categoría
        if (selectedCategory !== "todos" && !isNaN(selectedCategory)) {
          const categoriaId = Number.parseInt(selectedCategory);
          const response = await CatalogoService.getProductosByCategoria(categoriaId);
          console.log("Respuesta de productos por categoría:", response);
          productosData = CatalogoService.formatProductosList(response);
        } else if (searchTerm) {
          // Si hay un término de búsqueda, buscar productos
          const response = await CatalogoService.searchProductos(searchTerm);
          console.log("Respuesta de búsqueda de productos:", response);
          productosData = CatalogoService.formatProductosList(response);
        } else {
          // Si no, obtener todos los productos
          const response = await CatalogoService.getProductos();
          console.log("Respuesta de todos los productos:", response);
          
          // Verificar la estructura de la respuesta
          if (Array.isArray(response)) {
            console.log("La respuesta es un array de productos");
          } else if (response && response.data && Array.isArray(response.data)) {
            console.log("La respuesta tiene una propiedad data que es un array");
          } else {
            console.log("Estructura de respuesta desconocida:", response);
          }
          
          productosData = CatalogoService.formatProductosList(response);
        }
    
        console.log("Productos formateados:", productosData);
        
        // Verificar si hay productos
        if (productosData.length === 0) {
          console.warn("No se encontraron productos");
        }
    
        setProducts(productosData);
        setFilteredProducts(productosData); // Establecer los productos filtrados igual a todos los productos inicialmente
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchProducts()
  }, [selectedCategory, searchTerm])


  // Aplicar filtros cuando cambien
useEffect(() => {
  if (!Array.isArray(products) || products.length === 0) {
    setFilteredProducts([]);
    return;
  }

  console.log("Aplicando filtros a productos:", products);
  console.log("Filtros actuales:", { priceRange, sortBy, selectedRating });

  let result = [...products];

  // Verificar si hay productos antes de aplicar filtros
  console.log("Productos antes de filtrar:", result.length);

  // Filtrar por rango de precio (asegurarse de que price es un número)
  result = result.filter((product) => {
    const price = parseFloat(product.price || 0);
    return price >= priceRange[0] && price <= priceRange[1];
  });
  console.log("Productos después de filtrar por precio:", result.length);

  // Filtrar por valoración
  if (selectedRating > 0) {
    result = result.filter((product) => {
      const rating = parseFloat(product.rating || 0);
      return rating >= selectedRating;
    });
    console.log("Productos después de filtrar por valoración:", result.length);
  }

  // Aplicar ordenamiento
  if (sortBy === "price-asc") {
    result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
  } else if (sortBy === "rating") {
    result.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
  }

  console.log("Productos después de aplicar todos los filtros:", result);
  setFilteredProducts(result);
  setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
}, [priceRange, sortBy, selectedRating, products]);

  // Calcular productos paginados (paginación en el cliente)
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    setPaginatedProducts(currentProducts)
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage))
  }, [filteredProducts, currentPage, productsPerPage])

  const handlePriceChange = (e) => {
    setPriceRange([0, Number.parseInt(e.target.value)])
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  
    // Actualizar URL con el parámetro de categoría
    if (category !== "todos") {
      // Asegurarse de que category sea un valor válido antes de convertirlo a minúsculas
      try {
        // No usar toLowerCase() en el ID de categoría, solo en el nombre si es necesario
        setSearchParams({ categoria: category });
      } catch (error) {
        console.error("Error al actualizar parámetros de búsqueda:", error);
        setSearchParams({ categoria: category });
      }
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // El término de búsqueda ya se actualiza con el onChange del input
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll to top
    window.scrollTo(0, 0)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const clearFilters = () => {
    setSelectedCategory("todos")
    setPriceRange([0, 200000])
    setSortBy("featured")
    setSearchTerm("")
    setSelectedRating(0)
    setSearchParams({})
  }

  if (loading) {
    return (
      <div className="catalogo-page loading-container">
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando productos...</p>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalogo-page error-container">
        <Container className="py-5 mt-5 text-center">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
          <Button variant="success" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </Container>
      </div>
    )
  }

  // Generar elementos de paginación
  const paginationItems = []
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>,
    )
  }

  return (
    <div className="catalogo-page">
      <Container className="py-5 mt-5">
        <div className="catalog-header mb-4">
          <h1 className="page-title">Catálogo de Productos</h1>
          <p className="text-muted">Encuentra todo lo que tu mascota necesita</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="search-input"
              />
              <Button variant="success" type="submit" className="search-button">
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Botón para mostrar/ocultar filtros en móvil */}
        <div className="d-lg-none mb-4">
          <Button
            variant="outline-secondary"
            onClick={toggleFilters}
            className="w-100 d-flex justify-content-between align-items-center"
          >
            <span>Filtros y Ordenamiento</span>
            <i className={`bi bi-chevron-${showFilters ? "up" : "down"}`}></i>
          </Button>
        </div>

        <Row>
          {/* Filtros (columna izquierda) */}
          <Col lg={3} className={`mb-4 filters-column ${showFilters ? "show" : ""}`}>
            <div className="filters-container sticky-top" style={{ top: "90px" }}>
              <Card className="filters-card border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="filters-title mb-0">Filtros</h5>
                    <Button variant="link" className="p-0 text-decoration-none" onClick={clearFilters}>
                      Limpiar
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {/* Filtro por categoría */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Categorías</h6>
                    <div className="category-filters">
                      <div
                        className={`category-filter-item ${selectedCategory === "todos" ? "active" : ""}`}
                        onClick={() => handleCategoryChange("todos")}
                      >
                        Todos los productos
                      </div>
                      {Array.isArray(categories) && categories.map((category) => (
  <div
    key={category?.id || "unknown"}
    className={`category-filter-item ${selectedCategory === String(category?.id) ? "active" : ""}`}
    onClick={() => handleCategoryChange(String(category?.id))}
  >
    {category?.name || "Sin nombre"}
  </div>
))}
                    </div>
                  </div>

                  {/* Filtro por precio */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Precio</h6>
                    <div className="price-range-container">
                      <div className="d-flex justify-content-between mb-2">
                        <span>$0</span>
                        <span>${priceRange[1].toLocaleString()}</span>
                      </div>
                      <Form.Range
                        min="0"
                        max="200000"
                        step="10000"
                        value={priceRange[1]}
                        onChange={handlePriceChange}
                        className="price-range"
                      />
                    </div>
                  </div>

                  {/* Filtro por valoración */}
                  <div className="mb-4">
                    <h6 className="filter-subtitle mb-3">Valoración</h6>
                    <div className="rating-filters">
                      {[4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className={`rating-filter-item ${selectedRating === rating ? "active" : ""}`}
                          onClick={() => handleRatingChange(rating)}
                        >
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <i
                                key={i}
                                className={`bi ${i < rating ? "bi-star-fill" : "bi-star"} ${i < rating ? "text-warning" : ""}`}
                              ></i>
                            ))}
                          {rating === 4 && <span className="ms-2">y más</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ordenar por */}
                  <div>
                    <h6 className="filter-subtitle mb-3">Ordenar por</h6>
                    <Form.Select value={sortBy} onChange={handleSortChange} className="sort-select">
                      <option value="featured">Destacados</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="rating">Mejor Valorados</option>
                    </Form.Select>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Productos (columna derecha) */}
          <Col lg={9}>
            {filteredProducts.length === 0 ? (
              <div className="no-results-container">
                <div className="alert alert-info">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  No se encontraron productos que coincidan con los filtros seleccionados.
                </div>
                <Button variant="success" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4 results-header">
                  <p className="mb-0 results-count">{filteredProducts.length} productos encontrados</p>
                  <div className="d-none d-md-block">
                    <Form.Select value={sortBy} onChange={handleSortChange} className="sort-select-inline">
                      <option value="featured">Destacados</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="rating">Mejor Valorados</option>
                    </Form.Select>
                  </div>
                </div>

                <div className="products-grid-container">
                  <Row className="g-4">
                  {Array.isArray(paginatedProducts) && paginatedProducts.map((product, index) => (
  <Col md={6} lg={4} key={product?.id || `product-${index}`}>
    <ProductCard product={product} />
  </Col>
                    ))}
                  </Row>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="pagination-container mt-5 d-flex justify-content-center">
                    <Pagination>
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {paginationItems}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CatalogoPage
