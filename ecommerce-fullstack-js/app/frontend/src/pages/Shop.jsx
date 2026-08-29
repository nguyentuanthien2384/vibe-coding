import React, { useState, useEffect, useRef } from 'react'
import CommonSection from '../components/Ui/CommonSection';
import Helmet from '../components/Helmet/Helmet'
import { Container, Row, Col } from 'reactstrap'
import '../styles/shop.css'
import ProductsList from '../components/Ui/ProductsList'
import { useGetAllProductsQuery } from '../store/ProductsApi'
import Loader from '../loader/Loader'

const Shop = () => {
  const { data: apiResponse, isLoading, error } = useGetAllProductsQuery()

  // API trả về { data: [...], pagination: {} } — lấy đúng array
  const allProducts = apiResponse?.data ?? []

  const [productData, setProductData] = useState([])
  const debounceTimer = useRef(null)

  // Sync productData khi data từ API về
  useEffect(() => {
    setProductData(allProducts)
  }, [apiResponse])

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  const handleFilter = (e) => {
    const filterValue = e.target.value
    if (filterValue === 'all' || filterValue === 'Filter By Category') {
      setProductData(allProducts)
      return
    }
    setProductData(allProducts.filter((item) => item.category === filterValue))
  }

  const handleSearch = (e) => {
    const searchValue = e.target.value
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const filtered = allProducts.filter((item) =>
        item.product.toLowerCase().includes(searchValue.toLowerCase())
      )
      setProductData(filtered)
    }, 300)
  }

  return (
    <Helmet title={'shop'}>
        <CommonSection title={'Products'}/>
        <section>
          <Container>
            <Row>
              <Col lg='3' md='6'>
                <div className="filter__widget">
                  <select onChange={handleFilter}>
                    <option>Filter By Category</option>
                    <option value="all">All products</option>
                    <option value="phones">Phones</option>
                    <option value="Cameras">Cameras</option>
                    <option value="laptops">Laptops</option>
                    <option value="Headsets">Headsets</option>
                    <option value="Fridges">Fridges</option>
                  </select>
                </div>
              </Col>
              <Col lg='3' md='6' className="text-end">
                <div className="filter__widget">
                  <select>
                    <option>Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </Col>
              <Col lg='6' md='12'>
                <div className="search__box">
                  <input type="text" placeholder="search product ..." onChange={handleSearch}/>
                  <span>
                    <i className="ri-search-line"></i>
                  </span>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="pt-0">
        <Container>
          <Row>
            {
              isLoading ? (
                <section>
                  <Container>
                      <Row>
                      <Col lg="12" className="text-center align-items-center">
                          <Loader/>
                      </Col>
                      </Row>
                  </Container>
              </section>
              ) : error ? (
                <p>Something went wrong. Please try again later.</p>
              ):(
                productData.length > 0 ? <ProductsList data={productData}/>
                :
                <>
                  <span>
                    <i className="ri-file-damage-line ri-10x text-muted"></i>
                  </span>
                  <h1 className="text-muted">No Products Were Found</h1>
                </>
              )
            }
          </Row>
        </Container>
      </section>
    </Helmet>
  )
}

export default Shop