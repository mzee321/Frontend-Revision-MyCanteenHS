import React, { useEffect, useState } from "react";
import NavBar from "../global/NavBar";
import PageNav from "../global/PageNav";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../global/store/userReducers";
import { toast } from "react-hot-toast";
import "./Products.css";

const Archives = ({ archivedProducts, setArchivedProducts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo || {};
  
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          stallname: parsedUserInfo.stallname,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState.userInfo]);

  useEffect(() => {
    if (!userInfo?._id) return; // Prevent fetching if userInfo is undefined

    const fetchArchivedProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getProductListsArchive?stallId=${userInfo?._id}&archive=Archived`
        );
        const data = await response.json();
        if (data.status === "ok") {
          const products = data.data.map((product) => ({
            _id: product._id,
            image: `http://localhost:5000/${product.productImage}`,
            stallname: product.stallname,
            name: product.productName,
            category: product.category,
            price: product.price,
            stocks: product.availableStocks,
            isAvailable: product.availStatus === "Available",
          }));
          setArchivedProducts(products);
        } else {
          console.error("Failed to fetch archived products.");
        }
      } catch (error) {
        console.error("Error fetching archived products:", error);
      }
    };

    fetchArchivedProducts();
  }, [userInfo?._id, setArchivedProducts]);

  const handleRestore = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/restore-product/${productId}`, {
        method: "PUT",
      });
      const result = await response.json();
      if (result.status === "ok") {
        setArchivedProducts((prev) => prev.filter((product) => product._id !== productId));
        toast.success("Product restored successfully!");
      } else {
        toast.error("Failed to restore product.");
      }
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error("Error restoring product.");
    }
  };

  // Filter products based on search
  const filteredProducts = archivedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div>
      <NavBar />
      <PageNav />
      <div className="products-page">
        <h1>Archived Products</h1>

        {/* Search Bar */}
        <div className="search-bar2">
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="products-container">
          {currentProducts.length > 0 ? (
            <div className="products-list">
              {currentProducts.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={product.image || "./placeholder.png"}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-details">
                    <div className="product-field">
                      <span className="field-label">Product Name:</span>
                      <p className="product-title">{product.name}</p>
                    </div>
                    <div className="product-field">
                      <span className="field-label">Category:</span>
                      <p className="product-title">{product.category}</p>
                    </div>
                    <div className="product-field">
                      <span className="field-label">Price:</span>
                      <p className="product-price">₱{product.price}</p>
                    </div>
                    <div className="product-field">
                      <span className="field-label">Available Stocks:</span>
                      <p className="product-stocks">{product.stocks} in stock</p>
                    </div>
                    <div className="product-actions">
                      <button className="restore-button" onClick={() => handleRestore(product._id)}>
                        <i className="fas fa-undo"></i> Restore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-products">No archived products available.</p>
          )}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="pagination1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination1-button"
            >
              Previous
            </button>
            <span className="pagination1-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination1-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archives;
