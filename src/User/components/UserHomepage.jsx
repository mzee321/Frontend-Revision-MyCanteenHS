import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../App.css';
import NavBar from '../global/NavBarTest';
import axios from "axios";
import fallbackImage from '../images/stall1.png';
import { userActions } from "../../global/store/userReducers";
import { useDispatch, useSelector } from "react-redux";

const UserHomepage = () => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo || {};
  const BASE_URL = "http://localhost:5000";

  // Fetch vendors and products once
  useEffect(() => {
    axios.get("http://localhost:5000/getVendorLists")
      .then(res => setVendors(res.data.data))
      .catch(err => console.error("Failed to fetch vendors", err));

    axios.get("http://localhost:5000/getAllProducts")
      .then(res => setProducts(res.data.data))
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  // Update filtered results on search input change
  useEffect(() => {
    const lower = searchInput.toLowerCase();
    setFilteredStalls(
      vendors.filter((vendor) =>
        vendor.stallname.toLowerCase().includes(lower)
      )
    );
    setFilteredProducts(
      products.filter((product) =>
        product.productName.toLowerCase().includes(lower)
      )
    );
  }, [searchInput, vendors, products]);

  // Load user info from localStorage if not already in Redux
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState.userInfo]);

  const handleStallClick = (stallId) => {
    navigate(`/stall/${stallId}`);
  };

  

  return (
    <div>
      <NavBar />
      <section className="container">
        <div className="page">
          <div className="search-bar">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search stalls or products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="canteen">
        <div className="canteen-stalls">
          <div className="carousel-container">
            <div className="carousel">
              {/* When search is idle, show all vendors */}
              {searchInput === "" ? (
                vendors.length > 0 ? (
                  <div className="carousel1"> {/* Apply grid layout here */}
                            <h3 id="canteen-name">Canteen Stalls</h3>
                  {vendors.map((stall) => (
                    <div
                      key={stall._id}
                      className="stall-card"
                      onClick={() => handleStallClick(stall._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={stall.profilePicture ? `${BASE_URL}/${stall.profilePicture}` : fallbackImage}
                        alt={stall.stallname}
                        className="stall-image"
                      />
                      <div className="stall-label">{stall.stallname}</div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="no-stalls-message">No available stalls</div>
                )
              ) : (
                <>
                  <div className="search-results-stalls">
                    {filteredStalls.length > 0 ? (
                      <>
                        <h3 className="search-section-title">Stalls</h3>
                        <div className="menu-items">
                          {filteredStalls.map((stall) => (
                            <div
                              key={stall._id}
                              className="stall-card"
                              onClick={() => handleStallClick(stall._id)}
                              style={{ cursor: "pointer" }}
                            >
                              <img
                                src={stall.profilePicture ? `${BASE_URL}/${stall.profilePicture}` : fallbackImage}
                                alt={stall.stallname}
                                className="stall-image"
                              />
                              <div className="stall-label">{stall.stallname}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="search-results-products">
                    {filteredProducts.length > 0 ? (
                      <>
                        <h3 className="search-section-title">Products</h3>
                        <div className="menu-items">
                          {filteredProducts.map((product) => (
                            <div
                              key={product._id}
                              className="menu-item"
                              style={{
                                position: "relative",
                                opacity: product.availStatus === "Not Available" ? 0.3 : 1,
                                pointerEvents: product.availStatus === "Not Available" ? "none" : "auto",
                              }}
                            >
                              <img
                                src={product.productImage ? `${BASE_URL}/${product.productImage}` : fallbackImage}
                                alt={product.productName}
                                className="product-image"
                              />
                              {product.availStatus === "Not Available" && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: "5px",
                                    fontWeight: "bold",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  Not Available
                                </div>
                              )}
                              <h5>{product.productName}</h5>
                              <p>Available Stocks: {product.availableStocks}</p>
                              <p>₱{Number(product.price).toFixed(2)}</p>
                              <p className="stall-source">From: {product.stallName}</p>
                              {product.availStatus === "Available" && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleStallClick(product.stallId)} // ✅ use product.stallId
                                  style={{ cursor: "pointer" }}
                                >
                                  Go-to
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {filteredStalls.length === 0 && filteredProducts.length === 0 && (
                    <div className="no-stalls-message">No results found</div>
                  )}
                </>

              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserHomepage;
